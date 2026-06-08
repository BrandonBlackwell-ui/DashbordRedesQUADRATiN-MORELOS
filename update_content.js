// ═══════════════════════════════════════════════════════════════════
// update_content.js  — Weekly content metrics fetcher
// Runs every Monday via GitHub Actions
//
// Networks:  TikTok → Social Media Master API (Get User Videos)
//            (Instagram / Facebook / Twitter to be added later)
//
// Saves to:  Supabase → tiktok_videos table
// ═══════════════════════════════════════════════════════════════════

const https = require('https');

const RAP_KEY      = process.env.RAP_KEY      || 'ca3f32f8d2msh2837e1e472c671ap19ab72jsnc2437284c988';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwcazgeemwspebmhntcm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y2F6Z2VlbXdzcGVibWhudGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI1NzIsImV4cCI6MjA5NjQ5ODU3Mn0.f7HmfTR6l9exA1DGbM03n-sUAGOmNMRbLw9g3pGbhtY';

const TT_USERNAME = 'quadratinmorelos';
const IG_USERNAME = 'quadratin.morelos';

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function httpGet(url, headers) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(20000, () => { req.destroy(); resolve(null); });
  });
}

function httpPost(hostname, path, body, headers) {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`  POST ${path} → ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else { console.error('  Body:', data.substring(0, 300)); resolve(false); }
      });
    });
    req.on('error', e => { console.error('  request error:', e.message); resolve(false); });
    req.write(bodyStr);
    req.end();
  });
}

// ─── Supabase REST helpers ───────────────────────────────────────────────────

const SUPA_HOST    = new URL(SUPABASE_URL).hostname;
const SUPA_HEADERS = {
  'apikey':         SUPABASE_KEY,
  'Authorization':  `Bearer ${SUPABASE_KEY}`,
  'Content-Type':   'application/json',
  'Prefer':         'return=minimal',
};

async function supabaseUpsert(table, rows, onConflict = '') {
  const path = `/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`;
  const hdrs = { ...SUPA_HEADERS, 'Prefer': `resolution=merge-duplicates,return=minimal` };
  const ok = await httpPost(SUPA_HOST, path, rows, hdrs);
  if (ok) console.log(`  ✓ ${table}: ${Array.isArray(rows) ? rows.length : 1} rows saved`);
  return ok;
}

async function supabaseGet(table, query = '') {
  const r = await httpGet(
    `${SUPABASE_URL}/rest/v1/${table}?${query}`,
    { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  );
  return Array.isArray(r) ? r : [];
}

// ─── Step 1: get TikTok user numeric ID from username ───────────────────────

async function getTikTokUserId(username) {
  console.log(`  Looking up TikTok UID for @${username} …`);
  const r = await httpGet(
    `https://tiktok-scraper7.p.rapidapi.com/user/info?unique_id=${username}`,
    { 'x-rapidapi-key': RAP_KEY, 'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com' }
  );
  const uid = r?.data?.user?.id || r?.userInfo?.user?.id || null;
  console.log(`  → UID: ${uid}`);
  return uid;
}

// ─── Instagram: get user numeric ID ─────────────────────────────────────────

async function getInstagramUserId(username) {
  console.log(`  Looking up Instagram UID for @${username} …`);
  const r = await httpGet(
    `https://instagram-looter2.p.rapidapi.com/profile?username=${username}`,
    { 'x-rapidapi-key': RAP_KEY, 'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com' }
  );
  // instagram-looter2 returns the numeric user id in r.id or r.pk
  const uid = r?.id || r?.pk || r?.user?.pk || null;
  console.log(`  → Instagram UID: ${uid}`);
  return uid ? String(uid) : null;
}

// ─── Instagram: fetch posts or reels via Social Media Master ─────────────────
// Endpoints:
//   GET /instagram-user-posts?id=<uid>&month=<YYYY-MM-01>&includeProfile=false
//   GET /instagram-user-reels?id=<uid>&month=<YYYY-MM-01>&includeProfile=false

