import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BarChartComponent({ data, correctKey = 'correct', incorrectKey = 'incorrect', nameKey = 'type' }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ocean-900/95 backdrop-blur-xl p-4 rounded-2xl border border-ocean-600/20 shadow-2xl">
          <p className="text-sm font-bold text-white mb-3">{label}</p>
          {payload.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-sm mb-1.5 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-400">{p.name}:</span>
              <span className="font-mono font-bold text-white">{p.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
        <CartesianGrid strokeDasharray="3 8" stroke="rgba(12,21,39,0.8)" vertical={false} />
        <XAxis dataKey={nameKey} stroke="transparent" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#5A6A80', fontFamily: 'Space Grotesk' }} />
        <YAxis stroke="transparent" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#5A6A80', fontFamily: 'Space Grotesk' }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 232, 174, 0.03)' }} />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(value) => <span className="text-slate-400 font-semibold ml-1">{value}</span>}
        />
        <Bar dataKey={correctKey} name="Correct" fill="#00E8AE" radius={[8, 8, 0, 0]} animationDuration={1500} />
        <Bar dataKey={incorrectKey} name="Incorrect" fill="#FF5C85" radius={[8, 8, 0, 0]} animationDuration={1500} />
      </BarChart>
    </ResponsiveContainer>
  )
}
