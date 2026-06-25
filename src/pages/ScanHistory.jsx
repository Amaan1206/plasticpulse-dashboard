import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { History, Image, X, Filter, ChevronDown, Inbox, Scan, Cpu, Clock, Eye } from 'lucide-react'

const compositionColors = {
  plastic: { bg: 'bg-iris-500', text: 'text-iris-400', label: 'Plastic' },
  metal: { bg: 'bg-slate-400', text: 'text-slate-300', label: 'Metal' },
  organic: { bg: 'bg-teal-500', text: 'text-teal-400', label: 'Organic' },
  glass: { bg: 'bg-sun-400', text: 'text-sun-300', label: 'Glass' },
  other: { bg: 'bg-slate-600', text: 'text-slate-500', label: 'Other' },
}

const typeGradients = {
  PET: 'from-blue-500 to-teal-400',
  HDPE: 'from-teal-500 to-mint-400',
  PVC: 'from-rose-500 to-ember-400',
  LDPE: 'from-sun-500 to-sun-300',
  PP: 'from-iris-500 to-iris-300',
  PS: 'from-ember-500 to-sun-400',
  Other: 'from-slate-500 to-slate-400',
}

export default function ScanHistory() {
  const [scans, setScans] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [deviceFilter, setDeviceFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [imageModal, setImageModal] = useState(null) // scan id to show
  const [devices, setDevices] = useState([])
  const loadMoreRef = useRef(null)

  // Fetch history
  const fetchHistory = useCallback(async (page = 1, append = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (deviceFilter) params.set('device', deviceFilter)
      if (dateRange.start) params.set('start_date', dateRange.start)
      if (dateRange.end) params.set('end_date', dateRange.end)

      const res = await fetch(`/api/scans/history?${params}`)
      if (res.ok) {
        const data = await res.json()
        setScans(prev => append ? [...prev, ...data.scans] : data.scans)
        setPagination(data.pagination)
      }
    } catch {
      // Server not available
    }
    setIsLoading(false)
  }, [dateRange.end, dateRange.start, deviceFilter])

  // Fetch devices for filter
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch('/api/bins')
        if (res.ok) {
          const bins = await res.json()
          setDevices(bins.map(b => ({ id: b.device_id, name: b.location_name || b.device_id })))
        }
      } catch {}
    }
    fetchDevices()
  }, [])

  useEffect(() => {
    fetchHistory(1, false)
  }, [fetchHistory])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && pagination.page < pagination.totalPages) {
          fetchHistory(pagination.page + 1, true)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [isLoading, pagination, fetchHistory])

  return (
    <div className="space-y-6 page-transition">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-iris-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Scan History</h1>
          <p className="text-sm text-slate-500 mt-1">
            {pagination.total} scans recorded — each stored as a permanent log
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              showFilters
                ? 'bg-iris-500/10 text-iris-400 border border-iris-500/20'
                : 'bg-ocean-800/40 text-slate-400 border border-ocean-600/10 hover:bg-ocean-700/40 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="relative z-10 glass-card p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs text-slate-500 font-bold mb-1.5 block">Device</label>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-ocean-800/60 text-white text-sm px-4 py-2.5 rounded-xl border border-ocean-600/15 focus:outline-none focus:border-iris-500/30 min-w-[200px]"
              >
                <option value="">All Devices</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-bold mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                max={dateRange.end || undefined}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-ocean-800/60 text-white text-sm px-4 py-2.5 rounded-xl border border-ocean-600/15 focus:outline-none focus:border-iris-500/30 min-w-[180px]"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-bold mb-1.5 block">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                min={dateRange.start || undefined}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-ocean-800/60 text-white text-sm px-4 py-2.5 rounded-xl border border-ocean-600/15 focus:outline-none focus:border-iris-500/30 min-w-[180px]"
              />
            </div>
            {(deviceFilter || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setDeviceFilter('')
                  setDateRange({ start: '', end: '' })
                }}
                className="mt-5 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/15 hover:bg-rose-500/15 transition-all"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative z-10 space-y-3">
        {scans.length === 0 && !isLoading ? (
          <div className="glass-card flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-ocean-800/40 flex items-center justify-center mb-4 border border-ocean-600/10">
              <Inbox className="w-7 h-7 text-slate-700" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No scans recorded yet</p>
            <p className="text-xs text-slate-700 mt-1">Scans will appear here as permanent logs once your ESP32 starts detecting</p>
          </div>
        ) : (
          scans.map((scan, index) => (
            <ScanLogEntry
              key={scan.id}
              scan={scan}
              index={index}
              onViewImage={() => setImageModal(scan.id)}
            />
          ))
        )}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <div className="w-5 h-5 border-2 border-iris-500/30 border-t-iris-400 rounded-full animate-spin" />
              Loading scans...
            </div>
          )}
          {!isLoading && pagination.page >= pagination.totalPages && scans.length > 0 && (
            <p className="text-xs text-slate-700">All {pagination.total} scans loaded</p>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModal && (
        <ImageModal scanId={imageModal} onClose={() => setImageModal(null)} />
      )}
    </div>
  )
}

