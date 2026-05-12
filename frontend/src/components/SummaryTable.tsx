import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, BarChart2 } from 'lucide-react';

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
  const latestChange = data.length > 0 ? data[0].increasePct : 0;
  const isUp = latestChange >= 0;

  return (
    <div className="flex flex-col gap-5 h-full transition-colors duration-500">
      {/* ── Anlık Durum Kartı ── */}
      <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 p-5 rounded-[2rem] shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        {/* BG glow */}
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-600/5 dark:bg-indigo-600/8 rounded-full blur-3xl group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
              <BarChart2 size={15} />
            </div>
            <h3 className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Anlık Durum</h3>
          </div>
          {/* Change badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${
            isUp
              ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{isUp ? '+' : ''}{latestChange.toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {/* Main price */}
          <div>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.22em] mb-1">Güncel Fiyat</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums">
                ₺{stats?.latestPrice.toFixed(2) ?? '—'}
              </span>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600">/ Paket</span>
            </div>
          </div>

          {/* Min / Max */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <ArrowDownRight size={11} className="text-emerald-600 dark:text-emerald-500" />
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">En Düşük</p>
              </div>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                ₺{stats?.minPrice.toFixed(2) ?? '—'}
              </p>
            </div>
            <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <ArrowUpRight size={11} className="text-red-600 dark:text-red-500" />
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">En Yüksek</p>
              </div>
              <p className="text-sm font-black text-red-700 dark:text-red-400 tabular-nums">
                ₺{stats?.maxPrice.toFixed(2) ?? '—'}
              </p>
            </div>
          </div>

          {/* Last update */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Clock size={10} className="text-zinc-400 dark:text-zinc-600" />
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold italic tracking-wide">
              Son Güncelleme: {stats?.lastUpdate ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Aylık Özet Tablosu ── */}
      <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 rounded-[2rem] flex flex-col shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden flex-grow transition-all duration-500">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex-shrink-0">
          <h3 className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Aylık Özet</h3>
        </div>

        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-sm text-left">
            <thead className="text-[9px] uppercase bg-zinc-50/80 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800/60 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-black tracking-[0.18em] text-zinc-400 dark:text-zinc-500">Ay</th>
                <th className="px-5 py-3 font-black tracking-[0.18em] text-zinc-400 dark:text-zinc-500 text-right">Fiyat</th>
                <th className="px-5 py-3 font-black tracking-[0.18em] text-zinc-400 dark:text-zinc-500 text-center">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800/30">
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-colors duration-150 group"
                >
                  <td className="px-5 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white text-sm transition-colors">
                    {row.month}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-black text-indigo-600 dark:text-indigo-300/90 text-sm">
                    ₺{row.avgPrice.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${
                        row.increasePct > 0
                          ? 'bg-red-100/80 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : row.increasePct < 0
                            ? 'bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500'
                      }`}>
                        {row.increasePct > 0
                          ? <span className="flex items-center gap-0.5"><TrendingUp size={9} className="inline" /> +{row.increasePct.toFixed(1)}%</span>
                          : row.increasePct < 0
                            ? <span className="flex items-center gap-0.5"><TrendingDown size={9} className="inline" /> {row.increasePct.toFixed(1)}%</span>
                            : `${row.increasePct.toFixed(1)}%`
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-600 font-medium italic text-sm">
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
