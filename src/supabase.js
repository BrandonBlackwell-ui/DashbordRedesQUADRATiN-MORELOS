// ─── Supabase Client — Quadratín Morelos Dashboard ───────────────────────────
// Nuevo proyecto: uwcazgeemwspebmhntcm
// Tablas: daily_followers | competition_local | competition_estados | analysis_log | monthly_closes | tasks

const SUPABASE_URL = 'https://uwcazgeemwspebmhntcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y2F6Z2VlbXdzcGVibWhudGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI1NzIsImV4cCI6MjA5NjQ5ODU3Mn0.f7HmfTR6l9exA1DGbM03n-sUAGOmNMRbLw9g3pGbhtY';

const h = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

const post = async (table, body, prefer = 'return=minimal') => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...h(), 'Prefer': prefer },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`[${table}] POST ${res.status}: ${await res.text()}`);
  return prefer === 'return=minimal' ? true : await res.json();
};

const get = async (table, query = '') => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: h() });
  if (!res.ok) throw new Error(`[${table}] GET ${res.status}: ${await res.text()}`);
  return res.json();
};

const patch = async (table, filter, body) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH', headers: h(), body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`[${table}] PATCH ${res.status}`);
  return res.json();
};

const del = async (table, filter) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`[${table}] DELETE ${res.status}`);
  return true;
};

