(function () {
  var canvas = document.getElementById('cosmos');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [], nebulae = [], W, H, raf, lastT = 0;

  /* Drift speed of the star field, in pixels per SECOND of elapsed time.
     Rough guide, measured on a 1470px-wide screen:
       0.8 -> 0.95 px/s, 10px per 10s  (looks completely still)
       2   -> 2.5  px/s, 25px per 10s  (barely there)
       3.5 -> 4.4  px/s, 44px per 10s  (slow, but you can see it)
       5   -> 6.1  px/s, 61px per 10s  (a clear drift)
       8   -> 9.6  px/s, 96px per 10s  (busy enough to pull the eye)
     This is the only number to touch. */
  var DRIFT = 5;
  var DRIFT_ANGLE = -Math.PI / 2.6;   /* up and slightly to the right */

  /* Honour the OS "reduce motion" setting: the sky holds still, stars still
     twinkle. Nothing here is load-bearing, so this costs the visitor nothing. */
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The two themes differ only in how a nebula and a star are coloured, and in
     the floor on a star's radius, so that is all a palette carries. Everything
     about the motion is shared. */
  var PALETTE = {
    dark: {
      nebula: function (n, a) { return 'hsla(' + n.hue + ',70%,60%,' + a + ')'; },
      nebulaAlpha: function (n) { return n.alpha; },
      starRadius: function (r) { return r; },
      starFill: function (a) { return 'rgba(255,255,255,' + a + ')'; }
    },
    light: {
      nebula: function (n, a) { return 'hsla(' + (n.hue + 40) + ',60%,75%,' + a + ')'; },
      nebulaAlpha: function (n) { return n.alpha * 1.8; },
      starRadius: function (r) { return Math.max(r, 1); },
      starFill: function (a) { return 'rgba(20,10,40,' + Math.min(a * 2, 1) + ')'; }
    }
  };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    var count = Math.floor((W * H) / 4000);
    for (var i = 0; i < count; i++) {
      var r = Math.random() * 1.4 + 0.2;
      /* Parallax: bigger stars read as closer, so they drift a little faster.
         Each one also strays slightly off the shared heading, which keeps the
         field from sliding as one rigid sheet. */
      var speed = DRIFT * (0.5 + (r / 1.6) * 1.3);
      var angle = DRIFT_ANGLE + (Math.random() - 0.5) * 0.5;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: r,
        alpha: Math.random() * 0.6 + 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function initNebulae() {
    nebulae = [];
    for (var i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * W,
        y: Math.random() * H,
        rx: Math.random() * 180 + 80,
        ry: Math.random() * 120 + 60,
        hue: Math.random() * 60 + (isDark() ? 220 : 190),
        alpha: Math.random() * 0.045 + 0.01,
        vx: (Math.random() - 0.5) * 3.6,
        vy: (Math.random() - 0.5) * 2.4
      });
    }
  }

  function draw(t, dt, p) {
    ctx.clearRect(0, 0, W, H);

    nebulae.forEach(function (n) {
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < -n.rx) n.x = W + n.rx;
      if (n.x > W + n.rx) n.x = -n.rx;
      if (n.y < -n.ry) n.y = H + n.ry;
      if (n.y > H + n.ry) n.y = -n.ry;

      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      g.addColorStop(0, p.nebula(n, p.nebulaAlpha(n)));
      g.addColorStop(1, p.nebula(n, 0));
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    stars.forEach(function (s) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      /* Wrap on all four edges so the drift can point anywhere. */
      if (s.x < -s.r) s.x = W + s.r; else if (s.x > W + s.r) s.x = -s.r;
      if (s.y < -s.r) s.y = H + s.r; else if (s.y > H + s.r) s.y = -s.r;
      var tw = Math.sin(t * 0.001 + s.twinkleOffset) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, p.starRadius(s.r), 0, Math.PI * 2);
      ctx.fillStyle = p.starFill(s.alpha * tw);
      ctx.fill();
    });
  }

  function loop(t) {
    /* Elapsed seconds, not frames: without this the sky drifts twice as fast
       on a 120Hz display as on a 60Hz one. Capped so that coming back to a
       backgrounded tab does not teleport everything across the screen. */
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.1) : 0;
    lastT = t;
    if (still) dt = 0;
    draw(t, dt, isDark() ? PALETTE.dark : PALETTE.light);
    raf = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    initStars();
    initNebulae();
    cancelAnimationFrame(raf);
    lastT = 0;
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', function () { resize(); initStars(); });

  new MutationObserver(function () { initNebulae(); }).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );

  init();
})();
