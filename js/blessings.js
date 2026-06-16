// blessings.js — 祝福留言墙 + 弹幕

var danmakuOverlay = null;

function initDanmakuOverlay() {
  if (danmakuOverlay) return;
  danmakuOverlay = document.createElement('div');
  danmakuOverlay.className = 'danmaku-overlay';
  danmakuOverlay.id = 'danmaku-overlay';
  document.body.appendChild(danmakuOverlay);
}

function spawnDanmaku(author, text) {
  if (!danmakuOverlay) initDanmakuOverlay();

  var el = document.createElement('div');
  el.className = 'danmaku-item';
  el.textContent = '💝 ' + escapeHtml(author) + '：' + escapeHtml(text);

  // 随机垂直位置 (避开顶部和底部)
  var top = 15 + Math.random() * 60;
  el.style.top = top + '%';

  // 随机动画时长 6-10s
  var duration = 6 + Math.random() * 4;
  el.style.animationDuration = duration + 's';

  danmakuOverlay.appendChild(el);

  // 动画结束后移除
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, duration * 1000 + 200);
}

async function initBlessings() {
  var form = document.getElementById('blessing-form');
  var listEl = document.getElementById('blessings-list');
  var msgEl = document.getElementById('blessing-msg');
  var submitBtn = document.getElementById('blessing-submit');
  var countEl = document.getElementById('blessing-count');

  if (!form) return;

  initDanmakuOverlay();
  await loadBlessings(listEl, countEl);

  // 加载已有祝福为弹幕
  loadDanmakuFromServer();

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

      // 立即发射弹幕
      spawnDanmaku(author, blessingText);

      form.reset();
      await loadBlessings(listEl, countEl);
    } catch (err) {
      showBlessingMsg(msgEl, '发送失败，请稍后再试', 'error');
      console.error('Blessing error:', err);
    }

    resetBlessingBtn(submitBtn);
  });
}

// 从服务器加载祝福并逐个弹幕展示
async function loadDanmakuFromServer() {
  try {
    var blessings = await API.getBlessings();
    if (!blessings || blessings.length === 0) return;

    // 取最近10条，反转顺序（旧的先播）
    var recent = blessings.slice(0, 10).reverse();
    recent.forEach(function (b, i) {
      setTimeout(function () {
        spawnDanmaku(b.name, b.blessing);
      }, i * 1500 + 1000); // 每条间隔1.5秒
    });
  } catch (err) {
    console.warn('Danmaku load failed:', err.message);
  }
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
      // 列表中只显示最近3条，其余可滚动查看
      var displayList = blessings.slice(0, 3);
      listEl.innerHTML = displayList.map(function (b) {
        return '<div class="blessing-item">'
          + '<div class="blessing-author">' + escapeHtml(b.name) + '</div>'
          + '<div class="blessing-text">' + escapeHtml(b.blessing) + '</div>'
          + '<span class="blessing-time">' + timeAgo(b.created_at) + '</span>'
          + '</div>';
      }).join('');

      if (blessings.length > 3) {
        listEl.innerHTML += '<p class="text-caption" style="text-align:center;padding:8px;">↑ 上滑查看全部 ' + blessings.length + ' 条祝福 ↑</p>';
        // 复制全部祝福到滚动列表
        listEl.innerHTML += blessings.slice(3).map(function (b) {
          return '<div class="blessing-item">'
            + '<div class="blessing-author">' + escapeHtml(b.name) + '</div>'
            + '<div class="blessing-text">' + escapeHtml(b.blessing) + '</div>'
            + '<span class="blessing-time">' + timeAgo(b.created_at) + '</span>'
            + '</div>';
        }).join('');
      }
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
