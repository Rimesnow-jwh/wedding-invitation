# 婚礼邀请函 H5 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建蒋武华&彭斯的婚礼邀请函 H5 长图页面，含赴宴回执、祝福墙、访客记录、一键联系和长图导出功能。

**Architecture:** 纯静态 H5 页面（HTML + CSS + 原生 JS），Supabase 作为后端存储访客数据，html2canvas 生成长图。8 个版块从上到下依次排列，新中式雅致配色。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS, Supabase (PostgreSQL), html2canvas, Vercel 部署, 思源宋体

**Source Spec:** `docs/superpowers/specs/2026-06-16-wedding-invitation-design.md`

---

### Task 1: 项目脚手架与照片复制

**Files:**
- Create: `index.html`（骨架）
- Create: `css/style.css`（空文件）
- Create: `js/app.js`, `js/supabase.js`, `js/rsvp.js`, `js/blessings.js`, `js/visitors.js`, `js/export.js`（空文件）
- Create: `images/`（复制 18 张照片）

- [ ] **Step 1: 创建目录结构**

```bash
cd "D:\Desktop\桌面工作夹\工作台：婚礼邀请函"
mkdir -p css js images
```

- [ ] **Step 2: 复制 18 张精选照片到 images/**

```bash
cp "精修/IMG_2177--海报.jpg" images/
cp "精修/IMG_1984.jpg" images/
cp "精修/IMG_2104--10寸倾城.jpg" images/
cp "精修/IMG_2191--10寸倾城.jpg" images/
cp "精修/IMG_2111.jpg" images/
cp "精修/IMG_2022.jpg" images/
cp "精修/IMG_2114.jpg" images/
cp "精修/IMG_2076.jpg" images/
cp "精修/IMG_2090.jpg" images/
cp "精修/IMG_1953.jpg" images/
cp "精修/IMG_2225.jpg" images/
cp "精修/心心相印拼图80x40 陌初+水晶膜-黑色框.jpg" images/
cp "精修/IMG_2222--10寸倾城.jpg" images/
cp "精修/IMG_2182----10寸倾城.jpg" images/
cp "精修/IMG_1930.jpg" images/
cp "精修/九宫格(2).jpg" images/
cp "精修/IMG_2119.jpg" images/
cp "精修/IMG_2098.jpg" images/
```

- [ ] **Step 3: 创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="蒋武华 & 彭斯 婚礼邀请函">
  <meta property="og:title" content="蒋武华 & 彭斯 婚礼邀请函">
  <meta property="og:description" content="诚挚邀请你参加我们的婚礼">
  <meta property="og:image" content="images/IMG_2177--海报.jpg">
  <meta property="og:type" content="website">
  <title>蒋武华 & 彭斯 | 婚礼邀请函</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="invitation-container" id="invitation">
    <!-- 8 sections will be added here -->
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script src="js/supabase.js"></script>
  <script src="js/visitors.js"></script>
  <script src="js/rsvp.js"></script>
  <script src="js/blessings.js"></script>
  <script src="js/export.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建空的 JS 文件占位**

```bash
touch js/app.js js/supabase.js js/rsvp.js js/blessings.js js/visitors.js js/export.js
```

---

### Task 2: Supabase 数据库搭建

**Files:**
- Create: `sql/setup.sql`（数据库初始化 SQL）

- [ ] **Step 1: 创建 setup.sql**

```sql
-- 婚礼邀请函 Supabase 数据库初始化

-- 1. 创建 visitors 表
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  guest_count INT DEFAULT 1,
  phone TEXT,
  attending BOOLEAN DEFAULT NULL,
  blessing TEXT,
  visitor_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX idx_visitors_fingerprint ON visitors(visitor_fingerprint);

-- 3. 启用行级安全（RLS）
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- 4. 允许匿名 INSERT（任何人可提交回执/祝福）
CREATE POLICY "allow_anon_insert" ON visitors
  FOR INSERT TO anon
  WITH CHECK (true);

-- 5. 允许匿名 SELECT 祝福列表
CREATE POLICY "allow_anon_select_blessings" ON visitors
  FOR SELECT TO anon
  USING (blessing IS NOT NULL AND blessing != '');

-- 6. 允许匿名 SELECT 赴宴人数统计（聚合用）
CREATE POLICY "allow_anon_select_attending" ON visitors
  FOR SELECT TO anon
  USING (attending = true);

-- 7. 允许匿名 SELECT 浏览量统计
CREATE POLICY "allow_anon_select_views" ON visitors
  FOR SELECT TO anon
  USING (true);
```

- [ ] **Step 2: 创建 README 说明 Supabase 配置步骤**

```markdown
# Supabase 配置步骤

1. 前往 https://supabase.com 注册/登录
2. 创建新项目，记下项目 URL 和 anon key
3. 进入 SQL Editor，粘贴 sql/setup.sql 并执行
4. 将 URL 和 anon key 填入 js/supabase.js 中的对应位置
```

---

### Task 3: 全局 CSS 样式

**Files:**
- Modify: `css/style.css`（完整样式）

- [ ] **Step 1: 写入 CSS 变量与重置样式**

```css
/* === CSS Variables === */
:root {
  --color-bg: #FAF7F3;
  --color-surface: #F5EDE0;
  --color-border: #E8D5C4;
  --color-accent: #C4A882;
  --color-text-light: #8B7A62;
  --color-text: #5C4A3A;
  --color-text-dark: #3D3226;

  --font-h1: 700 32px/1.4 'Noto Serif SC', Georgia, serif;
  --font-h2: 500 18px/1.6 'Noto Serif SC', Georgia, serif;
  --font-body: 400 14px/2 'Noto Serif SC', Georgia, serif;
  --font-caption: 300 11px/1.8 'Noto Serif SC', Georgia, serif;
  --font-en: 400 13px/1.5 Georgia, serif;

  --max-width: 480px;
  --section-padding: 48px 24px;
}