async function fetchInstagramContent(uid, monthStr, type) {
  // type: 'posts' | 'reels'
  const endpoint = type === 'reels' ? 'instagram-user-reels' : 'instagram-user-posts';
  console.log(`  Fetching Instagram ${type} for UID ${uid}, month ${monthStr} …`);
  const url = `https://social-media-master.p.rapidapi.com/${endpoint}?id=${uid}&month=${monthStr}&includeProfile=false`;
  const r   = await httpGet(url, {
    'x-rapidapi-key':  RAP_KEY,
    'x-rapidapi-host': 'social-media-master.p.rapidapi.com',
  });
  if (!r) { console.warn(`  No response for Instagram ${type}`); return []; }
  // API may return r.data, r.posts, r.reels, r.items or plain array
  const raw = r?.data?.posts || r?.data?.reels || r?.data?.items
    || r?.posts || r?.reels || r?.items || r?.data
    || (Array.isArray(r) ? r : []);
  console.log(`  → ${raw.length} ${type} received`);
  return raw;
}

// ─── Normalize Instagram post/reel to our schema ─────────────────────────────

function normalizeIgPost(p, fetchedDate, month, type) {
  const id          = p.id || p.post_id || p.pk || null;
  const description = (p.caption?.text || p.caption || p.description || p.title || '').toString().substring(0, 500);
  // Metrics — field names vary across API versions
  const likes    = p.like_count    || p.likeCount    || p.likes    || 0;
  const comments = p.comment_count || p.commentCount || p.comments || 0;
  const shares   = p.share_count   || p.shareCount   || p.reshares || 0;
  const saves    = p.saved_count   || p.savedCount   || p.save_count || p.saves || 0;
  // Views: available for reels, usually 0 for static posts
  const views    = p.view_count    || p.viewCount    || p.video_view_count || p.play_count || 0;
  const duration = p.video_duration || p.duration || 0;
  const rawTs    = p.taken_at      || p.timestamp  || p.created_time || null;
  const posted_at = rawTs ? new Date(rawTs * 1000).toISOString() : null;

  return {
    fetched_date: fetchedDate,
    month,
    post_id: id ? String(id) : null,
    type,          // 'post' | 'reel'
    description,
    views:    Number(views)    || 0,
    likes:    Number(likes)    || 0,
    comments: Number(comments) || 0,
    shares:   Number(shares)   || 0,
    saves:    Number(saves)    || 0,
    duration: Number(duration) || 0,
    posted_at,
  };
}

// ─── Step 2: fetch videos via Social Media Master ────────────────────────────
// Endpoint: GET /tiktok-user-videos?id=<uid>&month=<YYYY-MM-01>&includeProfile=false

async function fetchTikTokVideos(uid, monthStr) {
  // monthStr: '2026-06-01'
  console.log(`  Fetching TikTok videos for UID ${uid}, month ${monthStr} …`);
  const url = `https://social-media-master.p.rapidapi.com/tiktok-user-videos?id=${uid}&month=${monthStr}&includeProfile=false`;
  const r   = await httpGet(url, {
    'x-rapidapi-key':  RAP_KEY,
    'x-rapidapi-host': 'social-media-master.p.rapidapi.com',
  });
  if (!r) { console.warn('  No response from Social Media Master'); return []; }

  // Normalize: API may return r.data, r.videos, r.items, or array directly
  const raw = r?.data?.videos || r?.videos || r?.items || r?.data || (Array.isArray(r) ? r : []);
  console.log(`  → ${raw.length} videos received`);
  return raw;
}

// ─── Normalize a single video object to our schema ───────────────────────────

