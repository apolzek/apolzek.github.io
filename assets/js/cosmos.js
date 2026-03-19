(function () {
  var canvas = document.getElementById('cosmos');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [], nebulae = [], W, H, raf;

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
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.015 + 0.003,
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
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.04
      });
    }
  }

  function drawDark(t) {
    ctx.clearRect(0, 0, W, H);

    nebulae.forEach(function (n) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -n.rx) n.x = W + n.rx;
      if (n.x > W + n.rx) n.x = -n.rx;
      if (n.y < -n.ry) n.y = H + n.ry;
      if (n.y > H + n.ry) n.y = -n.ry;

      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      g.addColorStop(0, 'hsla(' + n.hue + ',70%,60%,' + n.alpha + ')');
      g.addColorStop(1, 'hsla(' + n.hue + ',70%,60%,0)');
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    stars.forEach(function (s) {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      var tw = Math.sin(t * 0.001 + s.twinkleOffset) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (s.alpha * tw) + ')';
      ctx.fill();
    });
  }

  function drawLight(t) {
    ctx.clearRect(0, 0, W, H);

    nebulae.forEach(function (n) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -n.rx) n.x = W + n.rx;
      if (n.x > W + n.rx) n.x = -n.rx;
      if (n.y < -n.ry) n.y = H + n.ry;
      if (n.y > H + n.ry) n.y = -n.ry;

      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      g.addColorStop(0, 'hsla(' + (n.hue + 40) + ',60%,75%,' + (n.alpha * 1.8) + ')');
      g.addColorStop(1, 'hsla(' + (n.hue + 40) + ',60%,75%,0)');
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    stars.forEach(function (s) {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      var tw = Math.sin(t * 0.001 + s.twinkleOffset) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(s.r, 1), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,10,40,' + Math.min(s.alpha * tw * 2, 1) + ')';
      ctx.fill();
    });
  }

  function loop(t) {
    if (isDark()) drawDark(t); else drawLight(t);
    raf = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    initStars();
    initNebulae();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', function () { resize(); initStars(); });

  new MutationObserver(function () { initNebulae(); }).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );

  init();
})();
