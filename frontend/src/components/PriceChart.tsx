import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot, Brush } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

interface ChartDataPoint {
  fullDate: string;
  monthYear: string;
  price: number;
  event?: string;
  eventDesc?: string;
}

interface PriceChartProps {
  data: ChartDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial check
    setIsDark(document.documentElement.classList.contains('dark'));

    // Observer to detect theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const firstDaysOfMonths = useMemo(() => {
    const seen = new Set<string>();
    const firstDates = new Set<string>();

    data.forEach(item => {
      if (!seen.has(item.monthYear)) {
        seen.add(item.monthYear);
        firstDates.add(item.fullDate);
      }
    });
    return firstDates;
  }, [data]);

  const eventPoints = useMemo(() => {
    return data.filter(d => d.event);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-3xl h-[480px] w-full flex items-center justify-center shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-500">
        <p className="text-zinc-400 dark:text-zinc-500 font-medium tracking-wide italic">Bu kategori için henüz veri bulunamadı.</p>
      </div>
    );
  }

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const axisColor = isDark ? "#52525b" : "#a1a1aa";

  return (
    <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] h-[480px] w-full flex flex-col shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Fiyat Trend Analizi</h3>
        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Canlı Veri</span>
        </div>
      </div>

      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.3} />
            <XAxis
              dataKey="fullDate"
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              interval={0}
              tickFormatter={(value) => {
                if (firstDaysOfMonths.has(value)) {
                  const point = data.find(d => d.fullDate === value);
                  return point ? point.monthYear : "";
                }
                return "";
              }}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₺${val}`}
              dx={-10}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md min-w-[200px] transition-colors">
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-widest">{label}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">Ürün Fiyatı:</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">₺{Number(item.price).toFixed(2)}</span>
                        </div>
                        {item.event && (
                          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${item.event === 'Fiyat Artışı' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
                              <span className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">{item.event}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium">{item.eventDesc}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={() => <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Ürün Fiyatı</span>}
            />
            <Line
              type="linear"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: '#818cf8', stroke: isDark ? '#1e1b4b' : '#fff', strokeWidth: 3 }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            {eventPoints.map((point, i) => (
              <ReferenceDot
                key={i}
                x={point.fullDate}
                y={point.price}
                r={4}
                fill={point.event === 'Fiyat Artışı' ? '#ef4444' : '#10b981'}
                stroke="none"
                className="animate-pulse"
              />
            ))}
            {data.length > 30 && (
              <Brush
                dataKey="fullDate"
                height={20}
                stroke={isDark ? "#4f46e5" : "#cbd5e1"}
                fill={isDark ? "#09090b" : "#f8fafc"}
                tickFormatter={() => ""}
                className="mt-10"
                travellerWidth={8}
                opacity={0.3}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
