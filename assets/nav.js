/* Waya nav — Services / Products dropdowns.
   Opens on hover, stays open until the user clicks a selection,
   the trigger, or anywhere outside the menu.
   Only one dropdown can be open at a time — opening one closes the rest. */
(function () {
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown'));

  function close(dd) {
    dd.classList.remove('open');
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function open(dd) {
    dropdowns.forEach(function (other) {   /* close any other open dropdown first */
      if (other !== dd) close(other);
    });
    dd.classList.add('open');
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    var menu = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    dd.addEventListener('mouseenter', function () { open(dd); });  /* hover opens (and closes the other)… */
    /* …and it stays open: no mouseleave handler on purpose. */

    trigger.addEventListener('click', function (e) {  /* trigger toggles */
      e.stopPropagation();
      dd.classList.contains('open') ? close(dd) : open(dd);
    });

    menu.addEventListener('click', function () { close(dd); });  /* selection closes (link still navigates) */
  });

  document.addEventListener('click', function (e) {  /* outside click closes all */
    var inside = dropdowns.some(function (dd) { return dd.contains(e.target); });
    if (!inside) dropdowns.forEach(close);
  });

  document.addEventListener('keydown', function (e) {  /* Escape closes all */
    if (e.key === 'Escape') dropdowns.forEach(close);
  });
})();

/* Mobile menu: under 960px the links collapse behind a menu button
   (added here so every page gets it without extra markup). */
(function () {
  var nav = document.querySelector('.nav');
  var links = nav && nav.querySelector('.nav-links');
  if (!links) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-links');
  btn.innerHTML = '<span></span><span></span><span></span>';
  links.id = links.id || 'nav-links';
  links.parentNode.appendChild(btn);

  function set(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    set(!nav.classList.contains('open'));
  });
  links.addEventListener('click', function (e) {  /* following a link closes the menu */
    if (e.target.closest('a')) set(false);
  });
  document.addEventListener('click', function (e) {  /* outside click closes */
    if (!nav.contains(e.target)) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') set(false);
  });
  window.addEventListener('resize', function () {  /* back to desktop width: reset */
    if (window.innerWidth > 960) set(false);
  });
})();
