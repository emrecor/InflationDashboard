import { Search, Calendar, Settings2 } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export default function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedTimeRange,
  onTimeRangeChange
}: FilterPanelProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-5 rounded-[2rem] mb-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-colors duration-500">
      {/* Decorative gradient background */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/10 dark:group-hover:bg-indigo-600/20 transition-all duration-700"></div>

      <div className="flex items-center gap-4 mb-6 lg:mb-0 relative z-10">
        <div className="flex items-center justify-center p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl shadow-sm transition-all duration-300">
          <Settings2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Akıllı Filtreleme</h2>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs font-medium uppercase tracking-widest">Veri Setini Özelleştir</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto relative z-10">
        {/* Kategori Seçici */}
        <div className="flex flex-col relative group/select">
          <div className="flex items-center gap-1.5 mb-1.5 ml-1">
            <Search size={12} className="text-indigo-500/70" />
            <label className="text-[10px] text-zinc-400 dark:text-zinc-400 uppercase tracking-[0.2em] font-bold">Kategori</label>
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 text-zinc-900 dark:text-zinc-100 text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full lg:w-64 p-3 pl-4 transition-all outline-none cursor-pointer appearance-none shadow-sm dark:shadow-lg"
            >
              <option value="" disabled className="bg-white dark:bg-zinc-950">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-zinc-950 px-4 py-2 text-zinc-900 dark:text-zinc-100 font-medium">{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Zaman Aralığı Seçici */}
        <div className="flex flex-col relative group/select">
          <div className="flex items-center gap-1.5 mb-1.5 ml-1">
            <Calendar size={12} className="text-indigo-500/70" />
            <label className="text-[10px] text-zinc-400 dark:text-zinc-400 uppercase tracking-[0.2em] font-bold">Zaman Aralığı</label>
          </div>
          <div className="relative">
            <select
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 text-zinc-900 dark:text-zinc-100 text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-3 pl-4 pr-10 transition-all outline-none cursor-pointer appearance-none shadow-sm dark:shadow-lg"
            >
              <option value="1m" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Son Ay</option>
              <option value="3m" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Son 3 Ay</option>
              <option value="6m" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Son 6 Ay</option>
              <option value="1y" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Son 1 Yıl</option>
              <option value="all" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Tümü</option>
              <option value="custom" disabled className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium">Özel Tarih (Yakında)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
