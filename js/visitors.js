// visitors.js — 访客追踪

async function initVisitors() {
  try {
    await API.recordVisit();
    var count = await API.getViewCount();
    var statsContainer = document.getElementById('rsvp-stats');
    if (statsContainer) {
      var viewStat = document.createElement('div');
      viewStat.className = 'stat-item';
      viewStat.innerHTML = '<span class="stat-number">' + count + '</span><span class="stat-label">人浏览过</span>';
      statsContainer.appendChild(viewStat);
    }
  } catch (err) {
    console.warn('Visitor tracking skipped:', err.message);
  }
}
