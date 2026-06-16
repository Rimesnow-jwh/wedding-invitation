// app.js — 应用入口

document.addEventListener('DOMContentLoaded', function () {
  // 初始化所有模块
  initVisitors();
  initRSVP();
  initBlessings();
  initScrollReveal();
});

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
