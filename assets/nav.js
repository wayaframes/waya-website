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
