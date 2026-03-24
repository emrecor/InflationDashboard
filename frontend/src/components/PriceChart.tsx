import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Brush } from 'recharts';

interface ChartDataPoint {
  fullDate: string;
  monthYear: string;
  price: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-[450px] w-full flex flex-col shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">Fiyat Trendi</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="monthYear" 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
              minTickGap={50} // Sadece aylar görünecek (Mar 2026, Şub 2026 vb.)
            />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₺${val}`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
              formatter={(value: any) => {
                const num = Number(value);
                return [`₺${num.toFixed(2)}`, 'Fiyat'];
              }}
              labelFormatter={(label, payload) => {
                // Eğer payload içerisinden fullDate değerini alabiliyorsak (23 Mar '26) onu gösterelim
                if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, fill: '#818cf8', stroke: '#312e81', strokeWidth: 2 }}
            />
            <Brush 
              dataKey="monthYear"
              height={30}
              stroke="#6366f1"
              fill="#18181b"
              tickFormatter={() => ""} // Brush'ın kendi altındaki tarihleri kirlilik yapmasın diye gizleyebiliriz
              className="mt-4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
