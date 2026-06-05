// Weekly competition data updater — runs every Monday via GitHub Actions
// Facebook: facebook-scraper3 API (100 calls/month)
// Instagram/TikTok/Twitter: existing RapidAPI key

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const FB_KEY       = process.env.FB_KEY       || '4ba69eaa2amsh85583d0034b25cep1ebe37jsn4c3ca683070c';
const RAP_KEY      = process.env.RAP_KEY      || 'ca3f32f8d2msh2837e1e472c671ap19ab72jsnc2437284c988';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rpggshwqdxbjhqyxjicv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZ2dzaHdxZHhiamhxeXhqaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODE2NzEsImV4cCI6MjA5NjE1NzY3MX0.8s0VEFUpBnVS_z0gWsDjEm0pZbxqSCDTPjUk9c9T5Sk';

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

async function getFB(url) {
  const r = await get('https://facebook-scraper3.p.rapidapi.com/page/details?url=' + encodeURIComponent(url),
    { 'x-rapidapi-key': FB_KEY, 'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com' });
  return r?.results?.followers || null;
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
  { name: 'Quadratín Morelos', isUs: true,  fb: 'QuadratinMorelos',       ig: 'quadratin.morelos',       tt: 'quadratinmorelos',      tw: 'Quadratin_Mor' },
  { name: 'Diario de Morelos',              fb: 'DiariodeMorelosOficial', ig: 'diariodemorelosoficial',  tt: 'diariodemorelos',       tw: 'diariodemorelos' },
  { name: 'La Unión de Morelos',            fb: 'uniondemorelos',          ig: 'uniondemorelos',          tt: 'launiondemorelos',      tw: 'uniondemorelos' },
  { name: 'El Sol de Cuernavaca',           fb: 'ElSoldeCuernavaca',       ig: null,                      tt: null,                    tw: 'soldecuernavaca' },
  { name: 'La Jornada Morelos',             fb: 'lajornada.morelos',       ig: 'jornadamorelos',          tt: 'lajornadamorelos',      tw: 'MorelosJornada' },
  { name: '24 Morelos',                     fb: '24morelos',               ig: '24_morelos',              tt: '24mexico',              tw: '24_morelos' },
];

