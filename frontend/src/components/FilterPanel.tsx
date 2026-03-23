import { SelectHTMLAttributes } from 'react';
import { Settings2 } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl mb-8 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
          <Settings2 size={24} />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Filtrele</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-xs text-zinc-400 mb-1 ml-1 uppercase tracking-wider font-medium">Kategori</label>
          <select 
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors outline-none cursor-pointer"
          >
            <option value="" disabled>Kategori Seçin</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-zinc-400 mb-1 ml-1 uppercase tracking-wider font-medium">Zaman Aralığı</label>
          <select 
            value={selectedTimeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors outline-none cursor-pointer"
          >
            <option value="3m">Son 3 Ay</option>
            <option value="6m">Son 6 Ay</option>
            <option value="1y">Son 1 Yıl</option>
            <option value="all">Tümü</option>
          </select>
        </div>
      </div>
    </div>
  );
}
