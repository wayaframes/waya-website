/* Waya website analytics — PostHog, consent-gated.
   Loaded on every page via <script defer src="/assets/analytics.js">.
   No build step: paste your PostHog public key into POSTHOG_KEY below. */
(function () {
  'use strict';

  var POSTHOG_KEY  = 'phc_REPLACE_ME';              // <-- your phc_… project key
  var POSTHOG_HOST = 'https://us.i.posthog.com';
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

  /* ---- Custom events (filled in Task 4) ---- */
  function wireCustomEvents() {}

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
