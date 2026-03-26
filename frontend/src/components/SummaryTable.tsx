import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Clock, Tag } from 'lucide-react';

interface TableDataRow {
  month: string;
  avgPrice: number;
  increasePct: number;
}

interface PriceStats {
  latestPrice: number;
  minPrice: number;
  maxPrice: number;
  lastUpdate: string;
}

interface SummaryTableProps {
  data: TableDataRow[];
  stats: PriceStats | null;
}

export default function SummaryTable({ data, stats }: SummaryTableProps) {
  return (
    <div className="flex flex-col gap-6 h-full transition-colors duration-500">
      {/* Anlık Durum Kartı */}
      <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/5 dark:bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-all duration-700"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
            <Tag size={18} />
          </div>
          <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-100 uppercase tracking-widest">Anlık Durum</h3>
        </div>

        <div className="space-y-5 relative z-10">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Mevcut Fiyat</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">₺{stats?.latestPrice.toFixed(2) || '-'}</span>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600">/ Paket</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownRight size={12} className="text-emerald-600 dark:text-emerald-500" />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">En Düşük</p>
              </div>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">₺{stats?.minPrice.toFixed(2) || '-'}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight size={12} className="text-red-600 dark:text-red-500" />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">En Yüksek</p>
              </div>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">₺{stats?.maxPrice.toFixed(2) || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Clock size={12} className="text-zinc-400 dark:text-zinc-600" />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold italic">Son Güncelleme: {stats?.lastUpdate || '-'}</p>
          </div>
        </div>
      </div>

      {/* Aylık Özet Tablosu */}
      <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-[2rem] flex flex-col shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden flex-grow group transition-all">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50">
          <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-100 uppercase tracking-[0.2em]">Aylık Özet</h3>
        </div>

        <div className="overflow-y-auto max-h-[250px] relative scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
            <thead className="text-[10px] uppercase bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-10 font-black">
              <tr>
                <th scope="col" className="px-5 py-4 tracking-widest">Ay</th>
                <th scope="col" className="px-5 py-4 tracking-widest text-right">Fiyat</th>
                <th scope="col" className="px-5 py-4 tracking-widest text-center">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/30">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group">
                  <td className="px-5 py-4 font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white">
                    {row.month}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-black text-indigo-600 dark:text-indigo-200/80">
                    ₺{row.avgPrice.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${row.increasePct > 0 ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : row.increasePct < 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500'
                        }`}>
                        {row.increasePct > 0 ? '+' : ''}{row.increasePct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 font-medium italic">
                    Veri analiz ediliyor...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
