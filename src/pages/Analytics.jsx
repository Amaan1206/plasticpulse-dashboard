import { useState, useEffect } from 'react'
import StatCard from '../components/common/StatCard.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import DonutChart from '../components/charts/DonutChart.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import { Scan, TrendingUp, Gauge, BarChart3, Lightbulb, Inbox } from 'lucide-react'
import { getCategory } from '../lib/categories.js'

const presets = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
]

export default function Analytics() {
  const [activePreset, setActivePreset] = useState('Last 7 Days')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [showCustom, setShowCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)

  // Fetch analytics from the bridge server
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/analytics?range=${encodeURIComponent(activePreset)}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Server not available — keep showing empty state
      }
      setIsLoading(false)
    }
    fetchAnalytics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [activePreset])

  const handlePresetChange = (preset) => {
    setActivePreset(preset.label)
    setShowCustom(false)
  }

  const hasData = data && data.total_scans > 0

  return (
    <div className="space-y-6 page-transition">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-iris-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Summary Stats */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Items" value={data?.total_scans || 0} icon={Scan} color="teal" />
        <StatCard title="Correct Placement Rate" value={data?.correct_pct || 0} suffix="%" icon={TrendingUp} color="mint" />
        <StatCard title="Avg Confidence" value={data?.average_confidence || 0} suffix="%" icon={Gauge} color="iris" />
      </div>

      {/* Date Filter — Segmented Pill */}
      <div className="relative z-10 glass-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-ocean-800/40 rounded-2xl p-1 border border-ocean-600/10">
            {presets.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePresetChange(preset)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                  activePreset === preset.label && !showCustom
                    ? 'liquid-glass-pill-active text-white'
                    : 'liquid-glass-pill-inactive text-slate-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => { setShowCustom(true); setActivePreset('Custom') }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                showCustom
                  ? 'liquid-glass-pill-active text-white'
                  : 'liquid-glass-pill-inactive text-slate-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
          {showCustom && (
            <div className="flex items-center gap-3 ml-2">
              <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} className="bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-teal-500/30 focus:outline-none transition-colors" />
              <span className="text-slate-600 text-sm font-medium">to</span>
              <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} className="bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-teal-500/30 focus:outline-none transition-colors" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
        {!hasData ? (
          <div className="glass-card p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-ocean-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">No Analytics Data</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
              Analytics will populate once your backend is connected and detection data starts flowing in. Charts, breakdowns, and AI insights will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4.5 h-4.5 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Detection Volume Over Time</h3>
              </div>
              <LineChart data={data.volume_over_time} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-5 font-display">Material Category Breakdown</h3>
                <DonutChart data={data.type_breakdown} centerValue={data.total_scans} />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {data.type_breakdown.map(item => (
                    <div key={item.type} className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-ocean-800/25 border border-ocean-600/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategory(item.type).color }} />
                        <span className="text-slate-300 font-semibold">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white">{item.count}</span>
                        <span className="text-xs text-slate-600 ml-1.5">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-5 font-display">Bin Placement Accuracy by Type</h3>
                <BarChart data={data.placement_accuracy} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
