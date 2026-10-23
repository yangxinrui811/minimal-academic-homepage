/* site.js — shared interactions for the three-page site (defer-loaded)
   1) top reading-progress bar  2) scroll-reveal cards  3) count-up stat numbers
   All motion respects prefers-reduced-motion. */
(function () {
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 — reading progress bar */
  var pb = document.createElement('div');
  pb.className = 'progress-bar';
  pb.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pb);
  var updatePB = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    pb.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', updatePB, { passive: true });
  addEventListener('resize', updatePB, { passive: true });
  updatePB();

  /* 2 — scroll reveal */
  var els = document.querySelectorAll(
    '.card, .domain-card, .principle-card, .step-card, .soft-card, .fig-card'
  );
  if (!rm && 'IntersectionObserver' in window) {
    els.forEach(function (e) { e.classList.add('reveal'); });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    els.forEach(function (e) { io.observe(e); });
  }

  /* 3 — count-up for purely numeric stat numbers */
  if (!rm && 'IntersectionObserver' in window) {
    document.querySelectorAll('.stat-num').forEach(function (n) {
      var t = (n.textContent || '').trim();
      if (!/^\d+$/.test(t)) return; // skip "±tol" and the like
      var N = parseInt(t, 10);
      var D = Math.min(1300, 420 + N * 16);
      var io2 = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            io2.unobserve(en.target);
            var st = null;
            var tick = function (ts) {
              if (!st) st = ts;
              var p = Math.min(1, (ts - st) / D);
              n.textContent = String(Math.round(N * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(tick);
              else n.textContent = String(N);
            };
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.4 }
      );
      io2.observe(n);
    });
  }
})();
