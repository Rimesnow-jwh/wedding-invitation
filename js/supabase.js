// supabase.js — Supabase 客户端与数据操作
// ⚠️ 部署前请替换为真实 Supabase URL 和 anon key

var SUPABASE_URL = 'https://rtcfxigodgxuiwvgcqkk.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y2Z4aWdvZGd4dWl3dmdjcWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NTQxNDQsImV4cCI6MjA5NzEzMDE0NH0.ELd8JJBmd0ld8SAnQU8sQiP0bIjYrBqrQmhhpxAeVU0';

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 浏览器指纹（用于去重统计浏览量）
function getFingerprint() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('wedding-visitor', 2, 2);

  var fingerprint = canvas.toDataURL().slice(-32)
    + '|' + screen.width + 'x' + screen.height
    + '|' + navigator.language;

  return btoa(fingerprint).slice(0, 64);
}

var API = {
  // 提交赴宴回执
  submitRSVP: function (data) {
    return supabase
      .from('visitors')
      .insert({
        name: data.name,
        guest_count: data.guestCount,
        phone: data.phone || null,
        attending: data.attending,
        visitor_fingerprint: getFingerprint()
      })
      .select()
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  },

  // 提交祝福
  submitBlessing: function (data) {
    var fp = getFingerprint();
    return supabase
      .from('visitors')
      .select('id')
      .eq('visitor_fingerprint', fp)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (res.data) {
          return supabase
            .from('visitors')
            .update({ blessing: data.blessingText, name: data.author })
            .eq('id', res.data.id)
            .select()
            .single();
        } else {
          return supabase
            .from('visitors')
            .insert({
              name: data.author,
              blessing: data.blessingText,
              visitor_fingerprint: fp
            })
            .select()
            .single();
        }
      })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  },

  // 获取祝福列表
  getBlessings: function () {
    return supabase
      .from('visitors')
      .select('name, blessing, created_at')
      .not('blessing', 'is', null)
      .neq('blessing', '')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  },

  // 获取统计数据
  getStats: function () {
    return supabase
      .from('visitors')
      .select('guest_count', { count: 'exact' })
      .eq('attending', true)
      .then(function (res) {
        if (res.error) throw res.error;
        var attendingPeople = (res.data || []).length;
        var totalGuests = (res.data || []).reduce(function (sum, r) {
          return sum + (r.guest_count || 0);
        }, 0);

        return supabase
          .from('visitors')
          .select('id', { count: 'exact', head: true })
          .not('blessing', 'is', null)
          .neq('blessing', '')
          .then(function (res2) {
            if (res2.error) throw res2.error;
            return {
              attendingPeople: attendingPeople,
              totalGuests: totalGuests,
              blessingCount: res2.count || 0
            };
          });
      });
  },

  // 记录浏览
  recordVisit: function () {
    var fp = getFingerprint();
    var today = new Date().toISOString().split('T')[0];
    return supabase
      .from('visitors')
      .select('id')
      .eq('visitor_fingerprint', fp)
      .gte('created_at', today)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (!res.data) {
          return supabase
            .from('visitors')
            .insert({
              name: '访客',
              visitor_fingerprint: fp
            });
        }
      });
  },

  // 获取浏览量
  getViewCount: function () {
    return supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.count || 0;
      });
  }
};
