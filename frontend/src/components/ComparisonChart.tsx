import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers } from 'lucide-react';

interface ComparisonData {
  name: string;
  change: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title: string;
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

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const axisColor = isDark ? "#52525b" : "#a1a1aa";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#ffffff" : "#09090b";

  return (
    <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group transition-all duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
          <Layers size={18} />
        </div>
        <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-100 uppercase tracking-widest">{title} - Fiyat Değişim Karşılaştırması (3 Ay)</h3>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} opacity={0.2} />
            <XAxis
              type="number"
              stroke={isDark ? "#52525b" : "#94a3b8"}
              fontSize={10}
              tickFormatter={(val) => `%${val}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={isDark ? "#a1a1aa" : "#475569"}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)' }}
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '12px',
                fontSize: '12px',
                color: tooltipText,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
              formatter={(val: any) => [`%${Number(val).toFixed(1)}`, 'Değişim']}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: isDark ? '#818cf8' : '#4f46e5', fontWeight: 'bold' }}
            />
            <Bar
              dataKey="change"
              radius={[0, 8, 8, 0]}
              barSize={20}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#6366f1' : (isDark ? '#3f3f46' : '#e2e8f0')}
                  fillOpacity={index === 0 ? 1 : 0.6}
                  className={index === 0 ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
