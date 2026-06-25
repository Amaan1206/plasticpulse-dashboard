import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export default function Sparkline({ data, color = '#00E8AE', height = 60 }) {
  const chartData = data.map((v, i) => ({ value: v, index: i }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          fill={`url(#spark-${color.replace('#', '')})`}
          animationDuration={1000}
          animationEasing="ease-out"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
