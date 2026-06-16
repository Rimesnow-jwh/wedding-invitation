// app.js — 应用入口

document.addEventListener('DOMContentLoaded', function () {
  // 初始化所有模块
  initVisitors();
  initRSVP();
  initBlessings();
  initGalleryToggle();
  initScrollReveal();
  initSparkles();
});

// 星星火花效果
function initSparkles() {
  var canvas = document.getElementById('sparkle-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 点击/触摸产生粒子
  document.addEventListener('click', function (e) {
    spawnParticles(e.clientX, e.clientY);
  });
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      spawnParticles(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  function spawnParticles(x, y) {
    var count = 8 + Math.floor(Math.random() * 10);
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.5 + Math.random() * 4;
      var size = 1.5 + Math.random() * 3;
      var life = 0.6 + Math.random() * 0.8;
      // 金色/香槟色调
      var hue = 35 + Math.random() * 20;
      var sat = 40 + Math.random() * 30;
      var light = 60 + Math.random() * 25;

      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: size,
        life: life,
        maxLife: life,
        hue: hue, sat: sat, light: light
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // 微重力
      p.life -= 0.016;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      var alpha = p.life / p.maxLife;
      var r = p.size * (0.5 + alpha * 0.5);

      // 光晕
      var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      glow.addColorStop(0, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + alpha + ')');
      glow.addColorStop(0.3, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,' + (alpha * 0.5) + ')');
      glow.addColorStop(1, 'hsla(' + p.hue + ',' + p.sat + '%,' + p.light + '%,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      // 核心亮点
      ctx.fillStyle = 'hsla(' + p.hue + ',20%,95%,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// 相册点击暂停/继续
function initGalleryToggle() {
  var track = document.querySelector('.gallery-track');
  if (!track) return;
  var paused = false;
  track.addEventListener('click', function () {
    paused = !paused;
    track.style.animationPlayState = paused ? 'paused' : 'running';
  });
}

// 滚动渐显效果
function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // 降级：直接显示
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(function (el) {
    observer.observe(el);
  });
}