function ScanLogEntry({ scan, index, onViewImage }) {
  const gradient = typeGradients[scan.plastic_type] || typeGradients.Other
  const composition = scan.composition || {}
  const hasComposition = Object.keys(composition).length > 0
  const confidence = Math.round((scan.confidence || 0) * 100)

  return (
    <div className={`glass-card p-5 relative overflow-hidden detection-card-enter stagger-${Math.min(index + 1, 5)}`}>
      {/* Timeline accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b ${gradient}`} />

      <div className="relative z-10 pl-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-ocean-950/50 flex-shrink-0`}>
              <span className="text-xl font-bold text-white font-mono">#{scan.resin_code || '?'}</span>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-[15px]">{scan.plastic_type || 'Unknown'} Plastic</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {format(new Date(scan.timestamp), 'MMM d, yyyy · h:mm a')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-slate-600" />
                  {scan.device_id}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                {formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scan.has_image && (
              <button
                onClick={onViewImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-iris-500/10 text-iris-400 text-xs font-bold border border-iris-500/15 hover:bg-iris-500/15 transition-all"
              >
                <Eye className="w-3 h-3" />
                View Image
              </button>
            )}
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              scan.correct_bin
                ? 'bg-teal-500/8 text-teal-400 border-teal-500/15'
                : 'bg-rose-500/8 text-rose-400 border-rose-500/15'
            }`}>
              {scan.correct_bin ? '✓ Correct' : '✗ Wrong Bin'}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>Confidence: <span className="text-white font-bold">{confidence}%</span></span>
          {scan.fill_level_pct != null && (
            <span>Fill Level: <span className="text-white font-bold">{scan.fill_level_pct}%</span></span>
          )}
          {scan.location_name && (
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              {scan.location_name}
            </span>
          )}
          {scan.contaminated && (
            <span className="text-rose-400 font-bold">⚠ Contaminated</span>
          )}
        </div>

        <div className="mt-4">
          {scan.has_image ? (
            <button
              onClick={onViewImage}
              className="group relative w-full sm:w-[220px] aspect-[16/10] rounded-2xl overflow-hidden border border-ocean-600/15 bg-ocean-900/60"
            >
              <img
                src={`/api/scans/${scan.id}/image`}
                alt={`${scan.plastic_type || 'Plastic'} scan`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ocean-950 via-ocean-950/65 to-transparent px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-white font-semibold">Captured Image</span>
                <span className="text-iris-300 font-bold">Open</span>
              </div>
            </button>
          ) : (
            <div className="w-full sm:w-[220px] aspect-[16/10] rounded-2xl border border-dashed border-ocean-600/20 bg-ocean-900/35 flex flex-col items-center justify-center text-slate-600">
              <Image className="w-7 h-7 mb-2 text-ocean-700" />
              <span className="text-xs font-semibold">No image captured</span>
            </div>
          )}
        </div>

        {/* Composition breakdown */}
        {hasComposition && (
          <div className="mt-4 pt-4 border-t border-ocean-700/15">
            <p className="text-xs text-slate-600 font-bold mb-2 tracking-wide">COMPOSITION</p>
            
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden bg-ocean-800/40 mb-3">
              {Object.entries(composition)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
                  <div
                    key={key}
                    className={`${compositionColors[key]?.bg || 'bg-slate-500'} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                    title={`${compositionColors[key]?.label || key}: ${value}%`}
                  />
                ))
              }
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              {Object.entries(composition)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => {
                  const color = compositionColors[key] || { bg: 'bg-slate-500', text: 'text-slate-400', label: key }
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                      <span className={`text-xs ${color.text} font-semibold`}>
                        {color.label}: {value}%
                      </span>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ImageModal({ scanId, onClose }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
    setImageUrl(`/api/scans/${scanId}/image`)
  }, [scanId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm" />
      <div
        className="relative z-10 glass-card p-2 max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-xl bg-ocean-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-ocean-600/15"
        >
          <X className="w-4 h-4" />
        </button>
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 px-10">
            <Image className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm text-slate-500 font-semibold">No image available</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Scan capture"
            className="w-full h-auto rounded-xl"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  )
}
