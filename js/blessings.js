// blessings.js — 祝福留言墙

async function initBlessings() {
  var form = document.getElementById('blessing-form');
  var listEl = document.getElementById('blessings-list');
  var msgEl = document.getElementById('blessing-msg');
  var submitBtn = document.getElementById('blessing-submit');
  var countEl = document.getElementById('blessing-count');

  if (!form) return;

  await loadBlessings(listEl, countEl);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = '发送中...';
    msgEl.style.display = 'none';

    var blessingText = document.getElementById('blessing-text').value.trim();
    var author = document.getElementById('blessing-author').value.trim();

    if (!blessingText || !author) {
      showBlessingMsg(msgEl, '请填写祝福和署名', 'error');
      resetBlessingBtn(submitBtn);
      return;
    }

    try {
      await API.submitBlessing({ author: author, blessingText: blessingText });
      showBlessingMsg(msgEl, '💝 祝福已送出！', 'success');
      form.reset();
      await loadBlessings(listEl, countEl);
    } catch (err) {
      showBlessingMsg(msgEl, '发送失败，请稍后再试', 'error');
      console.error('Blessing error:', err);
    }

    resetBlessingBtn(submitBtn);
  });
}

function resetBlessingBtn(btn) {
  btn.disabled = false;
  btn.textContent = '送 出 祝 福';
}

async function loadBlessings(listEl, countEl) {
  try {
    var blessings = await API.getBlessings();
    if (countEl) countEl.textContent = blessings.length;

    if (listEl) {
      listEl.innerHTML = blessings.map(function (b) {
        return '<div class="blessing-item">'
          + '<div class="blessing-author">' + escapeHtml(b.name) + '</div>'
          + '<div class="blessing-text">' + escapeHtml(b.blessing) + '</div>'
          + '<span class="blessing-time">' + timeAgo(b.created_at) + '</span>'
          + '</div>';
      }).join('');
    }
  } catch (err) {
    console.warn('Blessings load failed:', err.message);
  }
}

function showBlessingMsg(el, text, type) {
  el.textContent = text;
  el.style.display = 'block';
  el.style.color = type === 'error' ? '#c44' : 'var(--color-accent)';
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(timestamp) {
  var now = new Date();
  var then = new Date(timestamp);
  var sec = Math.floor((now - then) / 1000);
  if (sec < 60) return '刚刚';
  if (sec < 3600) return Math.floor(sec / 60) + '分钟前';
  if (sec < 86400) return Math.floor(sec / 3600) + '小时前';
  return Math.floor(sec / 86400) + '天前';
}
