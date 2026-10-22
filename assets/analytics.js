/* Waya website analytics — PostHog, consent-gated.
   Loaded on every page via <script defer src="/assets/analytics.js">.
   No build step: paste your PostHog public key into POSTHOG_KEY below. */
(function () {
  'use strict';

  var POSTHOG_KEY  = 'phc_mAbTEGUVYzRY2EZLqYJzpjn4LTxQSaF3KPzcspuZBGyL';              // <-- your phc_… project key
  var POSTHOG_HOST = 'https://us.i.posthog.com';
  var ASSET_HOST   = 'https://us-assets.i.posthog.com';
  var CONSENT_KEY  = 'waya_analytics_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  /* ---- Attribution passthrough engine (reference: _data/utm.json) ----
     Website buttons carry only utm_button. This block remembers the utm_*
     values of the link that brought the visitor (first touch wins, last touch
     kept separately) and appends them to every booking link at click time.
     Direct visitors get window.WAYA_ATTR_DEFAULTS, set per page, so GHL can
     still route on the product token. Runs before consent: no cookies, no
     network, first-party localStorage only. */
  var ATTR_KEYS  = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var FIRST_KEY  = 'waya_attr_first';
  var LAST_KEY   = 'waya_attr_last';

  function readStore(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function writeStore(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function inboundAttribution() {
    var q = parseQuery(location.href), out = {}, any = false;
    ATTR_KEYS.forEach(function (k) { if (q[k]) { out[k] = q[k]; any = true; } });
    if (!any && document.referrer) {                      // organic / social referral with no UTMs
      try {
        var host = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (host && host !== location.hostname.replace(/^www\./, '')) {
          out = { utm_source: host.split('.')[0], utm_medium: 'referral' }; any = true;
        }
      } catch (e) {}
    }
    return any ? out : null;
  }

  function captureAttribution() {
    var inbound = inboundAttribution();
    if (inbound) {
      inbound.ts = Date.now();
      if (!readStore(FIRST_KEY)) writeStore(FIRST_KEY, inbound);
      writeStore(LAST_KEY, inbound);
    }
  }

  function currentAttribution() {
    var first = readStore(FIRST_KEY), last = readStore(LAST_KEY);
    var base = first || last || window.WAYA_ATTR_DEFAULTS || {};
    var out = {};
    ATTR_KEYS.forEach(function (k) { if (base[k]) out[k] = String(base[k]); });
    return out;
  }

  function decorateBookingLink(a) {
    var href = a.getAttribute('href') || '';
    if (href.indexOf('leadconnectorhq.com/widget/bookings/') === -1) return href;
    var attr = currentAttribution();
    var parts = href.split('#'), base = parts[0], frag = parts[1] ? '#' + parts[1] : '';
    var qs = base.split('?'), path = qs[0], existing = qs[1] ? qs[1].split('&') : [];
    var keep = existing.filter(function (kv) {           // page-level params (utm_button) stay
      var k = kv.split('=')[0];
      return ATTR_KEYS.indexOf(k) === -1;
    });
    ATTR_KEYS.forEach(function (k) { if (attr[k]) keep.push(k + '=' + encodeURIComponent(attr[k])); });
    var out = path + (keep.length ? '?' + keep.join('&') : '') + frag;
    a.setAttribute('href', out);
    return out;
  }

  captureAttribution();
  document.addEventListener('click', function (e) {       // capture phase: runs before analytics' own listener
    var a = e.target.closest ? e.target.closest('a') : null;
    if (a) decorateBookingLink(a);
  }, true);
  document.addEventListener('DOMContentLoaded', function () {   // also decorate statically for copy-link / middle-click
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="leadconnectorhq.com/widget/bookings/"]'), decorateBookingLink);
  });

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
    '/lean-ai/cohort/':        'lean-ai-cohort',
    '/lean-ai/':               'lean-ai',
    '/experiment-platform/':        'experiment-platform',
    '/case-studies/':          'case-studies',
    '/planning-guide/':        'planning-guide'
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
        var attr = currentAttribution();
        ph.capture('cta_schedule_call_clicked', {
          location: u.utm_button || u.utm_content || null,
          service:  bookingService(href),
          utm_source: attr.utm_source || null,
          utm_medium: attr.utm_medium || null,
          utm_campaign: attr.utm_campaign || null,
          utm_content: attr.utm_content || null,
          utm_term: attr.utm_term || null,
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

    wireVideoEvents(ph);
  }

  /* ---- Video events: video_play, video_progress (25/50/75), video_pause, video_completed ----
     Media events don't bubble, so these listen on document in the capture phase. That also
     covers the <video> the story cards create when their tile is clicked. */
  function wireVideoEvents(ph) {
    var state = typeof WeakMap === 'function' ? new WeakMap() : null;
    function stateFor(v) {
      if (!state) return { plays: 0, milestones: {} };
      var s = state.get(v);
      if (!s) { s = { plays: 0, milestones: {} }; state.set(v, s); }
      return s;
    }
    function srcPath(v) {
      try { return new URL(v.currentSrc || v.src, location.href).pathname; } catch (e) { return v.currentSrc || null; }
    }
    function placement(v) {
      if (v.closest('.proof-story')) return 'story_card';
      if (v.closest('.case-video'))  return 'case_page';
      return 'page';
    }
    function percent(v) {
      return v.duration > 0 && isFinite(v.duration) ? Math.floor((v.currentTime / v.duration) * 100) : null;
    }
    function props(v, extra) {
      var src = srcPath(v);
      var story = v.closest('.proof-story');
      var out = {
        page: location.pathname,
        video_src: src,
        video_name: src ? src.split('/').pop().replace(/\.[a-z0-9]+$/i, '') : null,
        video_duration: v.duration > 0 && isFinite(v.duration) ? Math.round(v.duration) : null,
        placement: placement(v),
        case_study: story ? story.id : null
      };
      for (var k in extra) if (extra.hasOwnProperty(k)) out[k] = extra[k];
      return out;
    }
    function isVideo(t) { return t && t.tagName === 'VIDEO'; }

    document.addEventListener('play', function (e) {
      var v = e.target; if (!isVideo(v)) return;
      var s = stateFor(v);
      s.plays += 1;
      ph.capture('video_play', props(v, { resumed: s.plays > 1, current_time: Math.round(v.currentTime) }));
    }, true);

    document.addEventListener('pause', function (e) {
      var v = e.target; if (!isVideo(v) || v.ended) return;     // the browser pauses at the end too
      ph.capture('video_pause', props(v, { current_time: Math.round(v.currentTime), percent_watched: percent(v) }));
    }, true);

    document.addEventListener('ended', function (e) {
      var v = e.target; if (!isVideo(v)) return;
      ph.capture('video_completed', props(v, {}));
    }, true);

    document.addEventListener('timeupdate', function (e) {
      var v = e.target; if (!isVideo(v)) return;
      var p = percent(v); if (p === null) return;
      var s = stateFor(v);
      [25, 50, 75].forEach(function (m) {
        if (p >= m && !s.milestones[m]) {
          s.milestones[m] = true;
          ph.capture('video_progress', props(v, { percent_watched: m }));
        }
      });
    }, true);
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
