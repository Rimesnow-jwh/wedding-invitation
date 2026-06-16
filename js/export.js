// export.js — 长图导出

function initExport() {
  var btn = document.getElementById('btn-export');
  var container = document.getElementById('invitation');

  if (!btn || !container) return;

  btn.addEventListener('click', async function () {
    var overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div>'
      + '<div class="loading-spinner"></div>'
      + '<p style="margin-top:16px;color:var(--color-accent);font:var(--font-caption);letter-spacing:2px;">正在生成长图...</p>'
      + '</div>';
    document.body.appendChild(overlay);

    try {
      container.classList.add('export-mode');
      await sleep(100);

      var canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF7F3',
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      });

      container.classList.remove('export-mode');
      overlay.remove();

      var link = document.createElement('a');
      link.download = '蒋武华&彭斯-婚礼邀请函.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (err) {
      container.classList.remove('export-mode');
      overlay.remove();
      alert('长图生成失败，请重试');
      console.error('Export error:', err);
    }
  });
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}
