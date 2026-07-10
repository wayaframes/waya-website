/* Waya nav — Services dropdown.
   Opens on hover, stays open until the user clicks a selection,
   the trigger, or anywhere outside the menu. */
(function () {
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    var menu = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    function open() {
      dd.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      dd.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    dd.addEventListener('mouseenter', open);          /* hover opens… */
    /* …and it stays open: no mouseleave handler on purpose. */

    trigger.addEventListener('click', function (e) {  /* trigger toggles */
      e.stopPropagation();
      dd.classList.contains('open') ? close() : open();
    });

    menu.addEventListener('click', close);            /* selection closes (link still navigates) */

    document.addEventListener('click', function (e) { /* outside click closes */
      if (!dd.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });
})();