export const supabase = {

  // ── 1. SEGUIDORES DIARIOS — Quadratín Morelos ──────────────────────────────
  // Tabla: daily_followers
  // Columnas: date, instagram, tiktok, facebook, twitter, youtube
  saveDailyFollowers: async (data) => {
    // data = { date: '2026-06-08', instagram, tiktok, facebook, twitter, youtube }
    try {
      return await post('daily_followers', data, 'resolution=merge-duplicates,return=minimal');
    } catch (e) {
      console.error('saveDailyFollowers:', e.message); return false;
    }
  },

  getDailyFollowers: async (from, to) => {
    try {
      let q = 'order=date.asc';
      if (from) q += `&date=gte.${from}`;
      if (to)   q += `&date=lte.${to}`;
      return await get('daily_followers', q);
    } catch (e) {
      console.error('getDailyFollowers:', e.message); return [];
    }
  },

  // ── 2. COMPETENCIA LOCAL — Medios de Morelos ───────────────────────────────
  // Tabla: competition_local
  // Columnas: fetched_date, name, facebook, instagram, tiktok, twitter
  saveCompetitionLocal: async (rows) => {
    // rows = [{ fetched_date, name, facebook, instagram, tiktok, twitter }, ...]
    try {
      return await post('competition_local', rows);
    } catch (e) {
      console.error('saveCompetitionLocal:', e.message); return false;
    }
  },

  getCompetitionLocal: async (name) => {
    try {
      let q = 'order=fetched_date.asc';
      if (name) q += `&name=eq.${encodeURIComponent(name)}`;
      return await get('competition_local', q);
    } catch (e) {
      console.error('getCompetitionLocal:', e.message); return [];
    }
  },

  // ── 3. COMPETENCIA ESTADOS — Red Quadratín Nacional ───────────────────────
  // Tabla: competition_estados
  // Columnas: fetched_date, estado, facebook, instagram, tiktok, twitter
  saveCompetitionEstados: async (rows) => {
    try {
      return await post('competition_estados', rows);
    } catch (e) {
      console.error('saveCompetitionEstados:', e.message); return false;
    }
  },

  getCompetitionEstados: async (estado) => {
    try {
      let q = 'order=fetched_date.asc';
      if (estado) q += `&estado=eq.${encodeURIComponent(estado)}`;
      return await get('competition_estados', q);
    } catch (e) {
      console.error('getCompetitionEstados:', e.message); return [];
    }
  },

  // ── 4. ANÁLISIS IA — Logs de análisis generados por Claude ────────────────
  // Tabla: analysis_log
  // Columnas: date, type, content (jsonb)
  saveAnalysis: async (date, type, content) => {
    // type: 'redes' | 'competencia' | 'semanal'
    // content: objeto JSON con el análisis
    try {
      return await post('analysis_log', { date, type, content });
    } catch (e) {
      console.error('saveAnalysis:', e.message); return false;
    }
  },

  getAnalysis: async (type, limit = 10) => {
    try {
      let q = `order=date.desc&limit=${limit}`;
      if (type) q += `&type=eq.${type}`;
      return await get('analysis_log', q);
    } catch (e) {
      console.error('getAnalysis:', e.message); return [];
    }
  },

  // ── 5. CIERRES MENSUALES — Quadratín Morelos ──────────────────────────────
  // Tabla: monthly_closes
  // Columnas: year, month, facebook, instagram, twitter, tiktok, youtube
  saveMonthlyCierre: async (year, month, data) => {
    try {
      return await post('monthly_closes', { year, month, ...data },
        'resolution=merge-duplicates,return=minimal');
    } catch (e) {
      console.error('saveMonthlyCierre:', e.message); return null;
    }
  },

  getMonthlyCierres: async () => {
    try {
      return await get('monthly_closes', 'order=year.asc,month.asc');
    } catch (e) {
      console.error('getMonthlyCierres:', e.message); return [];
    }
  },

  // ── 6. TAREAS / TASKS (Dependencias) ──────────────────────────────────────
  getTasks: async () => {
    try {
      return await get('tasks', 'order=created_at.desc');
    } catch (e) {
      console.error('getTasks:', e.message); return [];
    }
  },

  addTask: async (title) => {
    try {
      const data = await post('tasks', { title, status: 'pending' }, 'return=representation');
      return data[0] || null;
    } catch (e) {
      console.error('addTask:', e.message); return null;
    }
  },

  completeTask: async (id) => {
    try {
      const data = await patch('tasks', `id=eq.${id}`,
        { status: 'completed', completed_at: new Date().toISOString() });
      return data[0] || null;
    } catch (e) {
      console.error('completeTask:', e.message); return null;
    }
  },

  deleteTask: async (id) => {
    try {
      return await del('tasks', `id=eq.${id}`);
    } catch (e) {
      console.error('deleteTask:', e.message); return false;
    }
  },

  // ── 7. TIKTOK VIDEOS — Contenido semanal ──────────────────────────────────
  // Tabla: tiktok_videos
  // Columnas: fetched_date, month, video_id, description, views, likes,
  //           comments, shares, bookmarks, duration, posted_at
  saveTikTokVideos: async (rows) => {
    try {
      return await post('tiktok_videos', rows, 'resolution=merge-duplicates,return=minimal');
    } catch (e) {
      console.error('saveTikTokVideos:', e.message); return false;
    }
  },

  getTikTokVideos: async (month) => {
    // month: 'YYYY-MM' — if null returns all, ordered by views desc
    try {
      let q = 'order=views.desc';
      if (month) q += `&month=eq.${month}`;
      return await get('tiktok_videos', q);
    } catch (e) {
      console.error('getTikTokVideos:', e.message); return [];
    }
  },

  getLatestTikTokFetch: async () => {
    // Returns the most recent batch (latest fetched_date)
    try {
      const dates = await get('tiktok_videos', 'select=fetched_date&order=fetched_date.desc&limit=1');
      if (!dates?.length) return [];
      const latestDate = dates[0].fetched_date;
      return await get('tiktok_videos', `fetched_date=eq.${latestDate}&order=views.desc`);
    } catch (e) {
      console.error('getLatestTikTokFetch:', e.message); return [];
    }
  },

  // ── LEGACY: competition_history (proyecto anterior) ────────────────────────
  // Mantenido por compatibilidad — el nuevo flujo usa competition_local/estados
  saveCompetitionSnapshot: async (rows) => {
    try {
      return await post('competition_history', rows);
    } catch (e) {
      console.error('saveCompetitionSnapshot:', e.message); return false;
    }
  },
};
