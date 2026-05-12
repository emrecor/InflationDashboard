import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GitCompare } from 'lucide-react';

interface ComparisonData {
  name: string;
  change: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value;
  const name: string = payload[0].payload?.name ?? '';
  const isPos = val >= 0;
  return (
    <div className="bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl min-w-[170px]">
      <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{name}</p>
      <p className={`text-base font-black tabular-nums ${isPos ? 'text-red-500' : 'text-emerald-500'}`}>
        {isPos ? '+' : ''}{Number(val).toFixed(1)}%
      </p>
      <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Son 3 Aylık Değişim</p>
    </div>
  );
}

export default function ComparisonChart({ data, title }: ComparisonChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const gridColor = isDark ? '#1e1e23' : '#f0f0f5';
  const axisColor = isDark ? '#52525b' : '#a1a1aa';

  const getBarColor = (change: number, isFirst: boolean) => {
    if (isFirst) return change >= 0 ? '#ef4444' : '#10b981';
    return isDark ? '#27272a' : '#e4e4e7';
  };

  return (
    <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 p-6 rounded-[2rem] shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-500 group">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 dark:bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
            <GitCompare size={15} />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 tracking-tight">Karşılaştırmalı Analiz</h3>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
              {title} • Son 3 Aylık Fiyat Değişimi
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-zinc-400 dark:text-zinc-500">Artış</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-zinc-400 dark:text-zinc-500">Düşüş</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[240px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="0" stroke={gridColor} horizontal={false} opacity={1} />
            <XAxis
              type="number"
              stroke={axisColor}
              fontSize={10}
              tickFormatter={(val) => `%${val}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontWeight: 700 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={axisColor}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={110}
              tick={{ fontWeight: 600, fill: isDark ? '#a1a1aa' : '#52525b' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)' }} />
            <Bar
              dataKey="change"
              radius={[0, 6, 6, 0]}
              barSize={22}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="change"
                position="right"
                formatter={(val: number) => `${val >= 0 ? '+' : ''}${Number(val).toFixed(1)}%`}
                style={{ fontSize: 10, fontWeight: 800, fill: isDark ? '#a1a1aa' : '#52525b' }}
              />
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.change, index === 0)}
                  fillOpacity={index === 0 ? 0.9 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
