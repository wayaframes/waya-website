/* Waya website analytics — PostHog, consent-gated.
   Loaded on every page via <script defer src="/assets/analytics.js">.
   No build step: paste your PostHog public key into POSTHOG_KEY below. */
(function () {
  'use strict';

  var POSTHOG_KEY  = 'phc_mAbTEGUVYzRY2EZLqYJzpjn4LTxQSaF3KPzcspuZBGyL';              // <-- your phc_… project key
  var POSTHOG_HOST = 'https://us.i.posthog.com';ß
  var ASSET_HOST   = 'https://us-assets.i.posthog.com';
  var CONSENT_KEY  = 'waya_analytics_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  /* ---- Load PostHog and initialise (called only on consent) ---- */
  function loadPostHog() {
    if (window.__wayaPHLoaded) return;
    window.__wayaPHLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = ASSET_HOST + '/static/array.js';
    s.onload = function () {
      window.posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,      // scroll depth rides along
        enable_heatmaps: true,
        persistence: 'localStorage+cookie',
        loaded: function () { wireCustomEvents(); }
      });
    };
    document.head.appendChild(s);
  }

  /* ---- Custom events ---- */
  var SERVICE_PATHS = {
    '/scale-up-program/':      'scale-up-program',
    '/fundraising-narrative/': 'fundraising-narrative',
    '/data-room-preparation/': 'data-room-preparation',
    '/financial-model-prep/':  'financial-model-prep',
    '/operations-audit/':      'operations-audit',
    '/waya-os-mcp/':           'waya-os-mcp',
    '/pre-pmf-mcp/':           'pre-pmf-mcp'
  };

  function parseQuery(href) {
    var out = {}, q = href.split('?')[1];
    if (!q) return out;
    q.split('#')[0].split('&').forEach(function (pair) {
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }
  function bookingService(href) {
    var m = href.match(/\/bookings\/([a-z0-9\-]+)/i);
    return m ? m[1] : null;
  }
  function outboundNetwork(href) {
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/youtube\.com/i.test(href))  return 'youtube';
    if (/substack\.com/i.test(href)) return 'substack';
    return null;
  }
  function internalService(href) {
    for (var p in SERVICE_PATHS) {
      if (SERVICE_PATHS.hasOwnProperty(p) && href.indexOf(p) !== -1) return SERVICE_PATHS[p];
    }
    return null;
  }
  function linkSource(a) {
    if (a.closest && a.closest('.nav-dropdown-menu')) return 'nav';
    if (a.closest && a.closest('footer'))             return 'footer';
    return 'grid';
  }

  function wireCustomEvents() {
    var ph = window.posthog;

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';

      if (href.indexOf('leadconnectorhq.com') !== -1) {         // CTA → booking widget
        var u = parseQuery(href);
        ph.capture('cta_schedule_call_clicked', {
          location: u.utm_content || null,
          service:  bookingService(href),
          href: href
        });
        return;
      }
      var net = outboundNetwork(href);                          // thought-leadership outbound
      if (net) { ph.capture('outbound_click', { network: net, href: href }); return; }

      var svc = internalService(href);                          // internal service nav
      if (svc) { ph.capture('service_nav_clicked', { service: svc, source: linkSource(a) }); }
    }, true);

    ['carPrev', 'carNext'].forEach(function (id) {              // pillar carousel
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function () {
        ph.capture('carousel_interacted', { direction: id === 'carNext' ? 'next' : 'prev' });
      });
    });
  }

  /* ---- Consent banner ---- */
  function showBanner() {
    var bar = document.createElement('div');
    bar.className = 'waya-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p class="waya-consent__text">We use cookies to understand how visitors use our site, ' +
      'so we can make it more useful. No ads, ever.</p>' +
      '<div class="waya-consent__actions">' +
      '<button type="button" class="waya-consent__btn waya-consent__btn--decline">Decline</button>' +
      '<button type="button" class="waya-consent__btn waya-consent__btn--accept">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.waya-consent__btn--accept').addEventListener('click', function () {
      setConsent('granted'); bar.parentNode.removeChild(bar); loadPostHog();
    });
    bar.querySelector('.waya-consent__btn--decline').addEventListener('click', function () {
      setConsent('denied'); bar.parentNode.removeChild(bar);
    });
  }

  /* ---- Entry ---- */
  function start() {
    var c = getConsent();
    if (c === 'granted') { loadPostHog(); return; }
    if (c === 'denied')  { return; }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
