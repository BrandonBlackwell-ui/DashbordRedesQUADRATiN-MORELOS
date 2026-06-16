// Weekly competition data updater — runs every Monday via GitHub Actions
// Facebook: Apify actor apify/facebook-pages-scraper (single run with all pages)
// Instagram/TikTok/Twitter: existing RapidAPI key

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname || process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valParts] = trimmed.split('=');
        const val = valParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key.trim()] = val;
      }
    });
  }
}
loadEnv();

const APIFY_KEY    = process.env.APIFY_KEY   ;
const RAP_KEY      = process.env.RAP_KEY      || 'ca3f32f8d2msh2837e1e472c671ap19ab72jsnc2437284c988';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwcazgeemwspebmhntcm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y2F6Z2VlbXdzcGVibWhudGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI1NzIsImV4cCI6MjA5NjQ5ODU3Mn0.f7HmfTR6l9exA1DGbM03n-sUAGOmNMRbLw9g3pGbhtY';

function get(url, headers) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(15000, () => { req.destroy(); resolve(null); });
  });
}

function postJson(url, payload, headers = {}, timeoutMs = 300000) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

function normalizeFacebookUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^m\./, '').replace(/^www\./, '').toLowerCase();
    const path = u.pathname.replace(/\/+$/, '').toLowerCase();
    return `${host}${path}`;
  } catch(e) {
    return String(url).split('?')[0].replace(/\/+$/, '').toLowerCase();
  }
}

function parseCount(value) {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value !== 'string') return null;
  const clean = value.trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, '');
  const match = clean.match(/(\d+(?:\.\d+)?)([kmb])?/);
  if (!match) return null;
  const multipliers = { k: 1e3, m: 1e6, b: 1e9 };
  return Math.floor(Number(match[1]) * (multipliers[match[2]] || 1));
}

function findCountRecursive(data, targetKeys) {
  if (!data || typeof data !== 'object') return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findCountRecursive(item, targetKeys);
      if (found !== null) return found;
    }
    return null;
  }
  for (const key of targetKeys) {
    if (key in data) {
      const parsed = parseCount(data[key]);
      if (parsed !== null) return parsed;
      if (data[key] && typeof data[key] === 'object' && 'count' in data[key]) {
        const count = parseCount(data[key].count);
        if (count !== null) return count;
      }
    }
  }
  for (const value of Object.values(data)) {
    const found = findCountRecursive(value, targetKeys);
    if (found !== null) return found;
  }
  return null;
}

function getItemUrls(item) {
  return [
    item?.facebookUrl,
    item?.pageUrl,
    item?.url,
    item?.inputUrl,
    item?.startUrl,
    item?.startUrl?.url,
    item?.input?.url,
    item?.pageName ? `https://www.facebook.com/${item.pageName}` : null,
  ].filter(Boolean);
}

async function getFacebookFollowersBatch(urls) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (uniqueUrls.length === 0) return new Map();

  console.log(`Fetching Facebook followers via Apify (${uniqueUrls.length} pages in one run)...`);
  const input = { startUrls: uniqueUrls.map(url => ({ url })) };
  const endpoint = `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_KEY)}`;
  const items = await postJson(endpoint, input, {}, 300000);
  const results = new Map();

  if (!Array.isArray(items)) {
    console.log('Facebook Apify: actor did not return a dataset array.');
    return results;
  }

  const followerKeys = [
    'followers',
    'followersCount',
    'followers_count',
    'numberOfFollowers',
    'pageFollowers',
    'fanCount',
    'likes',
    'likesCount',
    'likes_count',
  ];

  for (const item of items) {
    const count = findCountRecursive(item, followerKeys);
    if (count === null) continue;
    for (const itemUrl of getItemUrls(item)) {
      results.set(normalizeFacebookUrl(itemUrl), count);
    }
  }

  console.log(`Facebook Apify: matched ${results.size} URL keys from ${items.length} result items.`);
  return results;
}
async function getIG(user) {
  if (!user) return null;
  const r = await get('https://instagram-looter2.p.rapidapi.com/profile?username=' + user,
    { 'x-rapidapi-key': RAP_KEY, 'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com' });
  return r?.edge_followed_by?.count || r?.follower_count || null;
}
async function getTT(user) {
  if (!user) return null;
  const r = await get('https://tiktok-scraper7.p.rapidapi.com/user/info?unique_id=' + user,
    { 'x-rapidapi-key': RAP_KEY, 'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com' });
  return r?.data?.stats?.followerCount || null;
}
async function getTW(user) {
  if (!user) return null;
  const r = await get('https://twitter-api45.p.rapidapi.com/screenname.php?screenname=' + user,
    { 'x-rapidapi-key': RAP_KEY, 'x-rapidapi-host': 'twitter-api45.p.rapidapi.com' });
  return r?.followers_count || r?.sub_count || null;
}

