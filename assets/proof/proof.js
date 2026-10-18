/* Proof components: picks a design (A, B or C), loads its CSS and JS, and lets it enhance
   every [data-proof] container. Without JS, or if a design fails, the plain HTML inside each
   container stays as it is.
   Review: ?design=a|b|c switches design and is remembered in this browser. */
(function () {
  var DESIGNS = ['a', 'b', 'c'], DEFAULT = 'a', KEY = 'waya_proof_design';
  var asked = new URLSearchParams(location.search).get('design');
  var design = DESIGNS.indexOf(asked) >= 0 ? asked : null;
  try {
    if (design) localStorage.setItem(KEY, design);
    else design = localStorage.getItem(KEY);
  } catch (e) { /* storage blocked: fall through to the default */ }
  if (DESIGNS.indexOf(design) < 0) design = DEFAULT;
  document.documentElement.classList.add('design-' + design);

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
      if (typeof renderer[type] !== 'function') return;
      try {
        renderer[type](el, ctxFor(el));
        el.classList.add('proof-enhanced');
      } catch (err) {
        console.error('proof design ' + design + ' failed on ' + type, err);   /* plain HTML stays */
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

  if (!document.querySelector('[data-proof]') && !document.getElementById('proof-switcher-anchor')) return;

  if (!document.getElementById('proof-design-css')) {   /* the page head normally loads it before first paint */
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = '/assets/proof/design-' + design + '.css?v=1';
    document.head.appendChild(css);
  }
  var js = document.createElement('script');
  js.src = '/assets/proof/design-' + design + '.js?v=1'; js.defer = true;
  document.head.appendChild(js);

  /* Design switcher for review: local previews, Cloudflare previews, or an explicit ?design= */
  var host = location.hostname;
  if (asked || host === 'localhost' || host === '127.0.0.1' || /\.pages\.dev$/.test(host)) {
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.createElement('div');
      bar.className = 'proof-switcher';
      bar.setAttribute('role', 'navigation');
      bar.setAttribute('aria-label', 'Design versions (review only)');
      bar.innerHTML = '<span>Design</span>' + DESIGNS.map(function (d) {
        var u = new URL(location.href); u.searchParams.set('design', d);
        return '<a href="' + u.pathname + u.search + u.hash + '"' + (d === design ? ' aria-current="true"' : '') + '>' + d.toUpperCase() + '</a>';
      }).join('');
      document.body.appendChild(bar);
    });
  }
})();
