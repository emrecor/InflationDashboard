'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { fetchCategories, fetchInflationData } from '@/lib/api';
import FilterPanel from '@/components/FilterPanel';
import PriceChart from '@/components/PriceChart';
import SummaryTable from '@/components/SummaryTable';

export default function Dashboard() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch inflation data whenever category or time range changes
  useEffect(() => {
    if (!selectedCategory) return;
    
    async function loadData() {
      setIsLoading(true);
      const data = await fetchInflationData(selectedCategory, selectedTimeRange);
      setChartData(data.chartData || []);
      setTableData(data.tableData || []);
      setIsLoading(false);
    }
    
    loadData();
  }, [selectedCategory, selectedTimeRange]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-500/30">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-1">
              Inflation Monitor
            </h1>
            <p className="text-zinc-500 text-sm font-medium">Gerçek zamanlı fiyat trendleri ve analiz dashboard'u</p>
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
          <div className="flex h-[450px] items-center justify-center bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed backdrop-blur-sm shadow-inner transition-all duration-500">
            <div className="flex flex-col items-center gap-5 text-zinc-500">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="animate-pulse font-medium text-sm tracking-wide">Analiz verileri yükleniyor...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-opacity duration-500 opacity-100">
            <div className="lg:col-span-8">
              <PriceChart data={chartData} />
            </div>
            <div className="lg:col-span-4 self-stretch">
              <SummaryTable data={tableData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
