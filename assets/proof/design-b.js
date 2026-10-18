/* Proof components, Design B: "Control Room".
   Each case is a gauge whose needle swings from the red zone to where the operation runs now.
   Registers strip, hero, steps and cases renderers with the loader in proof.js.
   Every value shown comes from WAYA_CASES (fmtBefore / fmtAfter); gauges are drawn to a
   log scale only when both before and after are numbers above 0. Anything else is shown as
   text with a fixed "target" mark and a dashed trail, never as a measured position. */
(function () {
  'use strict';
  if (!window.WayaProof || typeof window.WayaProof.register !== 'function') return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  function nextId(p) { uid += 1; return 'pb-' + p + '-' + uid; }

  /* ---------- small helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function str(v) { return v == null ? '' : String(v); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function prefersReduced(ctx) {
    if (ctx && ctx.reducedMotion) return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function validCases(ctx) {
    var list = ctx && Array.isArray(ctx.cases) ? ctx.cases : [];
    return list.filter(function (c) { return c && c.headline && typeof c.url === 'string'; });
  }

  /* ---------- magnitude helper (shared rule) ---------- */
  function num(v) { return typeof v === 'number' ? v : NaN; }
  function scalable(m) {
    var b = num(m && m.before), a = num(m && m.after);
    return isFinite(b) && isFinite(a) && b > 0 && a > 0;
  }
  /* Positions on the dial, 0..1, "good" always clockwise.
     Scalable: log scale between the two values, padded 15% each side, flipped when lower is better.
     Qualitative: a fixed start and the target mark at 0.85. */
  function positions(m) {
    if (!scalable(m)) {
      return { q: true, pb: str(m && m.fmtBefore) ? 0.15 : 0, pa: 0.85 };
    }
    var b = m.before, a = m.after;
    var lo = Math.min(a, b) * 0.85, hi = Math.max(a, b) * 1.15;
    var span = Math.log(hi / lo);
    function pos(v) { return clamp(Math.log(v / lo) / span, 0, 1); }
    var pb = pos(b), pa = pos(a);
    if (m.better === 'down') { pb = 1 - pb; pa = 1 - pa; }
    return { q: false, pb: pb, pa: pa };
  }
  function sentence(m) {
    var label = str(m.label), b = str(m.fmtBefore), a = str(m.fmtAfter);
    var vals = b ? b + ' to ' + a : a;
    return label ? label + ': ' + vals : vals;
  }

  /* ---------- easing ---------- */
  function bezier(x1, y1, x2, y2) {
    function cx(t) { return 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t; }
    function cy(t) { return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 24; i++) {
        t = (lo + hi) / 2;
        if (cx(t) < x) lo = t; else hi = t;
      }
      return cy(t);
    };
  }
  var spring = bezier(0.34, 1.56, 0.64, 1);
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* One animation runner per element: starting a new run cancels the old one. */
  function runner() {
    var token = 0;
    return function (dur, delay, frame, done) {
      token += 1;
      var mine = token, start = null;
      function tick(now) {
        if (mine !== token) return;
        if (start === null) start = now + (delay || 0);
        var t = dur > 0 ? clamp((now - start) / dur, 0, 1) : 1;
        if (now >= start) frame(t);
        if (t < 1 || now < start) window.requestAnimationFrame(tick);
        else if (done) done();
      }
      window.requestAnimationFrame(tick);
    };
  }

  /* ---------- count-up: only for a single plain number inside fmtAfter ---------- */
  function counterParts(text) {
    var s = str(text);
    var found = s.match(/\d+(?:\.\d+)?/g);
    if (!found || found.length !== 1 || /\d,\d/.test(s)) return null;
    var i = s.indexOf(found[0]);
    var dec = (found[0].split('.')[1] || '').length;
    return { pre: s.slice(0, i), post: s.slice(i + found[0].length), n: parseFloat(found[0]), dec: dec };
  }
  function countText(p, t) { return p.pre + (p.n * t).toFixed(p.dec) + p.post; }

  /* ---------- the dial ---------- */
  var CX = 180, CY = 186, R = 150, SWEEP = 240;
  function angleOf(p) { return -SWEEP / 2 + SWEEP * p; }
  function pointAt(p, r) {
    var a = angleOf(p) * Math.PI / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  }
  function arc(p0, p1, r) {
    var a = Math.min(p0, p1), b = Math.max(p0, p1);
    if (b - a < 0.002) return '';
    var s = pointAt(a, r), e = pointAt(b, r);
    var large = (b - a) * SWEEP > 180 ? 1 : 0;
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }

  function buildDial(size) {
    var root = svg('svg', { viewBox: '0 0 360 274', class: 'pb-dial pb-dial-' + size, 'aria-hidden': 'true', focusable: 'false' });
    root.appendChild(svg('path', { class: 'pb-track', d: arc(0, 1, R) }));
    var ticks = svg('g', { class: 'pb-ticks' });
    var count = size === 'sm' ? 12 : 24;
    for (var i = 0; i <= count; i++) {
      var p = i / count, major = i % (count / 4) === 0;
      var o = pointAt(p, R - 14), n = pointAt(p, R - (major ? 26 : 20));
      ticks.appendChild(svg('line', { x1: o[0].toFixed(2), y1: o[1].toFixed(2), x2: n[0].toFixed(2), y2: n[1].toFixed(2), class: major ? 'pb-tick pb-tick-major' : 'pb-tick' }));
    }
    root.appendChild(ticks);
    var red = svg('path', { class: 'pb-zone-red', d: '' });
    var trail = svg('path', { class: 'pb-trail', d: '' });
    var target = svg('path', { class: 'pb-target', d: '' });
    root.appendChild(red); root.appendChild(trail); root.appendChild(target);
    var needle = svg('g', { class: 'pb-needle' });
    needle.appendChild(svg('line', { x1: CX, y1: CY + 18, x2: CX, y2: CY - R + 28, class: 'pb-needle-line' }));
    needle.appendChild(svg('circle', { cx: CX, cy: CY - R + 28, r: 3.5, class: 'pb-needle-tip' }));
    root.appendChild(needle);
    var hub = svg('g', { class: 'pb-hub' });
    hub.appendChild(svg('circle', { cx: CX, cy: CY, r: 13, class: 'pb-hub-ring' }));
    hub.appendChild(svg('circle', { cx: CX, cy: CY, r: 5, class: 'pb-hub-dot' }));
    root.appendChild(hub);

    var run = runner();
    var state = { pb: 0, pa: 0, q: false };
    function draw(cur) {
      needle.setAttribute('transform', 'rotate(' + angleOf(clamp(cur, -0.02, 1.02)).toFixed(2) + ' ' + CX + ' ' + CY + ')');
      trail.setAttribute('d', arc(state.pb, clamp(cur, 0, 1), R));
    }
    function set(pos) {
      state = pos;
      red.setAttribute('d', arc(0, pos.pb, R));
      trail.setAttribute('class', pos.q ? 'pb-trail pb-trail-q' : 'pb-trail');
      if (pos.q) {
        var t1 = pointAt(0.85, R + 12), t2 = pointAt(0.85 - 0.018, R + 26), t3 = pointAt(0.85 + 0.018, R + 26);
        target.setAttribute('d', 'M' + t1[0].toFixed(2) + ' ' + t1[1].toFixed(2) + ' L' + t2[0].toFixed(2) + ' ' + t2[1].toFixed(2) + ' L' + t3[0].toFixed(2) + ' ' + t3[1].toFixed(2) + ' Z');
      } else {
        target.setAttribute('d', '');
      }
    }
    return {
      node: root,
      set: set,
      rest: function () { run(0, 0, function () { draw(state.pb); }); draw(state.pb); },
      finish: function () { run(0, 0, function () { draw(state.pa); }); draw(state.pa); },
      sweep: function (dur, delay, onT) {
        draw(state.pb);
        run(dur, delay, function (t) {
          draw(state.pb + (state.pa - state.pb) * spring(t));
          if (onT) onT(t);
        });
      },
      pulse: function () {
        hub.classList.remove('is-pulse');
        void hub.getBoundingClientRect();
        hub.classList.add('is-pulse');
      }
    };
  }

  function onView(target, threshold, fn) {
    if (!target) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: threshold });
    io.observe(target);
  }

  /* ======================================================================
     STRIP: dial on the left, channel picker (ARIA tabs) on the right
     ====================================================================== */
  function strip(host, ctx) {
    var cases = validCases(ctx);
    if (!host || cases.length < 2) return;
    var reduced = prefersReduced(ctx);

    var oldList = host.querySelector('.proof-list');
    var oldCta = host.querySelector('.proof-cta');
    var ctaText = (oldCta && oldCta.textContent.trim()) || 'Schedule a Call';
    var moreEl = host.querySelector('.proof-more');
    var moreText = (moreEl && moreEl.textContent.trim()) || 'Read the case study';

    var console_ = el('div', 'pb-console pb-strip pb-n' + Math.min(cases.length, 4));
    var grid = el('div', 'pb-grid');

    /* left: the dial and its readout (visual; the sentence lives in the tabpanel) */
    var dialCol = el('div', 'pb-dialcol');
    dialCol.setAttribute('aria-hidden', 'true');
    var dial = buildDial('lg');
    var dialWrap = el('div', 'pb-dialwrap');
    dialWrap.appendChild(dial.node);
    var rLabel = el('p', 'pb-read-label');
    var rVals = el('p', 'pb-read-vals');
    var rBefore = el('span', 'pb-before');
    var rArrow = el('span', 'pb-arrow', '→');
    var rAfter = el('span', 'pb-after');
    rVals.appendChild(rBefore); rVals.appendChild(rArrow); rVals.appendChild(rAfter);
    dialCol.appendChild(dialWrap); dialCol.appendChild(rLabel); dialCol.appendChild(rVals);

    /* right: tabs, panel, button */
    var side = el('div', 'pb-side');
    var tabsWrap = el('div', 'pb-tabs-wrap');
    var tablist = el('div', 'pb-tabs');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Case results');
    var panelId = nextId('panel');
    var tabs = cases.map(function (c, i) {
      var t = el('button', 'pb-tab');
      t.type = 'button';
      t.id = nextId('tab');
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', panelId);
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
      t.appendChild(el('span', 'pb-tab-kicker', str(c.kicker)));
      t.appendChild(el('span', 'pb-tab-title', str(c.title)));
      t.addEventListener('click', function () { select(i, true, false); });
      tablist.appendChild(t);
      return t;
    });
    tabsWrap.appendChild(tablist);

    var panel = el('div', 'pb-panel');
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    var live = el('p', 'pb-sr');
    live.setAttribute('aria-live', 'polite');
    var summary = el('p', 'pb-summary');
    var read = el('a', 'pb-readlink');
    var readText = el('span', null, moreText);
    var readSr = el('span', 'pb-sr');
    read.appendChild(readText); read.appendChild(readSr);
    panel.appendChild(live); panel.appendChild(summary); panel.appendChild(read);

    var cta = el('p', 'pb-cta');
    var btn = el('a', 'btn-rust', ctaText);
    btn.href = ctx.bookingUrl;
    cta.appendChild(btn);

    side.appendChild(tabsWrap); side.appendChild(panel); side.appendChild(cta);
    grid.appendChild(dialCol); grid.appendChild(side);
    console_.appendChild(grid);

    var current = -1, seen = false;
    var countRun = runner();

    function showAfter(c, dur, delay) {
      var text = str(c.headline.fmtAfter);
      var parts = counterParts(text);
      if (!parts || reduced || !dur) { countRun(0, 0, function () {}); rAfter.textContent = text; return; }
      rAfter.textContent = countText(parts, 0);
      countRun(dur, delay, function (t) { rAfter.textContent = t >= 1 ? text : countText(parts, easeOut(t)); });
    }

    function select(i, announce, focus) {
      if (i < 0 || i >= cases.length) return;
      var changed = i !== current;
      current = i;
      var c = cases[i], h = c.headline;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-active', on);
      });
      if (focus) tabs[i].focus();
      panel.setAttribute('aria-labelledby', tabs[i].id);
      if (announce) live.textContent = sentence(h);
      else if (!live.textContent) live.textContent = sentence(h);
      summary.textContent = str(c.summary);
      read.href = c.url;
      readSr.textContent = ': ' + str(c.title);

      var pos = positions(h);
      dial.set(pos);
      rLabel.textContent = str(h.label);
      var hasBefore = !!str(h.fmtBefore);
      rBefore.textContent = str(h.fmtBefore);
      rBefore.hidden = !hasBefore;
      rArrow.hidden = !hasBefore;
      rVals.classList.toggle('is-q', pos.q);
      rVals.classList.toggle('is-long', str(h.fmtAfter).length > 12);
      keepInView(i);

      if (reduced) { dial.finish(); showAfter(c, 0, 0); return; }
      if (!seen) { dial.rest(); rAfter.textContent = str(h.fmtAfter); return; }
      if (changed || announce) {
        dial.sweep(600, 0);
        showAfter(c, 600, 0);
        dial.pulse();
      }
    }

    /* keep the active chip visible in the mobile scroll row without moving the page */
    function keepInView(i) {
      var t = tabs[i];
      if (!t || tablist.scrollWidth <= tablist.clientWidth + 1) return;
      var left = t.offsetLeft - tablist.offsetLeft, right = left + t.offsetWidth;
      if (left < tablist.scrollLeft) tablist.scrollLeft = left;
      else if (right > tablist.scrollLeft + tablist.clientWidth) tablist.scrollLeft = right - tablist.clientWidth;
    }
    function edgeState() {
      var end = tablist.scrollLeft + tablist.clientWidth >= tablist.scrollWidth - 2;
      tabsWrap.classList.toggle('is-end', end);
    }
    tablist.addEventListener('scroll', edgeState, { passive: true });

    tablist.addEventListener('keydown', function (e) {
      var k = e.key, n = cases.length, i = current;
      if (k === 'ArrowRight' || k === 'ArrowDown') i = (current + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') i = (current - 1 + n) % n;
      else if (k === 'Home') i = 0;
      else if (k === 'End') i = n - 1;
      else return;
      e.preventDefault();
      select(i, true, true);
    });

    /* swap in: the enhanced console replaces the plain list and button */
    select(0, false, false);
    if (oldList && oldList.parentNode === host) host.removeChild(oldList);
    if (oldCta && oldCta.parentNode === host) host.removeChild(oldCta);
    host.appendChild(console_);
    host.classList.add('pb-on');
    edgeState();

    if (reduced) { seen = true; return; }
    onView(dialWrap, 0.5, function () {
      seen = true;
      dial.sweep(900, 300);
      showAfter(cases[current], 900, 300);
    });
  }

  /* ======================================================================
     HERO: a big idle gauge in the red that sweeps to sage once scrolled
     ====================================================================== */
  function hero(host, ctx) {
    if (!host) return;
    var reduced = prefersReduced(ctx);
    if (host.querySelector('.pb-hero-gauge')) return;

    var wrap = el('div', 'pb-hero-gauge');
    wrap.setAttribute('aria-hidden', 'true');
    var root = svg('svg', { viewBox: '0 0 360 274', class: 'pb-dial pb-dial-hero', focusable: 'false' });
    root.appendChild(svg('path', { class: 'pb-track', d: arc(0, 1, R) }));
    var ticks = svg('g', { class: 'pb-ticks' });
    for (var i = 0; i <= 40; i++) {
      var p = i / 40, major = i % 10 === 0;
      var o = pointAt(p, R - 14), n = pointAt(p, R - (major ? 28 : 20));
      ticks.appendChild(svg('line', { x1: o[0].toFixed(2), y1: o[1].toFixed(2), x2: n[0].toFixed(2), y2: n[1].toFixed(2), class: major ? 'pb-tick pb-tick-major' : 'pb-tick' }));
    }
    root.appendChild(ticks);
    root.appendChild(svg('path', { class: 'pb-zone-red', d: arc(0, 0.3, R) }));
    root.appendChild(svg('path', { class: 'pb-zone-good', d: arc(0.7, 1, R) }));
    var wobble = svg('g', { class: 'pb-wobble' });
    var needle = svg('g', { class: 'pb-needle' });
    needle.appendChild(svg('line', { x1: CX, y1: CY + 18, x2: CX, y2: CY - R + 28, class: 'pb-needle-line' }));
    wobble.appendChild(needle);
    root.appendChild(wobble);
    root.appendChild(svg('circle', { cx: CX, cy: CY, r: 13, class: 'pb-hub-ring' }));
    root.appendChild(svg('circle', { cx: CX, cy: CY, r: 5, class: 'pb-hub-dot' }));
    wrap.appendChild(root);

    var IDLE = 0.13, GOOD = 0.86;
    function draw(p) { needle.setAttribute('transform', 'rotate(' + angleOf(p).toFixed(2) + ' ' + CX + ' ' + CY + ')'); }

    host.insertBefore(wrap, host.firstChild);
    host.classList.add('pb-on');

    if (reduced) { draw(GOOD); wrap.classList.add('is-good'); return; }
    draw(IDLE);
    wrap.classList.add('is-idle');

    var done = false, run = runner();
    function go() {
      if (done) return;
      done = true;
      wrap.classList.remove('is-idle');
      wrap.classList.add('is-good');
      run(1100, 0, function (t) { draw(IDLE + (GOOD - IDLE) * spring(t)); });
    }
    function check(rect) { if (rect && -rect.top >= rect.height * 0.3) go(); }
    if (!('IntersectionObserver' in window)) { go(); return; }
    var th = [];
    for (var k = 0; k <= 50; k++) th.push(k / 50);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { check(e.boundingClientRect); });
      if (done) io.disconnect();
    }, { threshold: th });
    io.observe(host);
  }

  /* ======================================================================
     STEPS: a three-position rotary switch beside the step cards
     ====================================================================== */
  function steps(host, ctx) {
    if (!host) return;
    var items = Array.prototype.filter.call(host.children, function (n) { return n.tagName === 'LI'; });
    if (items.length < 2 || host.querySelector('.pb-knob-li')) return;
    var reduced = prefersReduced(ctx);
    var n = items.length;
    var ANG = n === 3 ? [-60, 0, 60] : items.map(function (_, i) { return -60 + (120 * i) / (n - 1); });

    /* knob (decorative) */
    var knobLi = el('li', 'pb-knob-li');
    knobLi.setAttribute('aria-hidden', 'true');
    knobLi.style.setProperty('--pb-rows', String(n));
    var k = svg('svg', { viewBox: '0 0 160 160', class: 'pb-knob', focusable: 'false' });
    k.appendChild(svg('circle', { cx: 80, cy: 80, r: 74, class: 'pb-knob-bezel' }));
    var marks = ANG.map(function (a, i) {
      var rad = a * Math.PI / 180;
      var g = svg('g', { class: 'pb-knob-mark' });
      g.appendChild(svg('line', { x1: (80 + 58 * Math.sin(rad)).toFixed(2), y1: (80 - 58 * Math.cos(rad)).toFixed(2), x2: (80 + 66 * Math.sin(rad)).toFixed(2), y2: (80 - 66 * Math.cos(rad)).toFixed(2) }));
      var label = svg('text', { x: (80 + 46 * Math.sin(rad)).toFixed(2), y: (80 - 46 * Math.cos(rad) + 4).toFixed(2), 'text-anchor': 'middle' });
      label.textContent = String(i + 1);
      g.appendChild(label);
      k.appendChild(g);
      return g;
    });
    var rot = svg('g', { class: 'pb-knob-rot' });
    rot.appendChild(svg('circle', { cx: 80, cy: 80, r: 34, class: 'pb-knob-body' }));
    for (var r = 0; r < 16; r++) {
      var ra = (r / 16) * Math.PI * 2;
      rot.appendChild(svg('line', { x1: (80 + 28 * Math.sin(ra)).toFixed(2), y1: (80 - 28 * Math.cos(ra)).toFixed(2), x2: (80 + 33 * Math.sin(ra)).toFixed(2), y2: (80 - 33 * Math.cos(ra)).toFixed(2), class: 'pb-knob-grip' }));
    }
    rot.appendChild(svg('line', { x1: 80, y1: 76, x2: 80, y2: 52, class: 'pb-knob-pointer' }));
    k.appendChild(rot);
    k.appendChild(svg('circle', { cx: 80, cy: 80, r: 6, class: 'pb-knob-cap' }));
    knobLi.appendChild(k);

    /* cards: each title becomes a button inside its h3 so the switch is keyboard operable */
    var buttons = items.map(function (li, i) {
      li.classList.add('pb-step');
      var h = li.querySelector('h3');
      var b = el('button', 'pb-step-btn');
      b.type = 'button';
      b.tabIndex = i === 0 ? 0 : -1;
      if (h) {
        while (h.firstChild) b.appendChild(h.firstChild);
        h.appendChild(b);
      } else {
        b.textContent = 'Step ' + (i + 1);
        b.classList.add('pb-sr');
        li.insertBefore(b, li.firstChild);
      }
      b.addEventListener('click', function (e) { e.stopPropagation(); select(i, false); });
      li.addEventListener('click', function () { select(i, false); });
      b.addEventListener('keydown', function (e) {
        var key = e.key, j = i;
        if (key === 'ArrowDown' || key === 'ArrowRight') j = (i + 1) % n;
        else if (key === 'ArrowUp' || key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (key === 'Home') j = 0;
        else if (key === 'End') j = n - 1;
        else return;
        e.preventDefault();
        select(j, true);
      });
      return b;
    });

    var current = -1;
    function select(i, focus) {
      if (i < 0 || i >= n) return;
      current = i;
      items.forEach(function (li, j) { li.classList.toggle('is-active', j === i); });
      buttons.forEach(function (b, j) {
        b.tabIndex = j === i ? 0 : -1;
        if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      marks.forEach(function (m, j) { m.setAttribute('class', j === i ? 'pb-knob-mark is-on' : 'pb-knob-mark'); });
      rot.style.transform = 'rotate(' + ANG[i] + 'deg)';
      if (focus) buttons[i].focus();
    }

    host.insertBefore(knobLi, host.firstChild);
    host.classList.add('pb-on');
    if (reduced) host.classList.add('pb-still');
    select(0, false);

    /* scroll: each step activates as it crosses the middle of the viewport */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var i = items.indexOf(e.target);
          if (i >= 0 && i !== current) select(i, false);
        });
      }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
      items.forEach(function (li) { io.observe(li); });
    }
  }

  /* ======================================================================
     CASES: a bank of small gauges with bar meters for the extra metrics
     ====================================================================== */
  function meter(m) {
    var li = el('li', 'pb-meter');
    var top = el('p', 'pb-meter-label', str(m.label));
    var vals = el('p', 'pb-meter-vals');
    if (str(m.fmtBefore)) {
      vals.appendChild(el('span', 'pb-meter-before', m.fmtBefore));
      var arr = el('span', 'pb-arrow', ' → ');
      arr.setAttribute('aria-hidden', 'true');
      var arrSr = el('span', 'pb-sr', ' to ');
      vals.appendChild(arr); vals.appendChild(arrSr);
    }
    vals.appendChild(el('span', 'pb-meter-after', str(m.fmtAfter)));
    var bar = el('div', 'pb-bar');
    bar.setAttribute('aria-hidden', 'true');
    var pos = positions(m);
    if (pos.q) {
      bar.classList.add('is-q');
    } else {
      var fill = el('span', 'pb-bar-fill');
      var tick = el('span', 'pb-bar-tick');
      fill.style.setProperty('--pb-from', pos.pb.toFixed(4));
      fill.style.setProperty('--pb-to', pos.pa.toFixed(4));
      tick.style.left = (pos.pb * 100).toFixed(2) + '%';
      bar.appendChild(fill); bar.appendChild(tick);
    }
    li.appendChild(top); li.appendChild(bar); li.appendChild(vals);
    return li;
  }

  function cases(host, ctx) {
    var list = validCases(ctx);
    if (!host || list.length < 2) return;
    var reduced = prefersReduced(ctx);
    var oldList = host.querySelector('.proof-list');
    var moreEl = host.querySelector('.proof-more');
    var moreText = (moreEl && moreEl.textContent.trim()) || 'Read the case study';

    var console_ = el('div', 'pb-console pb-cases pb-n' + Math.min(list.length, 4));
    var bank = el('ul', 'pb-bank');
    var dials = [];
    list.forEach(function (c) {
      var h = c.headline;
      var card = el('li', 'pb-card');
      var dial = buildDial('sm');
      var pos = positions(h);
      dial.set(pos);
      var dw = el('div', 'pb-card-dial');
      dw.appendChild(dial.node);
      card.appendChild(dw);
      dials.push(dial);

      card.appendChild(el('p', 'pb-card-kicker', str(c.kicker)));
      var title = el('h3', 'pb-card-title');
      var link = el('a', 'pb-card-link', str(c.title));
      link.href = c.url;
      title.appendChild(link);
      card.appendChild(title);

      var head = el('div', 'pb-card-head' + (pos.q ? ' is-q' : ''));
      head.appendChild(el('p', 'pb-card-label', str(h.label)));
      var vals = el('p', 'pb-card-vals');
      if (str(h.fmtBefore)) {
        vals.appendChild(el('span', 'pb-before', h.fmtBefore));
        var arr = el('span', 'pb-arrow', '→');
        arr.setAttribute('aria-hidden', 'true');
        vals.appendChild(arr);
        vals.appendChild(el('span', 'pb-sr', ' to '));
      }
      vals.appendChild(el('span', 'pb-after', str(h.fmtAfter)));
      head.appendChild(vals);
      card.appendChild(head);

      var metrics = Array.isArray(c.metrics) ? c.metrics.filter(Boolean).slice(0, 3) : [];
      if (metrics.length) {
        var ml = el('ul', 'pb-meters');
        metrics.forEach(function (m) { ml.appendChild(meter(m)); });
        card.appendChild(ml);
      }
      var more = el('p', 'pb-card-more');
      var moreSpan = el('span', null, moreText);
      moreSpan.setAttribute('aria-hidden', 'true');
      more.appendChild(moreSpan);
      card.appendChild(more);
      bank.appendChild(card);
    });
    console_.appendChild(bank);

    /* keep whatever else the page put in the container (the program link) as the panel footer */
    var foot = el('div', 'pb-foot');
    Array.prototype.slice.call(host.childNodes).forEach(function (node) {
      if (node === oldList) return;
      if (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim())) foot.appendChild(node);
    });
    if (foot.childNodes.length) console_.appendChild(foot);

    if (oldList && oldList.parentNode === host) host.removeChild(oldList);
    host.appendChild(console_);
    host.classList.add('pb-on');

    if (reduced) {
      dials.forEach(function (d) { d.finish(); });
      console_.classList.add('is-on', 'pb-still');
      return;
    }
    dials.forEach(function (d) { d.rest(); });
    onView(bank.querySelector('.pb-card-dial'), 0.5, function () {
      dials.forEach(function (d, i) { d.sweep(900, 300 + i * 90); });
      console_.classList.add('is-on');
    });
  }

  window.WayaProof.register('b', { strip: strip, hero: hero, steps: steps, cases: cases });
})();
