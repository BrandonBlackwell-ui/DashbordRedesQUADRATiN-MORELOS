// ═══════════════════════════════════════════════════════════════════
// api/analyze.js  — Vercel Serverless Function
// Receives video data → calls Claude Opus → returns analysis text
//
// Env var required (set in Vercel dashboard):
//   ANTHROPIC_API_KEY  — your Anthropic API key
//
// POST /api/analyze
//   Body: { network: 'tiktok', videos: [...], period: 'Junio 2026' }
//   Returns: { analysis: '...', model: '...' }
// ═══════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY no configurado. Agrégalo en Vercel → Settings → Environment Variables.'
    });
  }

  const { network = 'tiktok', videos = [], period = '' } = req.body || {};

  if (!videos.length) {
    return res.status(400).json({ error: 'No hay datos de videos para analizar.' });
  }

  // ─── Build data summary for the prompt ───────────────────────────────────
  const totalViews    = videos.reduce((s, v) => s + (v.views    || 0), 0);
  const totalLikes    = videos.reduce((s, v) => s + (v.likes    || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalShares   = videos.reduce((s, v) => s + (v.shares   || 0), 0);
  const avgViews      = Math.round(totalViews / videos.length);
  const avgLikes      = Math.round(totalLikes / videos.length);
  const engRate       = totalViews > 0
    ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2)
    : '0';

  // Top 5 by views
  const top5 = [...videos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((v, i) => `  ${i+1}. ${(v.description || 'Sin descripción').substring(0, 100)}\n     👁 ${(v.views||0).toLocaleString()} vistas · ❤️ ${(v.likes||0).toLocaleString()} likes · 💬 ${(v.comments||0).toLocaleString()} comentarios · 🔁 ${(v.shares||0).toLocaleString()} shares · ⏱ ${v.duration||0}s`)
    .join('\n');

  // Bottom 3 by views (worst performers)
  const bottom3 = [...videos]
    .sort((a, b) => (a.views || 0) - (b.views || 0))
    .slice(0, 3)
    .map((v, i) => `  ${i+1}. ${(v.description || 'Sin descripción').substring(0, 100)}\n     👁 ${(v.views||0).toLocaleString()} vistas · ❤️ ${(v.likes||0).toLocaleString()} likes`)
    .join('\n');

  const networkName = network === 'tiktok' ? 'TikTok' : network;
  const periodLabel = period || `últimos ${videos.length} videos analizados`;

  const prompt = `Eres un experto en estrategia de redes sociales, especializado en medios de comunicación latinoamericanos. Analizas el rendimiento de contenido de Quadratín Morelos, un medio de noticias digital de México.

DATOS DE ${networkName.toUpperCase()} — ${periodLabel}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMEN GENERAL
• Total videos: ${videos.length}
• Total vistas: ${totalViews.toLocaleString()}
• Total likes: ${totalLikes.toLocaleString()}
• Total comentarios: ${totalComments.toLocaleString()}
• Total shares: ${totalShares.toLocaleString()}
• Promedio vistas/video: ${avgViews.toLocaleString()}
• Promedio likes/video: ${avgLikes.toLocaleString()}
• Tasa de engagement: ${engRate}%

🏆 TOP 5 VIDEOS (por vistas):
${top5}

📉 PEORES 3 VIDEOS (por vistas):
${bottom3}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Con base en estos datos, genera un análisis ejecutivo en español con las siguientes secciones:

1. **DIAGNÓSTICO GENERAL** — ¿Cómo está el rendimiento general? ¿Qué tendencias destacan?

2. **MEJOR CONTENIDO** — Análisis del video #1: ¿por qué funcionó? ¿Qué elementos tiene que lo hacen exitoso? (duración, tipo de contenido, engagement ratio)

3. **CONTENIDO A MEJORAR** — ¿Por qué fallaron los peores videos? Patrón común.

4. **OPORTUNIDADES** — 3 acciones concretas y específicas para mejorar el rendimiento en ${networkName} en las próximas semanas.

5. **MÉTRICA CLAVE A MONITOREAR** — Una sola métrica prioritaria y por qué.

Sé directo, práctico y específico. Usa datos del análisis. Formato limpio con negritas en secciones. Máximo 400 palabras.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-3-5-sonnet-latest',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: `Anthropic API error ${response.status}` });
    }

    const data  = await response.json();
    const text  = data?.content?.[0]?.text || '';
    const model = data?.model || 'claude-3-5-sonnet-latest';

    return res.status(200).json({
      analysis: text,
      model,
      stats: { totalViews, totalLikes, totalComments, totalShares, avgViews, avgLikes, engRate, videoCount: videos.length },
    });

  } catch (err) {
    console.error('analyze handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