const localMediaDefs = [
  { name: 'Quadratín Morelos', isUs: true,  logo: 'https://morelos.quadratin.com.mx/favicon.ico',      fb: 'QuadratinMorelos',       ig: 'quadratin.morelos',       tt: 'quadratinmorelos',      tw: 'Quadratin_Mor' },
  { name: 'Diario de Morelos',              logo: 'https://www.diariodemorelos.com/favicon.ico',        fb: 'DiariodeMorelosOficial', ig: 'diariodemorelosoficial',  tt: 'diariodemorelos',       tw: 'diariodemorelos' },
  { name: 'La Unión de Morelos',            logo: 'https://www.launion.com.mx/favicon.ico',             fb: 'uniondemorelos',          ig: 'uniondemorelos',          tt: 'launiondemorelos',      tw: 'uniondemorelos' },
  { name: 'El Sol de Cuernavaca',           logo: 'https://oem.com.mx/elsoldecuernavaca/favicon.ico',   fb: 'ElSoldeCuernavaca',       ig: null,                      tt: null,                    tw: 'soldecuernavaca' },
  { name: 'La Jornada Morelos',             logo: 'https://www.lajornadamorelos.mx/favicon.ico',        fb: 'lajornada.morelos',       ig: 'jornadamorelos',          tt: 'lajornadamorelos',      tw: 'MorelosJornada' },
  { name: '24 Morelos',                     logo: 'https://www.24morelos.com/favicon.ico',              fb: '24morelos',               ig: '24_morelos',              tt: '24mexico',              tw: '24_morelos' },
];

