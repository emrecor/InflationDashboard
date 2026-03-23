import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ChartDataPoint {
  month: string;
  price: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-[400px] w-full flex flex-col shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">Fiyat Trendi</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
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
              formatter={(value: number) => [`₺${value.toFixed(2)}`, 'Fiyat']}
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
