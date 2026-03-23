import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TableDataRow {
  month: string;
  avgPrice: number;
  increasePct: number;
}

interface SummaryTableProps {
  data: TableDataRow[];
}

export default function SummaryTable({ data }: SummaryTableProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col shadow-xl backdrop-blur-sm overflow-hidden h-full">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-100">Aylık Özet</h3>
      </div>
      
      <div className="overflow-x-auto flex-grow relative">
        <table className="w-full text-sm text-left text-zinc-400 min-w-[280px]">
          <thead className="text-xs uppercase bg-zinc-800/80 text-zinc-500 border-b border-zinc-800 sticky top-0">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold w-1/3">Ay</th>
              <th scope="col" className="px-5 py-4 font-semibold text-right w-1/3">Ort. Fiyat</th>
              <th scope="col" className="px-5 py-4 font-semibold text-right w-1/3">Değişim</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4 font-medium text-zinc-200">
                  {row.month}
                </td>
                <td className="px-5 py-4 text-right tabular-nums text-indigo-100">
                  ₺{row.avgPrice.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {row.increasePct > 0 ? (
                      <TrendingUp size={16} className="text-red-400" />
                    ) : row.increasePct < 0 ? (
                      <TrendingDown size={16} className="text-emerald-400" />
                    ) : (
                      <Minus size={16} className="text-zinc-500" />
                    )}
                    <span className={`font-medium ${
                      row.increasePct > 0 ? 'text-red-400' 
                      : row.increasePct < 0 ? 'text-emerald-400' 
                      : 'text-zinc-500'
                    }`}>
                      {row.increasePct > 0 ? '+' : ''}{row.increasePct.toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                  Görüntülenecek veri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