/* === Reset === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font: var(--font-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

img {
  display: block;
  max-width: 100%;
}

.invitation-container {
  width: 100%;
  max-width: var(--max-width);
  background: var(--color-bg);
  overflow-x: hidden;
}
```

- [ ] **Step 2: 写入版块通用样式**

```css
/* === Section Common === */
.section {
  padding: var(--section-padding);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font: 500 12px/1 'Noto Serif SC', serif;
  color: var(--color-accent);
  letter-spacing: 6px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-divider {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  margin: 0 auto;
}

/* === Text styles === */
.text-center { text-align: center; }
.text-caption { font: var(--font-caption); color: var(--color-text-light); }
```

- [ ] **Step 3: 写入全幅满版图片样式（封面用）**

```css
/* === Hero: Full Bleed with Gradient === */
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(61,50,38,0.15) 0%,
    rgba(61,50,38,0.05) 30%,
    rgba(250,247,243,0.6) 70%,
    var(--color-bg) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 60px 32px 80px;
}

.hero-names {
  font: 700 36px/1.5 'Noto Serif SC', Georgia, serif;
  color: var(--color-text-dark);
  letter-spacing: 4px;
}

.hero-names .ampersand {
  display: block;
  font-size: 18px;
  color: var(--color-accent);
  font-weight: 400;
  margin: 4px 0;
}

.hero-date {
  margin-top: 20px;
  font: var(--font-caption);
  color: var(--color-text-light);
  letter-spacing: 4px;
}
```

- [ ] **Step 4: 写入圆形晕影样式（邀请语/联系方式用）**

```css
/* === Round Vignette === */
.vignette-photo {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 24px;
  box-shadow: 0 4px 24px rgba(180,150,120,0.25);
  display: block;
}

.vignette-text {
  text-align: center;
  font: 400 14px/2.4 'Noto Serif SC', serif;
  color: var(--color-text-light);
  letter-spacing: 2px;
}
```

- [ ] **Step 5: 写入侧边卡片样式（喜宴信息/赴宴回执用）**

```css
/* === Side Card Layout === */
.card-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.card-image {
  width: 120px;
  height: 160px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(61,50,38,0.08);
}

.card-info {
  flex: 1;
}

.card-info p {
  font: 400 13px/2.2 'Noto Serif SC', serif;
  color: var(--color-text);
  letter-spacing: 1px;
}
```

- [ ] **Step 6: 写入网格相册样式**

```css
/* === Photo Grid === */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.photo-grid img {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  width: 100%;
}

.photo-grid img:nth-child(odd) {
  border-radius: 4px 12px 4px 12px;
}

