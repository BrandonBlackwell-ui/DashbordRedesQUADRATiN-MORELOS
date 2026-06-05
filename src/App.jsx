import React, { useState, useEffect } from 'react';
import { qm_data } from './data';
import { qm_analysis } from './analysis';
import { supabase } from './supabase';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine
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

  // Extract history and configurations from data
  const history = qm_data.history;
  const goals = qm_data.goals;
  const monthly_goals = qm_data.monthly_goals;
  const monthly_real = qm_data.monthly_real;

  // Last entry with full data for totals (skip youtube-only gaps)
  const lastEntry = history[history.length - 1];
  const initialEntry = history[0]; // 1 Jan

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
    { label: 'Hoy', real: { facebook: 81097, instagram: 20583, twitter: 10635, tiktok: 5854 }, goal: null },
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
            className={`header-nav-tab ${activeReportTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('radar')}
          >
            Dependencias
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
                        <span className="font-bold" style={{ color: isGoalMet ? 'var(--color-success)' : 'var(--color-blue)' }}>
                          {progressPct.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Bar */}
                      <div className="progress-bar-container">
                        <div 
                          className="h-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(progressPct, 100)}%`,
                            backgroundColor: isGoalMet ? 'var(--color-success)' : 'var(--color-blue)'
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
                        <span className="text-slate-400">Inicio (9 Ene):</span>
                        <span className="text-slate-700 font-bold">{formatNumber(item.initial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cierre PDF (9 May):</span>
                        <span className="text-slate-700 font-bold">
                          {formatNumber(history[1] ? history[1][key] : item.initial)}
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
              Datos del PDF oficial (ene–may 2026) y scraping automático diario 7 AM. Metas disponibles desde marzo.
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
        ) : (
          <DependenciasDashboard />
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-slate-400 text-xs">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span>Quadratín Morelos · Dashboard Ejecutivo Q2</span>
            <span>•</span>
            <span>Estadísticas en Tiempo Real</span>
          </p>
          <p className="mt-1">
            Diseño corporativo oficial basado en la identidad visual de Quadratín (Naranja y Azul).
          </p>
        </footer>

      </div>
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

