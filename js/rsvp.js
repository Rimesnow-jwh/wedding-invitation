// rsvp.js — 赴宴回执

async function initRSVP() {
  var form = document.getElementById('rsvp-form');
  var msgEl = document.getElementById('rsvp-msg');
  var submitBtn = document.getElementById('rsvp-submit');

  if (!form) return;

  await loadRSVPStats();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    msgEl.style.display = 'none';

    var name = document.getElementById('rsvp-name').value.trim();
    var guestCount = parseInt(document.getElementById('rsvp-count').value) || 0;
    var phone = document.getElementById('rsvp-phone').value.trim();
    var attendingRadio = form.querySelector('input[name="attending"]:checked');
    var attending = attendingRadio ? attendingRadio.value === 'true' : null;

    if (!name) {
      showRSVPMsg(msgEl, '请输入姓名', 'error');
      resetRSVPBtn(submitBtn);
      return;
    }

    if (attending === null) {
      showRSVPMsg(msgEl, '请选择是否参加', 'error');
      resetRSVPBtn(submitBtn);
      return;
    }

    try {
      await API.submitRSVP({ name: name, guestCount: guestCount, phone: phone, attending: attending });
      showRSVPMsg(msgEl, attending ? '🎉 期待你的到来！已收到回执' : '收到回执，谢谢告知', 'success');
      form.reset();
      await loadRSVPStats();
    } catch (err) {
      showRSVPMsg(msgEl, '提交失败，请稍后再试', 'error');
      console.error('RSVP error:', err);
    }

    resetRSVPBtn(submitBtn);
  });
}

function resetRSVPBtn(btn) {
  btn.disabled = false;
  btn.textContent = '提 交 回 执';
}

async function loadRSVPStats() {
  try {
    var stats = await API.getStats();
    document.getElementById('attending-count').textContent = stats.attendingPeople;
    document.getElementById('guest-total').textContent = stats.totalGuests;
    var blessingCountEl = document.getElementById('blessing-count');
    if (blessingCountEl) blessingCountEl.textContent = stats.blessingCount;
  } catch (err) {
    console.warn('Stats load failed:', err.message);
  }
}

function showRSVPMsg(el, text, type) {
  el.textContent = text;
  el.style.display = 'block';
  el.style.color = type === 'error' ? '#c44' : 'var(--color-accent)';
}
