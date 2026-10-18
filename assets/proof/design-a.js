/* Proof components, Design A: "The Ledger".
   Each result is an entry in an operator's ledger. One range input (the wipe) slides across the
   Before and After columns, like an auditor closing a period.
   Registers strip, hero, steps and cases renderers with the loader in proof.js.
   Every value shown is fmtBefore / fmtAfter from WAYA_CASES. Before is struck through only when
   the result is scalable (both values are numbers above 0); qualitative results stay plain.
   Graphics are aria-hidden; each result has a text sentence for screen readers. */
(function () {
  'use strict';
  var WP = window.WayaProof;
  if (!WP || typeof WP.register !== 'function') return;

  var DUR = 1100;          /* wipe intro, ms */
  var STAGGER = 90;        /* per row, ms */
  var DASH = '–';     /* en dash for an empty value */

  /* ---------- helpers ---------- */
  function str(v) { return v == null ? '' : String(v).trim(); }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : NaN; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function scalable(m) {
    if (!m) return false;
    var b = num(m.before), a = num(m.after);
    return b > 0 && a > 0;
  }
  function hasValue(m) { return !!(m && typeof m === 'object' && (str(m.fmtBefore) || str(m.fmtAfter))); }
  function sentence(m) {
    var l = str(m.label), b = str(m.fmtBefore), a = str(m.fmtAfter);
    var v = b && a ? b + ' to ' + a : (a || b);
    return l ? (v ? l + ': ' + v : l) : v;
  }
  function kickerText(c) {
    var k = str(c.kicker), co = str(c.company);
    if (co && k.toLowerCase().indexOf(co.toLowerCase()) < 0) return k ? k + ' · ' + co : co;
    return k;
  }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  }
  function hide(e) { e.setAttribute('aria-hidden', 'true'); return e; }
  function toArray(list) { return Array.prototype.slice.call(list || []); }
  function usable(ctx) {
    var list = ctx && Array.isArray(ctx.cases) ? ctx.cases : [];
    return list.filter(function (c) { return c && typeof c === 'object' && hasValue(c.headline); });
  }
  function metricsOf(c) {
    return Array.isArray(c.metrics) ? c.metrics.filter(hasValue) : [];
  }
  function isReduced(ctx) {
    if (ctx && ctx.reducedMotion) return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function canAnimate() {
    return typeof window.requestAnimationFrame === 'function' && 'IntersectionObserver' in window;
  }

  /* cubic-bezier easing (x1, y1, x2, y2), solved with Newton steps then bisection */
  function bezier(x1, y1, x2, y2) {
    function A(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function B(p1, p2) { return 3 * p2 - 6 * p1; }
    function C(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((A(p1, p2) * t + B(p1, p2)) * t + C(p1)) * t; }
    function slope(t, p1, p2) { return 3 * A(p1, p2) * t * t + 2 * B(p1, p2) * t + C(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i;
      for (i = 0; i < 6; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (at(t, x1, x2) - x) / s;
      }
      if (!(t >= 0 && t <= 1) || Math.abs(at(t, x1, x2) - x) > 1e-4) {
        var lo = 0, hi = 1;
        t = x;
        for (i = 0; i < 24; i++) {
          var v = at(t, x1, x2);
          if (Math.abs(v - x) < 1e-5) break;
          if (v < x) lo = t; else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return at(clamp(t, 0, 1), y1, y2);
    };
  }
  var ease = bezier(0.2, 0.7, 0.2, 1);

  /* Fire fn once when the element's top passes 70% of the viewport, or after it has been
     on screen for 1.2s, whichever comes first. Works for elements taller than the viewport. */
  function onView(el, fn) {
    var done = false, timer = 0;
    function go() { if (done) return; done = true; if (timer) clearTimeout(timer); try { io1.disconnect(); io2.disconnect(); } catch (e) { /* ignore */ } fn(); }
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io1, io2;
    try {
      io1 = new IntersectionObserver(function (en) {
        if (en.some(function (x) { return x.isIntersecting; })) go();
      }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
      io2 = new IntersectionObserver(function (en) {
        var vis = en.some(function (x) { return x.isIntersecting; });
        if (vis && !timer) timer = setTimeout(go, 1200);
        else if (!vis && timer) { clearTimeout(timer); timer = 0; }
      }, { threshold: 0 });
      io1.observe(el);
      io2.observe(el);
    } catch (err) { fn(); }
  }

  /* ---------- the value cell: Before and After stacked in one grid area ---------- */
  function valueCell(m) {
    var b = str(m.fmtBefore), a = str(m.fmtAfter);
    var cell = hide(h('span', 'pa-val ' + (scalable(m) ? 'pa-scal' : 'pa-qual') + (b ? '' : ' pa-nob')));
    var bl = h('span', 'pa-b');
    bl.appendChild(h('span', 'pa-b-txt', b || DASH));
    var al = h('span', 'pa-a', a || DASH);
    al.setAttribute('data-flap', b || a || DASH);
    cell.appendChild(bl);
    cell.appendChild(al);
    cell.appendChild(h('span', 'pa-seam'));
    if (b) {
      var foot = h('span', 'pa-foot');
      foot.appendChild(h('span', 'pa-foot-k', 'Before'));
      foot.appendChild(h('span', 'pa-foot-v', b));
      cell.appendChild(foot);
    }
    return cell;
  }

  /* ---------- the wipe: one range input driving --wipe on every target ---------- */
  function makeWipe(targets, reduced) {
    var wrap = h('div', 'pa-ctl');
    var input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.className = 'pa-range';
    input.setAttribute('aria-label', 'Compare before and after');
    var labs = hide(h('span', 'pa-ctl-labs'));
    labs.appendChild(h('span', 'pa-ctl-b', 'Before'));
    labs.appendChild(h('span', 'pa-ctl-a', 'After'));
    wrap.appendChild(input);
    wrap.appendChild(labs);

    var prev = targets.map(function () { return -1; });
    var raf = 0;

    function flip(el) {
      el.classList.remove('is-flip');
      void el.offsetWidth;   /* restart the animation */
      el.classList.add('is-flip');
      setTimeout(function () { el.classList.remove('is-flip'); }, 240);
    }
    function apply(el, i, v) {
      v = clamp(v, 0, 100);
      el.style.setProperty('--wipe', v.toFixed(2) + '%');
      el.style.setProperty('--wipe-n', (v / 100).toFixed(4));
      el.classList.toggle('is-after', v >= 50);
      el.classList.toggle('is-mid', v > 0 && v < 100);
      if (!reduced && prev[i] >= 0 && prev[i] < 50 && v >= 50) flip(el);
      prev[i] = v;
    }
    function setCtl(v) {
      v = clamp(v, 0, 100);
      var r = Math.round(v);
      input.value = String(r);
      wrap.style.setProperty('--wipe-n', (v / 100).toFixed(4));
      input.setAttribute('aria-valuetext', r <= 0 ? 'Before' : r >= 100 ? 'After' : r + '% revealed');
    }
    function setAll(v) {
      targets.forEach(function (t, i) { apply(t, i, v); });
      setCtl(v);
    }
    /* Per-target animation. Wide screens: the first row entering plays every row, staggered.
       Narrow screens (one column, long list): each row plays as it scrolls into view.
       Fail-safe: a row that has been on screen for 1.2s without playing jumps to After. */
    var started = targets.map(function () { return false; });
    var t0s = targets.map(function () { return null; });
    var lastStarted = -1, touched = false, observers = [], safety = [];

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      wrap.classList.remove('is-playing');
    }
    function loop(ts) {
      var active = false;
      t0s.forEach(function (t0, i) {
        if (t0 === null) return;
        var p = clamp((ts - t0) / DUR, 0, 1);
        if (ts < t0) p = 0;
        apply(targets[i], i, ease(p) * 100);
        if (p < 1) active = true; else t0s[i] = null;
      });
      if (lastStarted >= 0) setCtl(prev[lastStarted] < 0 ? 0 : prev[lastStarted]);
      if (active) raf = window.requestAnimationFrame(loop);
      else stop();
    }
    function startTarget(i, delay) {
      if (touched || started[i]) return;
      started[i] = true;
      lastStarted = i;
      if (safety[i]) { clearTimeout(safety[i]); safety[i] = 0; }
      var now = (window.performance && performance.now) ? performance.now() : Date.now();
      t0s[i] = now + (delay || 0);
      if (!raf) { wrap.classList.add('is-playing'); raf = window.requestAnimationFrame(loop); }
    }
    function jumpTarget(i) {
      if (touched || started[i]) return;
      started[i] = true;
      lastStarted = i;
      apply(targets[i], i, 100);
      setCtl(100);
    }
    function narrow() {
      try { return window.matchMedia('(max-width: 640px)').matches; } catch (e) { return false; }
    }
    function teardown() {
      observers.forEach(function (o) { try { o.disconnect(); } catch (e) { /* ignore */ } });
      observers = [];
      safety.forEach(function (t) { if (t) clearTimeout(t); });
      safety = [];
    }
    function userSet(v) {
      touched = true;
      teardown();
      t0s = t0s.map(function () { return null; });
      stop();
      setAll(v);
    }

    input.addEventListener('input', function () {
      userSet(parseFloat(input.value) || 0);
    });
    input.addEventListener('keydown', function (e) {
      var v = parseFloat(input.value) || 0, n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = Math.floor(v / 10) * 10 + 10;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = Math.ceil(v / 10) * 10 - 10;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = 100;
      if (n === null) return;
      e.preventDefault();
      userSet(clamp(n, 0, 100));
    });

    return {
      node: wrap,
      start: function () {
        if (reduced || !canAnimate()) { setAll(100); return; }
        setAll(0);
        try {
          /* trigger: a row's top has passed 70% of the viewport height */
          var trig = new IntersectionObserver(function (entries) {
            var batch = 0;
            entries.forEach(function (en) {
              if (!en.isIntersecting) return;
              var i = targets.indexOf(en.target);
              if (i < 0 || started[i]) return;
              if (narrow()) { startTarget(i, STAGGER * batch); batch++; }
              else targets.forEach(function (t, j) { startTarget(j, STAGGER * Math.max(0, j - i)); });
            });
          }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
          /* safety: any row visible for 1.2s without playing jumps to After */
          var safe = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              var i = targets.indexOf(en.target);
              if (i < 0 || started[i]) return;
              if (en.isIntersecting && !safety[i]) {
                safety[i] = setTimeout(function () { safety[i] = 0; jumpTarget(i); }, 1200);
              } else if (!en.isIntersecting && safety[i]) {
                clearTimeout(safety[i]); safety[i] = 0;
              }
            });
          }, { threshold: 0 });
          targets.forEach(function (t) { trig.observe(t); safe.observe(t); });
          observers.push(trig, safe);
        } catch (err) {
          setAll(100);   /* never leave After hidden */
        }
      }
    };
  }

  /* ---------- a ledger row (strip) ---------- */
  function stripRow(c) {
    var m = c.headline;
    var url = str(c.url);
    var row = h(url ? 'a' : 'div', 'pa-row');
    if (url) row.href = url;
    var meta = h('span', 'pa-meta');
    var k = kickerText(c);
    if (k) meta.appendChild(h('span', 'pa-kicker', k));
    if (str(m.label)) meta.appendChild(hide(h('span', 'pa-label', str(m.label))));
    meta.appendChild(h('span', 'pa-sr', sentence(m)));
    if (url) {
      var more = h('span', 'pa-more', 'Read the case study');
      more.appendChild(hide(h('span', 'pa-more-arrow', '→')));
      meta.appendChild(more);
    }
    row.appendChild(meta);
    row.appendChild(valueCell(m));
    return row;
  }

  /* ---------- a ledger entry (problem-page cases) ---------- */
  function caseEntry(c, idx) {
    var m = c.headline;
    var url = str(c.url);
    var entry = h('article', 'pa-entry');
    var head = h('div', 'pa-entry-head');
    var meta = h('div', 'pa-meta');
    var k = kickerText(c);
    if (k) meta.appendChild(h('span', 'pa-kicker', k));
    var title = h('h3', 'pa-title');
    var link = h(url ? 'a' : 'span', 'pa-entry-link');
    if (url) link.href = url;
    link.appendChild(h('span', 'pa-title-txt', str(c.title) || str(m.label)));
    link.appendChild(h('span', 'pa-sr', '. ' + sentence(m)));
    title.appendChild(link);
    meta.appendChild(title);
    if (str(m.label)) meta.appendChild(hide(h('span', 'pa-label', str(m.label))));
    if (str(c.summary)) meta.appendChild(h('p', 'pa-summary', str(c.summary)));
    if (url) {
      var more = hide(h('span', 'pa-more', 'Read the case study'));
      more.appendChild(h('span', 'pa-more-arrow', '→'));
      meta.appendChild(more);
    }
    head.appendChild(meta);
    head.appendChild(valueCell(m));
    entry.appendChild(head);

    var ms = metricsOf(c);
    if (ms.length) {
      var table = h('table', 'pa-table');
      var cap = h('caption', 'pa-sr', (str(c.title) || 'Case ' + (idx + 1)));
      table.appendChild(cap);
      var thead = h('thead');
      var hr = h('tr');
      var th0 = h('th');
      th0.setAttribute('scope', 'col');
      th0.appendChild(h('span', 'pa-sr', 'Measure'));
      hr.appendChild(th0);
      ['Before', 'After'].forEach(function (t) {
        var th = h('th', null, t);
        th.setAttribute('scope', 'col');
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      table.appendChild(thead);
      var tbody = h('tbody');
      ms.forEach(function (mm) {
        var tr = h('tr', scalable(mm) ? 'pa-scal' : 'pa-qual');
        var th = h('th', null, str(mm.label));
        th.setAttribute('scope', 'row');
        tr.appendChild(th);
        var tdB = h('td', 'pa-td-b');
        if (str(mm.fmtBefore)) tdB.appendChild(h('span', 'pa-tv-b', str(mm.fmtBefore)));
        else tdB.appendChild(hide(h('span', 'pa-tv-none', DASH)));
        var tdA = h('td', 'pa-td-a');
        if (str(mm.fmtAfter)) tdA.appendChild(h('span', 'pa-tv-a', str(mm.fmtAfter)));
        else tdA.appendChild(hide(h('span', 'pa-tv-none', DASH)));
        tr.appendChild(tdB);
        tr.appendChild(tdA);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      entry.appendChild(table);
    }
    return entry;
  }

  function removeNode(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }

  /* ---------- renderers ---------- */
  WP.register('a', {
    strip: function (el, ctx) {
      if (!el) return;
      var cases = usable(ctx);
      if (cases.length < 2) return;
      var reduced = isReduced(ctx);

      var oldList = el.querySelector('.proof-list');
      var oldCta = el.querySelector('.proof-cta');
      var oldBtn = oldCta ? oldCta.querySelector('a') : null;
      var href = str(ctx && ctx.bookingUrl) || (oldBtn ? str(oldBtn.getAttribute('href')) : '');
      var btnText = str(oldBtn && oldBtn.textContent) || 'Schedule a Call';

      var root = h('div', 'pa-strip pa-n' + Math.min(cases.length, 4));

      /* left column: eyebrow + key, booking button pinned at the bottom */
      var aside = h('div', 'pa-aside');
      var top = h('div', 'pa-aside-top');
      top.appendChild(h('p', 'pa-eyebrow', 'Results'));
      var key = hide(h('p', 'pa-key'));
      key.appendChild(h('span', 'pa-key-b', 'Before'));
      key.appendChild(h('span', 'pa-key-a', 'After'));
      top.appendChild(key);
      aside.appendChild(top);
      if (href) {
        var cta = h('p', 'pa-cta');
        var btn = h('a', 'btn-rust pa-btn', btnText);
        btn.href = href;
        cta.appendChild(btn);
        aside.appendChild(cta);
      }

      /* right column: the wipe, then one row per case */
      var ledger = h('div', 'pa-ledger');
      var rows = cases.map(stripRow);
      var wipe = makeWipe(rows, reduced);
      var head = h('div', 'pa-head');
      head.appendChild(hide(h('span', 'pa-head-k')));
      head.appendChild(wipe.node);
      ledger.appendChild(head);
      var ul = h('ul', 'pa-rows');
      rows.forEach(function (r) {
        var li = h('li', 'pa-li');
        li.appendChild(r);
        ul.appendChild(li);
      });
      ledger.appendChild(ul);

      root.appendChild(aside);
      root.appendChild(ledger);

      removeNode(oldList);
      removeNode(oldCta);
      el.appendChild(root);
      if (reduced) root.classList.add('pa-still');
      wipe.start();
    },

    hero: function (el, ctx) {
      if (!el) return;
      var inner = el.querySelector('.hero-inner');
      if (!inner || inner.querySelector('.pa-page')) return;
      var reduced = isReduced(ctx);

      /* before figures: every headline first, then metrics round-robin, up to 8 */
      var cases = usable(ctx);
      var pools = cases.map(function (c) { return [c.headline].concat(metricsOf(c)); });
      var figs = [];
      var depth = pools.reduce(function (n, p) { return Math.max(n, p.length); }, 0);
      for (var d = 0; d < depth && figs.length < 8; d++) {
        for (var p = 0; p < pools.length && figs.length < 8; p++) {
          var m = pools[p][d];
          if (m && str(m.fmtBefore)) figs.push({ text: str(m.fmtBefore), scal: scalable(m) });
        }
      }
      if (!figs.length) return;

      var page = hide(h('div', 'pa-page' + (reduced ? '' : ' is-run')));
      var ph = h('div', 'pa-page-head');
      ph.appendChild(h('span', 'pa-page-n'));
      ph.appendChild(h('span', 'pa-page-col', 'Before'));
      page.appendChild(ph);
      var lines = h('div', 'pa-lines');
      for (var i = 0; i < 8; i++) {
        var line = h('div', 'pa-line');
        line.style.setProperty('--i', String(i));
        line.appendChild(h('span', 'pa-line-n', (i < 9 ? '0' : '') + (i + 1)));
        var f = figs[i];
        if (f) {
          var fig = h('span', 'pa-fig' + (f.scal ? ' pa-scal' : ''), f.text);
          fig.style.setProperty('--n', String(Math.max(1, f.text.length)));
          line.appendChild(fig);
        }
        lines.appendChild(line);
      }
      page.appendChild(lines);
      inner.appendChild(page);
    },

    steps: function (el, ctx) {
      if (!el) return;
      var items = toArray(el.children).filter(function (n) { return n.tagName === 'LI'; });
      if (!items.length) return;
      var gsteps = ctx && ctx.group && Array.isArray(ctx.group.steps) ? ctx.group.steps : [];
      var reduced = isReduced(ctx);

      items.forEach(function (li, i) {
        var t = li.querySelector('h3'), p = li.querySelector('p');
        var title = str(t && t.textContent) || str(gsteps[i] && gsteps[i].title);
        var text = str(p && p.textContent) || str(gsteps[i] && gsteps[i].text);
        if (!title && !text) return;   /* unknown markup: leave this item as it is */
        while (li.firstChild) li.removeChild(li.firstChild);
        li.className = 'pa-step';
        li.style.setProperty('--i', String(i));
        li.appendChild(h('span', 'pa-step-n', (i < 9 ? '0' : '') + (i + 1)));
        if (title) li.appendChild(h('h3', 'pa-step-t', title));
        if (text) li.appendChild(h('p', 'pa-step-x', text));
      });

      el.classList.add('pa-steps');
      if (reduced || !canAnimate()) { el.classList.add('is-in'); return; }
      el.classList.add('pa-wait');
      onView(el, function () { el.classList.add('is-in'); });
    },

    cases: function (el, ctx) {
      if (!el) return;
      var cases = usable(ctx);
      if (cases.length < 2) return;
      var reduced = isReduced(ctx);
      var oldList = el.querySelector('.proof-list');

      var root = h('div', 'pa-cases pa-n' + Math.min(cases.length, 4));
      var entries = cases.map(caseEntry);
      var wipe = makeWipe(entries, reduced);
      var bar = h('div', 'pa-bar');
      bar.appendChild(hide(h('span', 'pa-head-k')));
      bar.appendChild(wipe.node);
      root.appendChild(bar);
      entries.forEach(function (e) { root.appendChild(e); });

      removeNode(oldList);
      el.appendChild(root);
      if (reduced) root.classList.add('pa-still');
      wipe.start();
    }
  });
})();
