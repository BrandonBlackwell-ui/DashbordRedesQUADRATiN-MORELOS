const SUPABASE_URL = 'https://rpggshwqdxbjhqyxjicv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZ2dzaHdxZHhiamhxeXhqaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODE2NzEsImV4cCI6MjA5NjE1NzY3MX0.8s0VEFUpBnVS_z0gWsDjEm0pZbxqSCDTPjUk9c9T5Sk';

const getHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const supabase = {
  getTasks: async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&order=created_at.desc`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Error fetching tasks from Supabase:", e);
      return [];
    }
  },

  addTask: async (title) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          status: 'pending'
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (e) {
      console.error("Error adding task to Supabase:", e);
      return null;
    }
  },

  completeTask: async (id) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (e) {
      console.error("Error completing task in Supabase:", e);
      return null;
    }
  },

  // ── Monthly Close Tracking ──────────────────────────────────────
  saveMonthlyCierre: async (year, month, data) => {
    // data = { facebook, instagram, twitter, tiktok, youtube }
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/monthly_closes`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ year, month, ...data })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Error saving monthly close:', e);
      return null;
    }
  },

  getMonthlyCierres: async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/monthly_closes?select=*&order=year.asc,month.asc`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Error fetching monthly closes:', e);
      return [];
    }
  },

  // ── Competition History ──────────────────────────────────────────
  // Saves a weekly snapshot of all competitors to competition_history table
  // Each row: { fetched_date, type ('local'|'estado'), name, facebook, instagram, tiktok, twitter }
  saveCompetitionSnapshot: async (rows) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/competition_history`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify(rows)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (e) {
      console.error('Error saving competition snapshot:', e);
      return false;
    }
  },

  getCompetitionHistory: async (type, name) => {
    try {
      let url = `${SUPABASE_URL}/rest/v1/competition_history?select=*&order=fetched_date.asc`;
      if (type) url += `&type=eq.${type}`;
      if (name) url += `&name=eq.${encodeURIComponent(name)}`;
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Error fetching competition history:', e);
      return [];
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (e) {
      console.error("Error deleting task in Supabase:", e);
      return false;
    }
  }
};
