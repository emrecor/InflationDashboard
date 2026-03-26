'use client';

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ChevronRight, Sun, Moon } from 'lucide-react';
import { fetchCategories, fetchInflationData, fetchComparison } from '@/lib/api';
import FilterPanel from '@/components/FilterPanel';
import PriceChart from '@/components/PriceChart';
import SummaryTable from '@/components/SummaryTable';
import ComparisonChart from '@/components/ComparisonChart';

export default function Dashboard() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Initial load: Fetch categories
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

  // Fetch inflation & comparison data whenever category or time range changes
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadData() {
      setIsLoading(true);
      const [infData, compData] = await Promise.all([
        fetchInflationData(selectedCategory, selectedTimeRange),
        fetchComparison(selectedCategory)
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 p-4 md:p-8 font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">
      {/* Decorative background glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/5 dark:bg-purple-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[1.5rem] shadow-2xl shadow-indigo-500/20 border border-indigo-500/30 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Activity size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 dark:from-white via-zinc-800 dark:via-white to-zinc-500">
                  Inflation Monitor
                </h1>
                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-md tracking-widest border border-zinc-200 dark:border-zinc-700">v2.0</span>
              </div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                Gerçek Zamanlı Piyasa Analizleri <ChevronRight size={14} className="text-indigo-500" />
              </p>
            </div>
          </div>

        </header>

        {/* Filter Panel */}
        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex h-[550px] items-center justify-center bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800/50 border-dashed backdrop-blur-xl">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-[3px] border-purple-500/30 border-b-transparent animate-spin-slow"></div>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg tracking-tight mb-1">Veriler İşleniyor</p>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Piyasa endeksleri güncelleniyor...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8">
                <PriceChart data={chartData} />
              </div>
              <div className="lg:col-span-4">
                <SummaryTable data={tableData} stats={stats} />
              </div>
            </div>

            {/* Bottom Panel: Comparison */}
            <div className="w-full">
              <ComparisonChart data={comparisonData} title={selectedCategory} />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6 opacity-80">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-black text-zinc-400 dark:text-zinc-500 text-xs shadow-inner">N</div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-500/70" />
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500 font-bold italic tracking-wide">
              YASAL UYARI: Buradaki veriler ve analizler yatırım tavsiyesi değildir.
            </p>
          </div>

          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">© 2026 Inflation Monitor AI</p>
        </footer>
      </div>
    </div>
  );
}