.photo-grid img:nth-child(even) {
  border-radius: 12px 4px 12px 4px;
}
```

- [ ] **Step 7: 写入表单样式**

```css
/* === Form Styles === */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font: 400 12px/1.6 'Noto Serif SC', serif;
  color: var(--color-text-light);
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #fff;
  font: var(--font-body);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: var(--color-accent);
}

.form-input::placeholder {
  color: #c4b5a5;
}

.form-radio-group {
  display: flex;
  gap: 24px;
}

.form-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font: var(--font-body);
  color: var(--color-text);
}

.form-radio input[type="radio"] {
  accent-color: var(--color-accent);
}

.btn {
  display: inline-block;
  padding: 10px 32px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  font: 500 13px/1 'Noto Serif SC', serif;
  letter-spacing: 3px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn:hover { opacity: 0.85; }
.btn:active { opacity: 0.7; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

- [ ] **Step 8: 写入祝福列表和统计数字样式**

```css
/* === Blessings List === */
.blessings-list {
  margin-top: 24px;
}

.blessing-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.blessing-item:last-child {
  border-bottom: none;
}

.blessing-author {
  font: 500 13px/1.6 'Noto Serif SC', serif;
  color: var(--color-text-dark);
}

.blessing-text {
  font: var(--font-caption);
  color: var(--color-text-light);
  margin-top: 4px;
}

.blessing-time {
  font-size: 10px;
  color: #c4b5a5;
}

/* === Stats === */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 24px 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font: 700 28px/1 'Noto Serif SC', serif;
  color: var(--color-accent);
}

.stat-label {
  font: var(--font-caption);
  color: var(--color-text-light);
  margin-top: 4px;
  letter-spacing: 2px;
}
```

- [ ] **Step 9: 写入联系方式与尾图样式**

```css
/* === Contact === */
.contact-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.contact-card {
  text-align: center;
  flex: 1;
}

.contact-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(180,150,120,0.2);
}

.contact-name {
  font: 500 14px/1.6 'Noto Serif SC', serif;
  color: var(--color-text-dark);
}

.contact-phone {
  font: var(--font-caption);
}

.contact-phone a {
  color: var(--color-accent);
  text-decoration: none;
}

/* === Footer === */
.footer {
  text-align: center;
  padding: 60px 24px;
}

.footer-heart {
  font-size: 24px;
  color: var(--color-accent);
  margin-bottom: 12px;
}

.footer-text {
  font: 500 16px/2 'Noto Serif SC', serif;
  color: var(--color-text-dark);
  letter-spacing: 3px;
}

.footer-sub {
  font: var(--font-caption);
  color: var(--color-text-light);
  margin-top: 8px;
}

.footer-thanks {
  font: var(--font-en);
  color: var(--color-accent);
  letter-spacing: 4px;
  margin-top: 16px;
}
```

- [ ] **Step 10: 写入长图导出和响应式样式**

```css
/* === Export Button === */
.export-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 12px;
}

.export-btn {
  padding: 10px 24px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 24px;
  font: 500 12px/1 'Noto Serif SC', serif;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(180,150,120,0.3);
  transition: all 0.3s;
}

.export-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(180,150,120,0.4); }

/* === Export Mode (hidden elements) === */
.export-mode .export-bar,
.export-mode .form-input:focus-visible { display: none !important; }

/* === Loading === */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(250,247,243,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === Scroll Reveal === */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* === Wide Banner Photo === */
.banner-photo {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(61,50,38,0.06);
}

/* === Responsive === */
@media (max-width: 480px) {
  :root {
    --section-padding: 40px 20px;
  }
  .hero-names { font-size: 30px; }
  .card-row { flex-direction: column; }
  .card-image { width: 100%; height: 200px; }
}
```

---

### Task 4: HTML 页面结构（8 个版块）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 替换 `<!-- 8 sections will be added here -->` 为完整 HTML**

在 `<div class="invitation-container" id="invitation">` 内部写入：

```html
<!-- ====== ① 封面 ====== -->
<section class="section hero" id="section-hero">
  <img src="images/IMG_2177--海报.jpg" alt="" class="hero-image">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <p class="section-title">THE WEDDING</p>
    <h1 class="hero-names">
      蒋武华<span class="ampersand">&amp;</span>彭斯
    </h1>
    <p class="hero-date">2026年7月18日 · 中午12:00</p>
  </div>
</section>

<!-- ====== ② 邀请语 ====== -->
<section class="section reveal" id="section-invitation">
  <img src="images/IMG_1984.jpg" alt="" class="vignette-photo">
  <p class="vignette-text">
    嘉礼初成，良缘夙缔<br>
    情敦鹣鲽，愿相敬之如宾<br>
    同心同德，宜室宜家<br>
    谨以白头之约，书向鸿笺
  </p>
</section>

<!-- ====== ③ 喜宴信息 ====== -->
<section class="section reveal" id="section-info">
  <div class="section-header">
    <p class="section-title">喜 宴 信 息</p>
    <div class="section-divider"></div>
  </div>
  <div class="card-row">
    <img src="images/IMG_2104--10寸倾城.jpg" alt="" class="card-image">
    <div class="card-info">
      <p>📍 喜上喜（临武玉石城店）</p>
      <p style="font-size:11px;color:var(--color-text-light);padding-left:1.2em;">喜乐年华厅</p>
      <p>🕛 2026年7月18日</p>
      <p style="font-size:11px;color:var(--color-text-light);padding-left:1.2em;">周六 · 中午12:00</p>
      <p style="font-size:11px;color:var(--color-text-light);padding-left:1.2em;">农历丙午年五月廿四</p>
    </div>
  </div>
</section>

<!-- ====== ④ 相册展示 ====== -->
<section class="section reveal" id="section-gallery">
  <div class="section-header">
    <p class="section-title">我 们 的 故 事</p>
    <div class="section-divider"></div>
  </div>
  <div class="photo-grid">
    <img src="images/IMG_2111.jpg" alt="">
    <img src="images/IMG_2022.jpg" alt="">
    <img src="images/IMG_2114.jpg" alt="">
    <img src="images/IMG_2076.jpg" alt="">
    <img src="images/IMG_2090.jpg" alt="">
    <img src="images/IMG_1953.jpg" alt="">
  </div>
</section>

<!-- ====== ⑤ 赴宴回执 ====== -->
<section class="section reveal" id="section-rsvp">
  <div class="section-header">
    <p class="section-title">赴 宴 回 执</p>
    <div class="section-divider"></div>
  </div>
  <div class="card-row">
    <img src="images/IMG_2225.jpg" alt="" class="card-image">
    <div class="card-info">
      <div id="rsvp-stats" class="stats-row" style="justify-content:flex-start;gap:24px;">
        <div class="stat-item">
          <span class="stat-number" id="attending-count">0</span>
          <span class="stat-label">人确认赴宴</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" id="guest-total">0</span>
          <span class="stat-label">赴宴总人数</span>
        </div>
      </div>
    </div>
  </div>
  <form id="rsvp-form" style="margin-top:24px;">
    <div class="form-group">
      <label class="form-label">👤 您的姓名</label>
      <input type="text" class="form-input" id="rsvp-name" placeholder="请输入姓名" required>
    </div>
    <div class="form-group">
      <label class="form-label">👥 赴宴人数</label>
      <input type="number" class="form-input" id="rsvp-count" placeholder="请输入人数" min="0" max="20" value="1" required>
    </div>
    <div class="form-group">
      <label class="form-label">📞 联系电话</label>
      <input type="tel" class="form-input" id="rsvp-phone" placeholder="请输入电话（选填）">
    </div>
    <div class="form-group">
      <label class="form-label">💬 是否参加</label>
      <div class="form-radio-group">
        <label class="form-radio">
          <input type="radio" name="attending" value="true" required> 参加
        </label>
        <label class="form-radio">
          <input type="radio" name="attending" value="false"> 不参加
        </label>
      </div>
    </div>
    <button type="submit" class="btn" id="rsvp-submit">提 交 回 执</button>
    <p id="rsvp-msg" class="text-caption" style="margin-top:8px;display:none;"></p>
  </form>
</section>

<!-- ====== ⑥ 祝福留言墙 ====== -->
<section class="section reveal" id="section-blessings">
  <div class="section-header">
    <p class="section-title">祝 福 留 言</p>
    <div class="section-divider"></div>
  </div>
  <img src="images/心心相印拼图80x40 陌初+水晶膜-黑色框.jpg" alt="" class="banner-photo">
  <div class="stats-row">
    <div class="stat-item">
      <span class="stat-number" id="blessing-count">0</span>
      <span class="stat-label">条祝福</span>
    </div>
  </div>
  <form id="blessing-form" style="margin-top:16px;">
    <div class="form-group">
      <label class="form-label">✍️ 写下你的祝福</label>
      <textarea class="form-input" id="blessing-text" rows="3" placeholder="写下对新人的祝福..." required></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">署名</label>
      <input type="text" class="form-input" id="blessing-author" placeholder="你的名字" required>
    </div>
    <button type="submit" class="btn" id="blessing-submit">送 出 祝 福</button>
    <p id="blessing-msg" class="text-caption" style="margin-top:8px;display:none;"></p>
  </form>
  <div class="blessings-list" id="blessings-list"></div>
</section>

<!-- ====== ⑦ 联系方式 ====== -->
<section class="section reveal" id="section-contact">
  <div class="section-header">
    <p class="section-title">联 系 新 人</p>
    <div class="section-divider"></div>
  </div>
  <div class="contact-row">
    <div class="contact-card">
      <img src="images/IMG_2222--10寸倾城.jpg" alt="" class="contact-avatar">
      <p class="contact-name">🤵 新郎 · 蒋武华</p>
      <p class="contact-phone"><a href="tel:13349676608">13349676608</a></p>
    </div>
    <div class="contact-card">
      <img src="images/IMG_2182----10寸倾城.jpg" alt="" class="contact-avatar">
      <p class="contact-name">👰 新娘 · 彭斯</p>
      <p class="contact-phone"><a href="tel:18374893665">18374893665</a></p>
    </div>
  </div>
</section>

<!-- ====== ⑧ 尾图 ====== -->
<section class="section footer" id="section-footer">
  <img src="images/九宫格(2).jpg" alt="" class="banner-photo" style="margin-bottom:32px;">
  <p class="footer-heart">♡</p>
  <p class="footer-text">感谢你的到来</p>
  <p class="footer-sub">见证我们的幸福时刻</p>
  <p class="footer-thanks">THANK YOU</p>
  <img src="images/IMG_1930.jpg" alt="" class="vignette-photo" style="margin-top:32px;">
</section>

<!-- ====== 导出按钮 ====== -->
<div class="export-bar" id="export-bar">
  <button class="export-btn" id="btn-export">📸 保存长图</button>
</div>
```

---

### Task 5: Supabase 客户端封装

**Files:**
- Modify: `js/supabase.js`

- [ ] **Step 1: 写入 Supabase 客户端初始化与 API 封装**

```javascript
// supabase.js — Supabase 客户端与数据操作

// TODO: 替换为你的 Supabase 项目 URL 和 anon key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 浏览器指纹（用于去重统计浏览量）
function getFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('wedding-visitor', 2, 2);

  const fingerprint = canvas.toDataURL().slice(-32)
    + '|' + screen.width + 'x' + screen.height
    + '|' + navigator.language;

  return btoa(fingerprint).slice(0, 64);
}

const API = {
  // 提交赴宴回执
  async submitRSVP({ name, guestCount, phone, attending }) {
    const { data, error } = await supabase
      .from('visitors')
      .insert({
        name: name,
        guest_count: guestCount,
        phone: phone || null,
        attending: attending,
        visitor_fingerprint: getFingerprint()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 提交祝福（如果之前已提交过回执，则更新 blessing 字段）
  async submitBlessing({ author, blessingText }) {
    const fp = getFingerprint();
    // 先查是否已有记录
    const { data: existing } = await supabase
      .from('visitors')
      .select('id')
      .eq('visitor_fingerprint', fp)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('visitors')
        .update({ blessing: blessingText, name: author || undefined })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('visitors')
        .insert({
          name: author,
          blessing: blessingText,
          visitor_fingerprint: fp
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // 获取祝福列表
  async getBlessings() {
    const { data, error } = await supabase
      .from('visitors')
      .select('name, blessing, created_at')
      .not('blessing', 'is', null)
      .neq('blessing', '')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  // 获取赴宴人数统计
  async getStats() {
    const { data: attendingData, error: attendingError } = await supabase
      .from('visitors')
      .select('guest_count', { count: 'exact' })
      .eq('attending', true);

    if (attendingError) throw attendingError;

    const totalGuests = (attendingData || []).reduce((sum, r) => sum + (r.guest_count || 0), 0);
    const attendingPeople = (attendingData || []).length;

    const { count: blessingCount, error: blessingError } = await supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .not('blessing', 'is', null)
      .neq('blessing', '');

    if (blessingError) throw blessingError;

    return {
      attendingPeople,
      totalGuests,
      blessingCount: blessingCount || 0
    };
  },

  // 记录浏览（匿名访问）
  async recordVisit() {
    const fp = getFingerprint();
    // 检查今天是否已记录
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('visitors')
      .select('id')
      .eq('visitor_fingerprint', fp)
      .gte('created_at', today)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from('visitors')
        .insert({
          name: '访客',
          visitor_fingerprint: fp
        });
    }
  },

  // 获取浏览量
  async getViewCount() {
    const { count, error } = await supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
};
```

---

### Task 6: 访客追踪

**Files:**
- Modify: `js/visitors.js`

- [ ] **Step 1: 写入浏览器指纹生成与浏览记录**

```javascript
// visitors.js — 访客追踪

async function initVisitors() {
  try {
    await API.recordVisit();
    const count = await API.getViewCount();
    // 在封面区域动态插入浏览人数（如果有对应元素）
    const statsContainer = document.getElementById('rsvp-stats');
    if (statsContainer) {
      const viewStat = document.createElement('div');
      viewStat.className = 'stat-item';
      viewStat.innerHTML = `<span class="stat-number">${count}</span><span class="stat-label">人浏览过</span>`;
      statsContainer.appendChild(viewStat);
    }
  } catch (err) {
    console.warn('Visitor tracking skipped:', err.message);
  }
}
```

---

### Task 7: 赴宴回执（RSVP）

**Files:**
- Modify: `js/rsvp.js`

- [ ] **Step 1: 写入 RSVP 表单逻辑与实时统计**

```javascript
// rsvp.js — 赴宴回执

async function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const msgEl = document.getElementById('rsvp-msg');
  const submitBtn = document.getElementById('rsvp-submit');

  if (!form) return;

  // 加载统计数据
  await loadRSVPStats();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    msgEl.style.display = 'none';

    const name = document.getElementById('rsvp-name').value.trim();
    const guestCount = parseInt(document.getElementById('rsvp-count').value) || 0;
    const phone = document.getElementById('rsvp-phone').value.trim();
    const attendingRadio = form.querySelector('input[name="attending"]:checked');
    const attending = attendingRadio ? attendingRadio.value === 'true' : null;

    if (!name) {
      showMsg(msgEl, '请输入姓名', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = '提 交 回 执';
      return;
    }

    if (attending === null) {
      showMsg(msgEl, '请选择是否参加', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = '提 交 回 执';
      return;
    }

    try {
      await API.submitRSVP({ name, guestCount, phone, attending });
      showMsg(msgEl, attending ? '🎉 期待你的到来！已收到回执' : '收到回执，谢谢告知', 'success');
      form.reset();
      await loadRSVPStats();
    } catch (err) {
      showMsg(msgEl, '提交失败，请稍后再试', 'error');
      console.error('RSVP error:', err);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '提 交 回 执';
  });
}

async function loadRSVPStats() {
  try {
    const stats = await API.getStats();
    document.getElementById('attending-count').textContent = stats.attendingPeople;
    document.getElementById('guest-total').textContent = stats.totalGuests;
    document.getElementById('blessing-count').textContent = stats.blessingCount;
  } catch (err) {
    console.warn('Stats load failed:', err.message);
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.style.display = 'block';
  el.style.color = type === 'error' ? '#c44' : 'var(--color-accent)';
}
```

---

### Task 8: 祝福留言墙

**Files:**
- Modify: `js/blessings.js`

- [ ] **Step 1: 写入祝福墙逻辑**

```javascript
// blessings.js — 祝福留言墙

async function initBlessings() {
  const form = document.getElementById('blessing-form');
  const listEl = document.getElementById('blessings-list');
  const msgEl = document.getElementById('blessing-msg');
  const submitBtn = document.getElementById('blessing-submit');
  const countEl = document.getElementById('blessing-count');

  if (!form) return;

  // 加载已有祝福
  await loadBlessings(listEl, countEl);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = '发送中...';
    msgEl.style.display = 'none';

    const blessingText = document.getElementById('blessing-text').value.trim();
    const author = document.getElementById('blessing-author').value.trim();

    if (!blessingText || !author) {
      showBlessingMsg(msgEl, '请填写祝福和署名', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = '送 出 祝 福';
      return;
    }

    try {
      await API.submitBlessing({ author, blessingText });
      showBlessingMsg(msgEl, '💝 祝福已送出！', 'success');
      form.reset();
      await loadBlessings(listEl, countEl);
    } catch (err) {
      showBlessingMsg(msgEl, '发送失败，请稍后再试', 'error');
      console.error('Blessing error:', err);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '送 出 祝 福';
  });
}

async function loadBlessings(listEl, countEl) {
  try {
    const blessings = await API.getBlessings();
    if (countEl) countEl.textContent = blessings.length;

    if (listEl) {
      listEl.innerHTML = blessings.map(b => `
        <div class="blessing-item">
          <div class="blessing-author">${escapeHtml(b.name)}</div>
          <div class="blessing-text">${escapeHtml(b.blessing)}</div>
          <span class="blessing-time">${timeAgo(b.created_at)}</span>
        </div>
      `).join('');
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
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return '刚刚';
  if (sec < 3600) return Math.floor(sec / 60) + '分钟前';
  if (sec < 86400) return Math.floor(sec / 3600) + '小时前';
  return Math.floor(sec / 86400) + '天前';
}
```

---

### Task 9: 长图导出

**Files:**
- Modify: `js/export.js`

- [ ] **Step 1: 写入 html2canvas 长图导出逻辑**

```javascript
// export.js — 长图导出

function initExport() {
  const btn = document.getElementById('btn-export');
  const container = document.getElementById('invitation');

  if (!btn || !container) return;

  btn.addEventListener('click', async () => {
    // 显示 loading
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div>
        <div class="loading-spinner"></div>
        <p style="margin-top:16px;color:var(--color-accent);font:var(--font-caption);letter-spacing:2px;">正在生成长图...</p>
      </div>`;
    document.body.appendChild(overlay);

    try {
      // 进入导出模式（隐藏按钮等）
      container.classList.add('export-mode');

      // 等待一帧让 DOM 更新
      await sleep(100);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF7F3',
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      // 恢复
      container.classList.remove('export-mode');
      overlay.remove();

      // 创建下载链接
      const link = document.createElement('a');
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
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

### Task 10: 应用入口与滚动效果

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 写入初始化逻辑和滚动渐显效果**

```javascript
// app.js — 应用入口

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化所有模块
  initVisitors();
  initRSVP();
  initBlessings();
  initExport();
  initScrollReveal();
});

// 滚动渐显效果
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}
```

---

### Task 11: Supabase 配置与部署

**Files:**
- Modify: `js/supabase.js`（填入真实密钥）
- Create: `vercel.json`

- [ ] **Step 1: 注册 Supabase 并创建项目**

1. 前往 https://supabase.com 注册账号
2. 创建新项目，选择离中国最近的区域（如 Singapore）
3. 进入 Settings → API，复制 `Project URL` 和 `anon public key`
4. 进入 SQL Editor，粘贴 `sql/setup.sql` 内容并执行

- [ ] **Step 2: 填入 Supabase 密钥**

将 `js/supabase.js` 中的占位符替换为真实值：

```javascript
// 替换这两行
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

- [ ] **Step 3: 创建 vercel.json**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

- [ ] **Step 4: 部署到 Vercel**

```bash
# 安装 Vercel CLI（如未安装）
npm i -g vercel

# 部署
cd "D:\Desktop\桌面工作夹\工作台：婚礼邀请函"
vercel --prod
```

---

### 验证清单

- [ ] 页面在桌面端和手机端均正常显示（8 个版块完整）
- [ ] 封面图片渐变过渡自然，不突兀
- [ ] 照片在不同版块中与背景融合良好
- [ ] 滚动时版块有渐显动画
- [ ] 赴宴回执表单可以提交，提交后统计数据更新
- [ ] 祝福留言可以提交，祝福列表实时更新
- [ ] 页面浏览计数正常递增
- [ ] 点击电话号码可以唤起拨号
- [ ] 长图导出功能正常，导出后图片完整
- [ ] 在微信内置浏览器中打开正常
- [ ] 微信分享时 Open Graph 信息正确显示
