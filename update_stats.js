import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'src', 'data.js');
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "ca3f32f8d2msh2837e1e472c671ap19ab72jsnc2437284c988";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://uwcazgeemwspebmhntcm.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y2F6Z2VlbXdzcGVibWhudGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI1NzIsImV4cCI6MjA5NjQ5ODU3Mn0.f7HmfTR6l9exA1DGbM03n-sUAGOmNMRbLw9g3pGbhtY";

function findCountRecursive(data, targetKeys) {
  if (!data) return null;
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      for (const item of data) {
        const res = findCountRecursive(item, targetKeys);
        if (res !== null) return res;
      }
    } else {
      for (const k of targetKeys) {
        if (k in data) {
          const val = data[k];
          if (typeof val === 'number') return Math.floor(val);
          if (typeof val === 'string') {
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed)) return parsed;
          }
          if (val && typeof val === 'object' && 'count' in val) {
            const c = val.count;
            if (typeof c === 'number') return Math.floor(c);
          }
        }
      }
      for (const v of Object.values(data)) {
        const res = findCountRecursive(v, targetKeys);
        if (res !== null) return res;
      }
    }
  }
  return null;
}

async function getInstagramFollowers() {
  console.log("Fetching Instagram followers via RapidAPI...");
  const url = "https://instagram-looter2.p.rapidapi.com/profile?username=quadratin.morelos";
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "instagram-looter2.p.rapidapi.com"
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      let count = data?.edge_followed_by?.count ||
                  data?.user?.edge_followed_by?.count ||
                  data?.graphql?.user?.edge_followed_by?.count;
      if (count == null) {
        count = findCountRecursive(data, ["edge_followed_by", "follower_count", "followers"]);
      }
      if (count != null) {
        console.log(`Instagram followers: ${count}`);
        return count;
      }
      console.log(`Instagram: Could not find follower count in JSON:`, JSON.stringify(data).substring(0, 300));
    } else {
      console.log(`Instagram API Error ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.log(`Instagram API Exception: ${e.message}`);
  }
  return null;
}

async function getTikTokFollowers() {
  console.log("Fetching TikTok followers via RapidAPI...");
  const url = "https://tiktok-scraper7.p.rapidapi.com/user/info?unique_id=quadratinmorelos";
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com"
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      let count = data?.data?.stats?.followerCount || data?.data?.user?.stats?.followerCount;
      if (count == null) {
        count = findCountRecursive(data, ["followerCount", "follower_count", "followers"]);
      }
      if (count != null) {
        console.log(`TikTok followers: ${count}`);
        return count;
      }
      console.log(`TikTok: Could not find follower count in JSON:`, JSON.stringify(data).substring(0, 300));
    } else {
      console.log(`TikTok API Error ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.log(`TikTok API Exception: ${e.message}`);
  }
  return null;
}

async function getFacebookFollowers() {
  console.log("Fetching Facebook followers via RapidAPI...");
  const url = "https://facebook-pages-scraper2.p.rapidapi.com/get_facebook_pages_details?link=https://www.facebook.com/QuadratinMorelos&show_verified_badge=false&proxy_country=us";
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "facebook-pages-scraper2.p.rapidapi.com"
      }
    });
    if (res.status === 200) {
      let data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      let d = data?.data || data;
      let count = d?.followers || d?.followers_count || d?.likes || d?.likes_count;
      if (count == null) {
        count = findCountRecursive(data, ["followers", "followers_count", "likes", "likes_count"]);
      }
      if (count != null) {
        console.log(`Facebook followers: ${count}`);
        return count;
      }
      console.log(`Facebook: Could not find follower count in JSON:`, JSON.stringify(data).substring(0, 300));
    } else {
      console.log(`Facebook API Error ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.log(`Facebook API Exception: ${e.message}`);
  }
  return null;
}

async function getTwitterFollowers() {
  console.log("Fetching Twitter/X followers via RapidAPI...");
  const url = "https://twitter-api45.p.rapidapi.com/screenname.php?screenname=Quadratin_Mor";
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "twitter-api45.p.rapidapi.com"
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      let count = data?.followers_count || data?.sub_count || data?.followers;
      if (count == null) {
        count = findCountRecursive(data, ["followers_count", "sub_count", "followers"]);
      }
      if (count != null) {
        console.log(`Twitter/X followers: ${count}`);
        return count;
      }
      console.log(`Twitter/X: Could not find follower count in JSON:`, JSON.stringify(data).substring(0, 300));
    } else {
      console.log(`Twitter/X API Error ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.log(`Twitter/X API Exception: ${e.message}`);
  }
  return null;
}

