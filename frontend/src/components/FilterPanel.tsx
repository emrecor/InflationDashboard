import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const timeRanges = [
  { value: '1m', label: '1A' },
  { value: '3m', label: '3A' },
  { value: '6m', label: '6A' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'Tümü' },
];

export default function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedTimeRange,
  onTimeRangeChange,
}: FilterPanelProps) {
  return (
    <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 p-4 px-5 rounded-[2rem] mb-8 backdrop-blur-xl shadow-lg relative overflow-hidden transition-colors duration-500">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
        {/* Icon + Label */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="p-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <SlidersHorizontal size={16} />
          </div>
          <span className="text-sm font-black text-zinc-700 dark:text-zinc-200 tracking-tight hidden sm:block">Filtrele</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />

        {/* Category Select */}
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Search size={10} className="text-indigo-500/70" />
            <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.22em] font-black">Kategori</label>
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/50 text-zinc-900 dark:text-zinc-100 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/60 w-full sm:w-60 py-2.5 pl-3.5 pr-9 transition-all outline-none cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-white dark:bg-zinc-950">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-zinc-950 font-semibold">{cat}</option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
              width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />

        {/* Time Range Pills */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.22em] font-black ml-0.5">Zaman Aralığı</span>
          <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/70 p-1 rounded-xl">
            {timeRanges.map(({ value, label }) => {
              const isActive = selectedTimeRange === value;
              return (
                <button
                  key={value}
                  onClick={() => onTimeRangeChange(value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-[1.03]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
