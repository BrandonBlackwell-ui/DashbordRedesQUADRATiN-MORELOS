import React, { useState, useEffect } from 'react';
import { qm_data } from './data';
import { qm_analysis } from './analysis';
import { competition_data } from './competition';
import { supabase } from './supabase';
import {
  ComposedChart,
  LineChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Official, highly recognizable brand logo components
const InstagramLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ width: '28px', height: '28px' }}>
    <defs>
      <radialGradient id="igGradient" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="5" fill="url(#igGradient)" />
    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.25A3.25 3.25 0 1112 8.75a3.25 3.25 0 010 6.5zM17.25 7a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" fill="#ffffff" />
    <path d="M16 3H8C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm3.25 13c0 1.79-1.46 3.25-3.25 3.25H8C6.21 19.25 4.75 17.79 4.75 16V8C4.75 6.21 6.21 4.75 8 4.75h8c1.79 0 3.25 1.46 3.25 3.25v8z" fill="#ffffff" />
  </svg>
);

const FacebookLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ width: '28px', height: '28px' }}>
    <rect width="24" height="24" rx="5" fill="#1877F2" />
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#ffffff" />
  </svg>
);

const TikTokLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ width: '28px', height: '28px' }}>
    <rect width="24" height="24" rx="5" fill="#010101" />
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.99 1.15 2.33 1.93 3.79 2.19v3.9c-1.57-.02-3.11-.53-4.41-1.42-.49-.34-.94-.74-1.32-1.19v6.84c.05 1.5-.32 3.02-1.13 4.29-.93 1.48-2.45 2.58-4.17 3.01-1.74.45-3.62.24-5.21-.6-1.59-.85-2.82-2.34-3.37-4.08-.58-1.77-.38-3.76.54-5.36C3.96 10 5.48 8.87 7.23 8.39c1.07-.3 2.19-.3 3.25-.01v4.03c-.87-.31-1.84-.19-2.6.33-.87.57-1.39 1.59-1.35 2.62.03.95.53 1.85 1.33 2.37.83.56 1.88.66 2.78.27.9-.36 1.58-1.14 1.83-2.09.11-.47.15-.96.15-1.44V0h.005z" fill="#ffffff" />
  </svg>
);

const TwitterXLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ width: '28px', height: '28px' }}>
    <rect width="24" height="24" rx="5" fill="#000000" />
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff" />
  </svg>
);