const estadosDefs = [
  { estado: 'Morelos',          isUs: true, logo: 'https://morelos.quadratin.com.mx/favicon.ico', fb: 'QuadratinMorelos',       ig: 'quadratin.morelos',          tt: 'quadratinmorelos',       tw: 'Quadratin_Mor' },
  { estado: 'Michoacán',                    logo: 'https://quadratin.com.mx/favicon.ico',               fb: 'agenciaquadratin',        ig: 'quadratin_',                 tt: 'quadratin_',             tw: 'Quadratin_' },
  { estado: 'CDMX',                         logo: 'https://mexico.quadratin.com.mx/favicon.ico',        fb: 'QuadratinMexico',         ig: 'quadratincdmx',              tt: 'quadratin_mexico',       tw: 'QuadratinMexico' },
  { estado: 'Edomex',                       logo: 'https://edomex.quadratin.com.mx/favicon.ico',        fb: 'edomexquadratin',         ig: 'quadratinedomex',            tt: 'quadratin_edomex',       tw: 'QuadratinEdomex' },
  { estado: 'Jalisco',                      logo: 'https://jalisco.quadratin.com.mx/favicon.ico',       fb: 'quadratinjalisco',        ig: 'quadratin_jalisco',          tt: 'quadratin_jalisco',      tw: null },
  { estado: 'Querétaro',                    logo: 'https://queretaro.quadratin.com.mx/favicon.ico',     fb: 'queretaroquadratin',      ig: 'quadratinqueretaro',         tt: 'quadratin_qro',          tw: 'quadratin_q' },
  { estado: 'Hidalgo',                      logo: 'https://hidalgo.quadratin.com.mx/favicon.ico',       fb: 'quadratinhidalgo',        ig: 'quadratin_hidalgo',          tt: 'quadratin_hidalgo',      tw: 'Quadratin_Hgo' },
  { estado: 'Veracruz',                     logo: 'https://veracruz.quadratin.com.mx/favicon.ico',      fb: 'QuadratinVeracruz',       ig: 'quadratin_ver',              tt: 'quadratinveracruz',      tw: 'quadratin_ver' },
  { estado: 'SLP',                          logo: 'https://sanluispotosi.quadratin.com.mx/favicon.ico', fb: 'quadratin.slp',           ig: 'noticiasquadratin_slp',      tt: 'noticiasquadratin_slp',  tw: 'Quadratin_SLP' },
  { estado: 'Oaxaca',                       logo: 'https://oaxaca.quadratin.com.mx/favicon.ico',        fb: 'quadratinoaxaca',         ig: 'quadratinoaxaca',            tt: 'quadratin.oaxaca',       tw: 'Quadratinoaxaca' },
  { estado: 'Chiapas',                      logo: 'https://chiapas.quadratin.com.mx/favicon.ico',       fb: '61569144014499',          ig: 'quadratin_chiapas',          tt: 'quadratinchiapas',       tw: 'quadratin_chis' },
  { estado: 'Yucatán',                      logo: 'https://yucatan.quadratin.com.mx/favicon.ico',       fb: 'QuadratinYucatan',        ig: 'quadratinyucatan',           tt: 'quadratinyucatan',       tw: 'QuadratinY' },
  { estado: 'Guerrero',                     logo: 'https://guerrero.quadratin.com.mx/favicon.ico',      fb: 'guerreroquadratin',       ig: 'quadratin_guerrero',         tt: 'quadratinguerrero',      tw: 'Quadratin_Gro' },
  { estado: 'Tlaxcala',                     logo: 'https://tlaxcala.quadratin.com.mx/favicon.ico',      fb: 'QuadratinTlax',           ig: 'quadratintlax',              tt: 'quadratintlaxcala',      tw: 'quadratin_tlax' },
  { estado: 'Bajío',                        logo: 'https://bajio.quadratin.com.mx/favicon.ico',         fb: 'quadratinbajio',          ig: 'quadratinbajio',             tt: 'quadratinbajio',         tw: 'quadratinbajio' },
  { estado: 'Puebla',                       logo: 'https://puebla.quadratin.com.mx/favicon.ico',        fb: 'QuadratinPuebla',         ig: 'quadratinpuebla',            tt: 'quadratin.puebla',       tw: 'QuadratinPuebla' },
  { estado: 'Quintana Roo',                 logo: 'https://quintanaroo.quadratin.com.mx/favicon.ico',   fb: 'quadratin.quintanaroo',   ig: 'quadratin.quintana.roo',     tt: 'quadratinquintanarroo',  tw: 'Q_QRoo' },
  { estado: 'Sinaloa',                      logo: 'https://sinaloa.quadratin.com.mx/favicon.ico',       fb: 'sinaloaquadratin',        ig: null,                         tt: null,                     tw: 'QuadratinSin' },
  { estado: 'Nuevo León',                   logo: 'https://nuevoleon.quadratin.com.mx/favicon.ico',     fb: 'quadratinnuevoleon',      ig: 'quadratinnl',                tt: 'quadratinnl',            tw: 'quadratinnl' },
  { estado: 'Hispano (EE.UU.)',             logo: 'https://quadratin.com/favicon.ico',                  fb: 'HispanoQ',                ig: 'hispanoq',                   tt: 'hispanoq',               tw: 'HispanoQ' },
];

async function fetchItem(def, nameKey, facebookFollowersByUrl, existingData) {
  const fbUrl = def.fb ? ('https://www.facebook.com/' + def.fb) : null;
  console.log('Fetching', def[nameKey], '...');
  
  // Find existing item for fallback
  const existingList = existingData ? (nameKey === 'name' ? existingData.localMedia : existingData.estados) : [];
  const existingItem = existingList.find(item => item[nameKey] === def[nameKey]);

  let fb = fbUrl ? (facebookFollowersByUrl.get(normalizeFacebookUrl(fbUrl)) || null) : null;
  if (fb === null && existingItem) {
    fb = existingItem.facebook;
  }

  const [ig, tt, tw] = await Promise.all([getIG(def.ig), getTT(def.tt), getTW(def.tw)]);
  await new Promise(r => setTimeout(r, 600));

  const result = {
    [nameKey]: def[nameKey],
    facebook: fb,
    instagram: ig !== null ? ig : (existingItem ? existingItem.instagram : null),
    tiktok: tt !== null ? tt : (existingItem ? existingItem.tiktok : null),
    twitter: tw !== null ? tw : (existingItem ? existingItem.twitter : null),
    logo: def.logo || null,
    fb: def.fb || null,
    ig: def.ig || null,
    tt: def.tt || null,
    tw: def.tw || null
  };
  if (def.isUs) result.isUs = true;
  return result;
}

