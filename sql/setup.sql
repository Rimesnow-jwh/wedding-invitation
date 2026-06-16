-- 婚礼邀请函 Supabase 数据库初始化
-- 蒋武华 & 彭斯 · 2026年7月18日

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

-- 6. 允许匿名 SELECT 赴宴人数统计
CREATE POLICY "allow_anon_select_attending" ON visitors
  FOR SELECT TO anon
  USING (attending = true);

-- 7. 允许匿名 SELECT 浏览量统计
CREATE POLICY "allow_anon_select_views" ON visitors
  FOR SELECT TO anon
  USING (true);
