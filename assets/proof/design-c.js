/* Proof components, Design C: "The Climb".
   Each case gets an honest two-point slope chart drawn from its `chart` data: a y-axis from 0
   with labelled gridlines in the real unit, two labelled x positions, and a straight line from
   the before value to the after value. Lines go down when the number went down. Value labels
   are the fmtBefore / fmtAfter text from cases.js, never computed. Nothing is normalised.
   Vanilla ES2018, no dependencies. Styles live in design-c.css under html.design-c. */
(function () {
  'use strict';

  var WP = window.WayaProof;
  if (!WP || typeof WP.register !== 'function') return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ARROW = '→';

  /* ------------------------------------------------------------------ helpers */

  function clamp01(v) { return v > 1 ? 1 : (v > 0 ? v : 0); }          /* NaN → 0 */
  function txt(v) { return typeof v === 'string' ? v.trim() : ''; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function px(v) { return (Math.round(v * 100) / 100) + 'px'; }
  function r2(v) { return Math.round(v * 100) / 100; }

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }
  function hide(n) { n.setAttribute('aria-hidden', 'true'); return n; }
  function sr(text) { return h('span', 'dc-sr', text); }
  function prng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function viewportY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }

  /* Magnitude helper (shared rule). */
  function num(v) { return typeof v === 'number' ? v : NaN; }
  function scalable(m) {
    if (!m) return false;
    var b = num(m.before), a = num(m.after);
    return isFinite(b) && isFinite(a) && b > 0 && a > 0;
  }
  /* "{label}: {fmtBefore} to {fmtAfter}", built from data only. */
  function sentence(m) {
    if (!m) return '';
    var label = txt(m.label), b = txt(m.fmtBefore), a = txt(m.fmtAfter);
    var core = b && a ? b + ' to ' + a : (a || b);
    if (!core) return label;
    return label ? label + ': ' + core : core;
  }
  /* The metric the big number shows: the chart's, when there is a drawable chart. */
  function lead(c, chart) { return chart && c.chart ? c.chart : c.headline; }
  function chartSentence(ch, headline) {
    if (!ch || (headline && txt(ch.label) === txt(headline.label))) return '';
    var s = sentence(ch), xb = txt(ch.xBefore), xa = txt(ch.xAfter);
    return s && xb && xa ? s + ' (' + xb + ' to ' + xa + ')' : s;
  }
  function joinSentences(parts) {
    return parts.filter(Boolean).map(function (p) { return /[.?]$/.test(p) ? p : p + '.'; }).join(' ');
  }
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
    function safe(fn) { try { if (typeof fn === 'function') return fn(); } catch (e) { /* keep going */ } return undefined; }
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
      onRelayout: function (fn) { relayouts.push(fn); bind(); }
    };
  })();

  /* ------------------------------------------------------------------ the slope chart */

  var INTEGER_UNITS = /^(fte|ftes|goals|months|people|count|days|procedures)$/i;

  /* Round axis maximum ≥ max × 1.1, with 3–5 gridlines above zero. */
  function niceScale(maxVal, integer) {
    var target = maxVal * 1.1;
    if (!(target > 0)) return null;
    var mag = Math.pow(10, Math.floor(Math.log(target) / Math.LN10));
    var cands = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].map(function (c) { return +(c * mag).toPrecision(6); });
    var step = cands[cands.length - 1];
    for (var i = 0; i < cands.length; i++) {
      if (integer && cands[i] % 1 !== 0) continue;
      if (Math.ceil(target / cands[i] - 1e-9) <= 5) { step = cands[i]; break; }
    }
    var n = Math.ceil(target / step - 1e-9);
    if (n < 3 && (!integer || (step / 2) % 1 === 0)) { step = step / 2; n = Math.ceil(target / step - 1e-9); }
    return { step: step, n: n, max: +(step * n).toPrecision(6) };
  }
  function scaleFor(ch, a, b) {
    var sc = niceScale(Math.max(a, b), INTEGER_UNITS.test(txt(ch.unit)));
    /* a share can't pass 100%: cap percent axes there */
    if (sc && txt(ch.unit) === '%' && Math.max(a, b) <= 100 && sc.max > 100) sc = { step: 25, n: 4, max: 100 };
    return sc;
  }
  function tickLabel(v, unit) {
    var s = String(+v.toFixed(2)), u = txt(unit).toLowerCase();
    if (v === 0 && u.charAt(0) === '$') return '$0';
    if (u === '%') return s + '%';
    if (u === '$m') return '$' + s + 'M';
    if (u === '$k') return '$' + s + 'K';
    if (u === 'hours' || u === 'hour' || u === 'h') return s + ' h';
    if (u === 'min' || u === 'minutes') return s + ' min';
    return s;
  }
  function estWidth(str, size) { return String(str || '').length * size * 0.56; }
  function textWidth(node, str, size) {
    var w = 0;
    try { w = node.getComputedTextLength(); } catch (e) { w = 0; }
    return w > 0 ? w : estWidth(str, size);
  }

  /* Returns null when the chart data can't be drawn honestly (missing or negative values). */
  function Chart(ch, opts) {
    if (!ch || typeof ch !== 'object') return null;
    var b = num(ch.before), a = num(ch.after);
    if (!(isFinite(b) && isFinite(a) && b >= 0 && a >= 0 && (a > 0 || b > 0))) return null;
    var scale = scaleFor(ch, a, b);
    if (!scale) return null;
    opts = opts || {};
    var compact = !!opts.compact;
    var down = a < b;

    var box = hide(h('div', 'dc-chart' + (compact ? ' is-compact' : '') + (down ? ' is-down' : ' is-up')));
    var svg = svgEl('svg', { 'class': 'dc-chart-svg', focusable: 'false', 'aria-hidden': 'true' });
    box.appendChild(svg);

    var geo = null, f = 0, parts = null;

    function layout() {
      var W = box.clientWidth, H = box.clientHeight;
      if (!(W > 120 && H > 100)) return false;
      if (geo && geo.W === W && geo.H === H) return true;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);

      var tfs = compact ? 10.5 : 12, vfs = compact ? 12.5 : 14;
      var titleSide = !compact && W >= 480;
      var ticks = [];
      for (var i = 0; i <= scale.n; i++) ticks.push(+(i * scale.step).toPrecision(6));
      var tickW = 0;
      ticks.forEach(function (v) { tickW = Math.max(tickW, estWidth(tickLabel(v, ch.unit), tfs)); });

      var pl = r2(tickW + 10 + (titleSide ? 24 : 0));
      var pt = (titleSide ? 12 : (compact ? 26 : 30)) + vfs;
      var pr = W - 12, pb = H - (compact ? 22 : 30);
      var pw = pr - pl, ph = pb - pt;
      if (!(pw > 60 && ph > 40)) return false;
      function Y(v) { return r2(pb - (v / scale.max) * ph); }

      var g = svgEl('g', { 'class': 'dc-c-grid' });
      ticks.forEach(function (v) {
        var y = Y(v);
        g.appendChild(svgEl('line', { 'class': v === 0 ? 'dc-c-baseline' : 'dc-c-gridline', x1: pl, x2: pr, y1: y, y2: y }));
        g.appendChild(svgEl('text', { 'class': 'dc-c-tick', x: pl - 8, y: y, dy: '0.35em', 'text-anchor': 'end' }, tickLabel(v, ch.unit)));
      });
      svg.appendChild(g);

      var axis = txt(ch.axis);
      if (axis) {
        if (titleSide) {
          svg.appendChild(svgEl('text', {
            'class': 'dc-c-axis', x: 0, y: 0, 'text-anchor': 'middle',
            transform: 'translate(12,' + r2(pt + ph / 2) + ') rotate(-90)'
          }, axis));
        } else {
          svg.appendChild(svgEl('text', { 'class': 'dc-c-axis', x: 0, y: 11, 'text-anchor': 'start' }, axis));
        }
      }

      /* x positions: leave room for the value label on the side away from the line */
      var bLab = txt(ch.fmtBefore), aLab = txt(ch.fmtAfter);
      var bx, ax;
      if (down) {
        bx = pl + Math.max(28, pw * 0.14);
        ax = pr - Math.max(28, estWidth(aLab, vfs) + 16);
      } else {
        bx = pl + Math.max(28, estWidth(bLab, vfs) + 16);
        ax = pr - Math.max(28, pw * 0.14);
      }
      if (ax - bx < 60) { bx = pl + pw * 0.2; ax = pr - pw * 0.2; }
      bx = r2(bx); ax = r2(ax);
      var by = Y(b), ay = Y(a);

      /* x-axis labels, kept inside the box */
      [[bx, txt(ch.xBefore)], [ax, txt(ch.xAfter)]].forEach(function (p) {
        if (!p[1]) return;
        var t = svgEl('text', { 'class': 'dc-c-x', y: r2(pb + (compact ? 15 : 19)), 'text-anchor': 'middle' }, p[1]);
        svg.appendChild(t);
        var w = textWidth(t, p[1], tfs);
        t.setAttribute('x', r2(Math.min(Math.max(p[0], pl + w / 2 - 4), W - w / 2 - 2)));
      });
      svg.appendChild(svgEl('line', { 'class': 'dc-c-xtick', x1: bx, x2: bx, y1: pb, y2: pb + 4 }));
      svg.appendChild(svgEl('line', { 'class': 'dc-c-xtick', x1: ax, x2: ax, y1: pb, y2: pb + 4 }));

      /* shading: area under an improving rise, or the gap a reduction removed */
      var fill;
      if (down) {
        svg.appendChild(svgEl('line', { 'class': 'dc-c-guide', x1: bx, x2: ax, y1: by, y2: by }));
        fill = svgEl('path', { 'class': 'dc-c-fill dc-c-fill-down', d: 'M' + bx + ',' + by + ' L' + ax + ',' + by + ' L' + ax + ',' + ay + ' Z' });
      } else {
        fill = svgEl('path', { 'class': 'dc-c-fill dc-c-fill-up', d: 'M' + bx + ',' + pb + ' L' + ax + ',' + pb + ' L' + ax + ',' + ay + ' L' + bx + ',' + by + ' Z' });
      }
      svg.appendChild(fill);

      var line = svgEl('path', { 'class': 'dc-c-line', d: 'M' + bx + ',' + by + ' L' + ax + ',' + ay });
      svg.appendChild(line);
      var L = Math.hypot(ax - bx, ay - by);
      line.style.strokeDasharray = px(L) + ' ' + px(L + 2);

      var pB = svgEl('circle', { 'class': 'dc-c-pt dc-c-pt-before', cx: bx, cy: by, r: compact ? 4.5 : 5.5 });
      var pA = svgEl('circle', { 'class': 'dc-c-pt dc-c-pt-after', cx: ax, cy: ay, r: compact ? 5.5 : 6.5 });
      svg.appendChild(pB);
      svg.appendChild(pA);

      /* value labels: the real text from cases.js */
      var vB = null, vA = null;
      if (bLab) {
        if (down) {
          vB = svgEl('text', { 'class': 'dc-c-val dc-c-val-before', y: r2(by - 11), 'text-anchor': 'middle' }, bLab);
          svg.appendChild(vB);
          var wb = textWidth(vB, bLab, vfs);
          vB.setAttribute('x', r2(Math.min(Math.max(bx, wb / 2 + 2), W - wb / 2 - 2)));
        } else {
          vB = svgEl('text', { 'class': 'dc-c-val dc-c-val-before', x: r2(bx - 11), y: r2(by - 7), 'text-anchor': 'end' }, bLab);
          svg.appendChild(vB);
        }
      }
      if (aLab) {
        if (down) {
          vA = svgEl('text', { 'class': 'dc-c-val dc-c-val-after', x: r2(ax + 11), y: r2(ay - 7), 'text-anchor': 'start' }, aLab);
          svg.appendChild(vA);
        } else {
          vA = svgEl('text', { 'class': 'dc-c-val dc-c-val-after', y: r2(ay - 12), 'text-anchor': 'middle' }, aLab);
          svg.appendChild(vA);
          var wa = textWidth(vA, aLab, vfs);
          vA.setAttribute('x', r2(Math.min(ax, W - wa / 2 - 2)));
        }
      }

      parts = { line: line, fill: fill, pB: pB, pA: pA, vB: vB, vA: vA };
      geo = { W: W, H: H, L: L };
      set(f);
      return true;
    }

    function toggle(node, on) { if (node) node.classList.toggle('is-on', on); }
    function set(p) {
      f = clamp01(p);
      if (!geo || !parts) return;
      parts.line.style.strokeDashoffset = px(geo.L * (1 - f));
      parts.fill.style.opacity = String(r2(f));
      toggle(parts.pB, f > 0); toggle(parts.vB, f > 0);
      toggle(parts.pA, f >= 1); toggle(parts.vA, f >= 1);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { try { layout(); } catch (e) { /* leave as drawn */ } }).observe(box);
    }
    engine.onRelayout(layout);

    return { box: box, layout: layout, set: set };
  }

  /* Hooks a list of {chart, li, el} up to scroll: each chart draws as it moves up the viewport. */
  function animate(entries, rm) {
    function finishOne(e) { if (e.chart) e.chart.set(1); e.done = true; e.li.classList.add('is-drawn'); }
    entries.forEach(function (e) { if (e.chart) e.chart.layout(); });
    if (rm || !engine.supported) { entries.forEach(finishOne); return; }
    entries.forEach(function (e) {
      if (!e.chart) { finishOne(e); return; }
      e.chart.set(0);
      var top = 0;
      var added = engine.add({
        target: e.chart.box,
        measure: function () { top = e.chart.box.getBoundingClientRect().top + viewportY(); },
        update: function (y, vh, atEnd) {
          var p = atEnd ? 1 : clamp01((vh * 0.88 - (top - y)) / (vh * 0.4));
          e.chart.set(p);
          if (p >= 1) { finishOne(e); return true; }
          return false;
        },
        finish: function () { finishOne(e); }
      });
      if (!added) finishOne(e);
    });
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

  function stripCard(c) {
    var m = c.headline;
    var li = h('li', 'dc-card-item');
    var a = h('a', 'dc-card');
    a.setAttribute('href', c.url);
    var chart = Chart(c.chart, { compact: true });
    if (chart) a.appendChild(chart.box);

    var body = h('span', 'dc-card-body');
    var big = lead(c, chart);
    body.appendChild(sr(joinSentences([txt(c.kicker), sentence(big), big !== m ? sentence(m) : ''])));
    var after = txt(big.fmtAfter);
    if (after) body.appendChild(hide(h('span', 'dc-after', after)));
    var label = txt(big.label);
    if (label) body.appendChild(hide(h('span', 'dc-label', label)));
    var kicker = txt(c.kicker);
    if (kicker) body.appendChild(hide(h('span', 'dc-kicker', kicker)));
    body.appendChild(h('span', 'dc-more', 'Read the case study'));
    a.appendChild(body);
    li.appendChild(a);
    return { li: li, chart: chart, done: false };
  }

  function strip(el, ctx) {
    if (!el) return;
    var cases = validCases(ctx);
    if (cases.length < 2) return;                       /* leave the server HTML untouched */
    var rm = !!(ctx && ctx.reducedMotion);

    var wrap = h('div', 'dc-strip-wrap');
    var ul = h('ul', 'dc-cards');
    ul.setAttribute('role', 'list');
    var cards = cases.map(function (c) { var card = stripCard(c); ul.appendChild(card.li); return card; });
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
    if (rm) el.classList.add('dc-rm');
    var band = (el.closest && el.closest('section')) || el;
    band.classList.add('dc-strip-band');
    el.insertBefore(contour(), el.firstChild);

    animate(cards, rm);
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

    el.classList.add('dc-hero');
    el.insertBefore(art, el.firstChild);
    if (rm) { el.classList.add('dc-rm'); return; }

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

  /* ------------------------------------------------------------------ cases */

  function routeCard(c) {
    var m = c.headline;
    var li = h('li', 'dc-tl-item');
    var card = h('div', 'dc-route');

    var kicker = txt(c.kicker);
    if (kicker) card.appendChild(h('p', 'dc-kicker', kicker));
    var title = h('h3', 'dc-route-title');
    var link = h('a', 'dc-route-link', txt(c.title) || txt(m.label) || 'Read the case study');
    link.setAttribute('href', c.url);
    title.appendChild(link);
    card.appendChild(title);

    var chart = Chart(c.chart, { compact: false });
    if (chart) card.appendChild(chart.box);
    /* metrics list: the headline first when the chart shows something else; never repeat the chart */
    var shown = txt(lead(c, chart).label);
    var metrics = arr(c.metrics).filter(function (x) { return x && typeof x === 'object' && txt(x.label) !== shown; });
    if (txt(m.label) !== shown) metrics.unshift(m);

    var result = h('p', 'dc-result');
    var big = lead(c, chart);
    result.appendChild(sr(joinSentences([chartSentence(big, null), txt(c.timeframe)])));
    var after = txt(big.fmtAfter);
    if (after) result.appendChild(hide(h('span', 'dc-after', after)));
    var label = txt(big.label);
    if (label) result.appendChild(hide(h('span', 'dc-label', label)));
    card.appendChild(result);
    var tf = txt(c.timeframe);
    if (tf) card.appendChild(hide(h('p', 'dc-timeframe', tf)));

    var summary = txt(c.summary);
    if (summary) card.appendChild(h('p', 'dc-summary', summary));

    if (metrics.length) {
      var dl = h('dl', 'dc-markers');
      metrics.forEach(function (mt) {
        var row = h('div', 'dc-marker' + (scalable(mt) ? '' : ' is-qual'));
        row.appendChild(h('dt', null, txt(mt.label)));
        row.appendChild(valueNodes(h('dd'), mt));
        dl.appendChild(row);
      });
      card.appendChild(dl);
    }
    card.appendChild(hide(h('span', 'dc-more', 'Read the case study')));
    li.appendChild(card);
    return { li: li, chart: chart, done: false };
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

    if (original && original.parentNode) original.parentNode.replaceChild(ul, original);
    else el.insertBefore(ul, el.firstChild);
    el.classList.add('dc-cases', 'dc-n' + Math.min(list.length, 4));
    if (rm) el.classList.add('dc-rm');

    animate(cards, rm);
  }

  /* ------------------------------------------------------------------ chart (story cards)
     Only the slope chart, for one case. The story card's HTML carries the title, numbers and link.
     Self-contained: no parent classes or other renderers needed. */
  function chart(el, ctx) {
    if (!el) return;
    var c = arr(ctx && ctx.cases)[0];
    if (!c || typeof c !== 'object') return;
    var ch = Chart(c.chart, { compact: false });
    if (!ch) return;                                  /* leave the fallback text */
    var rm = !!(ctx && ctx.reducedMotion);
    var line = chartSentence(c.chart, null);
    while (el.firstChild) el.removeChild(el.firstChild);
    el.classList.add('dc-chart-solo');
    if (rm) el.classList.add('dc-rm');
    if (line) el.appendChild(sr(line + '.'));
    el.appendChild(ch.box);
    animate([{ chart: ch, li: el, done: false }], rm);
  }

  /* ------------------------------------------------------------------ anim: one per Solutions page
     Margins and Cash: the AP invoice line as a working machine. Invoices ride a belt through
     Receive, Extract line items and Verify; gears turn on one drive shaft; each station drops
     cost into its bin; a Gross margin dial reads short of Target.
       1 Measure the gap: the Extract bin fills far higher; the gap is bracketed on the dial.
       2 Find the cause: a lens opens the Extract housing: typed twice, checked line by line,
         batches wait. Everything else dims.
       3 Build the fix: the extra arms retract, a gear "Built into the app" drops in, invoices
         go one at a time, the bin drains, the needle reaches Target, "Standard work" locks on.
     No numbers or amounts. Two clocks: t (the story, 0–8s, then held) and clock (the motion,
     always running while visible). Every frame is a pure function of both. */

  var MACHINE_END = 8;
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  function machineState(t) {
    var e = function (a, b) { return ease(seg(t, a, b)); };
    var stage = t < 2.6 ? 0 : (t < 5.2 ? 1 : 2);
    return {
      stage: stage,
      progress: stage === 0 ? seg(t, 0, 2.6) : (stage === 1 ? seg(t, 2.6, 5.2) : seg(t, 5.2, MACHINE_END)),
      fillLow: 0.26 * e(0.2, 2.2),
      fillHigh: 0.88 * e(0.2, 2.2) - 0.62 * e(6.2, 7.2),
      gap: e(1.6, 2.1) * (1 - e(7.0, 7.4)),
      needle: 155 - 120 * e(6.4, 7.6),
      onTarget: e(7.2, 7.6),
      dim: e(2.6, 3.0) * (1 - e(5.6, 6.0)),
      lens: e(2.6, 3.0) * (1 - e(5.6, 6.0)),
      lensSlide: 1 - e(2.6, 3.2),
      inspect: e(2.7, 3.1) * (1 - e(5.6, 6.0)),
      arms: e(3.0, 3.4) * (1 - e(5.2, 5.6)),
      armsUp: e(5.2, 5.6),
      lensLabels: e(3.4, 3.8) * (1 - e(5.2, 5.5)),
      queue: 4 * e(2.8, 4.2) * (1 - e(6.0, 6.8)),
      batchLabel: e(3.2, 3.6) * (1 - e(6.0, 6.4)),
      bunch: 1 - e(6.0, 7.0),
      fixedRate: e(6.2, 6.6),
      newGear: e(5.8, 6.4),
      gearLabel: e(6.3, 6.7),
      oneAtATime: e(6.6, 7.0),
      flowOk: e(6.0, 6.6),
      plate: e(7.2, 7.7)
    };
  }

  function gearPath(r, teeth) {
    var d = '', n = teeth * 2, ri = r * 0.78;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, rr = i % 2 ? ri : r;
      var p0 = [rr * Math.cos(a0 + 0.06), rr * Math.sin(a0 + 0.06)], p1 = [rr * Math.cos(a1 - 0.06), rr * Math.sin(a1 - 0.06)];
      d += (i ? ' L' : 'M') + r2(p0[0]) + ',' + r2(p0[1]) + ' L' + r2(p1[0]) + ',' + r2(p1[1]);
    }
    return d + ' Z';
  }
  function polar(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [r2(cx + r * Math.cos(a)), r2(cy - r * Math.sin(a))]; }

  function animMachine(el, ctx) {
    var rm = !!(ctx && ctx.reducedMotion);
    var steps = arr(ctx && ctx.group && ctx.group.steps);
    var fallback = ['Measure the gap', 'Find the cause on the floor', 'Build the fix into the system'];

    el.classList.add('dc-anim', 'dc-anim-machine');
    if (rm) el.classList.add('dc-rm');

    /* stage strip */
    var strip = h('div', 'dc-stages');
    var segs = fallback.map(function (f, i) {
      var s = h('div', 'dc-stage');
      var n = h('span', 'dc-stage-n', String(i + 1));
      var lab = h('span', 'dc-stage-t', txt(steps[i] && steps[i].title) || f);
      var bar = h('span', 'dc-stage-bar');
      var fillBar = h('span', 'dc-stage-fill');
      bar.appendChild(fillBar);
      s.appendChild(bar);
      s.appendChild(n);
      s.appendChild(lab);
      strip.appendChild(s);
      return { el: s, fill: fillBar };
    });
    var box = h('div', 'dc-anim-box');
    var svg = svgEl('svg', { 'class': 'dc-anim-svg', focusable: 'false', 'aria-hidden': 'true' });
    box.appendChild(svg);
    el.appendChild(strip);
    el.appendChild(box);

    var uidM = 'dcm' + Math.floor(Math.random() * 1e6);
    var G = null;

    function label(parent, x, y, str, cls, anchor, plate, fs) {
      var g = svgEl('g', { 'class': 'dc-k-label' });
      if (plate) {
        var w = str.length * fs * 0.57 + 10, lx = anchor === 'start' ? x - 5 : (anchor === 'end' ? x - w + 5 : x - w / 2);
        g.appendChild(svgEl('rect', { 'class': 'dc-k-plate', x: r2(lx), y: r2(y - fs - 1), width: r2(w), height: r2(fs + 7), rx: 3 }));
      }
      g.appendChild(svgEl('text', { 'class': 'dc-k-t ' + (cls || ''), x: r2(x), y: r2(y), 'text-anchor': anchor || 'middle' }, str));
      parent.appendChild(g);
      return g;
    }
    /* one or two lines, for narrow layouts */
    function label2(parent, x, y, lines, cls, anchor, fs) {
      var g = svgEl('g', { 'class': 'dc-k-label' });
      lines.forEach(function (ln, i) {
        g.appendChild(svgEl('text', { 'class': 'dc-k-t ' + (cls || ''), x: r2(x), y: r2(y - (lines.length - 1 - i) * (fs + 2)), 'text-anchor': anchor || 'middle' }, ln));
      });
      parent.appendChild(g);
      return g;
    }

    function layout() {
      var W = box.clientWidth, H = box.clientHeight;
      if (!(W > 240 && H > 200)) return false;
      if (G && G.W === W && G.H === H) return true;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);

      var N = W < 640;
      var fs = N ? 11 : 13;
      var beltY = N ? 70 : 92, bt = N ? 10 : 14;
      var cw = N ? 18 : 32, ch = N ? 14 : 22;
      var hy0 = N ? 26 : 30, hy1 = N ? 88 : 118;
      var by0 = N ? 110 : 148, bh = N ? 60 : 80, bw = N ? 34 : 56;
      var gearY = N ? 222 : 278, gr = N ? 18 : 26;
      var R = N ? 30 : 58, gx = W - R - (N ? 44 : 56), gy = N ? 70 : 120;
      var beltEnd = gx - R - (N ? 10 : 26), x0b = N ? 8 : 14;
      var a = N ? 58 : 170, b = beltEnd - (N ? 32 : 90), m = (a + b) / 2;
      var spacing = m - a;
      var hw = N ? 50 : Math.min(150, spacing * 0.5);
      var stX = [a, m, b];
      var LR = N ? 40 : Math.min(72, spacing * 0.55);
      var v = N ? 30 : 56, sp = N ? 44 : 78;

      var defs = svgEl('defs');
      var clip = svgEl('clipPath', { id: uidM + 'l' });
      clip.appendChild(svgEl('circle', { cx: 0, cy: 0, r: LR - 2 }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      var dimG = svgEl('g');
      svg.appendChild(dimG);

      /* drive shaft, rods, gears */
      dimG.appendChild(svgEl('line', { 'class': 'dc-k-shaft', x1: 6, x2: r2(b + (N ? 36 : 70)), y1: gearY, y2: gearY }));
      dimG.appendChild(svgEl('rect', { 'class': 'dc-k-solid', x: 0, y: gearY - (N ? 9 : 12), width: N ? 10 : 14, height: N ? 18 : 24, rx: 2 }));
      var gears = stX.map(function (x) {
        dimG.appendChild(svgEl('line', { 'class': 'dc-k-rod', x1: r2(x), x2: r2(x), y1: hy1, y2: gearY }));
        var g = svgEl('g');
        g.appendChild(svgEl('path', { 'class': 'dc-k-gear', d: gearPath(gr, N ? 9 : 11) }));
        g.appendChild(svgEl('circle', { 'class': 'dc-k-hub', r: r2(gr * 0.28) }));
        dimG.appendChild(g);
        return { g: g, x: x };
      });

      /* cost bins */
      var bins = stX.map(function (x) {
        var bx = r2(x - bw / 2);
        dimG.appendChild(svgEl('rect', { 'class': 'dc-k-binbg', x: bx, y: by0, width: bw, height: bh }));
        var f = svgEl('rect', { 'class': 'dc-k-cost', x: bx, width: bw, y: by0 + bh, height: 0 });
        dimG.appendChild(f);
        dimG.appendChild(svgEl('path', { 'class': 'dc-k-bin', d: 'M' + bx + ',' + by0 + ' V' + (by0 + bh) + ' H' + r2(x + bw / 2) + ' V' + by0 }));
        return { fill: f, x: x };
      });
      var coins = [0, 1, 2, 3].map(function () { var cn = svgEl('circle', { 'class': 'dc-k-coin', r: N ? 4 : 6, cx: r2(stX[0]), cy: hy1 }); cn.style.display = 'none'; return dimG.appendChild(cn); });

      /* belt with rollers and moving tread */
      dimG.appendChild(svgEl('rect', { 'class': 'dc-k-solid', x: x0b, y: beltY, width: r2(beltEnd - x0b), height: bt, rx: bt / 2 }));
      var tread = svgEl('line', { 'class': 'dc-k-tread', x1: x0b + bt / 2, x2: r2(beltEnd - bt / 2), y1: beltY + bt / 2, y2: beltY + bt / 2 });
      dimG.appendChild(tread);

      /* invoice cards on the belt */
      var cardsG = svgEl('g');
      dimG.appendChild(cardsG);
      var beltLen = beltEnd - x0b;
      var pool = [];
      var poolN = Math.ceil(beltLen / (sp * 0.45)) + 4;
      for (var p = 0; p < poolN; p++) {
        var cg = svgEl('g', { 'class': 'dc-k-card' });
        cg.appendChild(svgEl('rect', { x: 0, y: 0, width: cw, height: ch, rx: 2 }));
        cg.appendChild(svgEl('line', { x1: r2(cw * 0.18), x2: r2(cw * 0.82), y1: r2(ch * 0.35), y2: r2(ch * 0.35) }));
        cg.appendChild(svgEl('line', { x1: r2(cw * 0.18), x2: r2(cw * 0.6), y1: r2(ch * 0.68), y2: r2(ch * 0.68) }));
        cardsG.appendChild(cg);
        pool.push(cg);
      }

      /* intake chute */
      dimG.appendChild(svgEl('path', { 'class': 'dc-k-housing', d: N ? 'M2,40 H30 L26,68 H8 Z' : 'M2,42 H54 L44,' + (beltY - 2) + ' H14 Z' }));
      if (N) label2(dimG, 0, 112, ['Invoices', 'in'], 'b', 'start', fs);
      else label(dimG, 0, 26, 'Invoices in', 'b', 'start', false, fs);

      /* station housings over the belt */
      var names = [['Receive'], N ? ['Extract', 'line items'] : ['Extract line items'], ['Verify']];
      var housings = stX.map(function (x, i) {
        var hsg = svgEl('rect', { 'class': 'dc-k-housing', x: r2(x - hw / 2), y: hy0, width: r2(hw), height: hy1 - hy0, rx: 4 });
        dimG.appendChild(hsg);
        label2(dimG, x, hy0 - 8, names[i], 'b', 'middle', fs);
        return hsg;
      });

      /* dial gauge */
      var arcL = polar(gx, gy, R, 180), arcR = polar(gx, gy, R, 0);
      dimG.appendChild(svgEl('path', { 'class': 'dc-k-dial', d: 'M' + arcL + ' A' + R + ',' + R + ' 0 0 1 ' + arcR + ' Z' }));
      var t0 = polar(gx, gy, R * 0.74, 35), t1 = polar(gx, gy, R * 1.08, 35);
      dimG.appendChild(svgEl('line', { 'class': 'dc-k-target', x1: t0[0], y1: t0[1], x2: t1[0], y2: t1[1] }));
      var tl = polar(gx, gy, R + (N ? 5 : 8), 35);
      label(dimG, tl[0] + 2, tl[1] - 2, 'Target', 'b', 'start', false, fs);
      label(dimG, gx, gy + (N ? 17 : 24), 'Gross margin', 'b', 'middle', false, fs);
      var gapArc = svgEl('path', { 'class': 'dc-k-gaparc' });
      dimG.appendChild(gapArc);
      var gapLab = label(dimG, gx, r2(gy - R - (N ? 12 : 18)), 'The gap', 'b', 'middle', false, fs);
      var needle = svgEl('line', { 'class': 'dc-k-needle', x1: gx, y1: gy });
      var needleOk = svgEl('line', { 'class': 'dc-k-needle ok', x1: gx, y1: gy });
      dimG.appendChild(needle);
      dimG.appendChild(needleOk);
      dimG.appendChild(svgEl('circle', { 'class': 'dc-k-solid', cx: gx, cy: gy, r: N ? 4 : 6 }));

      /* --- undimmed layer: the problem and the fix --- */
      var topG = svgEl('g');
      svg.appendChild(topG);

      /* queue of waiting batches before Extract */
      var qx = m - hw / 2 - (N ? 3 : 14) - cw, qdx = N ? 1.5 : 3, qdy = N ? 4 : 7;
      var queue = [0, 1, 2, 3].map(function (j) {
        var qg = svgEl('g', { 'class': 'dc-k-card dc-k-wait', transform: 'translate(' + r2(qx - j * qdx) + ',' + r2(beltY - ch - j * qdy) + ')' });
        qg.appendChild(svgEl('rect', { x: 0, y: 0, width: cw, height: ch, rx: 2 }));
        qg.appendChild(svgEl('line', { x1: r2(cw * 0.18), x2: r2(cw * 0.82), y1: r2(ch * 0.35), y2: r2(ch * 0.35) }));
        topG.appendChild(qg);
        return qg;
      });
      var batchLab = N ? label(topG, qx + cw / 2, beltY + bt + 15, 'Batches wait', 'b', 'middle', true, fs)
        : label(topG, qx + cw / 2 - 4, beltY - ch - 3 * qdy - 10, 'Batches wait', 'b', 'middle', true, fs);

      /* the new gear, built into the app */
      var ngx = m + (N ? 30 : 48);
      var newGear = svgEl('g');
      newGear.appendChild(svgEl('path', { 'class': 'dc-k-gear ok', d: gearPath(gr, N ? 9 : 11) }));
      newGear.appendChild(svgEl('circle', { 'class': 'dc-k-hub', r: r2(gr * 0.28) }));
      topG.appendChild(newGear);
      var gearLab = label(topG, ngx, gearY + gr + (N ? 15 : 19), 'Built into the app', 'b', 'middle', true, fs);
      var oneLab = N ? label(topG, (m + b) / 2, beltY + bt + 15, 'One at a time', 'b', 'middle', true, fs)
        : label(topG, (m + b) / 2, beltY - ch - 14, 'One at a time', 'b', 'middle', true, fs);

      /* Standard work plate */
      var pw = N ? 84 : 112, ph = N ? 16 : 20;
      var plate = svgEl('g');
      plate.appendChild(svgEl('rect', { 'class': 'dc-k-plate-ok', x: r2(m - pw / 2), y: r2(hy1 - ph - 4), width: pw, height: ph, rx: 3 }));
      plate.appendChild(svgEl('text', { 'class': 'dc-k-t dc-k-plate-t', x: r2(m), y: r2(hy1 - 4 - ph / 2 + fs * 0.36), 'text-anchor': 'middle' }, 'Standard work'));
      topG.appendChild(plate);

      /* the lens over Extract line items */
      var lensG = svgEl('g');
      var lensInner = svgEl('g', { 'clip-path': 'url(#' + uidM + 'l)' });
      lensInner.appendChild(svgEl('circle', { 'class': 'dc-k-lensbg', r: LR }));
      var s = LR / 72;
      lensInner.appendChild(svgEl('rect', { 'class': 'dc-k-solid', x: r2(-LR), y: r2(38 * s), width: r2(LR * 2), height: r2(8 * s) }));
      var work = svgEl('g', { 'class': 'dc-k-card' });
      work.appendChild(svgEl('rect', { x: r2(-30 * s), y: r2(-6 * s), width: r2(60 * s), height: r2(44 * s), rx: 3 }));
      [6, 16, 26].forEach(function (y) { work.appendChild(svgEl('line', { x1: r2(-22 * s), x2: r2(22 * s), y1: r2(y * s), y2: r2(y * s) })); });
      lensInner.appendChild(work);
      var armsG = svgEl('g');
      var armL = svgEl('path', { 'class': 'dc-k-arm' }), armR = svgEl('path', { 'class': 'dc-k-arm' }), armC = svgEl('path', { 'class': 'dc-k-arm' });
      var tipL = svgEl('circle', { 'class': 'dc-k-tip', r: r2(3.5 * s) }), tipR = svgEl('circle', { 'class': 'dc-k-tip', r: r2(3.5 * s) });
      var pointer = svgEl('path', { 'class': 'dc-k-tip' });
      [armL, armR, armC, tipL, tipR, pointer].forEach(function (n) { armsG.appendChild(n); });
      lensInner.appendChild(armsG);
      lensG.appendChild(lensInner);
      lensG.appendChild(svgEl('line', { 'class': 'dc-k-handle', x1: r2(LR * 0.72), y1: r2(LR * 0.72), x2: r2(LR * 1.12), y2: r2(LR * 1.12) }));
      lensG.appendChild(svgEl('circle', { 'class': 'dc-k-rim', r: LR }));
      var lensLabs = svgEl('g');
      label(lensLabs, 0, LR + (N ? 14 : 18), 'Typed twice', 'b', 'middle', true, fs);
      label(lensLabs, 0, LR + (N ? 14 : 18) + fs + 6, 'Checked line by line', 'b', 'middle', true, fs);
      lensG.appendChild(lensLabs);
      svg.appendChild(lensG);

      G = { W: W, H: H, N: N, s: s, beltY: beltY, bt: bt, cw: cw, ch: ch, hy1: hy1, by0: by0, bh: bh, gearY: gearY, gr: gr,
        R: R, gx: gx, gy: gy, x0b: x0b, beltEnd: beltEnd, beltLen: beltLen, m: m, hw: hw, LR: LR, v: v, sp: sp, stX: stX, ngx: ngx,
        dimG: dimG, gears: gears, bins: bins, coins: coins, tread: tread, pool: pool, housing2: housings[1],
        gapArc: gapArc, gapLab: gapLab, needle: needle, needleOk: needleOk, queue: queue, batchLab: batchLab,
        newGear: newGear, gearLab: gearLab, oneLab: oneLab, plate: plate, lensG: lensG, armsG: armsG,
        armL: armL, armR: armR, armC: armC, tipL: tipL, tipR: tipR, pointer: pointer, lensLabs: lensLabs };
      render(lastT, lastClock);
      return true;
    }

    var lastT = 0, lastClock = 0;
    function op(n, v) { n.style.opacity = String(r2(clamp01(v))); }

    function render(t, clock) {
      lastT = t; lastClock = clock;
      var S = machineState(Math.min(t, MACHINE_END));
      segs.forEach(function (sg, i) {
        sg.el.classList.toggle('is-active', i === S.stage);
        sg.el.classList.toggle('is-done', i < S.stage);
        sg.fill.style.transform = 'scaleX(' + r2(i < S.stage ? 1 : (i === S.stage ? S.progress : 0)) + ')';
      });
      if (!G) return;
      var g = G;
      op(g.dimG, 1 - 0.6 * S.dim);

      /* gears and tread: steady rotation */
      var ang = (clock * 40) % 360;
      g.gears.forEach(function (gr) { gr.g.setAttribute('transform', 'translate(' + r2(gr.x) + ',' + g.gearY + ') rotate(' + r2(ang) + ')'); });
      var dropH = g.gearY - g.hy1;
      g.newGear.setAttribute('transform', 'translate(' + r2(g.ngx) + ',' + r2(g.gearY - (1 - S.newGear) * dropH) + ') rotate(' + r2(-ang + 16) + ')');
      op(g.newGear, S.newGear * 4);
      g.tread.style.strokeDashoffset = px(-(clock * g.v) % 20);

      /* cards: batches of three before the fix, evenly spaced after */
      var P = g.beltLen / g.v, flow = (clock + P) * g.v, used = 0;
      var kMax = Math.floor(flow / g.sp) + 2;
      for (var k = kMax; k >= 0 && used < g.pool.length; k--) {
        var u = flow - k * g.sp + ((k % 3) - 1) * 0.55 * g.sp * S.bunch;
        if (u < -g.cw) continue;
        if (u > g.beltLen) break;
        var c = g.pool[used++];
        var x = g.x0b + u;
        c.setAttribute('transform', 'translate(' + r2(x) + ',' + r2(g.beltY - g.ch) + ')');
        c.setAttribute('class', 'dc-k-card' + (S.flowOk > 0.5 && x > g.m + g.hw / 2 ? ' ok' : ''));
        c.style.opacity = '1';
      }
      for (; used < g.pool.length; used++) g.pool[used].style.opacity = '0';

      /* cost bins and falling coins */
      var levels = [S.fillLow, S.fillHigh, S.fillLow];
      g.bins.forEach(function (bn, i) {
        var hgt = levels[i] * g.bh;
        bn.fill.setAttribute('y', r2(g.by0 + g.bh - hgt));
        bn.fill.setAttribute('height', r2(hgt));
      });
      var fast = 0.4 + 1.2 * S.fixedRate;
      [[0, 1.6, 0], [1, fast, 0], [1, fast, 0.5], [2, 1.6, 0.8]].forEach(function (cdef, j) {
        var coin = g.coins[j], period = cdef[1];
        var ph = ((clock + cdef[2] * period) % period + period) % period;
        if (t <= 0 || ph > 0.45 || (j === 2 && S.fixedRate > 0.5)) { coin.style.display = 'none'; return; }
        coin.style.display = '';
        var top = g.hy1 + 4, bottom = g.by0 + g.bh - levels[cdef[0]] * g.bh - 5;
        var q = ph / 0.45;
        coin.setAttribute('cx', r2(g.stX[cdef[0]] + (j === 2 ? 8 : 0)));
        coin.setAttribute('cy', r2(top + (bottom - top) * q * q));
      });

      /* dial */
      var tip = polar(g.gx, g.gy, g.R * 0.86, S.needle);
      [g.needle, g.needleOk].forEach(function (n) { n.setAttribute('x2', tip[0]); n.setAttribute('y2', tip[1]); });
      op(g.needleOk, S.onTarget);
      op(g.needle, 1 - S.onTarget);
      var rr = g.R + (g.N ? 5 : 8), p0 = polar(g.gx, g.gy, rr, S.needle), p1 = polar(g.gx, g.gy, rr, 35);
      g.gapArc.setAttribute('d', 'M' + p0 + ' A' + rr + ',' + rr + ' 0 0 1 ' + p1);
      op(g.gapArc, S.gap);
      op(g.gapLab, S.gap);

      /* the inspection */
      op(g.housing2, 1);
      g.housing2.style.fillOpacity = String(r2(1 - 0.85 * S.inspect));
      g.queue.forEach(function (q, j) { op(q, S.queue - j); });
      op(g.batchLab, S.batchLab);
      var lx = g.m + S.lensSlide * Math.min(g.W * 0.2, 160), ly = g.beltY + (g.N ? 6 : 10);
      g.lensG.setAttribute('transform', 'translate(' + r2(lx) + ',' + r2(ly) + ')');
      op(g.lensG, S.lens);
      g.lensG.style.display = S.lens > 0.001 ? '' : 'none';
      op(g.lensLabs, S.lensLabels);
      if (S.lens > 0.001) {
        var sc = g.s, bob = 3 * sc * Math.sin(clock * 14), bob2 = 3 * sc * Math.sin(clock * 14 + Math.PI);
        var lineY = (6 + 10 * (Math.floor(clock * 2.5) % 3)) * sc;
        var pts = function (list) { return 'M' + list.map(function (p) { return r2(p[0] * sc) + ',' + r2(p[1] * sc); }).join(' L'); };
        g.armL.setAttribute('d', pts([[-66, -50], [-44, -30], [-12, -8 + bob / sc]]));
        g.armR.setAttribute('d', pts([[66, -50], [44, -30], [12, -8 + bob2 / sc]]));
        g.armC.setAttribute('d', pts([[70, 40], [52, 30], [30, lineY / sc]]));
        g.tipL.setAttribute('cx', r2(-12 * sc)); g.tipL.setAttribute('cy', r2(-8 * sc + bob));
        g.tipR.setAttribute('cx', r2(12 * sc)); g.tipR.setAttribute('cy', r2(-8 * sc + bob2));
        g.pointer.setAttribute('d', 'M' + r2(30 * sc) + ',' + r2(lineY) + ' l' + r2(-8 * sc) + ',' + r2(-4 * sc) + ' v' + r2(8 * sc) + ' Z');
        g.armsG.setAttribute('transform', 'translate(0,' + r2(-g.LR * S.armsUp) + ')');
        op(g.armsG, S.arms);
      }

      /* the fix */
      op(g.gearLab, S.gearLabel);
      op(g.oneLab, S.oneAtATime);
      g.plate.setAttribute('transform', 'translate(0,' + r2(-(1 - S.plate) * 16) + ')');
      op(g.plate, S.plate);
    }

    if ('ResizeObserver' in window) new ResizeObserver(function () { try { layout(); } catch (e) { /* static */ } }).observe(box);
    layout();

    if (rm || !('IntersectionObserver' in window) || typeof window.requestAnimationFrame !== 'function') {
      render(MACHINE_END, 3.3);
      return;
    }

    /* story plays once at 40% in view; the machine keeps running gently while visible */
    var elapsed = 0, clock = 0, visible = false, started = false, raf = 0, prev = 0;
    function tick(now) {
      raf = 0;
      if (!visible) return;
      var dt = prev ? Math.min(0.1, Math.max(0, (now - prev) / 1000)) : 0;
      prev = now;
      elapsed += dt;
      clock += dt;
      render(elapsed, clock);
      raf = window.requestAnimationFrame(tick);
    }
    function run() { if (!raf) { prev = 0; raf = window.requestAnimationFrame(tick); } }
    render(0, 0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) { started = true; run(); }
      });
    }, { threshold: 0.4 });
    io.observe(el);

    var btn = h('button', 'dc-anim-replay', 'Replay');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Replay the illustration');
    btn.addEventListener('click', function () {
      elapsed = 0;
      render(0, clock);
      if (started) run();
    });
    /* outside the aria-hidden container, so the control stays reachable */
    if (el.parentNode) el.parentNode.insertBefore(btn, el.nextSibling);
  }

  function anim(el, ctx) {
    if (!el || !ctx) return;
    if (ctx.groupId === 'margins-and-cash') animMachine(el, ctx);
    /* scaling-through-change and faster-service: not built yet, container stays empty */
  }
  WP.register('c', { strip: strip, hero: hero, cases: cases, chart: chart, anim: anim });
})();
