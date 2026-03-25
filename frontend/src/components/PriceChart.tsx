import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Brush } from 'recharts';
import { useMemo } from 'react';

interface ChartDataPoint {
  fullDate: string;
  monthYear: string;
  price: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  // Her ay için sadece ilk günün tarihini etiket olarak göstermek için set oluşturuyoruz
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-[450px] w-full flex items-center justify-center shadow-xl backdrop-blur-sm">
        <p className="text-zinc-500 font-medium">Bu kategori için henüz veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-[450px] w-full flex flex-col shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">Fiyat Trendi</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="fullDate" // Benzersiz anahtar kullanımı (Mouse atlamasını engeller)
              stroke="#71717a" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              dy={10}
              interval={0} // Her veriyi kontrol et, formatter ile hangisinin görüneceğine karar ver
              tickFormatter={(value) => {
                // Sadece ayın ilk gününde ay/yıl etiketini göster
                if (firstDaysOfMonths.has(value)) {
                  const point = data.find(d => d.fullDate === value);
                  return point ? point.monthYear : "";
                }
                return "";
              }}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₺${val}`}
              dx={-5}
              domain={['auto', 'auto']} 
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                borderColor: '#27272a', 
                borderRadius: '12px', 
                color: '#f4f4f5', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px' }}
              formatter={(value: any) => [`₺${Number(value).toFixed(2)}`, 'Fiyat']}
              labelFormatter={(label) => label} // dataKey=fullDate olduğu için label direkt 23 Mar '26 olur
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              dot={data.length < 50 ? { r: 3, fill: '#6366f1', strokeWidth: 0 } : false}
              activeDot={{ r: 6, fill: '#818cf8', stroke: '#312e81', strokeWidth: 2 }}
              animationDuration={1500}
            />
            {data.length > 5 && (
              <Brush 
                dataKey="fullDate"
                height={25}
                stroke="#4f46e5"
                fill="#09090b"
                tickFormatter={() => ""}
                className="mt-6"
                travellerWidth={10}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
