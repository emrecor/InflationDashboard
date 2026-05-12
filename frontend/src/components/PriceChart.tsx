import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Brush,
  defs,
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload as ChartDataPoint;

  const idx = payload[0]?.index ?? -1;

  return (
    <div className="bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/80 dark:border-indigo-500/20 p-4 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-xl min-w-[210px] transition-colors">
      <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-[0.18em]">{label}</p>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Ortalama Fiyat</span>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            ₺{Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.event && (
          <div className="mt-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.event === 'Fiyat Artışı'
                ? 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                }`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                {item.event}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">{item.eventDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PriceChart({ data }: PriceChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
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

  const eventPoints = useMemo(() => data.filter(d => d.event), [data]);

  const { minPoint, maxPoint, priceDelta, priceDeltaPct } = useMemo(() => {
    if (!data.length) return { minPoint: null, maxPoint: null, priceDelta: 0, priceDeltaPct: 0 };
    const prices = data.map(d => d.price);
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const minPoint = data.find(d => d.price === minVal) ?? null;
    const maxPoint = data.find(d => d.price === maxVal) ?? null;
    const first = data[0].price;
    const last = data[data.length - 1].price;
    const delta = last - first;
    const pct = first > 0 ? (delta / first) * 100 : 0;
    return { minPoint, maxPoint, priceDelta: delta, priceDeltaPct: pct };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-3xl h-[480px] w-full flex items-center justify-center shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-500">
        <p className="text-zinc-400 dark:text-zinc-500 font-medium tracking-wide italic">Bu kategori için henüz veri bulunamadı.</p>
      </div>
    );
  }

  const gridColor = isDark ? '#1e1e23' : '#f0f0f5';
  const axisColor = isDark ? '#4a4a56' : '#b0b0be';
  const isPositive = priceDeltaPct >= 0;

  return (
    <div className="bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/40 p-6 rounded-[2rem] h-[480px] w-full flex flex-col shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors duration-500 group">
      {/* Soft glow bg */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-lg">
              <Zap size={14} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">Fiyat Trend Analizi</h3>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em] ml-8">
            {data.length > 0 ? `${data[0].monthYear} – ${data[data.length - 1].monthYear}` : 'Veri yükleniyor'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Delta badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${isPositive
            ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'
            : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
            {isPositive
              ? <TrendingUp size={12} />
              : <TrendingDown size={12} />
            }
            <span>{isPositive ? '+' : ''}{priceDeltaPct.toFixed(1)}%</span>
          </div>
          {/* Live badge */}
          <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Canlı</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={isDark ? 0.35 : 0.2} />
                <stop offset="60%" stopColor="#6366f1" stopOpacity={isDark ? 0.08 : 0.04} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} opacity={1} />

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
                  return point ? point.monthYear : '';
                }
                return '';
              }}
              tick={{ fontWeight: 700, fill: axisColor }}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₺${val}`}
              dx={-8}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 10 }}
              tick={{ fontWeight: 700, fill: axisColor }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Min reference line */}
            {minPoint && (
              <ReferenceLine
                y={minPoint.price}
                stroke={isDark ? '#10b98140' : '#10b98130'}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#818cf8',
                stroke: isDark ? '#1e1b4b' : '#fff',
                strokeWidth: 2.5,
                filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.8))'
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* Event dots */}
            {eventPoints.map((point, i) => (
              <ReferenceDot
                key={i}
                x={point.fullDate}
                y={point.price}
                r={5}
                fill={point.event === 'Fiyat Artışı' ? '#ef4444' : '#10b981'}
                stroke={isDark ? '#09090b' : '#fff'}
                strokeWidth={2}
              />
            ))}

            {/* Min/Max dots */}
            {minPoint && (
              <ReferenceDot
                x={minPoint.fullDate}
                y={minPoint.price}
                r={4}
                fill="#10b981"
                stroke={isDark ? '#09090b' : '#fff'}
                strokeWidth={2}
                label={{ value: `₺${minPoint.price.toFixed(0)}`, position: 'bottom', fontSize: 9, fill: '#10b981', fontWeight: 800 }}
              />
            )}
            {maxPoint && (
              <ReferenceDot
                x={maxPoint.fullDate}
                y={maxPoint.price}
                r={4}
                fill="#ef4444"
                stroke={isDark ? '#09090b' : '#fff'}
                strokeWidth={2}
                label={{ value: `₺${maxPoint.price.toFixed(0)}`, position: 'top', fontSize: 9, fill: '#ef4444', fontWeight: 800 }}
              />
            )}

            {data.length > 30 && (
              <Brush
                dataKey="fullDate"
                height={20}
                stroke={isDark ? '#4f46e5' : '#c7d2fe'}
                fill={isDark ? '#09090b' : '#f5f3ff'}
                tickFormatter={() => ''}
                travellerWidth={8}
                opacity={0.6}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
