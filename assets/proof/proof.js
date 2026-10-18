/* Proof components: lets the design script (design-c.js, which registers 'c') enhance every
   [data-proof] container. Without JS, or if the design fails, the plain HTML inside each
   container stays as it is. The page head loads design-c.css and sets html.design-c. */
(function () {
  var design = 'c';

  /* Video tiles: the poster button becomes the player on click (portrait cut on upright phones). */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.proof-video-play');
    if (!btn) return;
    var fig = btn.closest('.proof-video');
    var portrait = fig.getAttribute('data-portrait') &&
      window.matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
    var v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto';
    v.poster = portrait ? fig.getAttribute('data-poster-portrait') : (btn.querySelector('img') || {}).src || '';
    v.src = portrait ? fig.getAttribute('data-portrait') : fig.getAttribute('data-src');
    v.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Play the video: /, ''));
    btn.replaceWith(v);
    v.focus();
    var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay blocked: the controls are there */ });
  });

  var BOOKING = 'https://api.leadconnectorhq.com/widget/bookings/';
  var ran = false;

  function ctxFor(el) {
    var group = el.getAttribute('data-group');
    var root = el.getAttribute('data-root') || (group && window.WAYA_GROUPS[group] && window.WAYA_GROUPS[group].root) || 'waya-consultation';
    var slugs = (el.getAttribute('data-cases') || (group ? window.WAYA_GROUPS[group].cases.join(',') : ''))
      .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return {
      design: design,
      group: group ? window.WAYA_GROUPS[group] : null,
      groupId: group,
      cases: slugs.map(function (s) { var c = window.WAYA_CASES[s]; return c ? Object.assign({ slug: s }, c) : null; }).filter(Boolean),
      bookingUrl: BOOKING + root + '?utm_button=proof',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  function run(renderer) {
    if (ran || !renderer) return;
    ran = true;
    document.querySelectorAll('[data-proof]').forEach(function (el) {
      var type = el.getAttribute('data-proof');
      if (typeof renderer[type] !== 'function') return;   /* steps: design-c only illustrates groups it has drawings for */
      try {
        renderer[type](el, ctxFor(el));
        el.classList.add('proof-enhanced');
      } catch (err) {
        console.error('proof design failed on ' + type, err);   /* plain HTML stays */
      }
    });
  }

  window.WayaProof = {
    design: design,
    register: function (id, renderer) {
      if (id !== design) return;
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { run(renderer); });
      else run(renderer);
    }
  };
})();
