import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useCountUp } from '../../hooks/useCountUp.js'
import { getCategory } from '../../lib/categories.js'

const colorFor = (name) => (name === 'Contaminated' ? '#E6174F' : getCategory(name).color)

export default function DonutChart({ data, centerValue, centerLabel }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const animatedTotal = useCountUp(centerValue || data.reduce((a, b) => a + (b.count || b.value), 0), 1800)

  const onPieEnter = (_, index) => setActiveIndex(index)
  const onPieLeave = () => setActiveIndex(null)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-ocean-900/95 backdrop-blur-xl p-4 rounded-2xl border border-ocean-600/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorFor(d.type || d.name) }} />
            <p className="text-sm font-bold text-white">{d.type || d.name}</p>
          </div>
          <p className="text-xs text-slate-400">{d.count || d.value} items <span className="text-slate-600">({d.pct}%)</span></p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={115}
            paddingAngle={4}
            dataKey="count"
            nameKey="type"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationBegin={300}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorFor(entry.type || entry.name)}
                stroke="rgba(6, 10, 20, 0.9)"
                strokeWidth={3}
                style={{
                  transform: activeIndex === index ? 'scale(1.08)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: activeIndex === index ? `brightness(1.2) drop-shadow(0 0 8px ${colorFor(entry.type || entry.name)}40)` : 'brightness(1)',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-4xl font-bold text-white tracking-tight">{animatedTotal.toLocaleString()}</span>
        <span className="text-[11px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{centerLabel || 'Total Scans'}</span>
      </div>
    </div>
  )
}
