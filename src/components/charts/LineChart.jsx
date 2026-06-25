import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function LineChartComponent({ data, dataKey = 'count', xKey = 'timestamp', color = '#00E8AE' }) {
  const formattedData = data.map(d => ({
    ...d,
    formattedTime: format(parseISO(d[xKey]), 'HH:mm'),
    formattedDate: format(parseISO(d[xKey]), 'MMM dd'),
  }))

  const maxValue = Math.max(...data.map(d => d[dataKey]))
  const maxPoint = data.find(d => d[dataKey] === maxValue)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ocean-900/95 backdrop-blur-xl p-4 rounded-2xl border border-ocean-600/20 shadow-2xl shadow-ocean-950/50">
          <p className="text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-widest">{label}</p>
          <p className="text-lg font-mono font-bold text-white">{payload[0].value} <span className="text-sm text-slate-500 font-normal">scans</span></p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="50%" stopColor={color} stopOpacity={0.06} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`line-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#7A68FF" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 8" stroke="rgba(12,21,39,0.8)" vertical={false} />
          <XAxis 
            dataKey="formattedTime" 
            stroke="transparent" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5A6A80', fontFamily: 'Space Grotesk' }}
          />
          <YAxis 
            stroke="transparent" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5A6A80', fontFamily: 'Space Grotesk' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }} />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={`url(#line-${color.replace('#', '')})`}
            strokeWidth={2.5}
            fill={`url(#gradient-${color.replace('#', '')})`}
            animationDuration={2000}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: '#060A14', strokeWidth: 3, style: { filter: `drop-shadow(0 0 6px ${color}60)` } }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {maxPoint && (
        <div className="absolute top-4 right-4 bg-ocean-900/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-teal-500/15 shadow-glow-teal">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Peak Activity</p>
          <p className="text-xl font-mono font-bold text-white">{maxValue} <span className="text-sm text-slate-500 font-normal">scans</span></p>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">{format(parseISO(maxPoint[xKey]), 'MMM dd, HH:mm')}</p>
        </div>
      )}
    </div>
  )
}