// Save rows to a Supabase table via REST API
function supabasePost(table, rows) {
  return new Promise((resolve) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    const req  = https.request({
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  ✓ ${table}: ${Array.isArray(rows) ? rows.length : 1} filas guardadas`);
          resolve(true);
        } else {
          console.error(`  ✗ ${table} error ${res.statusCode}: ${data.substring(0, 200)}`);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.error(`  ✗ ${table} request error:`, e.message); resolve(false); });
    req.write(body);
    req.end();
  });
}

async function saveToSupabase(today, localMedia, estados) {
  console.log('\n=== Guardando en Supabase ===');

  // competition_local
  const localRows = localMedia.map(m => ({
    fetched_date: today, name: m.name,
    facebook: m.facebook || null, instagram: m.instagram || null,
    tiktok: m.tiktok || null,     twitter: m.twitter   || null,
  }));
  await supabasePost('competition_local', localRows);

  // competition_estados
  const estadosRows = estados.map(e => ({
    fetched_date: today, estado: e.estado,
    facebook: e.facebook || null, instagram: e.instagram || null,
    tiktok: e.tiktok || null,     twitter: e.twitter    || null,
  }));
  await supabasePost('competition_estados', estadosRows);
}

function loadExistingCompetitionData() {
  const compPath = path.join(__dirname, 'src', 'competition.js');
  if (fs.existsSync(compPath)) {
    try {
      const content = fs.readFileSync(compPath, 'utf8');
      const jsonStr = content
        .replace(/(?<!https?:)\/\/.*$/gm, '') // Remove single-line comments safely
        .replace(/export\s+const\s+competition_data\s*=\s*/, '')
        .replace(/;\s*$/, '')
        .trim();
      return Function('return (' + jsonStr + ')')();
    } catch (e) {
      console.error('Failed to parse existing competition.js:', e.message);
    }
  }
  return null;
}

async function main() {
  const existingData = loadExistingCompetitionData();
  const facebookUrls = [...localMediaDefs, ...estadosDefs]
    .filter(d => d.fb)
    .map(d => 'https://www.facebook.com/' + d.fb);
  const facebookFollowersByUrl = await getFacebookFollowersBatch(facebookUrls);

  console.log('=== Fetching local media ===');
  const localMedia = [];
  for (const d of localMediaDefs) localMedia.push(await fetchItem(d, 'name', facebookFollowersByUrl, existingData));

  console.log('\n=== Fetching Quadratin estados ===');
  const estados = [];
  for (const d of estadosDefs) estados.push(await fetchItem(d, 'estado', facebookFollowersByUrl, existingData));

  const today = new Date().toISOString().split('T')[0];

  // Save competition.js for the dashboard
  const output = `// Competition data — auto-fetched weekly (Mondays) via GitHub Actions
// Last updated: ${today}

export const competition_data = {

  // Local Morelos media comparison
  localMedia: ${JSON.stringify(localMedia, null, 4)},

  // Quadratín by state comparison
  estados: ${JSON.stringify(estados, null, 4)},

  lastUpdated: '${today}',
};\n`;

  fs.writeFileSync(path.join(__dirname, 'src', 'competition.js'), output, 'utf8');
  console.log('\nDone! src/competition.js updated.');

  // Save historical snapshot to Supabase
  console.log('\n=== Saving to Supabase competition_history ===');
  await saveToSupabase(today, localMedia, estados);
}

main().catch(e => { console.error(e); process.exit(1); });
