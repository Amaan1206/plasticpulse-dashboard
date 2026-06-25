import { useState, useEffect } from 'react'
import { useCountUp } from '../hooks/useCountUp.js'
import DonutChart from '../components/charts/DonutChart.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import { FileBarChart, Share2, Download, ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Target, BarChart3, Inbox, ChevronDown, Calendar, MapPin } from 'lucide-react'

export default function AreaReport() {
  const [generated, setGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [beforeStart, setBeforeStart] = useState('')
  const [beforeEnd, setBeforeEnd] = useState('')
  const [afterStart, setAfterStart] = useState('')
  const [afterEnd, setAfterEnd] = useState('')
  const [report, setReport] = useState(null)

  const [areas, setAreas] = useState([])

  // Fetch available areas from API
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch('/api/areas')
        if (res.ok) {
          const json = await res.json()
          setAreas(json)
        }
      } catch {
        // Server not available
      }
    }
    fetchAreas()
  }, [])

  const handleGenerate = async () => {
    if (!selectedArea || !beforeStart || !beforeEnd || !afterStart || !afterEnd) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/reports/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: selectedArea,
          before: { start: beforeStart, end: beforeEnd },
          after: { start: afterStart, end: afterEnd }
        })
      })
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch {
      // Server not available
    }
    setIsLoading(false)
    setGenerated(true)
  }

  const shareWhatsApp = () => {
    if (!report) return
    const improvementPct = ((report.after.correct_pct - report.before.correct_pct) / report.before.correct_pct * 100).toFixed(1)
    const text = `📊 WasteWise Area Impact Report\n\n${report.area}\n✅ Wrong placements reduced by ${improvementPct}%\n♻️ ${report.after.total_scans} scans in after period\n🌱 Score improved from ${report.before.sustainability_score} to ${report.after.sustainability_score}\n\nPowered by WasteWise`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-iris-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 glass-card p-7">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-jade-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FileBarChart className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-display">Area Impact Report</h2>
            <p className="text-sm text-slate-400 font-medium">Compare waste metrics across two time periods</p>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="relative z-10 glass-card p-8">
        {!generated ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-white/40 border border-white/50 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-iris-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Target className="w-12 h-12 text-slate-400 relative z-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 font-display">Generate a Before / After Report</h3>
            <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto font-medium">Select an area and two time periods to measure the real-world impact of cleanup drives, awareness campaigns, or new bin deployments.</p>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 max-w-4xl mx-auto w-full">
              <div className="text-left flex-[1.2] min-w-[200px] w-full">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" /> Area / Ward
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                    className="w-full bg-ocean-900/40 border border-ocean-700/30 rounded-xl pl-4 pr-10 py-3 text-slate-100 text-sm focus:border-teal-500/40 focus:outline-none transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-ocean-950 text-slate-400">Select area...</option>
                    {areas.length > 0 ? (
                      areas.map(a => <option key={a} value={a} className="bg-ocean-950 text-slate-200">{a}</option>)
                    ) : (
                      <option value="" disabled className="bg-ocean-950 text-slate-500">Connect backend...</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="text-left flex-[1.4] min-w-[240px] w-full">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" /> Before Period
                </label>
                <div className="flex items-center gap-2 bg-ocean-900/40 border border-ocean-700/30 rounded-xl p-1.5 focus-within:border-teal-500/40 transition-all">
                  <input
                    type="date"
                    value={beforeStart}
                    onChange={e => setBeforeStart(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 text-slate-200 text-xs focus:outline-none font-medium p-1 cursor-pointer"
                  />
                  <span className="text-slate-600 text-xs font-bold px-0.5 shrink-0">to</span>
                  <input
                    type="date"
                    value={beforeEnd}
                    onChange={e => setBeforeEnd(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 text-slate-200 text-xs focus:outline-none font-medium p-1 cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-left flex-[1.4] min-w-[240px] w-full">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                  <Calendar className="w-3.5 h-3.5 text-iris-400" /> After Period
                </label>
                <div className="flex items-center gap-2 bg-ocean-900/40 border border-ocean-700/30 rounded-xl p-1.5 focus-within:border-iris-500/40 transition-all">
                  <input
                    type="date"
                    value={afterStart}
                    onChange={e => setAfterStart(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 text-slate-200 text-xs focus:outline-none font-medium p-1 cursor-pointer"
                  />
                  <span className="text-slate-600 text-xs font-bold px-0.5 shrink-0">to</span>
                  <input
                    type="date"
                    value={afterEnd}
                    onChange={e => setAfterEnd(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 text-slate-200 text-xs focus:outline-none font-medium p-1 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-end flex-[1] min-w-[160px] w-full">
                <Button onClick={handleGenerate} variant="glass" className="w-full">Generate Report</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {!report ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/40 border border-white/50 flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-ocean-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">No Report Data Available</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto font-medium leading-relaxed mb-6">
                  Report generation requires a connected backend with historical detection data. Once your API is live, before/after comparisons, charts, and insights will appear here.
                </p>
                <button onClick={() => setGenerated(false)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/40 text-slate-400 font-bold text-sm hover:bg-white/50 transition-all border border-white/50">
                  ← Back to Generator
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Report Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-800 font-display">{report.area}</h3>
                    <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
                      <span className="flex items-center gap-2 bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Before: {report.before.start} → {report.before.end}
                      </span>
                      <span className="flex items-center gap-2 bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        After: {report.after.start} → {report.after.end}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={shareWhatsApp} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 text-violet-500 text-sm font-bold hover:bg-violet-500/15 transition-all border border-violet-400/15">
                      <Share2 className="w-4 h-4" /> WhatsApp
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/40 text-slate-400 text-sm font-bold hover:bg-white/50 transition-all border border-white/50">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>

                {/* Headline Metric */}
                {(() => {
                  const isImproved = report.after.correct_pct > report.before.correct_pct
                  const improvementPct = ((report.after.correct_pct - report.before.correct_pct) / report.before.correct_pct * 100).toFixed(1)
                  return (
                    <div className={`p-10 rounded-3xl border text-center relative overflow-hidden ${isImproved ? 'bg-violet-500/5 border-violet-400/15' : 'bg-terracotta-400/5 border-terracotta-400/15'}`}>
                      <div className="relative z-10">
                        <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 ${isImproved ? 'text-violet-500' : 'text-terracotta-500'}`}>
                          {isImproved ? 'Improvement Detected' : 'Decline Detected'}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                          {isImproved ? <TrendingUp className="w-12 h-12 text-violet-500" /> : <TrendingDown className="w-12 h-12 text-terracotta-500" />}
                          <span className={`font-mono text-7xl font-bold ${isImproved ? 'text-violet-500' : 'text-terracotta-500'}`}>
                            {isImproved ? '+' : '-'}{Math.abs(improvementPct)}%
                          </span>
                        </div>
                        <p className="text-lg text-slate-800 mt-3 font-semibold">Correct segregation rate {isImproved ? 'improved' : 'declined'} in {report.area}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Comparison Donuts */}
                {report.before_breakdown && report.after_breakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                      <h4 className="text-sm font-bold text-slate-400 mb-4 text-center uppercase tracking-[0.15em]">Before — Category Breakdown</h4>
                      <DonutChart data={report.before_breakdown} centerValue={report.before.total_scans} centerLabel="Total Scans" />
                    </div>
                    <div className="glass-card p-6">
                      <h4 className="text-sm font-bold text-violet-500 mb-4 text-center uppercase tracking-[0.15em]">After — Category Breakdown</h4>
                      <DonutChart data={report.after_breakdown} centerValue={report.after.total_scans} centerLabel="Total Scans" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