function App() {
  const [selectedChartTab, setSelectedChartTab] = useState('consolidado');
  const [activeReportTab, setActiveReportTab] = useState('redes');
  const [compTab, setCompTab] = useState('local');
  const [compNetwork, setCompNetwork] = useState('facebook');
  const [showMetasForm, setShowMetasForm] = useState(false);
  const [metasPin, setMetasPin] = useState('');
  const [metasPinOk, setMetasPinOk] = useState(false);
  const [metasForm, setMetasForm] = useState({ facebook: '', instagram: '', twitter: '', tiktok: '' });
  const [metasSaved, setMetasSaved] = useState(false);
  const METAS_PIN = 'QM2026';

  // Extract history and configurations from data
  const history = qm_data.history;
  const goals = qm_data.goals;
  const monthly_goals = qm_data.monthly_goals;
  const monthly_real = qm_data.monthly_real;

  // Last entry with full data for totals (skip youtube-only gaps)
  const lastEntry = history[history.length - 1];
  const initialEntry = history[0]; // 1 Jan

  // Last month-end close (entries labeled "Cierre ...")
  const cierreEntries = history.filter(h => h.label && h.label.startsWith('Cierre'));
  const lastMonthClose = cierreEntries[cierreEntries.length - 1] || initialEntry;

  // Auto-save monthly close on last day of each month
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isLastDayOfMonth = tomorrow.getMonth() !== today.getMonth();
    if (!isLastDayOfMonth) return;
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const storageKey = `cierre_saved_${year}_${month}`;
    if (localStorage.getItem(storageKey)) return;
    supabase.saveMonthlyCierre(year, month, {
      facebook:  lastEntry.facebook  ?? null,
      instagram: lastEntry.instagram ?? null,
      twitter:   lastEntry.twitter   ?? null,
      tiktok:    lastEntry.tiktok    ?? null,
      youtube:   lastEntry.youtube   ?? null,
    }).then(result => {
      if (result) {
        localStorage.setItem(storageKey, '1');
        console.log(`Cierre mensual guardado: ${year}-${month}`);
      }
    });
  }, []);

  // Platform configuration objects
  const platforms = {
    instagram: {
      name: 'Instagram',
      color: '#e1306c',
      logo: InstagramLogo,
      initial: initialEntry.instagram,
      current: lastEntry.instagram,
      goal: goals.instagram,
      profileUrl: 'https://www.instagram.com/quadratin.morelos/'
    },
    tiktok: {
      name: 'TikTok',
      color: '#ee1d52',
      logo: TikTokLogo,
      initial: initialEntry.tiktok,
      current: lastEntry.tiktok,
      goal: goals.tiktok,
      profileUrl: 'https://www.tiktok.com/@quadratinmorelos'
    },
    facebook: {
      name: 'Facebook',
      color: '#1877f2',
      logo: FacebookLogo,
      initial: initialEntry.facebook,
      current: lastEntry.facebook,
      goal: goals.facebook,
      profileUrl: 'https://www.facebook.com/share/14iS411Pd47/?mibextid=wwXIfr'
    },
    twitter: {
      name: 'Twitter / X',
      color: '#1d9bf0',
      logo: TwitterXLogo,
      initial: initialEntry.twitter,
      current: lastEntry.twitter,
      goal: goals.twitter,
      profileUrl: 'https://x.com/Quadratin_Mor'
    }
  };

  // Format date helper in Spanish
  const formatDateSpanish = (dateStr) => {
    const dateObj = new Date(dateStr + 'T12:00:00');
    return dateObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHeaderDate = (dateStr) => {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `Cuernavaca, Morelos a ${day} de ${month} de ${year}`;
  };

  const formatNumber = (num) => num == null ? '—' : new Intl.NumberFormat('es-MX').format(num);
  const formatPercentage = (val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;

  // Totals using last entry
  const initialTotal = initialEntry.instagram + initialEntry.tiktok + initialEntry.facebook + initialEntry.twitter;
  const currentTotal = lastEntry.instagram + lastEntry.tiktok + lastEntry.facebook + lastEntry.twitter;
  const totalGoal = goals.instagram + goals.tiktok + goals.facebook + goals.twitter;
  const totalGrowth = currentTotal - initialTotal;
  const totalGrowthPercentage = (totalGrowth / initialTotal) * 100;
  const totalProgress = (currentTotal / totalGoal) * 100;

  // Build chart data for the multi-line chart
  // Each point = one month label, has real + goal values per platform
  const chartMonths = [
    { label: '1 Ene', real: { facebook: 78000, instagram: 1692, twitter: 10500, tiktok: 1893 }, goal: null },
    { label: 'Cierre Ene', real: { facebook: 77890, instagram: null, twitter: null, tiktok: 1893 }, goal: null },
    { label: 'Cierre Feb', real: { facebook: 78825, instagram: null, twitter: null, tiktok: 2010 }, goal: null },
    { label: 'Marzo', real: { facebook: 80479, instagram: 3936, twitter: 10584, tiktok: 2116 }, goal: { facebook: 93500, instagram: 4500, twitter: 12933, tiktok: 2500 } },
    { label: 'Abril', real: { facebook: 81025, instagram: 11904, twitter: 10603, tiktok: 5638 }, goal: { facebook: 109000, instagram: 9000, twitter: 15289, tiktok: 5000 } },
    { label: 'Mayo', real: { facebook: 81024, instagram: 19917, twitter: 10628, tiktok: 5794 }, goal: { facebook: 84000, instagram: 13500, twitter: 15200, tiktok: 7500 } },
    { label: 'Junio', real: { facebook: 81000, instagram: 21927, twitter: 10636, tiktok: 6060 }, goal: { facebook: 87000, instagram: 18000, twitter: 20000, tiktok: 10000 } },
  ];

  // Flatten chart data for recharts
  const buildChartData = (platform) =>
    chartMonths.map(m => ({
      label: m.label,
      real: m.real[platform] ?? null,
      meta: m.goal ? m.goal[platform] : null,
    }));

  const consolidadoChartData = chartMonths.map(m => ({
    label: m.label,
    real: m.real.facebook + (m.real.instagram ?? 0) + (m.real.twitter ?? 0) + (m.real.tiktok ?? 0),
    meta: m.goal ? m.goal.facebook + m.goal.instagram + m.goal.twitter + m.goal.tiktok : null,
  }));

  const currentChartData = selectedChartTab === 'consolidado'
    ? consolidadoChartData
    : buildChartData(selectedChartTab);

  const activeNotes = qm_analysis[activeReportTab];

  // Table config
  const tableRows = [
    { key: 'facebook', label: 'FACEBOOK', color: '#1877f2', bg: '#e7f0fd', account: 'Quadratín Morelos', inicio: 78000 },
    { key: 'instagram', label: 'INSTAGRAM', color: '#e1306c', bg: '#fce8f1', account: '@quadratin.morelos', inicio: 1692 },
    { key: 'twitter', label: 'X / TWITTER', color: '#1d9bf0', bg: '#e7f5fe', account: '@Quadratin_Mor', inicio: 10500 },
    { key: 'youtube', label: 'YOUTUBE', color: '#ff0000', bg: '#ffe5e5', account: 'Quadratín Morelos', inicio: 216 },
    { key: 'tiktok', label: 'TIKTOK', color: '#010101', bg: '#f0f0f0', account: '@quadratin.morelos', inicio: 1893 },
  ];
  const tableMonths = [
    { key: 'enero', label: 'Enero', hasGoal: false },
    { key: 'febrero', label: 'Febrero', hasGoal: false },
    { key: 'marzo', label: 'Marzo', hasGoal: true },
    { key: 'abril', label: 'Abril', hasGoal: true },
    { key: 'mayo', label: 'Mayo', hasGoal: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* 1. Header Oficial de Quadratín Morelos */}
      <header className="w-full">
        
        {/* Sección Central Blanca con Logo */}
        <div className="header-main-logo">
          <img src="/logo_quadratin.png" alt="Logo Quadratín Morelos" />
        </div>
        
        {/* Barra de Navegación Azul Marino */}
        <div className="header-nav-bar">
          <span className="header-nav-title">Reporte de Avances</span>
          <button 
            className={`header-nav-tab ${activeReportTab === 'redes' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('redes')}
          >
            Redes Sociales
          </button>
          <button
            className={`header-nav-tab ${activeReportTab === 'competencia' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('competencia')}
          >
            Competencia
          </button>
          <button
            className={`header-nav-tab ${activeReportTab === 'analisis' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('analisis')}
          >
            Análisis
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {activeReportTab === 'redes' ? (
          <>
            {/* Metadata section (Sub-header) */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-outfit text-[#003366]">
              Dashboard de Métricas
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Campaña Q2 2026 · Resumen ejecutivo y cumplimiento de objetivos.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Último Scrape Automatizado</span>
            <span className="text-sm font-bold text-[#003366] flex items-center gap-1.5 mt-0.5">
              <Clock size={15} className="text-[#ff6600]" />
              {formatDateSpanish(lastEntry.date)} (7:00 AM)
            </span>
          </div>
        </div>

        {/* Totals Section */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="corp-card">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Audiencia Consolidada</span>
              <div className="text-3xl font-extrabold text-[#003366] font-outfit">{formatNumber(currentTotal)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              <span className="text-[#ff6600] font-bold flex items-center">
                <TrendingUp size={14} className="mr-0.5" /> {formatPercentage(totalGrowthPercentage)}
              </span>
              desde el 9 de enero ({formatNumber(initialTotal)})
            </div>
          </div>

          <div className="corp-card">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Crecimiento Neto</span>
              <div className="text-3xl font-extrabold text-[#003366] font-outfit">+{formatNumber(totalGrowth)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-4">
              Seguidores totales ganados en la campaña
            </div>
          </div>

          <div className="corp-card">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Progreso vs Meta Global</span>
              <div className="flex items-center justify-between mb-2 mt-1">
                <span className="text-xl font-extrabold text-[#003366] font-outfit">{totalProgress.toFixed(1)}%</span>
                <span className="text-xs font-mono text-slate-500">{formatNumber(currentTotal)} / {formatNumber(totalGoal)}</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min(totalProgress, 100)}%`,
                    backgroundColor: 'var(--color-orange)'
                  }}
                />
              </div>
            </div>
          </div>

        </section>

        {/* Platform Grid */}
        <section className="mb-10">
          <h2 className="text-lg font-bold font-outfit text-[#003366] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ff6600] rounded-full inline-block"></span>
            Rendimiento por Plataforma
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(platforms).map(([key, item]) => {
              const Logo = item.logo;
              const netGrowth = item.current - item.initial;
              const netGrowthPct = (netGrowth / item.initial) * 100;
              const progressPct = (item.current / item.goal) * 100;
              const remaining = item.goal - item.current;
              const isGoalMet = item.current >= item.goal;
              const perfColor = progressPct >= 80 ? '#16a34a' : progressPct >= 50 ? '#f97316' : '#dc2626';
              const perfBg    = progressPct >= 80 ? '#f0fdf4' : progressPct >= 50 ? '#fff7ed' : '#fef2f2';

              return (
                <div key={key} className="corp-card">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <Logo />
                      <a 
                        href={item.profileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-[#003366] transition-colors p-1"
                        title="Ver perfil oficial"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>

                    {/* Title & Count */}
                    <div>
                      <h3 className="text-sm font-bold font-outfit text-slate-500">{item.name}</h3>
                      <div className="text-2xl font-extrabold text-[#003366] mt-0.5 font-outfit tracking-tight">
                        {formatNumber(item.current)}
                      </div>
                      <div className="text-[11px] text-slate-400">seguidores actuales</div>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Crecimiento Neto:</span>
                      <span className="font-bold flex items-center gap-0.5" style={{ color: netGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {netGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatNumber(netGrowth)} ({formatPercentage(netGrowthPct)})
                      </span>
                    </div>

                    {/* Meta progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 flex items-center gap-0.5"><Target size={11} /> Meta: {formatNumber(item.goal)}</span>
                        <span className="font-bold text-sm px-1.5 py-0.5 rounded-md" style={{ color: perfColor, backgroundColor: perfBg }}>
                          {progressPct.toFixed(1)}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="progress-bar-container">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(progressPct, 100)}%`,
                            backgroundColor: perfColor
                          }}
                        />
                      </div>

                      {/* Remaining indicator */}
                      <div className="text-right mt-1">
                        {isGoalMet ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-650 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-250">
                            <Award size={9} /> Meta Superada
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Faltan <strong className="text-slate-600 font-semibold">{formatNumber(remaining)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Historical Baseline comparisons */}
                    <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-2 space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Inicio (1 Ene):</span>
                        <span className="text-slate-700 font-bold">{formatNumber(item.initial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Cierre {lastMonthClose.label?.replace('Cierre ', '') || 'May'}:
                        </span>
                        <span className="font-bold" style={{ color: (lastMonthClose[key] ?? 0) >= item.initial ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {formatNumber(lastMonthClose[key] ?? item.initial)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Histórico de Crecimiento — Gráfica */}
        <section className="mb-10">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold font-outfit text-[#003366] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#ff6600] rounded-full inline-block"></span>
                Histórico de Crecimiento — Quadratín Morelos
              </h2>
              <p className="text-slate-400 text-xs mt-0.5 ml-4">Enero – Mayo 2026 · ● Real · ■ Meta (marzo–mayo)
              </p>
            </div>

            {/* Tab Selector */}
            <div className="sub-tabs-container">
              <button onClick={() => setSelectedChartTab('consolidado')} className={`sub-tab-btn ${selectedChartTab === 'consolidado' ? 'active' : ''}`}>Consolidado</button>
              <button onClick={() => setSelectedChartTab('facebook')}    className={`sub-tab-btn ${selectedChartTab === 'facebook'    ? 'active' : ''}`}>Facebook</button>
              <button onClick={() => setSelectedChartTab('instagram')}   className={`sub-tab-btn ${selectedChartTab === 'instagram'   ? 'active' : ''}`}>Instagram</button>
              <button onClick={() => setSelectedChartTab('twitter')}     className={`sub-tab-btn ${selectedChartTab === 'twitter'     ? 'active' : ''}`}>X/Twitter</button>
              <button onClick={() => setSelectedChartTab('tiktok')}      className={`sub-tab-btn ${selectedChartTab === 'tiktok'      ? 'active' : ''}`}>TikTok</button>
            </div>
          </div>

          {/* Chart Card */}
          <div className="corp-card">
            {/* Mini stat bar above chart */}
            {selectedChartTab !== 'consolidado' && (() => {
              const p = platforms[selectedChartTab];
              const growth = p ? p.current - p.initial : 0;
              const growthPct = p && p.initial > 0 ? ((growth / p.initial) * 100).toFixed(1) : '0';
              const goalPct   = p && p.goal  > 0 ? ((p.current / p.goal) * 100).toFixed(1) : '0';
              const isOver    = p && p.current >= p.goal;
              return (
                <div className="flex flex-wrap gap-4 mb-5 pb-4 border-b border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Seguidores actuales</span>
                    <span className="text-2xl font-extrabold font-outfit" style={{ color: p?.color || '#003366' }}>
                      {p ? formatNumber(p.current) : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Crecimiento neto</span>
                    <span className="text-xl font-bold text-emerald-600">+{formatNumber(growth)} ({growthPct > 0 ? '+' : ''}{growthPct}%)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Meta mayo ({formatNumber(p?.goal)})</span>
                    <span className={`text-xl font-bold ${isOver ? 'text-emerald-600' : 'text-[#003366]'}`}>
                      {goalPct}% {isOver ? '✓ Superada' : ''}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Recharts Composed Chart */}
            <div className="w-full">
              <ResponsiveContainer width="100%" height={384}>
                <ComposedChart
                  data={currentChartData}
                  margin={{ top: 16, right: 28, left: -4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"
                        stopColor={selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366')}
                        stopOpacity={0.25}
                      />
                      <stop offset="95%"
                        stopColor={selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366')}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366'),
                      borderRadius: '10px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      padding: '10px 14px'
                    }}
                    itemStyle={{ color: '#374151', fontWeight: 600 }}
                    labelStyle={{ color: '#6b7280', fontWeight: 700, marginBottom: '4px' }}
                    formatter={(value, name) => [
                      value != null ? new Intl.NumberFormat('es-MX').format(value) : '—',
                      name === 'real' ? '🟢 Seguidores Reales' : '■ Meta Mensual'
                    ]}
                  />

                  <Legend
                    formatter={(value) =>
                      value === 'real'
                        ? <span style={{ color: selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366'), fontWeight: 700, fontSize: '11px' }}>&#9679; Seguidores Reales</span>
                        : <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}>- - Meta Mensual</span>
                    }
                    wrapperStyle={{ paddingTop: '10px' }}
                  />

                  {/* Colored Area — Real */}
                  <Area
                    type="monotone"
                    dataKey="real"
                    name="real"
                    stroke={selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366')}
                    strokeWidth={2.5}
                    fill="url(#realGradient)"
                    fillOpacity={1}
                    dot={{
                      r: 5,
                      fill: selectedChartTab === 'consolidado' ? '#ff6600' : (platforms[selectedChartTab]?.color || '#003366'),
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                    connectNulls={true}
                    animationDuration={900}
                  />

                  {/* Gray dashed Line — Meta */}
                  <Line
                    type="monotone"
                    dataKey="meta"
                    name="meta"
                    stroke="#94a3b8"
                    strokeWidth={1.8}
                    strokeDasharray="6 4"
                    dot={{ r: 4, fill: '#94a3b8', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                    connectNulls={true}
                    animationDuration={900}
                  />

                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Footer note */}
            <div className="mt-4 text-xs text-slate-400 border-t border-slate-100 pt-3 flex items-center gap-1.5">
              <Calendar size={12} className="text-[#003366]" />
              Datos del PDF oficial (ene–jun 2026) y scraping automático diario 7 AM. Metas disponibles desde marzo.
            </div>
          </div>
        </section>

        {/* 3. Avance Operativo y Planificación (Oculto temporalmente) */}
        {false && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold font-outfit text-[#003366] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#ff6600] rounded-full inline-block"></span>
                {activeNotes.title}
              </h2>
              <span className="text-xs font-bold bg-[#e6f0fa] text-[#003366] px-3 py-1 rounded-full uppercase tracking-wider">
                {activeNotes.is_dynamic ? 'Generado con IA (Claude)' : 'Datos Estáticos del PDF'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1: Logros */}
              <div className="corp-card">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold font-outfit text-slate-700 flex items-center gap-1.5 text-sm">
                      <span className="text-emerald-500">🏆</span> Logros de la Semana
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                      {activeNotes.logros.length} ítems
                    </span>
                  </div>

                  <div className="space-y-1">
                    {activeNotes.logros.map((text, idx) => (
                      <div key={idx} className="op-list-item">
                        <span className="text-emerald-500 op-bullet">✓</span>
                        <span className="op-text">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Accionables */}
              <div className="corp-card">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold font-outfit text-slate-700 flex items-center gap-1.5 text-sm">
                      <span className="text-amber-500">⚡</span> Accionables Próxima Semana
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                      {activeNotes.accionables.length} ítems
                    </span>
                  </div>

                  <div className="space-y-1">
                    {activeNotes.accionables.map((text, idx) => (
                      <div key={idx} className="op-list-item">
                        <span className="text-amber-500 op-bullet">▶</span>
                        <span className="op-text">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Dependencias */}
              <div className="corp-card">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold font-outfit text-slate-700 flex items-center gap-1.5 text-sm">
                      <span className="text-[#003366]">📌</span> Dependencias y Notas
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                      {activeNotes.dependencias.length} ítems
                    </span>
                  </div>

                  <div className="space-y-1">
                    {activeNotes.dependencias.map((text, idx) => (
                      <div key={idx} className="op-list-item">
                        <span className="text-[#003366] op-bullet">•</span>
                        <span className="op-text">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}
          </>
        ) : activeReportTab === 'competencia' ? (
          <CompetenciaSection
            compTab={compTab} setCompTab={setCompTab}
            compNetwork={compNetwork} setCompNetwork={setCompNetwork}
            formatNumber={formatNumber}
          />
        ) : activeReportTab === 'analisis' ? (
          <AnalisisSection formatNumber={formatNumber} />
        ) : null}

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-slate-400 text-xs">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span>Quadratín Morelos · Dashboard Ejecutivo Q2</span>
            <span>•</span>
            <span>Estadísticas en Tiempo Real</span>
          </p>
        </footer>

      </div>
    </div>
  );
}

// ─── Competencia Section ────────────────────────────────────────────────────
const NET_CONFIG = {
  facebook:  { label: 'Facebook',  color: '#1877f2', bg: '#e7f0fd', Logo: FacebookLogo },
  instagram: { label: 'Instagram', color: '#e1306c', bg: '#fce8f1', Logo: InstagramLogo },
  tiktok:    { label: 'TikTok',    color: '#ee1d52', bg: '#fff0f3', Logo: TikTokLogo },
  twitter:   { label: 'X/Twitter', color: '#1d9bf0', bg: '#e7f5fe', Logo: TwitterXLogo },
};

function NetLogo({ network, size = 18 }) {
  const logos = {
    facebook:  <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}><rect width="24" height="24" rx="4" fill="#1877F2"/><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#fff"/></svg>,
    instagram: <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}><defs><radialGradient id="igC" cx="30%" cy="107%" r="130%"><stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="5" fill="url(#igC)"/><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.25A3.25 3.25 0 1112 8.75a3.25 3.25 0 010 6.5zM17.25 7a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" fill="#fff"/><path d="M16 3H8C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm3.25 13c0 1.79-1.46 3.25-3.25 3.25H8C6.21 19.25 4.75 17.79 4.75 16V8C4.75 6.21 6.21 4.75 8 4.75h8c1.79 0 3.25 1.46 3.25 3.25v8z" fill="#fff"/></svg>,
    tiktok:    <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}><rect width="24" height="24" rx="4" fill="#010101"/><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.99 1.15 2.33 1.93 3.79 2.19v3.9c-1.57-.02-3.11-.53-4.41-1.42-.49-.34-.94-.74-1.32-1.19v6.84c.05 1.5-.32 3.02-1.13 4.29-.93 1.48-2.45 2.58-4.17 3.01-1.74.45-3.62.24-5.21-.6-1.59-.85-2.82-2.34-3.37-4.08-.58-1.77-.38-3.76.54-5.36C3.96 10 5.48 8.87 7.23 8.39c1.07-.3 2.19-.3 3.25-.01v4.03c-.87-.31-1.84-.19-2.6.33-.87.57-1.39 1.59-1.35 2.62.03.95.53 1.85 1.33 2.37.83.56 1.88.66 2.78.27.9-.36 1.58-1.14 1.83-2.09.11-.47.15-.96.15-1.44V0h.005z" fill="#fff"/></svg>,
    twitter:   <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}><rect width="24" height="24" rx="4" fill="#000"/><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#fff"/></svg>,
  };
  return logos[network] || null;
}

const RACE_GRADIENTS = [
  'linear-gradient(90deg,#06b6d4,#10b981)',
  'linear-gradient(90deg,#f59e0b,#fde047)',
  'linear-gradient(90deg,#ec4899,#f43f5e)',
  'linear-gradient(90deg,#8b5cf6,#6366f1)',
  'linear-gradient(90deg,#0ea5e9,#38bdf8)',
  'linear-gradient(90deg,#14b8a6,#34d399)',
  'linear-gradient(90deg,#f97316,#fb923c)',
  'linear-gradient(90deg,#a855f7,#c084fc)',
];
const US_GRADIENT = 'linear-gradient(90deg,#ff6600,#ff9500)';

function Avatar({ name, isUs, logo, size = 44 }) {
  const [imgOk, setImgOk] = React.useState(true);
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const colors   = ['#1877f2','#e1306c','#ee1d52','#1d9bf0','#16a34a','#9333ea','#dc2626','#0891b2'];
  const color    = isUs ? '#ff6600' : colors[name.charCodeAt(0) % colors.length];

  const wrapStyle = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: isUs ? '3px solid #ff6600' : '2px solid #e2e8f0',
    boxShadow: isUs ? '0 0 0 3px #ff660030' : '0 2px 6px rgba(0,0,0,0.10)',
    overflow: 'hidden', background: '#fff',
  };

  // Use Google's reliable favicon service as primary, fallback to initials
  const faviconUrl = logo
    ? `https://www.google.com/s2/favicons?domain=${new URL(logo).hostname}&sz=64`
    : null;

  return (
    <div style={wrapStyle}>
      {faviconUrl && imgOk ? (
        <img
          src={faviconUrl}
          alt={name}
          onError={() => setImgOk(false)}
          style={{ width: size * 0.62, height: size * 0.62, objectFit: 'contain' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isUs ? US_GRADIENT : `linear-gradient(135deg,${color}cc,${color})`,
          color: '#fff', fontWeight: 800, fontSize: size * 0.32,
          fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.5px',
        }}>
          {initials}
        </div>
      )}
    </div>
  );
}

const COMP_COLORS = ['#06b6d4','#f59e0b','#ec4899','#8b5cf6','#10b981','#ef4444','#3b82f6','#14b8a6','#a855f7','#f97316'];

const getSocialLink = (item, network) => {
  const username = item[network === 'facebook' ? 'fb' : network === 'instagram' ? 'ig' : network === 'tiktok' ? 'tt' : 'tw'];
  if (!username) return null;
  if (network === 'facebook') return `https://www.facebook.com/${username}`;
  if (network === 'instagram') return `https://www.instagram.com/${username}`;
  if (network === 'tiktok') return `https://www.tiktok.com/@${username}`;
  if (network === 'twitter') return `https://x.com/${username}`;
  return null;
};

function CompetenciaSection({ compTab, setCompTab, compNetwork, setCompNetwork, formatNumber }) {
  const networks   = ['facebook','instagram','tiktok','twitter'];
  const netLabels  = ['Facebook','Instagram','TikTok','Twitter'];
  
  // Sincronizar dinámicamente los datos de "NOSOTROS" (Quadratín Morelos) con los datos diarios (qm_data)
  const latestQM = qm_data.history && qm_data.history.length > 0 
    ? qm_data.history[qm_data.history.length - 1] 
    : null;

  const overrideItem = (item) => {
    if (item.isUs && latestQM) {
      return {
        ...item,
        facebook: latestQM.facebook ?? item.facebook,
        instagram: latestQM.instagram ?? item.instagram,
        tiktok: latestQM.tiktok ?? item.tiktok,
        twitter: latestQM.twitter ?? item.twitter,
      };
    }
    return item;
  };

  const localMedia = competition_data.localMedia.map(overrideItem);
  const estados = competition_data.estados.map(overrideItem);

  const sourceData = compTab === 'local' ? localMedia : estados;
  const nameKey    = compTab === 'local' ? 'name' : 'estado';
  const net        = NET_CONFIG[compNetwork];

  // For estados: limit to top 9 + always include us
  let displayData = [...sourceData];
  if (compTab === 'estados') {
    const sorted = [...sourceData].sort((a, b) => (b[compNetwork]||0) - (a[compNetwork]||0));
    const top9 = sorted.slice(0, 9);
    const us = sourceData.find(m => m.isUs);
    if (us && !top9.find(m => m.isUs)) top9.push(us);
    displayData = top9.filter(Boolean);
  }

  // Raw follower values per network — log scale handles the spread
  const chartData = networks.map((n, ni) => {
    const pt = { network: netLabels[ni] };
    displayData.forEach((item, i) => {
      const v = item[n];
      pt[`p${i}`] = v && v > 0 ? v : null;   // raw value, no normalization
    });
    return pt;
  });

  const usIdx = displayData.findIndex(m => m.isUs);

  // Pre-compute staggered Y positions for end labels (avoids overlap)
  const CHART_H = 500, M_TOP = 24, M_BOTTOM = 16;
  const lastNet = networks[networks.length - 1];
  const sortedByLast = displayData
    .map((item, i) => ({ i, v: item[lastNet] || 0 }))
    .filter(d => d.v > 0)
    .sort((a, b) => b.v - a.v);
  const plotH = CHART_H - M_TOP - M_BOTTOM;
  const step  = plotH / (sortedByLast.length + 1);
  const labelY = {};
  sortedByLast.forEach(({ i }, rank) => {
    labelY[i] = M_TOP + step * (rank + 1);
  });

  // Custom dot: avatar + staggered label only at last point
  const makeDot = (item, itemIdx, color, isUs) => (props) => {
    const { cx, cy, index } = props;
    const isLast = index === networks.length - 1;
    const val    = chartData[index]?.[`p${itemIdx}`];
    if (!val) return <g key={`d-${itemIdx}-${index}`} />;

    if (!isLast) {
      return <circle key={`d-${itemIdx}-${index}`} cx={cx} cy={cy}
        r={isUs ? 5 : 3.5} fill={color} stroke="#fff" strokeWidth={1.5} />;
    }

    const r         = isUs ? 20 : 15;
    const lY        = labelY[itemIdx] ?? cy;
    const host      = item.logo ? (() => { try { return new URL(item.logo).hostname; } catch(e) { return ''; } })() : '';
    const favicon   = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
    const shortName = (item[nameKey] || '').split(' ').slice(0, 2).join(' ');
    const clipId    = `cp-${compTab}-${itemIdx}`;

    return (
      <g key={`d-${itemIdx}-${index}`}>
        {/* connector line from data point to label */}
        {Math.abs(cy - lY) > r + 4 && (
          <line x1={cx} y1={cy} x2={cx + 8} y2={lY}
            stroke={color} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="4 3" />
        )}
        {/* dot at actual data position */}
        {isUs && <circle cx={cx} cy={cy} r={r + 5} fill={color} fillOpacity={0.12} />}
        <circle cx={cx} cy={cy} r={r + 1} fill="#fff" />
        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={color} strokeWidth={isUs ? 3 : 2} />
        <defs>
          <clipPath id={clipId}><circle cx={cx} cy={cy} r={r - 2} /></clipPath>
        </defs>
        {favicon && (
          <image href={favicon} x={cx-(r-2)} y={cy-(r-2)}
            width={(r-2)*2} height={(r-2)*2}
            clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid meet" />
        )}
        {/* label at staggered position */}
        <text x={cx + r + 10} y={lY - 3} fontSize={isUs ? 12 : 10}
          fontWeight={isUs ? 800 : 600} fill={color} fontFamily="Outfit,sans-serif">
          {shortName}
        </text>
        <text x={cx + r + 10} y={lY + 11} fontSize={isUs ? 11 : 9}
          fontWeight={700} fill={color} fillOpacity={0.8} fontFamily="Outfit,sans-serif">
          {new Intl.NumberFormat('es-MX').format(val)}
        </text>
      </g>
    );
  };

  return (
    <div className="py-2">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold font-outfit text-[#003366] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ff6600] rounded-full inline-block"></span>
            Análisis de Competencia
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 ml-4">
            {compTab === 'local' ? 'Medios Locales · Morelos' : 'Red Quadratín · Nacional'} · Actualización semanal · {competition_data.lastUpdated}
          </p>
        </div>
        <div className="sub-tabs-container">
          <button onClick={() => setCompTab('local')}   className={`sub-tab-btn ${compTab==='local'   ?'active':''}`}>Medios Locales</button>
          <button onClick={() => setCompTab('estados')} className={`sub-tab-btn ${compTab==='estados' ?'active':''}`}>Quadratín Nacional</button>
        </div>
      </div>

      {/* ── Quadratín Nacional: horizontal bar chart ── */}
      {compTab === 'estados' && (() => {
        const barData = [...estados]
          .filter(e => e[compNetwork] != null)
          .sort((a, b) => (b[compNetwork]||0) - (a[compNetwork]||0));
        const maxBar = barData[0]?.[compNetwork] || 1;
        return (
          <div className="corp-card">
            {/* Network pills inside card */}
            <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-slate-100">
              {['facebook','instagram','tiktok','twitter'].map(n => {
                const cfg = NET_CONFIG[n]; const active = compNetwork === n;
                return (
                  <button key={n} onClick={() => setCompNetwork(n)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-200"
                    style={active ? { background: cfg.color, color:'#fff', borderColor: cfg.color } : { background:'#fff', color: cfg.color, borderColor: cfg.color+'50' }}>
                    <NetLogo network={n} size={14} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2.5">
              {barData.map((item, idx) => {
                const val   = item[compNetwork] || 0;
                const pct   = (val / maxBar) * 100;
                const isUs  = item.isUs;
                const grad  = isUs ? US_GRADIENT : RACE_GRADIENTS[idx % RACE_GRADIENTS.length];
                const host  = item.logo ? (() => { try { return new URL(item.logo).hostname; } catch(e) { return ''; } })() : '';
                const fav   = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
                const link  = getSocialLink(item, compNetwork);
                const RowTag = link ? 'a' : 'div';
                const rowProps = link ? {
                  href: link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-3 group hover:bg-slate-50/80 transition-colors cursor-pointer"
                } : {
                  className: "flex items-center gap-3 group"
                };
                return (
                  <RowTag key={idx} {...rowProps}
                    style={isUs ? { background:'#fff7ed', borderRadius: 12, padding:'6px 8px', border:'1.5px solid #ff660040' } : { padding:'4px 8px' }}>
                    {/* Rank */}
                    <span className="text-[10px] font-extrabold w-6 text-center flex-shrink-0"
                      style={{ color: idx===0?'#f59e0b':idx===1?'#94a3b8':idx===2?'#cd7c2f':'#cbd5e1' }}>
                      #{idx+1}
                    </span>
                    {/* Avatar */}
                    <div style={{ width:34, height:34, borderRadius:'50%', border:`2.5px solid ${isUs?'#ff6600':'#e2e8f0'}`, overflow:'hidden', background:'#fff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: isUs?'0 0 0 3px #ff660020':undefined }}>
                      {fav ? <img src={fav} alt="" style={{ width:22, height:22, objectFit:'contain' }} /> : <span style={{ fontSize:11, fontWeight:800, color: isUs?'#ff6600':'#94a3b8' }}>{item.estado.substring(0,2).toUpperCase()}</span>}
                    </div>
                    {/* Name */}
                    <span className="text-xs font-semibold flex-shrink-0 w-24 truncate" style={{ color: isUs?'#ff6600':'#334155' }}>
                      {item.estado}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: isUs?14:10, background:'#f1f5f9', minWidth:0 }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background: grad, boxShadow: isUs?'0 2px 8px #ff660030':undefined }} />
                    </div>
                    {/* Value */}
                    <div className="text-right flex-shrink-0 w-20">
                      <div className="text-xs font-extrabold font-outfit" style={{ color: isUs?'#ff6600':'#1e293b' }}>
                        {new Intl.NumberFormat('es-MX').format(val)}
                      </div>
                    </div>
                    {/* NOSOTROS badge */}
                    {isUs && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: US_GRADIENT }}>NOSOTROS</span>}
                  </RowTag>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Medios Locales: barras horizontales ── */}
      {compTab === 'local' && (() => {
        const barData = [...localMedia]
          .filter(m => m[compNetwork] != null)
          .sort((a, b) => (b[compNetwork]||0) - (a[compNetwork]||0));
        const maxBar = barData[0]?.[compNetwork] || 1;
        return (
          <div className="corp-card">
            <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-slate-100">
              {['facebook','instagram','tiktok','twitter'].map(n => {
                const cfg = NET_CONFIG[n]; const active = compNetwork === n;
                return (
                  <button key={n} onClick={() => setCompNetwork(n)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-200"
                    style={active ? { background: cfg.color, color:'#fff', borderColor: cfg.color } : { background:'#fff', color: cfg.color, borderColor: cfg.color+'50' }}>
                    <NetLogo network={n} size={14} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2.5">
              {barData.map((item, idx) => {
                const val  = item[compNetwork] || 0;
                const pct  = (val / maxBar) * 100;
                const isUs = item.isUs;
                const grad = isUs ? US_GRADIENT : RACE_GRADIENTS[idx % RACE_GRADIENTS.length];
                const host = item.logo ? (() => { try { return new URL(item.logo).hostname; } catch(e) { return ''; } })() : '';
                const fav  = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
                const link = getSocialLink(item, compNetwork);
                const RowTag = link ? 'a' : 'div';
                const rowProps = link ? {
                  href: link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
                } : {
                  className: "flex items-center gap-3"
                };
                return (
                  <RowTag key={idx} {...rowProps}
                    style={isUs ? { background:'#fff7ed', borderRadius:12, padding:'6px 8px', border:'1.5px solid #ff660040' } : { padding:'4px 8px' }}>
                    <span className="text-[10px] font-extrabold w-6 text-center flex-shrink-0"
                      style={{ color: idx===0?'#f59e0b':idx===1?'#94a3b8':idx===2?'#cd7c2f':'#cbd5e1' }}>
                      #{idx+1}
                    </span>
                    <div style={{ width:34, height:34, borderRadius:'50%', border:`2.5px solid ${isUs?'#ff6600':'#e2e8f0'}`, overflow:'hidden', background:'#fff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isUs?'0 0 0 3px #ff660020':undefined }}>
                      {fav ? <img src={fav} alt="" style={{ width:22, height:22, objectFit:'contain' }} /> : <span style={{ fontSize:11, fontWeight:800, color:isUs?'#ff6600':'#94a3b8' }}>{(item.name||'').substring(0,2).toUpperCase()}</span>}
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0 w-28 truncate" style={{ color:isUs?'#ff6600':'#334155' }}>
                      {item.name}
                    </span>
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height:isUs?14:10, background:'#f1f5f9', minWidth:0 }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background:grad, boxShadow:isUs?'0 2px 8px #ff660030':undefined }} />
                    </div>
                    <div className="text-right flex-shrink-0 w-20">
                      <div className="text-xs font-extrabold font-outfit" style={{ color:isUs?'#ff6600':'#1e293b' }}>
                        {new Intl.NumberFormat('es-MX').format(val)}
                      </div>
                    </div>
                    {isUs && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background:US_GRADIENT }}>NOSOTROS</span>}
                  </RowTag>
                );
              })}
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// ─── Análisis Section ────────────────────────────────────────────────────────

// ─── Network config for Análisis tab ────────────────────────────────────────
const ANALISIS_NETS = {
  tiktok: {
    label: 'TikTok', color: '#ee1d52', bg: '#fff0f3',
    accentGrad: 'linear-gradient(135deg,#ee1d52,#ff6600)',
    Logo: TikTokLogo,
    mainMetric: 'views',   mainLabel: 'Vistas',
    itemLabel: 'Video',    itemLabelPlural: 'Videos',
  },
  instagram: {
    label: 'Instagram', color: '#e1306c', bg: '#fce8f1',
    accentGrad: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)',
    Logo: InstagramLogo,
    mainMetric: 'likes',   mainLabel: 'Likes',
    itemLabel: 'Post',     itemLabelPlural: 'Posts',
  },
};

function AnalisisSection({ formatNumber }) {
  const [activeNet,    setActiveNet]    = useState('tiktok');
  const [igSubTab,     setIgSubTab]     = useState('reels');   // 'posts' | 'reels'
  const [items,        setItems]        = useState([]);
  const [analysis,     setAnalysis]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [aiError,      setAiError]      = useState('');
  const [fetchedDate,  setFetchedDate]  = useState('');

  const netCfg = ANALISIS_NETS[activeNet];
  const fmt    = (n) => new Intl.NumberFormat('es-MX').format(n || 0);

  // ── Load data when network/subtab changes ────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setItems([]);
    setFetchedDate('');
    const analysisType = activeNet === 'tiktok' ? 'tiktok_content' : `instagram_${igSubTab}`;

    const dataPromise = activeNet === 'tiktok'
      ? supabase.getLatestTikTokFetch()
      : supabase.getLatestInstagramFetch(igSubTab);

    Promise.all([dataPromise, supabase.getAnalysis(analysisType, 1)])
      .then(([rows, analyses]) => {
        setItems(rows || []);
        if (rows?.length) setFetchedDate(rows[0].fetched_date || '');
        setAnalysis(analyses?.length ? analyses[0] : null);
        setLoading(false);
      });
  }, [activeNet, igSubTab]);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalViews    = items.reduce((s, v) => s + (v.views    || 0), 0);
  const totalLikes    = items.reduce((s, v) => s + (v.likes    || 0), 0);
  const totalComments = items.reduce((s, v) => s + (v.comments || 0), 0);
  const totalShares   = items.reduce((s, v) => s + (v.shares   || 0), 0);
  const totalSaves    = items.reduce((s, v) => s + (v.saves    || 0), 0);
  const mainTotal     = activeNet === 'tiktok' ? totalViews : totalLikes;
  const mainAvg       = items.length ? Math.round(mainTotal / items.length) : 0;
  const engBase       = activeNet === 'tiktok' ? totalViews : totalLikes;
  const engRate       = engBase > 0
    ? ((totalLikes + totalComments + totalShares) / engBase * 100).toFixed(1) : '0';
  const bestItem      = items[0];

  // ── Chart: top 10 by main metric ─────────────────────────────────────────
  const chartData = items.slice(0, 10).map((v, i) => ({
    name:  `P${i + 1}`,
    valor: activeNet === 'tiktok' ? (v.views || 0) : (v.likes || 0),
    likes: v.likes    || 0,
    coms:  v.comments || 0,
    label: (v.description || 'Sin título').substring(0, 45),
  }));

  // ── AI Analysis handler ──────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!items.length) return;
    setAnalyzing(true);
    setAiError('');
    try {
      const now         = new Date();
      const period      = now.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
      const networkLabel = activeNet === 'instagram' ? `Instagram ${igSubTab}` : 'TikTok';
      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ network: networkLabel, videos: items, period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      const today       = now.toISOString().split('T')[0];
      const analysisType = activeNet === 'tiktok' ? 'tiktok_content' : `instagram_${igSubTab}`;
      await supabase.saveAnalysis(today, analysisType, {
        text:        data.analysis,
        stats:       data.stats,
        model:       data.model,
        generatedAt: now.toISOString(),
        itemCount:   items.length,
      });
      setAnalysis({ date: today, content: { text: data.analysis, stats: data.stats, model: data.model, itemCount: items.length } });
    } catch (e) {
      setAiError(e.message || 'Error al generar análisis');
    }
    setAnalyzing(false);
  };

  // ── Custom chart tooltip ──────────────────────────────────────────────────
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = chartData.find(c => c.name === label);
    return (
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', maxWidth:280 }}>
        <p style={{ fontSize:10, color:'#64748b', marginBottom:5, lineHeight:'1.3' }}>{d?.label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:14, fontSize:11, fontWeight:700, color: p.fill || netCfg.color }}>
            <span>{p.name}</span><span>{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Summary cards config ──────────────────────────────────────────────────
  const summaryCards = activeNet === 'tiktok' ? [
    { label: 'Videos',          value: fmt(items.length),  color: '#ee1d52', icon: '🎬' },
    { label: 'Total vistas',    value: fmt(totalViews),     color: '#0ea5e9', icon: '👁'  },
    { label: 'Promedio vistas', value: fmt(mainAvg),        color: '#8b5cf6', icon: '📊' },
    { label: 'Engagement rate', value: `${engRate}%`,       color: '#16a34a', icon: '💡' },
  ] : [
    { label: igSubTab === 'reels' ? 'Reels' : 'Posts', value: fmt(items.length), color: '#e1306c', icon: igSubTab === 'reels' ? '🎞' : '🖼' },
    { label: 'Total likes',     value: fmt(totalLikes),     color: '#f97316', icon: '❤️' },
    { label: 'Promedio likes',  value: fmt(mainAvg),        color: '#8b5cf6', icon: '📊' },
    { label: 'Total guardados', value: fmt(totalSaves),     color: '#16a34a', icon: '🔖' },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────
  const tiktokCols  = ['Vistas','Likes','Comentarios','Shares','Duración'];
  const igCols      = ['Likes','Comentarios','Guardados','Vistas','Duración'];
  const tableCols   = activeNet === 'tiktok' ? tiktokCols : igCols;

  const rowVal = (v, col) => {
    const m = {
      'Vistas':      fmt(v.views),
      'Likes':       fmt(v.likes),
      'Comentarios': fmt(v.comments),
      'Shares':      fmt(v.shares),
      'Guardados':   fmt(v.saves),
      'Duración':    v.duration ? `${v.duration}s` : '—',
    };
    return m[col] || '—';
  };
  const colColor = { 'Vistas':'#0ea5e9','Likes':'#ee1d52','Comentarios':'#8b5cf6','Shares':'#16a34a','Guardados':'#f59e0b' };

  return (
    <div className="py-2">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-outfit text-[#003366] flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full inline-block" style={{ background: netCfg.color }} />
            Análisis de Contenido
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 ml-4">
            Rendimiento de publicaciones · Actualización semanal
            {fetchedDate && ` · Último corte: ${fetchedDate}`}
          </p>
        </div>

        {/* Network tabs */}
        <div className="flex items-center gap-2">
          {Object.entries(ANALISIS_NETS).map(([key, cfg]) => {
            const active = activeNet === key;
            return (
              <button key={key}
                onClick={() => { setActiveNet(key); setAnalysis(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200"
                style={active
                  ? { background: cfg.color, color:'#fff', borderColor: cfg.color, boxShadow:`0 3px 12px ${cfg.color}40` }
                  : { background:'#fff', color: cfg.color, borderColor: cfg.color + '60' }}>
                <cfg.Logo style={{ width:18, height:18 }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Instagram sub-tabs (Posts / Reels) ─────────────────────── */}
      {activeNet === 'instagram' && (
        <div className="flex gap-2 mb-5">
          {['reels','posts'].map(t => (
            <button key={t}
              onClick={() => setIgSubTab(t)}
              className="px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
              style={igSubTab === t
                ? { background:'#e1306c', color:'#fff', borderColor:'#e1306c' }
                : { background:'#fff', color:'#e1306c', borderColor:'#e1306c60' }}>
              {t === 'reels' ? 'Reels' : 'Posts'}
            </button>
          ))}
          <span className="text-xs text-slate-400 self-center ml-1">· {items.length} publicaciones</span>
        </div>
      )}

      {loading ? (
        <div className="corp-card flex items-center justify-center py-16 text-slate-400 text-sm">
          Cargando publicaciones…
        </div>
      ) : items.length === 0 ? (
        <div className="corp-card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-base font-bold text-[#003366] mb-2">Sin datos aún</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Los datos se cargan automáticamente cada lunes. Ejecuta manualmente:
          </p>
          <code className="mt-4 inline-block text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-mono">
            node update_content.js
          </code>
        </div>
      ) : (
        <>
          {/* ── Summary stat cards ─────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card, i) => (
              <div key={i} className="corp-card" style={{ borderLeft:`4px solid ${card.color}`, paddingTop:16, paddingBottom:16 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{card.icon}</span>
                  <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                </div>
                <div className="text-2xl font-extrabold font-outfit" style={{ color: card.color }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Best item highlight ────────────────────────────────── */}
          {bestItem && (
            <div className="corp-card mb-6"
              style={{ background: netCfg.bg, border:`1.5px solid ${netCfg.color}30` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: netCfg.accentGrad }}>
                  <span className="text-white text-lg">🏆</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: netCfg.color }}>
                      Mejor {netCfg.itemLabel}
                    </span>
                    {bestItem.month && <span className="text-xs text-slate-400">· {bestItem.month}</span>}
                    {bestItem.type  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: netCfg.color }}>{bestItem.type}</span>}
                  </div>
                  <p className="text-sm font-semibold text-[#003366] leading-snug line-clamp-2">
                    {bestItem.description || 'Sin descripción'}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
                    {bestItem.views    > 0 && <span><strong style={{ color:'#0ea5e9' }}>{fmt(bestItem.views)}</strong> vistas</span>}
                    {bestItem.likes    > 0 && <span><strong style={{ color:'#ee1d52' }}>{fmt(bestItem.likes)}</strong> likes</span>}
                    {bestItem.comments > 0 && <span><strong style={{ color:'#8b5cf6' }}>{fmt(bestItem.comments)}</strong> comentarios</span>}
                    {bestItem.shares   > 0 && <span><strong style={{ color:'#16a34a' }}>{fmt(bestItem.shares)}</strong> shares</span>}
                    {bestItem.saves    > 0 && <span><strong style={{ color:'#f59e0b' }}>{fmt(bestItem.saves)}</strong> guardados</span>}
                    {bestItem.duration > 0 && <span><strong style={{ color:'#64748b' }}>{bestItem.duration}s</strong></span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Bar chart: top 10 ──────────────────────────────────── */}
          <div className="corp-card mb-6">
            <h3 className="text-sm font-bold text-[#003366] mb-4">
              Top 10 {netCfg.itemLabelPlural} por {netCfg.mainLabel}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top:4, right:16, left:8, bottom:4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fontFamily:'Outfit,sans-serif', fill:'#94a3b8' }} />
                <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fontSize:10, fill:'#94a3b8' }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="valor" name={netCfg.mainLabel} radius={[6,6,0,0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? netCfg.color : `hsl(${activeNet==='tiktok'?340:320},${70-i*3}%,${58+i*2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Content table ─────────────────────────────────────── */}
          <div className="corp-card mb-6">
            <h3 className="text-sm font-bold text-[#003366] mb-4">
              Todas las publicaciones · {netCfg.label}
              {activeNet === 'instagram' && ` · ${igSubTab === 'reels' ? 'Reels' : 'Posts'}`}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-2 text-slate-400 font-semibold w-6">#</th>
                    <th className="text-left py-2 px-2 text-slate-400 font-semibold">Descripción</th>
                    {tableCols.map(col => (
                      <th key={col} className="text-right py-2 px-2 text-slate-400 font-semibold whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((v, i) => (
                    <tr key={v.video_id || v.post_id || i}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      style={i === 0 ? { background: netCfg.bg } : {}}>
                      <td className="py-2 px-2 font-bold text-slate-400">{i + 1}</td>
                      <td className="py-2 px-2 text-slate-700 max-w-xs">
                        <span className="line-clamp-2 block">{v.description || '—'}</span>
                        <span className="text-[10px] text-slate-400">{v.month || ''}</span>
                      </td>
                      {tableCols.map(col => (
                        <td key={col} className="py-2 px-2 text-right font-semibold whitespace-nowrap"
                          style={{ color: colColor[col] || '#475569' }}>
                          {rowVal(v, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── AI Analysis panel ─────────────────────────────────── */}
          <div className="corp-card" style={{ border:'1.5px solid #ff660030', background:'linear-gradient(135deg,#fffbf7,#fff)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-sm font-bold text-[#003366] flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  Análisis con Inteligencia Artificial
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Claude Opus analiza {items.length} publicaciones de {netCfg.label} y da recomendaciones personalizadas
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !items.length}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: analyzing ? '#94a3b8' : 'linear-gradient(135deg,#ff6600,#ff9500)',
                  boxShadow: analyzing ? 'none' : '0 4px 15px #ff660040' }}>
                {analyzing
                  ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analizando…</>
                  : <>✨ Hacer Análisis</>}
              </button>
            </div>

            {aiError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {aiError}
              </div>
            )}

            {analysis ? (
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background:'linear-gradient(135deg,#ff6600,#ff9500)' }}>
                    {analysis.content?.model || 'claude-opus-4-5'}
                  </span>
                  <span className="text-xs text-slate-400">Generado el {analysis.date}</span>
                  {analysis.content?.itemCount && (
                    <span className="text-xs text-slate-400">· {analysis.content.itemCount} publicaciones</span>
                  )}
                </div>
                <div>
                  {(analysis.content?.text || '').split('\n').map((line, i) => {
                    const isBold = line.startsWith('**') || line.match(/^\d+\.\s*\*\*/);
                    const cleaned = line.replace(/\*\*/g, '');
                    if (!cleaned.trim()) return <div key={i} className="h-2" />;
                    return (
                      <p key={i} className={`text-sm leading-relaxed mb-1 ${isBold ? 'font-bold text-[#003366]' : 'text-slate-700'}`}>
                        {cleaned}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                <p>Haz clic en <strong>Hacer Análisis</strong> para obtener recomendaciones personalizadas.</p>
                <p className="text-xs mt-2 text-slate-300">Requiere ANTHROPIC_API_KEY en Vercel → Environment Variables.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions for metadata persistence
const loadLocalMetadata = () => {
  try {
    const data = localStorage.getItem('asana_tasks_metadata');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error reading localStorage:", e);
    return {};
  }
};

const saveLocalMetadata = (metadata) => {
  try {
    localStorage.setItem('asana_tasks_metadata', JSON.stringify(metadata));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
};

const formatDateBrief = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${months[monthIdx] || ''}`;
};

function DependenciasDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);
  
  // Asana States
  const [activeView, setActiveView] = useState('list'); // 'list' | 'board'
  const [localMetadata, setLocalMetadata] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null); // { taskId, field }
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const dbTasks = await supabase.getTasks();
    
    // Load local metadata and merge
    const meta = loadLocalMetadata();
    let updatedMeta = { ...meta };
    let hasChanges = false;

    dbTasks.forEach(task => {
      if (!updatedMeta[task.id]) {
        // Assign default metadata for tasks that don't have it
        const inThreeDays = new Date(Date.now() + 86400000 * 3);
        const formattedDate = inThreeDays.toISOString().split('T')[0];
        
        updatedMeta[task.id] = {
          priority: 'media',
          assignee: 'Dirección',
          dueDate: formattedDate
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      saveLocalMetadata(updatedMeta);
    }

    setLocalMetadata(updatedMeta);
    setTasks(dbTasks);
    setLoading(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAdding(true);
    const newTask = await supabase.addTask(newTaskTitle.trim());
    if (newTask) {
      // Add default metadata for new task
      const inThreeDays = new Date(Date.now() + 86400000 * 3);
      const formattedDate = inThreeDays.toISOString().split('T')[0];
      
      const updatedMeta = {
        ...localMetadata,
        [newTask.id]: {
          priority: 'media',
          assignee: 'Dirección',
          dueDate: formattedDate
        }
      };
      saveLocalMetadata(updatedMeta);
      setLocalMetadata(updatedMeta);
      
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
    }
    setAdding(false);
  };

  const handleCompleteTask = async (id) => {
    const updated = await supabase.completeTask(id);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
  };

  const handleDeleteTask = async (id) => {
    const success = await supabase.deleteTask(id);
    if (success) {
      // Remove from tasks list
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // Clean up metadata
      const updatedMeta = { ...localMetadata };
      delete updatedMeta[id];
      saveLocalMetadata(updatedMeta);
      setLocalMetadata(updatedMeta);
    }
  };

  const updateMetadata = (taskId, field, value) => {
    const updatedMeta = {
      ...localMetadata,
      [taskId]: {
        ...localMetadata[taskId],
        [field]: value
      }
    };
    saveLocalMetadata(updatedMeta);
    setLocalMetadata(updatedMeta);
    setActiveDropdown(null);
  };

  const getElapsedTime = (dateStr) => {
    const createdDate = new Date(dateStr);
    const nowDate = new Date();
    const diffMs = nowDate - createdDate;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return '0 días';
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  const getElapsedTimeBadgeClass = (dateStr) => {
    const createdDate = new Date(dateStr);
    const nowDate = new Date();
    const diffMs = nowDate - createdDate;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return 'asana-pill-blue';
    if (diffDays < 3) return 'asana-pill-amber';
    return 'asana-pill-red';
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const oldestPendingTask = pendingTasks.reduce((oldest, current) => {
    if (!oldest) return current;
    return new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest;
  }, null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="asana-layout-wrapper">
      {/* Sidebar */}
      <aside className="asana-sidebar">
        <div className="asana-sidebar-workspace">
          <div className="asana-sidebar-avatar">QM</div>
          <div className="asana-sidebar-ws-info">
            <div className="asana-sidebar-ws-name">Quadratín Morelos</div>
            <div className="asana-sidebar-ws-role">Espacio de Dirección</div>
          </div>
        </div>

        <nav className="asana-sidebar-menu">
          <div className="asana-sidebar-link active">
            <span>📋</span> Tareas del Equipo
          </div>
          <div className="asana-sidebar-link" onClick={() => alert("Próximamente: Bandeja de entrada con notificaciones en tiempo real.")}>
            <span>✉️</span> Bandeja de entrada
          </div>
          <div className="asana-sidebar-link" onClick={() => alert("Próximamente: Portafolios de proyectos generales.")}>
            <span>📊</span> Portafolios
          </div>
        </nav>

        <div className="asana-sidebar-section-title">Proyectos</div>
        <div className="asana-sidebar-projects">
          <div className="asana-project-item active">
            <span className="asana-dot" style={{ backgroundColor: 'var(--asana-primary)' }}></span>
            <span className="truncate">Dependencias DG</span>
          </div>
          <div className="asana-project-item" onClick={() => alert("Proyecto secundario en planificación.")}>
            <span className="asana-dot" style={{ backgroundColor: 'var(--asana-amber)' }}></span>
            <span className="truncate">Reporte de Avances</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="asana-workspace-main">
        {/* Project Header */}
        <header className="asana-proj-header">
          <div className="asana-proj-meta-bar">
            <div className="asana-proj-title-wrapper">
              <div className="asana-proj-icon">📌</div>
              <div>
                <h1 className="asana-proj-title">Dependencias Dirección General</h1>
                <p className="asana-proj-subtitle">Seguimiento de procesos, aprobaciones y tareas del equipo directivo.</p>
              </div>
            </div>
          </div>

          <div className="asana-proj-nav-tabs">
            <button 
              className={`asana-view-tab ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
            >
              Lista
            </button>
            <button 
              className={`asana-view-tab ${activeView === 'board' ? 'active' : ''}`}
              onClick={() => setActiveView('board')}
            >
              Tablero (Kanban)
            </button>
          </div>
        </header>

        {/* Retraso Alert Banner */}
        {oldestPendingTask && !isAlertDismissed && (
          <div className="asana-retraso-banner">
            <div className="asana-retraso-content">
              <span>⚠️</span>
              <div>
                <strong>Alerta de Retraso:</strong> La dependencia pendiente más antigua es "<strong>{oldestPendingTask.title}</strong>", 
                asignada a <strong>{localMetadata[oldestPendingTask.id]?.assignee || 'Dirección'}</strong>. 
                {(() => {
                  const createdDate = new Date(oldestPendingTask.created_at);
                  const diffDays = Math.floor((new Date() - createdDate) / 86400000);
                  return diffDays === 1 
                    ? " Ha transcurrido 1 día desde su creación." 
                    : ` Han transcurrido ${diffDays} días desde su creación.`;
                })()}
              </div>
            </div>
            <button className="asana-banner-close" onClick={() => setIsAlertDismissed(true)}>✕</button>
          </div>
        )}

        {/* Workspace Body */}
        <div className="asana-workspace-body">
          {loading ? (
            <div className="asana-empty-state">
              <span className="inline-block animate-spin mr-2">⏳</span> Cargando dependencias desde Supabase...
            </div>
          ) : activeView === 'list' ? (
            /* Vista de Lista */
            <div className="asana-list-container">
              <table className="asana-list-table">
                <thead>
                  <tr>
                    <th className="asana-th" style={{ width: '40px' }}></th>
                    <th className="asana-th">Nombre de la tarea</th>
                    <th className="asana-th" style={{ width: '130px' }}>Responsable</th>
                    <th className="asana-th" style={{ width: '120px' }}>Fecha límite</th>
                    <th className="asana-th" style={{ width: '100px' }}>Prioridad</th>
                    <th className="asana-th" style={{ width: '140px' }}>Tiempo transcurrido</th>
                    <th className="asana-th" style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Tareas Activas */}
                  {pendingTasks.map(task => {
                    const meta = localMetadata[task.id] || { priority: 'media', assignee: 'Dirección', dueDate: '' };
                    return (
                      <tr key={task.id} className="asana-tr">
                        <td className="asana-td">
                          <div 
                            className="asana-circle-checkbox" 
                            onClick={() => handleCompleteTask(task.id)}
                            title="Marcar como completada"
                          />
                        </td>
                        <td className="asana-td">
                          <div className="asana-task-title-cell" title={task.title}>{task.title}</div>
                        </td>
                        <td className="asana-td">
                          {activeDropdown?.taskId === task.id && activeDropdown?.field === 'assignee' ? (
                            <select 
                              value={meta.assignee || 'Dirección'} 
                              onChange={(e) => updateMetadata(task.id, 'assignee', e.target.value)}
                              onBlur={() => setActiveDropdown(null)}
                              autoFocus
                              className="asana-inline-select"
                            >
                              <option value="Dirección">Dirección</option>
                              <option value="Redacción">Redacción</option>
                              <option value="Diseño">Diseño</option>
                              <option value="Redes">Redes</option>
                            </select>
                          ) : (
                            <button 
                              className="asana-badge-pill asana-badge-assignee"
                              onClick={() => setActiveDropdown({ taskId: task.id, field: 'assignee' })}
                            >
                              👤 {meta.assignee || 'Dirección'}
                            </button>
                          )}
                        </td>
                        <td className="asana-td">
                          {activeDropdown?.taskId === task.id && activeDropdown?.field === 'dueDate' ? (
                            <input 
                              type="date"
                              value={meta.dueDate || ''} 
                              onChange={(e) => updateMetadata(task.id, 'dueDate', e.target.value)}
                              onBlur={() => setActiveDropdown(null)}
                              autoFocus
                              className="asana-inline-select"
                            />
                          ) : (
                            <button 
                              className="asana-badge-pill asana-badge-date"
                              onClick={() => setActiveDropdown({ taskId: task.id, field: 'dueDate' })}
                            >
                              📅 {meta.dueDate ? formatDateBrief(meta.dueDate) : 'Sin fecha'}
                            </button>
                          )}
                        </td>
                        <td className="asana-td">
                          {activeDropdown?.taskId === task.id && activeDropdown?.field === 'priority' ? (
                            <select 
                              value={meta.priority || 'media'} 
                              onChange={(e) => updateMetadata(task.id, 'priority', e.target.value)}
                              onBlur={() => setActiveDropdown(null)}
                              autoFocus
                              className="asana-inline-select"
                            >
                              <option value="alta">Alta</option>
                              <option value="media">Media</option>
                              <option value="baja">Baja</option>
                            </select>
                          ) : (
                            <button 
                              className={`asana-badge-pill asana-badge-priority-${meta.priority || 'media'}`}
                              onClick={() => setActiveDropdown({ taskId: task.id, field: 'priority' })}
                            >
                              ⚡ {(meta.priority || 'media').toUpperCase()}
                            </button>
                          )}
                        </td>
                        <td className="asana-td">
                          <span className={`asana-pill ${getElapsedTimeBadgeClass(task.created_at)}`}>
                            ⏱️ {getElapsedTime(task.created_at)}
                          </span>
                        </td>
                        <td className="asana-td text-center">
                          <button 
                            className="asana-btn-delete-row"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Eliminar dependencia"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Inline Add Row */}
                  <tr className="asana-inline-add-tr">
                    <td colSpan={7} className="asana-inline-add-cell">
                      <form onSubmit={handleAddTask} className="asana-inline-add-input-wrapper">
                        <span className="asana-inline-add-icon">+</span>
                        <input 
                          type="text" 
                          placeholder="Agregar una nueva tarea o proceso de Dirección..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="asana-inline-input"
                          disabled={adding}
                        />
                        {newTaskTitle.trim() && (
                          <button type="submit" disabled={adding} className="asana-inline-add-btn">
                            {adding ? 'Agregando...' : 'Crear Tarea'}
                          </button>
                        )}
                      </form>
                    </td>
                  </tr>

                  {/* Tareas Completadas (en la lista se muestran abajo) */}
                  {completedTasks.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-b text-slate-500 bg-slate-50">
                          Tareas Completadas
                        </td>
                      </tr>
                      {completedTasks.map(task => {
                        const meta = localMetadata[task.id] || { priority: 'media', assignee: 'Dirección', dueDate: '' };
                        return (
                          <tr key={task.id} className="asana-tr opacity-60">
                            <td className="asana-td">
                              <div className="asana-circle-checkbox completed" />
                            </td>
                            <td className="asana-td">
                              <div className="asana-task-title-cell completed" title={task.title}>{task.title}</div>
                            </td>
                            <td className="asana-td">
                              <span className="asana-badge-pill asana-badge-assignee cursor-default">
                                👤 {meta.assignee || 'Dirección'}
                              </span>
                            </td>
                            <td className="asana-td">
                              <span className="asana-badge-pill asana-badge-date cursor-default">
                                📅 {meta.dueDate ? formatDateBrief(meta.dueDate) : 'Sin fecha'}
                              </span>
                            </td>
                            <td className="asana-td">
                              <span className={`asana-badge-pill asana-badge-priority-${meta.priority || 'media'} cursor-default`}>
                                ⚡ {(meta.priority || 'media').toUpperCase()}
                              </span>
                            </td>
                            <td className="asana-td">
                              <span className="text-xs text-slate-400">
                                Completada el {new Date(task.completed_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>
                            <td className="asana-td text-center">
                              <button 
                                className="asana-btn-delete-row"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Eliminar registro"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Vista de Tablero (Board View) */
            <div className="asana-board-columns">
              {/* Columna Pendientes */}
              <div className="asana-board-col">
                <div className="asana-board-col-header">
                  <div className="asana-board-col-title">
                    <span className="text-amber-500">▶</span> Tareas Activas
                  </div>
                  <span className="asana-board-col-count">{pendingTasks.length}</span>
                </div>

                {pendingTasks.length === 0 ? (
                  <div className="asana-board-empty">
                    🎉 ¡No hay dependencias activas! Todo al día.
                  </div>
                ) : (
                  pendingTasks.map(task => {
                    const meta = localMetadata[task.id] || { priority: 'media', assignee: 'Dirección', dueDate: '' };
                    return (
                      <div key={task.id} className="asana-card">
                        <div className="asana-card-header">
                          <div className="asana-card-title">{task.title}</div>
                          <button 
                            className="asana-btn-delete-card"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Eliminar tarea"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="asana-card-meta">
                          <span className={`asana-badge-pill asana-badge-priority-${meta.priority || 'media'} cursor-default`}>
                            ⚡ {meta.priority?.toUpperCase()}
                          </span>
                          <span className="asana-badge-pill asana-badge-date cursor-default">
                            📅 {meta.dueDate ? formatDateBrief(meta.dueDate) : 'Sin fecha'}
                          </span>
                        </div>
                        <div className="asana-card-footer">
                          <div className="flex items-center gap-1.5">
                            <div className="asana-card-assignee-avatar" title={meta.assignee}>
                              {getInitials(meta.assignee)}
                            </div>
                            <span className="text-xs text-slate-500">{meta.assignee}</span>
                          </div>
                          <span className={`asana-pill ${getElapsedTimeBadgeClass(task.created_at)}`}>
                            ⏱️ {getElapsedTime(task.created_at)}
                          </span>
                        </div>
                        <button 
                          className="mt-2 w-full py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Completar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Columna Completadas */}
              <div className="asana-board-col">
                <div className="asana-board-col-header">
                  <div className="asana-board-col-title">
                    <span className="text-emerald-500">✓</span> Completadas
                  </div>
                  <span className="asana-board-col-count">{completedTasks.length}</span>
                </div>

                {completedTasks.length === 0 ? (
                  <div className="asana-board-empty">
                    No hay tareas completadas recientemente.
                  </div>
                ) : (
                  completedTasks.map(task => {
                    const meta = localMetadata[task.id] || { priority: 'media', assignee: 'Dirección', dueDate: '' };
                    return (
                      <div key={task.id} className="asana-card opacity-60">
                        <div className="asana-card-header">
                          <div className="asana-card-title completed">{task.title}</div>
                          <button 
                            className="asana-btn-delete-card"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Eliminar registro"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="asana-card-meta">
                          <span className={`asana-badge-pill asana-badge-priority-${meta.priority || 'media'} cursor-default`}>
                            ⚡ {meta.priority?.toUpperCase()}
                          </span>
                          <span className="asana-badge-pill asana-badge-date cursor-default">
                            📅 {meta.dueDate ? formatDateBrief(meta.dueDate) : 'Sin fecha'}
                          </span>
                        </div>
                        <div className="asana-card-footer">
                          <div className="flex items-center gap-1.5">
                            <div className="asana-card-assignee-avatar bg-emerald-500" title={meta.assignee}>
                              {getInitials(meta.assignee)}
                            </div>
                            <span className="text-xs text-slate-500">{meta.assignee}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Completada el {new Date(task.completed_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

