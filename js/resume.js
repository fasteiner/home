/*!
 * Resume - Vanilla JS (Bootstrap 5 compatible)
 */
(function () {
  'use strict';

  // Smooth scroll for js-scroll-trigger links
  document.querySelectorAll('a.js-scroll-trigger[href*="#"]:not([href="#"])').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      if (
        location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
        location.hostname === this.hostname
      ) {
        var target = document.querySelector(this.hash);
        if (!target) {
          target = document.querySelector('[name=' + this.hash.slice(1) + ']');
        }
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Collapse navbar on mobile when a scroll-trigger link is clicked
  document.querySelectorAll('.js-scroll-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
})();
