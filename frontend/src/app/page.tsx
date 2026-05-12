'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, ShieldAlert, Sun, Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fetchCategories, fetchInflationData, fetchComparison } from '@/lib/api';
import FilterPanel from '@/components/FilterPanel';
import PriceChart from '@/components/PriceChart';
import SummaryTable from '@/components/SummaryTable';
import ComparisonChart from '@/components/ComparisonChart';

// ── KPI card ──────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  trend,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
  delay?: number;
}) {
  const trendColor =
    trend === 'up'
      ? 'text-red-500 dark:text-red-400'
      : trend === 'down'
        ? 'text-emerald-500 dark:text-emerald-400'
        : 'text-zinc-400';

  return (
    <div
      className="flex-1 min-w-0 bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 rounded-2xl px-5 py-4 backdrop-blur-xl shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />
      <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.22em] mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">{value}</p>
        {trend && trend !== 'flat' && (
          <span className={`flex items-center gap-0.5 text-xs font-black mb-0.5 ${trendColor}`}>
            {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // ── Hydration ──
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : true;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // ── Dark / Light toggle ──
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // ── Initial load ──
  useEffect(() => {
    async function loadInitialData() {
      const cats = await fetchCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      } else {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // ── Data fetch ──
  useEffect(() => {
    if (!selectedCategory) return;
    async function loadData() {
      setIsLoading(true);
      const [infData, compData] = await Promise.all([
        fetchInflationData(selectedCategory, selectedTimeRange),
        fetchComparison(selectedCategory),
      ]);
      setChartData(infData.chartData || []);
      setTableData(infData.tableData || []);
      setStats(infData.stats || null);
      setComparisonData(compData || []);
      setIsLoading(false);
    }
    loadData();
  }, [selectedCategory, selectedTimeRange]);

  if (!isMounted) return null;

  // ── KPI values ──
  const latestPrice = stats?.latestPrice;
  const minPrice = stats?.minPrice;
  const maxPrice = stats?.maxPrice;
  const latestChange = tableData.length > 0 ? (tableData as any[])[0].increasePct : null;
  const latestChangeTrend: 'up' | 'down' | 'flat' =
    latestChange == null ? 'flat' : latestChange > 0 ? 'up' : latestChange < 0 ? 'down' : 'flat';

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] transition-colors duration-500 overflow-x-hidden">
      {/* ── Decorative background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/[0.06] dark:bg-indigo-600/[0.07] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[40%] bg-purple-600/[0.04] dark:bg-purple-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-sky-600/[0.03] dark:bg-sky-600/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 relative z-10">

        {/* ── Header ── */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative group">
              <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-xl shadow-indigo-500/25 border border-indigo-400/20">
                <Activity size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                  Inflation Monitor
                </h1>
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase rounded-md tracking-widest border border-indigo-100 dark:border-indigo-500/25">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-[0.2em]">
                Gerçek Zamanlı Piyasa Analizleri
              </p>
            </div>
          </div>

          {/* Right side: Dark/Light toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group self-start sm:self-auto"
          >
            <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-indigo-500/30 rounded-full transition-colors duration-300 flex items-center">
              <div className={`absolute w-3.5 h-3.5 rounded-full transition-all duration-300 shadow ${isDark ? 'translate-x-4 bg-indigo-400' : 'translate-x-0.5 bg-zinc-500'}`} />
            </div>
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
              {isDark ? 'Koyu' : 'Açık'}
            </span>
            {isDark
              ? <Moon size={13} className="text-indigo-400" />
              : <Sun size={13} className="text-amber-500" />
            }
          </button>
        </header>

        {/* ── KPI Bar ── */}
        {!isLoading && stats && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up">
            <KpiCard
              label="Güncel Fiyat"
              value={latestPrice != null ? `₺${latestPrice.toFixed(2)}` : '—'}
              sub="/ Paket"
              trend={latestChangeTrend}
              delay={0}
            />
            <KpiCard
              label="Aylık Değişim"
              value={latestChange != null ? `${latestChange >= 0 ? '+' : ''}${latestChange.toFixed(1)}%` : '—'}
              sub="Önceki aya göre"
              trend={latestChangeTrend}
              delay={60}
            />
            <KpiCard
              label="Dönem En Düşük"
              value={minPrice != null ? `₺${minPrice.toFixed(2)}` : '—'}
              sub="Seçili dönem"
              trend="down"
              delay={120}
            />
            <KpiCard
              label="Dönem En Yüksek"
              value={maxPrice != null ? `₺${maxPrice.toFixed(2)}` : '—'}
              sub="Seçili dönem"
              trend="up"
              delay={180}
            />
          </div>
        )}

        {/* ── Filter Panel ── */}
        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* ── Main Content ── */}
        {isLoading ? (
          <div className="flex h-[520px] items-center justify-center bg-white/40 dark:bg-zinc-900/20 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/50 border-dashed backdrop-blur-xl">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[2.5px] border-zinc-200 dark:border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-[2.5px] border-indigo-500 border-t-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-[2.5px] border-purple-500/30 border-b-transparent animate-spin-slow" />
              </div>
              <div className="text-center">
                <p className="text-zinc-800 dark:text-white font-black text-base tracking-tight mb-1">Veriler İşleniyor</p>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.22em] animate-pulse">
                  Piyasa endeksleri güncelleniyor...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-up">
            {/* Chart + Table row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8">
                <PriceChart data={chartData} />
              </div>
              <div className="lg:col-span-4">
                <SummaryTable data={tableData} stats={stats} />
              </div>
            </div>

            {/* Comparison */}
            <div className="w-full">
              <ComparisonChart data={comparisonData} title={selectedCategory} />
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-14 pt-6 border-t border-zinc-200/60 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-100 dark:border-indigo-500/15">
              <Activity size={14} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
              © 2026 Inflation Monitor AI
            </span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50/60 dark:bg-amber-500/5 px-4 py-2 rounded-full border border-amber-100/60 dark:border-amber-500/15">
            <ShieldAlert size={12} className="text-amber-600 dark:text-amber-500/70 flex-shrink-0" />
            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-bold italic tracking-wide">
              YASAL UYARI: Buradaki veriler ve analizler yatırım tavsiyesi değildir.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
