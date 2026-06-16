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
  var lastMoveSpawn = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 点击产生粒子
  document.addEventListener('click', function (e) {
    spawnParticles(e.clientX, e.clientY, 12);
  });

  // 触摸开始
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      spawnParticles(e.touches[0].clientX, e.touches[0].clientY, 10);
    }
  }, { passive: true });

  // 按住滑动时持续产生粒子（节流）
  document.addEventListener('touchmove', function (e) {
    var now = Date.now();
    if (now - lastMoveSpawn < 45) return; // 节流
    lastMoveSpawn = now;
    if (e.touches.length >= 1) {
      spawnParticles(e.touches[0].clientX, e.touches[0].clientY, 3);
    }
  }, { passive: true });

  function spawnParticles(x, y, count) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 3;
      var size = 0.8 + Math.random() * 1.8;
      var life = 0.4 + Math.random() * 0.7;

      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: size,
        life: life,
        maxLife: life,
        rotation: Math.random() * Math.PI
      });
    }
  }

  function drawStar(ctx, x, y, r, alpha) {
    // 四角星形
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.globalAlpha = alpha;

    // 外层十字光芒
    var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 4);
    grad.addColorStop(0, 'rgba(255,255,240,1)');
    grad.addColorStop(0.05, 'rgba(255,250,220,0.95)');
    grad.addColorStop(0.2, 'rgba(255,220,150,0.7)');
    grad.addColorStop(0.5, 'rgba(255,200,100,0.2)');
    grad.addColorStop(1, 'rgba(255,180,80,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    // 十字光芒
    var inner = r * 0.3;
    var outer = r * 4;
    ctx.moveTo(0, -outer);
    ctx.lineTo(inner, -inner);
    ctx.lineTo(outer, 0);
    ctx.lineTo(inner, inner);
    ctx.lineTo(0, outer);
    ctx.lineTo(-inner, inner);
    ctx.lineTo(-outer, 0);
    ctx.lineTo(-inner, -inner);
    ctx.closePath();
    ctx.fill();

    // 对角光芒
    var outer2 = r * 2.5;
    ctx.beginPath();
    ctx.moveTo(outer2, 0);
    ctx.lineTo(0, outer2);
    ctx.lineTo(-outer2, 0);
    ctx.lineTo(0, -outer2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,245,0.7)';
    ctx.fill();

    // 中心亮点
    var coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    coreGrad.addColorStop(0, 'rgba(255,255,255,1)');
    coreGrad.addColorStop(0.5, 'rgba(255,255,240,0.8)');
    coreGrad.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.018;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      var alpha = p.life / p.maxLife;
      var r = p.size * (0.6 + alpha * 0.4);
      drawStar(ctx, p.x, p.y, r, alpha);
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