const estadosDefs = [
  { estado: 'Morelos',          isUs: true, fb: 'QuadratinMorelos',       ig: 'quadratin.morelos',          tt: 'quadratinmorelos',       tw: 'Quadratin_Mor' },
  { estado: 'Michoacán',                    fb: 'agenciaquadratin',        ig: 'quadratin_',                 tt: 'quadratin_',             tw: 'Quadratin_' },
  { estado: 'CDMX',                         fb: 'QuadratinMexico',         ig: 'quadratincdmx',              tt: 'quadratin_mexico',       tw: 'QuadratinMexico' },
  { estado: 'Edomex',                       fb: 'edomexquadratin',         ig: 'quadratinedomex',            tt: 'quadratin_edomex',       tw: 'QuadratinEdomex' },
  { estado: 'Jalisco',                      fb: 'quadratinjalisco',        ig: 'quadratin_jalisco',          tt: 'quadratin_jalisco',      tw: null },
  { estado: 'Querétaro',                    fb: 'queretaroquadratin',      ig: 'quadratinqueretaro',         tt: 'quadratin_qro',          tw: 'quadratin_q' },
  { estado: 'Hidalgo',                      fb: 'quadratinhidalgo',        ig: 'quadratin_hidalgo',          tt: 'quadratin_hidalgo',      tw: 'Quadratin_Hgo' },
  { estado: 'Veracruz',                     fb: 'QuadratinVeracruz',       ig: 'quadratin_ver',              tt: 'quadratinveracruz',      tw: 'quadratin_ver' },
  { estado: 'SLP',                          fb: 'quadratin.slp',           ig: 'noticiasquadratin_slp',      tt: 'noticiasquadratin_slp',  tw: 'Quadratin_SLP' },
  { estado: 'Oaxaca',                       fb: 'quadratinoaxaca',         ig: 'quadratinoaxaca',            tt: 'quadratin.oaxaca',       tw: 'Quadratinoaxaca' },
  { estado: 'Chiapas',                      fb: '61569144014499',          ig: 'quadratin_chiapas',          tt: 'quadratinchiapas',       tw: 'quadratin_chis' },
  { estado: 'Yucatán',                      fb: 'QuadratinYucatan',        ig: 'quadratinyucatan',           tt: 'quadratinyucatan',       tw: 'QuadratinY' },
  { estado: 'Guerrero',                     fb: 'guerreroquadratin',       ig: 'quadratin_guerrero',         tt: 'quadratinguerrero',      tw: 'Quadratin_Gro' },
  { estado: 'Tlaxcala',                     fb: 'QuadratinTlax',           ig: 'quadratintlax',              tt: 'quadratintlaxcala',      tw: 'quadratin_tlax' },
  { estado: 'Bajío',                        fb: 'quadratinbajio',          ig: 'quadratinbajio',             tt: 'quadratinbajio',         tw: 'quadratinbajio' },
  { estado: 'Puebla',                       fb: 'QuadratinPuebla',         ig: 'quadratinpuebla',            tt: 'quadratin.puebla',       tw: 'QuadratinPuebla' },
  { estado: 'Quintana Roo',                 fb: 'quadratin.quintanaroo',   ig: 'quadratin.quintana.roo',     tt: 'quadratinquintanarroo',  tw: 'Q_QRoo' },
  { estado: 'Sinaloa',                      fb: 'sinaloaquadratin',        ig: null,                         tt: null,                     tw: 'QuadratinSin' },
  { estado: 'Nuevo León',                   fb: 'quadratinnuevoleon',      ig: 'quadratinnl',                tt: 'quadratinnl',            tw: 'quadratinnl' },
  { estado: 'Hispano (EE.UU.)',             fb: 'HispanoQ',                ig: 'hispanoq',                   tt: 'hispanoq',               tw: 'HispanoQ' },
];

async function fetchItem(def, nameKey) {
  const fbUrl = def.fb ? ('https://www.facebook.com/' + def.fb) : null;
  console.log('Fetching', def[nameKey], '...');
  const [fb, ig, tt, tw] = await Promise.all([
    fbUrl ? getFB(fbUrl) : Promise.resolve(null),
    getIG(def.ig), getTT(def.tt), getTW(def.tw)
  ]);
  await new Promise(r => setTimeout(r, 600));
  const result = { [nameKey]: def[nameKey], facebook: fb, instagram: ig, tiktok: tt, twitter: tw };
  if (def.isUs) result.isUs = true;
  return result;
}

// Save snapshot to Supabase competition_history table
async function saveToSupabase(today, localMedia, estados) {
  const rows = [
    ...localMedia.map(m => ({
      fetched_date: today,
      type: 'local',
      name: m.name,
      facebook:  m.facebook  || null,
      instagram: m.instagram || null,
      tiktok:    m.tiktok    || null,
      twitter:   m.twitter   || null,
    })),
    ...estados.map(e => ({
      fetched_date: today,
      type: 'estado',
      name: e.estado,
      facebook:  e.facebook  || null,
      instagram: e.instagram || null,
      tiktok:    e.tiktok    || null,
      twitter:   e.twitter   || null,
    })),
  ];

  return new Promise((resolve) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`${SUPABASE_URL}/rest/v1/competition_history`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Supabase: ${rows.length} rows saved to competition_history`);
          resolve(true);
        } else {
          console.error(`Supabase error ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.error('Supabase request error:', e); resolve(false); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Fetching local media ===');
  const localMedia = [];
  for (const d of localMediaDefs) localMedia.push(await fetchItem(d, 'name'));

  console.log('\n=== Fetching Quadratin estados ===');
  const estados = [];
  for (const d of estadosDefs) estados.push(await fetchItem(d, 'estado'));

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
