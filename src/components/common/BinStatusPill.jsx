import { useNavigate } from 'react-router-dom'

export default function BinStatusPill({ bin }) {
  const navigate = useNavigate()
  const fill = bin.fill_level_pct

  let statusColor = '#00E8AE'
  let borderAccent = 'border-teal-500/15'
  let bgTint = 'from-teal-500/5 to-transparent'
  let isCritical = false

  if (fill >= 90) {
    statusColor = '#FF5C85'
    borderAccent = 'border-rose-500/20'
    bgTint = 'from-rose-500/5 to-transparent'
    isCritical = true
  } else if (fill >= 70) {
    statusColor = '#FFC81A'
    borderAccent = 'border-sun-500/15'
    bgTint = 'from-sun-500/5 to-transparent'
  }

  // SVG arc for circular gauge
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (fill / 100) * circumference

  return (
    <button 
      onClick={() => navigate('/bins')}
      className={`flex-shrink-0 w-48 p-4 rounded-2xl border ${borderAccent} bg-gradient-to-b ${bgTint} text-left transition-all duration-400 hover:scale-[1.03] cursor-pointer group relative overflow-hidden`}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 truncate pr-2 uppercase tracking-wider">{bin.location_name}</span>
          {isCritical && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: statusColor }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: statusColor }}></span>
            </span>
          )}
        </div>

        {/* Circular gauge */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(12,21,39,0.8)" strokeWidth="4" />
              <circle 
                cx="32" cy="32" r={radius} fill="none" 
                stroke={statusColor} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 4px ${statusColor}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-lg font-bold text-white">{fill}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-mono">{bin.device_id}</span>
          <span className="text-[10px] font-bold" style={{ color: statusColor }}>
            {isCritical ? 'CRITICAL' : fill >= 70 ? 'WARNING' : 'NORMAL'}
          </span>
        </div>
      </div>
    </button>
  )
}