async function supabasePost(table, payload) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    });
    if (res.status >= 200 && res.status < 300) {
      console.log(`  Supabase ${table}: guardado OK`);
      return true;
    } else {
      console.log(`  Supabase ${table} error ${res.status}: ${await res.text()}`);
      return false;
    }
  } catch (e) {
    console.log(`  Supabase ${table} excepcion: ${e.message}`);
    return false;
  }
}

async function saveDailyFollowersSupabase(entry) {
  console.log("Guardando seguidores diarios en Supabase...");
  const row = {
    date: entry.date,
    instagram: entry.instagram,
    tiktok: entry.tiktok,
    facebook: entry.facebook,
    twitter: entry.twitter,
    youtube: entry.youtube
  };
  await supabasePost("daily_followers", row);
}

async function main() {
  console.log(`=== SOCIAL MEDIA UPDATER (NODE) - ${new Date().toLocaleString()} ===`);
  
  let data;
  if (fs.existsSync(DATA_FILE)) {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonStr = content.replace("export const qm_data = ", "").trim().replace(/;\s*$/, "");
    const cleanJsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    data = JSON.parse(cleanJsonStr);
  } else {
    data = {
      history: [],
      goals: {
        instagram: 18000,
        tiktok: 10000,
        facebook: 87000,
        twitter: 20000
      }
    };
  }

  const instagram = await getInstagramFollowers();
  const tiktok = await getTikTokFollowers();
  const facebook = await getFacebookFollowers();
  const twitter = await getTwitterFollowers();

  if (!instagram && !tiktok && !facebook && !twitter) {
    console.error("Error: Could not retrieve any metrics. Aborting update.");
    process.exit(1);
  }

  const todayStr = "2026-06-15";
  const lastEntry = data.history[data.history.length - 1] || {};

  const newEntry = {
    date: todayStr,
    instagram: instagram !== null ? instagram : (lastEntry.instagram || 0),
    tiktok: tiktok !== null ? tiktok : (lastEntry.tiktok || 0),
    facebook: facebook !== null ? facebook : (lastEntry.facebook || 0),
    twitter: twitter !== null ? twitter : (lastEntry.twitter || 0),
    youtube: lastEntry.youtube !== undefined ? lastEntry.youtube : null
  };

  const failedPlatforms = [];
  if (instagram === null) failedPlatforms.push("instagram");
  if (tiktok === null) failedPlatforms.push("tiktok");
  if (facebook === null) failedPlatforms.push("facebook");
  if (twitter === null) failedPlatforms.push("twitter");

  if (failedPlatforms.length > 0) {
    newEntry.failed_scrapes = failedPlatforms;
    console.log(`Warnings: Failed to scrape: ${failedPlatforms.join(", ")}`);
  }

  let todayIndex = data.history.findIndex(entry => entry.date === todayStr);

  if (todayIndex !== -1) {
    const prevToday = data.history[todayIndex];
    for (const key of ["instagram", "tiktok", "facebook", "twitter"]) {
      if (newEntry[key] === 0 || failedPlatforms.includes(key)) {
        if ((prevToday[key] || 0) > 0) {
          newEntry[key] = prevToday[key];
        }
      }
    }
    const prevFailed = prevToday.failed_scrapes || [];
    const newFailed = failedPlatforms.filter(p => prevFailed.includes(p));
    if (newFailed.length > 0) {
      newEntry.failed_scrapes = newFailed;
    } else {
      delete newEntry.failed_scrapes;
    }
    data.history[todayIndex] = newEntry;
    console.log("Updated existing entry for today.");
  } else {
    data.history.push(newEntry);
    console.log("Added new entry for today.");
  }

  fs.writeFileSync(DATA_FILE, "export const qm_data = " + JSON.stringify(data, null, 2) + ";\n", 'utf8');
  console.log("src/data.js updated successfully!");

  await saveDailyFollowersSupabase(newEntry);
  console.log("Completed update_stats.js successfully");
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
