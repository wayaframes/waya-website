/* Proof components, Design C: "The Climb".
   Every case is a route up a mountain: base camp (before) to the ridge (after), drawn as the
   visitor scrolls. The height of a climb is only ever the improvement ratio of comparable
   values (both numbers above 0); anything else is qualitative and gets a dashed final pitch.
   Profiles are stylised on purpose: no axis, no scale, only the two endpoints are data.
   Vanilla ES2018, no dependencies. Styles live in design-c.css under html.design-c. */
(function () {
  'use strict';

  var WP = window.WayaProof;
  if (!WP || typeof WP.register !== 'function') return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ARROW = '→';
  var uid = 0;

  /* ------------------------------------------------------------------ helpers */

  function clamp01(v) { return v > 1 ? 1 : (v > 0 ? v : 0); }          /* NaN → 0 */
  function txt(v) { return typeof v === 'string' ? v.trim() : ''; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function px(v) { return (Math.round(v * 100) / 100) + 'px'; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function each(list, fn) { if (list) Array.prototype.forEach.call(list, fn); }

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function hide(n) { n.setAttribute('aria-hidden', 'true'); return n; }
  function sr(text) { return h('span', 'dc-sr', text); }
  function children(el, sel) {
    return Array.prototype.filter.call(el.children || [], function (c) { return !sel || (c.matches && c.matches(sel)); });
  }
  function prng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function viewportY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }

  /* Magnitude helper (shared rule): scalable only when both values are finite and above 0. */
  function num(v) { return typeof v === 'number' ? v : NaN; }
  function scalable(m) {
    if (!m) return false;
    var b = num(m.before), a = num(m.after);
    return isFinite(b) && isFinite(a) && b > 0 && a > 0;
  }
  function ratio(m) {
    var b = num(m.before), a = num(m.after);
    return m.better === 'down' ? b / a : a / b;
  }
  /* Climb height as a share of the profile box. Qualitative results always reach 0.85. */
  function climb(m) {
    if (!scalable(m)) return 0.85;
    return 0.35 + 0.65 * clamp01(Math.log(ratio(m)) / Math.log(20));
  }
  /* "{label}: {fmtBefore} to {fmtAfter}", built from data only. */
  function sentence(m) {
    if (!m) return '';
    var label = txt(m.label), b = txt(m.fmtBefore), a = txt(m.fmtAfter);
    var core = b && a ? b + ' to ' + a : (a || b);
    if (!core) return label;
    return label ? label + ': ' + core : core;
  }
  function joinSentences(parts) {
    return parts.filter(Boolean).map(function (p) { return /[.?]$/.test(p) ? p : p + '.'; }).join(' ');
  }
  /* "fmtBefore → fmtAfter" as visible text, with " to " for screen readers. */
  function valueNodes(parent, m) {
    var b = txt(m && m.fmtBefore), a = txt(m && m.fmtAfter);
    if (b) parent.appendChild(h('span', 'dc-v-before', b));
    if (b && a) {
      parent.appendChild(hide(h('span', 'dc-v-arrow', ' ' + ARROW + ' ')));
      parent.appendChild(sr(' to '));
    }
    if (a) parent.appendChild(h('span', 'dc-v-after', a));
    return parent;
  }
  function validCases(ctx) {
    return arr(ctx && ctx.cases).filter(function (c) {
      return c && typeof c === 'object' && c.headline && typeof c.headline === 'object' && txt(c.url);
    });
  }

  /* ------------------------------------------------------------------ scroll engine
     One passive scroll listener, at most one rAF per frame. Positions are measured in
     IntersectionObserver / resize / load callbacks and cached as document offsets, so the
     frame itself only reads window.pageYOffset and writes styles. */
  var engine = (function () {
    var items = [], queued = false, bound = false, vh = 0, maxScroll = 0, resizeTimer = 0;
    var relayouts = [];

    function readViewport() {
      vh = window.innerHeight || document.documentElement.clientHeight || 0;
      maxScroll = Math.max(0, (document.documentElement.scrollHeight || 0) - vh);
    }
    function safe(fn, arg) { try { if (typeof fn === 'function') return fn(arg); } catch (e) { /* keep going */ } return undefined; }
    function request() { if (!queued) { queued = true; window.requestAnimationFrame(frame); } }
    function frame() {
      queued = false;
      var y = viewportY(), atEnd = y >= maxScroll - 4;
      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        if (!it.visible) continue;
        var done;
        try { done = it.update(y, vh, atEnd) === true; } catch (e) { done = true; safe(it.finish); }
        if (done) drop(it);
      }
    }
    function drop(it) {
      var i = items.indexOf(it);
      if (i >= 0) items.splice(i, 1);
      if (it.io) it.io.disconnect();
    }
    function remeasureAll() {
      readViewport();
      relayouts.forEach(function (fn) { safe(fn); });
      items.forEach(function (it) { safe(it.measure); });
      request();
    }
    function bind() {
      if (bound) return;
      bound = true;
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(remeasureAll, 120);
      }, { passive: true });
      window.addEventListener('load', remeasureAll);
      if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(remeasureAll, function () {});
      }
    }
    return {
      supported: 'IntersectionObserver' in window && typeof window.requestAnimationFrame === 'function',
      /* item: { target, measure(), update(y, vh, atEnd) → true when finished, finish() } */
      add: function (it) {
        if (!this.supported || !it || !it.target) return false;
        bind();
        readViewport();
        it.visible = false;
        items.push(it);
        it.io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { it.visible = e.isIntersecting; });
          readViewport();
          safe(it.measure);
          request();
        }, { rootMargin: '20% 0px 20% 0px' });
        it.io.observe(it.target);
        safe(it.measure);
        return true;
      },
      /* geometry rebuilds that should also run on resize, load and fonts.ready */
      onRelayout: function (fn) { relayouts.push(fn); bind(); },
      request: request
    };
  })();

  /* ------------------------------------------------------------------ the route profile
     A stylised elevation profile: base camp bottom-left, summit top-right, a few bumps in
     between. Bumps are decoration, never data. Built at the box's real pixel size so
     strokes and the flag are never distorted, and rebuilt when the box resizes. */
  function Profile(m, opts) {
    opts = opts || {};
    var id = 'dcp' + (++uid);
    var qual = !scalable(m);
    var height = climb(m);
    var bumps = Math.max(2, opts.bumps || 2);

    var box = hide(h('div', 'dc-profile' + (qual ? ' is-qual' : '')));
    var svg = svgEl('svg', { 'class': 'dc-profile-svg', focusable: 'false', 'aria-hidden': 'true' });
    var defs = svgEl('defs');
    var clip = svgEl('clipPath', { id: id + 'c' });
    var clipRect = svgEl('rect', { x: 0, y: 0, width: 0, height: 0 });
    clip.appendChild(clipRect);
    defs.appendChild(clip);

    var mask = null, maskPath = null, last = null;
    if (qual) {
      mask = svgEl('mask', { id: id + 'm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 0, height: 0 });
      maskPath = svgEl('path', { 'class': 'dc-reveal', fill: 'none', stroke: 'white', 'stroke-width': 12, 'stroke-linecap': 'round' });
      mask.appendChild(maskPath);
      defs.appendChild(mask);
    }
    svg.appendChild(defs);

    var ground = svgEl('line', { 'class': 'dc-ground' });
    var area = svgEl('path', { 'class': 'dc-area', 'clip-path': 'url(#' + id + 'c)' });
    var route = svgEl('path', { 'class': 'dc-line' });
    svg.appendChild(ground);
    svg.appendChild(area);
    svg.appendChild(route);
    if (qual) {
      last = svgEl('path', { 'class': 'dc-line dc-line-qual', mask: 'url(#' + id + 'm)' });
      svg.appendChild(last);
    }
    var baseDot = svgEl('circle', { 'class': 'dc-base-dot', r: 6 });
    var flagAt = svgEl('g');
    var flag = svgEl('g', { 'class': 'dc-flag' });
    flag.appendChild(svgEl('line', { 'class': 'dc-flag-pole', x1: 0, y1: 0, x2: 0, y2: -28 }));
    flag.appendChild(svgEl('path', { 'class': 'dc-flag-cloth', d: 'M1,-28 L21,-22 L1,-16 Z' }));
    flagAt.appendChild(svgEl('circle', { 'class': 'dc-summit-dot', r: 3.5 }));
    flagAt.appendChild(flag);
    svg.appendChild(baseDot);
    svg.appendChild(flagAt);
    box.appendChild(svg);

    var before = txt(m && m.fmtBefore);
    if (before) box.appendChild(h('span', 'dc-base-label', before));

    var geo = null, f = 0;

    function layout() {
      var W = box.clientWidth, H = box.clientHeight;
      if (!(W > 60 && H > 60)) return false;
      if (geo && geo.W === W && geo.H === H) return true;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);

      var padL = 20, padR = 34, top = 40, gy = H - 28;
      var usable = Math.max(8, gy - top);
      var bx = padL, sx = Math.max(padL + 40, W - padR);
      function P(tt0, e) { return [r2(bx + tt0 * (sx - bx)), r2(gy - clamp01(e) * usable)]; }

      /* A stylised climb, not a chart: every segment rises (no dips, no implied timeline).
         Steep pitches alternate with gentle traverses, like switchbacks up a slope. */
      var pts = [[bx, gy]];
      var segs = bumps * 2 + 1, xw = [], rw = [], xs = 0, rs = 0;
      for (var i = 0; i < segs; i++) {
        var steep = i % 2 === 0;
        xw.push(steep ? 1 : 1.5); rw.push(steep ? 1 : 0.22);
        xs += xw[i]; rs += rw[i];
      }
      var tx = 0, er = 0;
      for (var j = 0; j < segs - 1; j++) {
        tx += xw[j] / xs; er += rw[j] / rs;
        pts.push(P(tx, height * er));
      }
      var summit = P(1, height);
      pts.push(summit);

      var cum = [0];
      for (var k = 1; k < pts.length; k++) {
        cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      }
      var mainEnd = qual ? pts.length - 2 : pts.length - 1;
      var line = function (from, to) {
        return 'M' + pts.slice(from, to + 1).map(function (p) { return p[0] + ',' + p[1]; }).join(' L');
      };

      route.setAttribute('d', line(0, mainEnd));
      area.setAttribute('d', line(0, pts.length - 1) + ' L' + summit[0] + ',' + gy + ' L' + bx + ',' + gy + ' Z');
      ground.setAttribute('x1', 0); ground.setAttribute('x2', W);
      ground.setAttribute('y1', gy); ground.setAttribute('y2', gy);
      clipRect.setAttribute('height', H);
      baseDot.setAttribute('cx', bx); baseDot.setAttribute('cy', gy);
      flagAt.setAttribute('transform', 'translate(' + summit[0] + ',' + summit[1] + ')');

      var L1 = cum[mainEnd];
      try { var measured = route.getTotalLength(); if (measured > 0) L1 = measured; } catch (e) { /* computed length stands */ }
      var L = L1 + (cum[pts.length - 1] - cum[mainEnd]);
      route.style.strokeDasharray = px(L1) + ' ' + px(L1 + 2);

      var L2 = 0;
      if (qual) {
        var d2 = line(mainEnd, pts.length - 1);
        last.setAttribute('d', d2);
        maskPath.setAttribute('d', d2);
        mask.setAttribute('x', -20); mask.setAttribute('y', -20);
        mask.setAttribute('width', W + 40); mask.setAttribute('height', H + 40);
        L2 = L - L1;
        maskPath.style.strokeDasharray = px(L2) + ' ' + px(L2 + 2);
      }
      geo = { W: W, H: H, L: L, L1: L1, L2: L2, pts: pts, cum: cum, summit: summit };
      set(f);
      if (typeof opts.onLayout === 'function') opts.onLayout();
      return true;
    }

    function tipX(drawn) {
      var pts = geo.pts, cum = geo.cum;
      for (var i = 1; i < pts.length; i++) {
        if (drawn <= cum[i]) {
          var seg = cum[i] - cum[i - 1] || 1;
          return pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * ((drawn - cum[i - 1]) / seg);
        }
      }
      return geo.W;
    }

    function set(p) {
      f = clamp01(p);
      if (!geo) return;
      var drawn = f * geo.L;
      route.style.strokeDashoffset = px(Math.max(0, geo.L1 - drawn));
      if (maskPath) maskPath.style.strokeDashoffset = px(geo.L2 - Math.min(geo.L2, Math.max(0, drawn - geo.L1)));
      clipRect.setAttribute('width', r2(f >= 1 ? geo.W : tipX(drawn)));
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { try { layout(); } catch (e) { /* leave as drawn */ } }).observe(box);
    }
    engine.onRelayout(layout);

    return {
      box: box,
      qual: qual,
      layout: layout,
      set: set,
      summit: function () { return geo ? { x: geo.summit[0], y: geo.summit[1] } : null; }
    };
  }

  /* ------------------------------------------------------------------ strip */

  function contour() {
    var svg = hide(svgEl('svg', { 'class': 'dc-contour', viewBox: '0 0 1200 600', preserveAspectRatio: 'xMidYMid slice', focusable: 'false' }));
    var rnd = prng(7);
    for (var i = 0; i < 6; i++) {
      var y = 60 + i * 96, amp = 18 + i * 5, d = 'M-40,' + y;
      for (var x = -40; x < 1240; x += 160) {
        var up = (x / 160) % 2 === 0 ? -1 : 1;
        d += ' Q' + (x + 80) + ',' + r2(y + up * amp * (0.6 + rnd() * 0.8)) + ' ' + (x + 160) + ',' + r2(y + (rnd() - 0.5) * 10);
      }
      svg.appendChild(svgEl('path', { d: d }));
    }
    return svg;
  }

  function Connector() {
    var id = 'dct' + (++uid);
    var svg = hide(svgEl('svg', { 'class': 'dc-connector', focusable: 'false' }));
    var defs = svgEl('defs');
    var mask = svgEl('mask', { id: id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 0, height: 0 });
    var reveal = svgEl('path', { 'class': 'dc-reveal', fill: 'none', stroke: 'white', 'stroke-width': 8, 'stroke-linecap': 'round' });
    mask.appendChild(reveal);
    defs.appendChild(mask);
    svg.appendChild(defs);
    var line = svgEl('path', { 'class': 'dc-connector-line', mask: 'url(#' + id + ')' });
    svg.appendChild(line);
    var shown = false, len = 0;
    return {
      svg: svg,
      layout: function (W, H, from, cardBottom, to) {
        if (!(to.y > cardBottom + 24)) { svg.classList.remove('is-ready'); return; }
        var mid = r2((cardBottom + 16 + to.y) / 2);
        var d = 'M' + r2(from.x) + ',' + r2(from.y) + ' L' + r2(from.x) + ',' + r2(cardBottom + 16) +
          ' C' + r2(from.x) + ',' + mid + ' ' + r2(to.x) + ',' + mid + ' ' + r2(to.x) + ',' + r2(to.y);
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('width', W);
        svg.setAttribute('height', H);
        mask.setAttribute('width', W); mask.setAttribute('height', H);
        line.setAttribute('d', d);
        reveal.setAttribute('d', d);
        try { len = reveal.getTotalLength(); } catch (e) { len = 0; }
        if (!(len > 0)) { svg.classList.remove('is-ready'); return; }
        reveal.style.strokeDasharray = px(len) + ' ' + px(len + 2);
        reveal.style.strokeDashoffset = shown ? '0px' : px(len);
        svg.classList.add('is-ready');
      },
      show: function () {
        if (shown) return;
        shown = true;
        svg.classList.add('is-drawing');
        reveal.style.strokeDashoffset = '0px';
      }
    };
  }

  function stripCard(c, onLayout) {
    var m = c.headline;
    var li = h('li', 'dc-card-item' + (scalable(m) ? '' : ' is-qual'));
    var a = h('a', 'dc-card');
    a.setAttribute('href', c.url);
    var profile = Profile(m, { bumps: Math.min(3, Math.max(2, arr(c.metrics).length)), onLayout: onLayout });
    a.appendChild(profile.box);

    var body = h('span', 'dc-card-body');
    body.appendChild(sr(joinSentences([txt(c.kicker), sentence(m)])));
    var after = txt(m.fmtAfter);
    if (after) body.appendChild(hide(h('span', 'dc-after', after)));
    var label = txt(m.label);
    if (label) body.appendChild(hide(h('span', 'dc-label', label)));
    var kicker = txt(c.kicker);
    if (kicker) body.appendChild(hide(h('span', 'dc-kicker', kicker)));
    body.appendChild(h('span', 'dc-more', 'Read the case study'));
    a.appendChild(body);
    li.appendChild(a);
    return { li: li, profile: profile, top: 0, k: 0, kmax: 0, done: false };
  }

  function strip(el, ctx) {
    if (!el) return;
    var cases = validCases(ctx);
    if (cases.length < 2) return;                       /* leave the server HTML untouched */
    var rm = !!(ctx && ctx.reducedMotion);

    var wrap = h('div', 'dc-strip-wrap');
    var connector = Connector();
    wrap.appendChild(connector.svg);
    var ul = h('ul', 'dc-cards');
    ul.setAttribute('role', 'list');
    var relayConnector = function () { layoutConnector(); };
    var cards = cases.map(function (c) { var card = stripCard(c, relayConnector); ul.appendChild(card.li); return card; });
    wrap.appendChild(ul);

    /* Booking button: keep the page's own button and copy, force the contract href. */
    var cta = el.querySelector('.proof-cta');
    var btn = cta ? cta.querySelector('a') : el.querySelector('a.btn-rust');
    if (!cta) cta = h('p', 'proof-cta');
    if (!btn) btn = cta.appendChild(h('a', 'btn-rust', 'Schedule a Call'));
    if (btn.parentNode !== cta) cta.appendChild(btn);
    if (ctx && ctx.bookingUrl) btn.setAttribute('href', ctx.bookingUrl);
    btn.classList.add('btn-rust');
    cta.classList.add('dc-cta');
    wrap.appendChild(cta);

    var list = el.querySelector('.proof-list');
    if (list && list.parentNode) list.parentNode.replaceChild(wrap, list);
    else el.appendChild(wrap);

    el.classList.add('dc-strip', 'dc-n' + Math.min(cases.length, 4));
    var band = (el.closest && el.closest('section')) || el;
    band.classList.add('dc-strip-band');
    el.insertBefore(contour(), el.firstChild);

    function layoutConnector() {
      if (!cards || !cards.length || !btn) return;
      var lastCard = cards[cards.length - 1];
      var s = lastCard && lastCard.profile.summit();
      if (!s || window.innerWidth <= 960) return;
      var wr = wrap.getBoundingClientRect();
      var pr = lastCard.profile.box.getBoundingClientRect();
      var cr = lastCard.li.getBoundingClientRect();
      var br = btn.getBoundingClientRect();
      if (!(wr.width > 0 && br.width > 0)) return;
      connector.layout(wr.width, wr.height,
        { x: pr.left - wr.left + s.x, y: pr.top - wr.top + s.y },
        cr.bottom - wr.top,
        { x: br.left - wr.left + br.width / 2, y: br.top - wr.top - 6 });
    }

    function finish() {
      cards.forEach(function (c) { c.profile.set(1); c.done = true; c.li.classList.add('is-summit'); });
      layoutConnector();
      connector.show();
    }

    /* Initial geometry (measuring here is fine: it is not a scroll handler). */
    cards.forEach(function (c) { c.profile.layout(); });
    engine.onRelayout(layoutConnector);
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { try { layoutConnector(); } catch (e) { /* decorative only */ } }).observe(wrap);
    }

    if (rm || !engine.supported) {
      el.classList.add('dc-rm');
      finish();
      return;
    }
    cards.forEach(function (c) { c.profile.set(0); });

    var added = engine.add({
      target: wrap,
      measure: function () {
        var y = viewportY();
        cards.forEach(function (c) { c.top = c.li.getBoundingClientRect().top + y; });
        cards.forEach(function (c, i) {
          var k = 0, n = 0;
          cards.forEach(function (o, j) {
            if (Math.abs(o.top - c.top) < 8) { n++; if (j < i) k++; }
          });
          c.k = k; c.kmax = Math.max(0, n - 1);
        });
        layoutConnector();
      },
      update: function (y, vh, atEnd) {
        var all = true;
        cards.forEach(function (c) {
          if (c.done) return;
          var raw = (vh * 0.85 - (c.top - y)) / (vh * 0.5);
          var p = atEnd ? 1 : clamp01((raw - c.k * 0.08) / (1 - c.kmax * 0.08));
          c.profile.set(p);
          if (p >= 1) { c.done = true; c.li.classList.add('is-summit'); }
          else all = false;
        });
        if (all) { connector.show(); return true; }
        return false;
      },
      finish: finish
    });
    if (!added) finish();
  }

  /* ------------------------------------------------------------------ hero */

  function ridgePath(seed, peakTop, valleyTop, steps) {
    var rnd = prng(seed), W = 1440, H = 260, d = 'M0,' + H + ' L0,' + r2(valleyTop + rnd() * 30);
    for (var i = 1; i <= steps; i++) {
      var x = r2((i / steps) * W);
      var peak = i % 2 === 1;
      var y = peak ? peakTop + rnd() * (valleyTop - peakTop) * 0.55 : valleyTop + rnd() * (H - valleyTop) * 0.25;
      var shoulderX = r2(x - (W / steps) * (0.35 + rnd() * 0.2));
      var shoulderY = r2(y + (peak ? 1 : -1) * (12 + rnd() * 18));
      d += ' L' + shoulderX + ',' + shoulderY + ' L' + x + ',' + r2(y);
    }
    return d + ' L' + W + ',' + H + ' Z';
  }

  function hero(el, ctx) {
    if (!el) return;
    var rm = !!(ctx && ctx.reducedMotion);
    var art = hide(h('div', 'dc-ridges'));
    var specs = [
      { cls: 'dc-ridge-back', seed: 11, peak: 8, valley: 110, steps: 9, f: 0.3 },
      { cls: 'dc-ridge-mid', seed: 23, peak: 70, valley: 160, steps: 11, f: 0.2 },
      { cls: 'dc-ridge-front', seed: 41, peak: 140, valley: 205, steps: 13, f: 0.1 }
    ];
    var layers = specs.map(function (sp) {
      var layer = h('div', 'dc-ridge ' + sp.cls);
      var svg = svgEl('svg', { viewBox: '0 0 1440 260', preserveAspectRatio: 'none', focusable: 'false' });
      svg.appendChild(svgEl('path', { d: ridgePath(sp.seed, sp.peak, sp.valley, sp.steps) }));
      layer.appendChild(svg);
      art.appendChild(layer);
      return { el: layer, f: sp.f };
    });
    var here = h('span', 'dc-here');
    here.appendChild(h('span', 'dc-here-dot'));
    here.appendChild(h('span', 'dc-here-label', 'You are here'));
    art.appendChild(here);

    el.classList.add('dc-hero');
    el.insertBefore(art, el.firstChild);
    if (rm) { el.classList.add('dc-rm'); return; }
    el.classList.add('dc-hero-live');

    var top = 0, height = 0, lastOff = -1;
    engine.add({
      target: el,
      measure: function () {
        var r = el.getBoundingClientRect();
        top = r.top + viewportY();
        height = r.height;
      },
      update: function (y) {
        var off = Math.max(0, Math.min(y, top + height));
        if (Math.abs(off - lastOff) < 0.5) return false;
        lastOff = off;
        layers.forEach(function (l) { l.el.style.transform = 'translate3d(0,' + r2(off * l.f) + 'px,0)'; });
        return false;                                   /* parallax never finishes */
      }
    });
  }

  /* ------------------------------------------------------------------ steps: the trail map */

  function steps(el, ctx) {
    if (!el || !el.parentNode) return;
    var items = children(el, 'li');
    if (!items.length) return;
    var rm = !!(ctx && ctx.reducedMotion);

    var stepsData = items.map(function (li, i) {
      var n = li.querySelector('.proof-step-n');
      var title = li.querySelector('h3, h4, h2');
      var rest = Array.prototype.slice.call(li.childNodes).filter(function (node) {
        return node !== n && node !== title && !(node.nodeType === 3 && !node.textContent.trim());
      });
      if (!n) n = h('span', 'proof-step-n', String(i + 1));
      n.classList.add('dc-wp');
      var card = h('div', 'dc-step-card');
      if (title) card.appendChild(title);
      rest.forEach(function (node) { card.appendChild(node); });
      while (li.firstChild) li.removeChild(li.firstChild);
      li.classList.add('dc-step');
      li.appendChild(n);
      li.appendChild(card);
      return { li: li, wp: n, len: 0 };
    });

    var wrap = h('div', 'dc-trail-wrap');
    var svg = hide(svgEl('svg', { 'class': 'dc-trail', focusable: 'false' }));
    var ghost = svgEl('path', { 'class': 'dc-trail-ghost' });
    var path = svgEl('path', { 'class': 'dc-trail-path' });
    svg.appendChild(ghost);
    svg.appendChild(path);
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(svg);
    wrap.appendChild(el);
    el.classList.add('dc-steps');
    el.setAttribute('role', 'list');

    var L = 0, table = [], drawn = 0, wrapTop = 0, done = false;
    var narrow = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;

    function build() {
      var wr = wrap.getBoundingClientRect();
      if (!(wr.width > 0 && wr.height > 0)) return false;
      var W = wr.width, H = wr.height;
      var pts = stepsData.map(function (s) {
        var r = s.wp.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
      var d, straight = !!(narrow && narrow.matches);
      var x0 = pts[0].x;
      if (straight) {
        d = 'M' + r2(x0) + ',0 L' + r2(x0) + ',' + r2(H);
      } else {
        var amp = Math.min(64, W * 0.07);
        d = 'M' + r2(x0) + ',0 L' + r2(pts[0].x) + ',' + r2(pts[0].y);
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], dy = b.y - a.y, side = i % 2 === 1 ? 1 : -1;
          d += ' C' + r2(a.x + side * amp) + ',' + r2(a.y + dy * 0.3) + ' ' + r2(b.x + side * amp) + ',' + r2(b.y - dy * 0.3) +
            ' ' + r2(b.x) + ',' + r2(b.y);
        }
        var lastPt = pts[pts.length - 1];
        d += ' L' + r2(lastPt.x) + ',' + r2(H);
      }
      svg.setAttribute('viewBox', '0 0 ' + r2(W) + ' ' + r2(H));
      svg.setAttribute('width', r2(W));
      svg.setAttribute('height', r2(H));
      ghost.setAttribute('d', d);
      path.setAttribute('d', d);
      try { L = path.getTotalLength(); } catch (e) { L = 0; }
      if (!(L > 0)) return false;
      /* length ↔ height lookup, sampled once here so the scroll frame never touches geometry */
      table = [];
      var N = 160;
      for (var k = 0; k <= N; k++) {
        var len = (k / N) * L, pt = path.getPointAtLength(len);
        table.push({ len: len, x: pt.x, y: pt.y });
      }
      stepsData.forEach(function (s, j) {
        var best = 0, bestD = Infinity;
        table.forEach(function (row) {
          var dd = Math.hypot(row.x - pts[j].x, row.y - pts[j].y);
          if (dd < bestD) { bestD = dd; best = row.len; }
        });
        s.len = best;
      });
      path.style.strokeDasharray = px(L) + ' ' + px(L + 2);
      paint(done ? L : drawn);
      return true;
    }

    function lenAtY(y) {
      if (!table.length) return 0;
      if (y <= table[0].y) return 0;
      for (var i = 1; i < table.length; i++) {
        if (table[i].y >= y) {
          var a = table[i - 1], b = table[i], span = b.y - a.y;
          return span > 0 ? a.len + (b.len - a.len) * ((y - a.y) / span) : b.len;
        }
      }
      return L;
    }

    function paint(len) {
      drawn = Math.max(0, Math.min(L, len));
      path.style.strokeDashoffset = px(L - drawn);
      stepsData.forEach(function (s) { s.li.classList.toggle('is-reached', drawn >= s.len - 1); });
    }

    function finish() { done = true; build(); paint(L); stepsData.forEach(function (s) { s.li.classList.add('is-reached'); }); }

    engine.onRelayout(build);
    if ('ResizeObserver' in window) new ResizeObserver(function () { try { build(); } catch (e) { /* static trail */ } }).observe(wrap);

    if (rm || !engine.supported) { wrap.classList.add('dc-rm'); finish(); return; }
    build();
    paint(0);
    var added = engine.add({
      target: wrap,
      measure: function () { wrapTop = wrap.getBoundingClientRect().top + viewportY(); },
      update: function (y, vh, atEnd) {
        if (!L) return false;
        var target = atEnd ? L : lenAtY(y + vh * 0.62 - wrapTop);
        if (target > drawn) paint(target);              /* the trail only ever grows */
        if (drawn >= L - 0.5) { done = true; return true; }
        return false;
      },
      finish: finish
    });
    if (!added) finish();
  }

  /* ------------------------------------------------------------------ cases: the timeline */

  function routeCard(c) {
    var m = c.headline;
    var metrics = arr(c.metrics).filter(function (x) { return x && typeof x === 'object'; });
    var li = h('li', 'dc-tl-item' + (scalable(m) ? '' : ' is-qual'));
    var card = h('div', 'dc-route');

    var kicker = txt(c.kicker);
    if (kicker) card.appendChild(h('p', 'dc-kicker', kicker));
    var title = h('h3', 'dc-route-title');
    var link = h('a', 'dc-route-link', txt(c.title) || txt(m.label) || 'Read the case study');
    link.setAttribute('href', c.url);
    title.appendChild(link);
    card.appendChild(title);

    var profile = Profile(m, {
      bumps: Math.min(3, Math.max(2, metrics.length))
    });
    card.appendChild(profile.box);

    var result = h('p', 'dc-result');
    result.appendChild(sr(joinSentences([sentence(m), txt(c.timeframe)])));
    var after = txt(m.fmtAfter);
    if (after) result.appendChild(hide(h('span', 'dc-after', after)));
    var label = txt(m.label);
    if (label) result.appendChild(hide(h('span', 'dc-label', label)));
    card.appendChild(result);
    var tf = txt(c.timeframe);
    if (tf) card.appendChild(hide(h('p', 'dc-timeframe', tf)));

    var summary = txt(c.summary);
    if (summary) card.appendChild(h('p', 'dc-summary', summary));

    if (metrics.length) {
      var dl = h('dl', 'dc-markers');
      metrics.forEach(function (mt, i) {
        var row = h('div', 'dc-marker' + (scalable(mt) ? '' : ' is-qual'));
        var dt = h('dt');
        dt.appendChild(document.createTextNode(txt(mt.label)));
        row.appendChild(dt);
        row.appendChild(valueNodes(h('dd'), mt));
        dl.appendChild(row);
      });
      card.appendChild(dl);
    }
    card.appendChild(hide(h('span', 'dc-more', 'Read the case study')));
    li.appendChild(card);
    return { li: li, card: card, profile: profile, top: 0, done: false };
  }

  function summitBand(el, ctx, list) {
    var extras = children(el).filter(function (n) { return n !== list; });
    var group = ctx && ctx.group;
    if (!extras.length && !(group && group.program && txt(group.program.name) && txt(group.program.url))) return null;
    var band = h('div', 'dc-summit');
    var icon = hide(svgEl('svg', { 'class': 'dc-summit-flag', viewBox: '0 0 40 48', focusable: 'false' }));
    icon.appendChild(svgEl('line', { x1: 6, y1: 4, x2: 6, y2: 46 }));
    icon.appendChild(svgEl('path', { d: 'M7,5 L36,13 L7,21 Z' }));
    band.appendChild(icon);
    var body = h('div', 'dc-summit-body');
    if (extras.length) {
      extras.forEach(function (n) { body.appendChild(n); });
    } else {
      var p = h('p');
      var a = h('a', null, txt(group.program.name));
      a.setAttribute('href', group.program.url);
      p.appendChild(a);
      body.appendChild(p);
    }
    band.appendChild(body);
    return band;
  }

  function cases(el, ctx) {
    if (!el) return;
    var list = validCases(ctx);
    if (list.length < 2) return;
    var rm = !!(ctx && ctx.reducedMotion);

    var original = el.querySelector('.proof-list');
    var ul = h('ul', 'dc-timeline');
    ul.setAttribute('role', 'list');
    var cards = list.map(function (c) { var rc = routeCard(c); ul.appendChild(rc.li); return rc; });

    var band = summitBand(el, ctx, original);
    if (original && original.parentNode) original.parentNode.replaceChild(ul, original);
    else el.insertBefore(ul, el.firstChild);
    if (band) el.appendChild(band);
    el.classList.add('dc-cases', 'dc-n' + Math.min(list.length, 4));

    cards.forEach(function (c) { c.profile.layout(); });

    function finishOne(c) { c.profile.set(1); c.done = true; c.li.classList.add('is-summit'); }
    if (rm || !engine.supported) { el.classList.add('dc-rm'); cards.forEach(finishOne); return; }

    cards.forEach(function (c) {
      c.profile.set(0);
      var added = engine.add({
        target: c.card,
        measure: function () { c.top = c.profile.box.getBoundingClientRect().top + viewportY(); },
        update: function (y, vh, atEnd) {
          var raw = (vh * 0.85 - (c.top - y)) / (vh * 0.45);
          var p = atEnd ? 1 : clamp01(raw);
          c.profile.set(p);
          if (p >= 1) { finishOne(c); return true; }
          return false;
        },
        finish: function () { finishOne(c); }
      });
      if (!added) finishOne(c);
    });
  }

  WP.register('c', { strip: strip, hero: hero, steps: steps, cases: cases });
})();
