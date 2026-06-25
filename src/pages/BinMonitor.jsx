import { useState } from 'react'
import { useBinStatus } from '../hooks/useBinStatus.js'
import { useCountUp } from '../hooks/useCountUp.js'
import Sparkline from '../components/charts/Sparkline.jsx'
import ProgressBar from '../components/common/ProgressBar.jsx'
import Badge from '../components/common/Badge.jsx'
import { Trash2, AlertTriangle, ArrowUpDown, MapPin, ChevronDown, ChevronUp, Activity, Gauge, Inbox } from 'lucide-react'

export default function BinMonitor() {
  const { bins } = useBinStatus()
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('fill_desc')
  const [expandedBin, setExpandedBin] = useState(null)

  const totalBins = bins.length
  const warningBins = bins.filter(b => b.fill_level_pct >= 70 && b.fill_level_pct < 90).length
  const criticalBins = bins.filter(b => b.fill_level_pct >= 90).length

  const animatedTotal = useCountUp(totalBins, 1000)
  const animatedWarning = useCountUp(warningBins, 1000)
  const animatedCritical = useCountUp(criticalBins, 1000)

  const filteredBins = bins.filter(bin => {
    if (filter === 'All') return true
    if (filter === 'Normal') return bin.fill_level_pct < 70
    if (filter === 'Warning') return bin.fill_level_pct >= 70 && bin.fill_level_pct < 90
    if (filter === 'Critical') return bin.fill_level_pct >= 90
    return true
  })

  const sortedBins = [...filteredBins].sort((a, b) => {
    if (sortBy === 'fill_desc') return b.fill_level_pct - a.fill_level_pct
    if (sortBy === 'fill_asc') return a.fill_level_pct - b.fill_level_pct
    if (sortBy === 'name') return a.location_name.localeCompare(b.location_name)
    if (sortBy === 'active') return new Date(b.last_detection) - new Date(a.last_detection)
    return 0
  })

  const filters = ['All', 'Normal', 'Warning', 'Critical']

  return (
    <div className="space-y-6 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-rose-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Summary Stats */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 border-l-[3px] border-l-teal-500/40 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">Total Bins Deployed</p>
              <p className="stat-number text-white mt-2">{animatedTotal}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-[3px] border-l-sun-500/40 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">Bins Needing Attention</p>
              <p className="stat-number text-white mt-2">{animatedWarning}</p>
              <p className="text-xs text-sun-400 mt-1.5 font-bold">70-89% fill level</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sun-500/10 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-sun-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-[3px] border-l-rose-500/40 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-semibold">Critical Overflow</p>
              <p className="stat-number text-white mt-2">{animatedCritical}</p>
              <p className="text-xs text-rose-400 mt-1.5 font-bold">90%+ — Alert sent</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="relative z-10 glass-card p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center bg-ocean-800/40 rounded-2xl p-1 border border-ocean-600/10">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                filter === f
                  ? 'liquid-glass-pill-active text-white'
                  : 'liquid-glass-pill-inactive text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-600" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-teal-500/30 focus:outline-none font-medium">
            <option value="fill_desc">Fill Level (High → Low)</option>
            <option value="fill_asc">Fill Level (Low → High)</option>
            <option value="name">Location Name</option>
            <option value="active">Last Active</option>
          </select>
        </div>
      </div>

      {/* Bin Grid or Empty State */}
      {sortedBins.length === 0 ? (
        <div className="relative z-10 glass-card p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-ocean-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-display">No Bins Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
            {bins.length === 0
              ? 'Bin monitoring data will appear here once your IoT devices are connected to the backend.'
              : 'No bins match the current filter. Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedBins.map((bin) => {
            const isCritical = bin.fill_level_pct >= 90
            const isWarning = bin.fill_level_pct >= 70 && !isCritical
            const cardColor = isCritical ? 'rose' : isWarning ? 'sun' : 'teal'

            return (
              <div key={bin.id} className={`glass-card p-6 transition-all duration-300 card-hover ${isCritical ? 'critical-pulse border-rose-500/20' : ''}`}>
                {isCritical && (
                  <div className="mb-4 px-4 py-2 bg-rose-500/8 border border-rose-500/15 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Overflow Alert Sent to Municipality
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white text-lg font-display">{bin.location_name}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Mumbai, Maharashtra
                    </p>
                  </div>
                  <Badge color={cardColor} size="md">{bin.top_plastic_type}</Badge>
                </div>

                <div className="flex items-end gap-2 mb-3">
                  <span className="font-mono text-5xl font-bold text-white">{bin.fill_level_pct}</span>
                  <span className="text-sm text-slate-500 font-semibold mb-2">%</span>
                </div>

                <ProgressBar value={bin.fill_level_pct} color={cardColor} height="h-3" />

                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Last detection: {bin.last_detection ? 'Just now' : 'N/A'}
                  </span>
                  <span className="font-mono">{bin.device_id}</span>
                </div>

                {bin.fill_history_24h && (
                  <div className="mt-5 pt-4 border-t border-ocean-700/15">
                    <p className="text-[10px] text-slate-600 mb-2 font-bold uppercase tracking-widest">24h Trend</p>
                    <Sparkline data={bin.fill_history_24h} color={isCritical ? '#FF5C85' : isWarning ? '#FFC81A' : '#00E8AE'} />
                  </div>
                )}

                <button
                  onClick={() => setExpandedBin(expandedBin === bin.id ? null : bin.id)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ocean-800/25 hover:bg-ocean-800/40 text-slate-400 text-sm font-semibold transition-all duration-300 border border-ocean-600/10 hover:border-ocean-500/15"
                >
                  {expandedBin === bin.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expandedBin === bin.id ? 'Collapse Details' : 'View Details'}
                </button>

                {expandedBin === bin.id && (
                  <div className="mt-5 pt-5 border-t border-ocean-700/15 space-y-5 animate-fade-in-up">
                    <p className="text-sm text-slate-500 text-center font-medium">Detailed history will populate from backend data</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