function normalizeVideo(v, fetchedDate, month) {
  // Social Media Master fields (may vary — handle both camelCase and snake_case)
  const id          = v.id       || v.video_id   || v.aweme_id || null;
  const description = (v.desc    || v.description || v.title   || '').substring(0, 500);
  const views       = v.playCount    || v.play_count   || v.viewCount   || v.view_count   || 0;
  const likes       = v.diggCount   || v.digg_count   || v.likeCount   || v.like_count   || 0;
  const comments    = v.commentCount || v.comment_count || 0;
  const shares      = v.shareCount   || v.share_count   || 0;
  const bookmarks   = v.collectCount || v.collect_count || v.bookmarkCount || 0;
  const duration    = v.duration || v.video?.duration || 0;
  // Posted timestamp (may be unix seconds)
  const rawTs       = v.createTime   || v.create_time   || v.publishTime || null;
  const posted_at   = rawTs ? new Date(rawTs * 1000).toISOString() : null;

  return {
    fetched_date: fetchedDate,
    month,
    video_id:    id,
    description,
    views:       Number(views)     || 0,
    likes:       Number(likes)     || 0,
    comments:    Number(comments)  || 0,
    shares:      Number(shares)    || 0,
    bookmarks:   Number(bookmarks) || 0,
    duration:    Number(duration)  || 0,
    posted_at,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const now   = new Date();
  const today = now.toISOString().split('T')[0];

  // Build list of months to fetch: current + previous
  const months = [];
  for (let offset = 0; offset <= 1; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  }

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  update_content.js  —  TikTok + Instagram     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`Date: ${today}\n`);

  // ═══════════════════════════════════════
  // 1. TIKTOK
  // ═══════════════════════════════════════
  console.log('▶ TikTok ─────────────────────────────────────');
  const ttUid = await getTikTokUserId(TT_USERNAME);
  if (ttUid) {
    const allVideos = [];
    for (const monthStr of months) {
      const month = monthStr.substring(0, 7);
      const raw   = await fetchTikTokVideos(ttUid, monthStr);
      raw.forEach(v => allVideos.push(normalizeVideo(v, today, month)));
      await new Promise(r => setTimeout(r, 700));
    }
    const validVideos = allVideos.filter(v => v.video_id);
    if (validVideos.length) {
      await supabaseUpsert('tiktok_videos', validVideos, 'fetched_date,video_id');
      const totalViews = validVideos.reduce((s, v) => s + v.views, 0);
      const best       = [...validVideos].sort((a, b) => b.views - a.views)[0];
      console.log(`  Videos: ${validVideos.length} | Total views: ${totalViews.toLocaleString()}`);
      console.log(`  Best:   "${best?.description?.substring(0,60)}" (${best?.views?.toLocaleString()} views)`);
    } else {
      console.warn('  No TikTok videos to save.');
    }
  } else {
    console.warn('  Could not get TikTok UID — skipping TikTok.');
  }

  // ═══════════════════════════════════════
  // 2. INSTAGRAM — Posts & Reels
  // ═══════════════════════════════════════
  console.log('\n▶ Instagram ──────────────────────────────────');
  await new Promise(r => setTimeout(r, 800)); // polite gap between networks
  const igUid = await getInstagramUserId(IG_USERNAME);

  if (igUid) {
    const allIgPosts = [];

    // Posts
    for (const monthStr of months) {
      const month = monthStr.substring(0, 7);
      const raw   = await fetchInstagramContent(igUid, monthStr, 'posts');
      raw.forEach(p => allIgPosts.push(normalizeIgPost(p, today, month, 'post')));
      await new Promise(r => setTimeout(r, 700));
    }

    // Reels
    for (const monthStr of months) {
      const month = monthStr.substring(0, 7);
      const raw   = await fetchInstagramContent(igUid, monthStr, 'reels');
      raw.forEach(p => allIgPosts.push(normalizeIgPost(p, today, month, 'reel')));
      await new Promise(r => setTimeout(r, 700));
    }

    const validIg = allIgPosts.filter(p => p.post_id);
    if (validIg.length) {
      await supabaseUpsert('instagram_posts', validIg, 'fetched_date,post_id');
      const posts = validIg.filter(p => p.type === 'post');
      const reels = validIg.filter(p => p.type === 'reel');
      const bestReel = [...reels].sort((a, b) => b.views - a.views)[0];
      console.log(`  Posts: ${posts.length} | Reels: ${reels.length}`);
      if (bestReel) console.log(`  Best reel: "${bestReel.description?.substring(0,55)}" (${bestReel.views?.toLocaleString()} views)`);
    } else {
      console.warn('  No Instagram posts/reels to save.');
    }
  } else {
    console.warn('  Could not get Instagram UID — skipping Instagram.');
  }

  console.log('\n✓ update_content.js completed');
}

main().catch(e => { console.error(e); process.exit(1); });
