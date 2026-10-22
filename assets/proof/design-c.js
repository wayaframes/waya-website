/* Proof components, Design C: "The Climb".
   Each case gets an honest two-point slope chart drawn from its `chart` data: a y-axis from 0
   with labelled gridlines in the real unit, two labelled x positions, and a straight line from
   the before value to the after value. Lines go down when the number went down. Value labels
   are the fmtBefore / fmtAfter text from cases.js, never computed. Nothing is normalised.
   Two optional chart fields: `axisMin` starts the y-axis above zero (the line is drawn without
   the area wash, since a filled area implies a zero base), and `zones` ([left, right] labels)
   draws two dashed boxes, one around each point, labelled on top.
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
    var min = num(ch.axisMin);
    if (!(isFinite(min) && min > 0 && min < Math.min(a, b))) min = 0;
    var sc = niceScale(Math.max(a, b) - min, INTEGER_UNITS.test(txt(ch.unit)));
    /* a share can't pass 100%: cap percent axes there */
    if (sc && !min && txt(ch.unit) === '%' && Math.max(a, b) <= 100 && sc.max > 100) sc = { step: 25, n: 4, max: 100 };
    if (sc) sc.min = min;                              /* sc.max is the span above sc.min */
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
      for (var i = 0; i <= scale.n; i++) ticks.push(+(scale.min + i * scale.step).toPrecision(6));
      var tickW = 0;
      ticks.forEach(function (v) { tickW = Math.max(tickW, estWidth(tickLabel(v, ch.unit), tfs)); });

      var pl = r2(tickW + 10 + (titleSide ? 24 : 0));
      /* zone labels sit above their boxes; on narrow charts they wrap to two lines */
      var zones = arr(ch.zones).map(txt).filter(Boolean);
      if (zones.length !== 2) zones = null;
      var zfs = compact ? 10.5 : 12;
      var zoneW = (W - (tickW + 10 + (titleSide ? 24 : 0)) - 12) / 2 - 10;
      var zWrap = !!zones && zones.some(function (z) { return z.indexOf(' ') > 0 && estWidth(z, zfs) > zoneW - 8; });
      var pt = (titleSide ? 12 : (compact ? 26 : 30)) + vfs + (zones ? (zWrap ? 2 : 1) * (zfs + 4) + 4 : 0);
      var pr = W - 12, pb = H - (compact ? 22 : 30);
      var pw = pr - pl, ph = pb - pt;
      if (!(pw > 60 && ph > 40)) return false;
      function Y(v) { return r2(pb - ((v - scale.min) / scale.max) * ph); }

      var g = svgEl('g', { 'class': 'dc-c-grid' });
      ticks.forEach(function (v, i) {
        var y = Y(v);
        g.appendChild(svgEl('line', { 'class': i === 0 ? 'dc-c-baseline' : 'dc-c-gridline', x1: pl, x2: pr, y1: y, y2: y }));
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

      if (zones) {
        var mid = (bx + ax) / 2, gap = 5, zTop = r2(pt - 8), zH = r2(pb - zTop);
        [[pl + 2, mid - gap, zones[0], 'before'], [mid + gap, pr - 2, zones[1], 'after']].forEach(function (z) {
          svg.appendChild(svgEl('rect', { 'class': 'dc-c-zone dc-c-zone-' + z[3], x: r2(z[0]), y: zTop, width: r2(z[1] - z[0]), height: zH, rx: 8 }));
          var cx = r2((z[0] + z[1]) / 2), words = z[2].split(' ');
          var lines = [z[2]];
          if (zWrap && words.length > 1) {
            var half = Math.ceil(words.length / 2);
            lines = [words.slice(0, half).join(' '), words.slice(half).join(' ')];
          }
          lines.forEach(function (ln, i) {
            svg.appendChild(svgEl('text', { 'class': 'dc-c-zone-label', x: cx, y: r2(zTop - 7 - (lines.length - 1 - i) * (zfs + 3)), 'text-anchor': 'middle' }, ln));
          });
        });
      }

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
      } else if (!scale.min) {
        fill = svgEl('path', { 'class': 'dc-c-fill dc-c-fill-up', d: 'M' + bx + ',' + pb + ' L' + ax + ',' + pb + ' L' + ax + ',' + ay + ' L' + bx + ',' + by + ' Z' });
      }
      if (fill) svg.appendChild(fill);

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
        } else if (zones) {
          vB = svgEl('text', { 'class': 'dc-c-val dc-c-val-before', y: r2(by - 12), 'text-anchor': 'middle' }, bLab);
          svg.appendChild(vB);
          var wz = textWidth(vB, bLab, vfs);
          vB.setAttribute('x', r2(Math.max(bx, pl + wz / 2 + 6)));
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
      if (parts.fill) parts.fill.style.opacity = String(r2(f));
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

  /* Steps: the problem pages ship their own step cards, so Design C leaves them alone. */
  WP.register('c', { strip: strip, hero: hero, cases: cases, chart: chart });
})();
