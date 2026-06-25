import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useCountUp } from '../hooks/useCountUp.js'
import StatCard from '../components/common/StatCard.jsx'
import Badge from '../components/common/Badge.jsx'
import { Building2, Clock, CheckCircle2, AlertTriangle, ArrowUpDown, ChevronRight, X, MapPin, Inbox } from 'lucide-react'

const wardGeoJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Bandra West", zone: "H-West" }, geometry: { type: "Polygon", coordinates: [[[72.82, 19.04], [72.84, 19.04], [72.84, 19.09], [72.82, 19.09], [72.82, 19.04]]] } },
    { type: "Feature", properties: { name: "Juhu", zone: "K-West" }, geometry: { type: "Polygon", coordinates: [[[72.84, 19.04], [72.88, 19.04], [72.88, 19.07], [72.84, 19.07], [72.84, 19.04]]] } },
    { type: "Feature", properties: { name: "Versova", zone: "K-West" }, geometry: { type: "Polygon", coordinates: [[[72.88, 19.07], [72.92, 19.07], [72.92, 19.11], [72.88, 19.11], [72.88, 19.07]]] } },
    { type: "Feature", properties: { name: "Powai", zone: "S" }, geometry: { type: "Polygon", coordinates: [[[72.88, 19.04], [72.92, 19.04], [72.92, 19.07], [72.88, 19.07], [72.88, 19.04]]] } },
    { type: "Feature", properties: { name: "Andheri East", zone: "K-East" }, geometry: { type: "Polygon", coordinates: [[[72.84, 19.08], [72.88, 19.08], [72.88, 19.12], [72.84, 19.12], [72.84, 19.08]]] } },
    { type: "Feature", properties: { name: "Dadar", zone: "F-North" }, geometry: { type: "Polygon", coordinates: [[[72.82, 19.00], [72.86, 19.00], [72.86, 19.04], [72.82, 19.04], [72.82, 19.00]]] } },
    { type: "Feature", properties: { name: "Sion", zone: "F-South" }, geometry: { type: "Polygon", coordinates: [[[72.86, 19.00], [72.90, 19.00], [72.90, 19.04], [72.86, 19.04], [72.86, 19.00]]] } },
    { type: "Feature", properties: { name: "Mahim", zone: "F-North" }, geometry: { type: "Polygon", coordinates: [[[72.82, 18.96], [72.86, 18.96], [72.86, 19.00], [72.82, 19.00], [72.82, 18.96]]] } },
  ]
}

function WardMap({ wards, onWardSelect }) {
  const getWardData = (name) => wards.find(w => w.name === name)

  const getFillColor = (name) => {
    const ward = getWardData(name)
    if (!ward || ward.status === 'Not Integrated') return 'rgba(255,255,255,0.85)'
    const nodes = ward.nodes_deployed
    if (nodes >= 5) return '#6C5CE7'
    if (nodes >= 3) return '#7A68FF'
    if (nodes >= 1) return '#6C5CE7'
    return 'rgba(255,255,255,0.85)'
  }

  const getFillOpacity = (name) => {
    const ward = getWardData(name)
    if (!ward || ward.status === 'Not Integrated') return 0.05
    return 0.35
  }

  return (
    <GeoJSON
      data={wardGeoJSON}
      style={(feature) => ({
        fillColor: getFillColor(feature.properties.name),
        fillOpacity: getFillOpacity(feature.properties.name),
        color: 'rgba(108,92,231,0.12)',
        weight: 2,
        opacity: 0.6,
      })}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => onWardSelect(feature.properties.name),
          mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.5, weight: 3, color: '#6C5CE7' }) },
          mouseout: (e) => { e.target.setStyle({ fillOpacity: getFillOpacity(feature.properties.name), weight: 2, color: 'rgba(108,92,231,0.12)' }) }
        })
        const ward = getWardData(feature.properties.name)
        layer.bindTooltip(
          `<div style="font-family: Outfit, sans-serif; background: rgba(255,255,255,0.85); color: white; padding: 12px 16px; border-radius: 16px; border: 1px solid rgba(0,232,174,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <strong style="font-size: 14px;">${feature.properties.name}</strong><br/>
            <span style="color: #5A6A80; font-size: 11px;">${feature.properties.zone}</span><br/>
            <span style="color: #6C5CE7; font-size: 11px; font-weight: 600;">${ward?.nodes_deployed || 0} nodes deployed</span>
          </div>`,
          { direction: 'top', offset: [0, -10], className: 'custom-tooltip' }
        )
      }}
    />
  )
}

export default function Municipal() {
  const [selectedWard, setSelectedWard] = useState(null)
  const [sortField, setSortField] = useState('flagged_at')
  const [sortDir, setSortDir] = useState('desc')
  const [wardFilter, setWardFilter] = useState('')
  const [municipalData, setMunicipalData] = useState({ wards: [], response_log: [] })

  // Fetch municipal data from API
  useEffect(() => {
    const fetchMunicipal = async () => {
      try {
        const res = await fetch('/api/municipal')
        if (res.ok) {
          const json = await res.json()
          setMunicipalData(json)
        }
      } catch {
        // Server not available
      }
    }
    fetchMunicipal()
    const interval = setInterval(fetchMunicipal, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalWards = municipalData.wards.length
  const integratedWards = municipalData.wards.filter(w => w.status === 'Active').length
  const avgResponse = integratedWards > 0
    ? municipalData.wards.filter(w => w.avg_response_hours !== null).reduce((a, b) => a + b.avg_response_hours, 0) / integratedWards
    : 0
  const resolvedThisMonth = municipalData.response_log.filter(r => r.status === 'Resolved').length

  const animatedIntegrated = useCountUp(integratedWards, 1000)
  const animatedAvg = useCountUp(Math.round(avgResponse * 10) / 10, 1000)
  const animatedResolved = useCountUp(resolvedThisMonth, 1000)

  const selectedWardData = municipalData.wards.find(w => w.name === selectedWard)

  const filteredLog = municipalData.response_log
    .filter(r => !wardFilter || r.ward === wardFilter)
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const getResponseStatus = (time) => {
    if (time === 'Pending') return { color: 'text-slate-400', bg: 'bg-slate-500/8', label: 'Awaiting Service' }
    const hours = parseInt(time.split('h')[0])
    if (hours < 4) return { color: 'text-violet-500', bg: 'bg-violet-500/8', label: 'Fast' }
    if (hours <= 12) return { color: 'text-amber-500', bg: 'bg-amber-400/8', label: 'Moderate' }
    return { color: 'text-terracotta-500', bg: 'bg-terracotta-400/8', label: 'Slow' }
  }

  const hasData = totalWards > 0

  return (
    <div className="space-y-6 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-iris-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Wards Integrated" value={animatedIntegrated} suffix={totalWards > 0 ? ` / ${totalWards}` : ''} icon={Building2} color="teal" subtitle={hasData ? `${Math.round((integratedWards / totalWards) * 100)}% of city wards` : 'Awaiting backend data'} />
        <StatCard title="Avg Response Time" value={animatedAvg} suffix=" hrs" icon={Clock} color={avgResponse <= 4 ? 'mint' : avgResponse <= 8 ? 'sun' : 'rose'} subtitle="Time from overflow alert to servicing" />
        <StatCard title="Alerts Resolved This Month" value={animatedResolved} icon={CheckCircle2} color="iris" subtitle="Overflow bins cleared by municipal teams" />
      </div>

      <div className="relative z-10 glass-card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3 font-display">
          <MapPin className="w-5 h-5 text-violet-500" />
          Ward Coverage Map
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 rounded-2xl overflow-hidden border border-white/50">
            <MapContainer center={[19.04, 72.87]} zoom={12} scrollWheelZoom={false} className="w-full h-full" style={{ background: '#F4F2EE' }}>
              <TileLayer attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>' url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
              <WardMap wards={municipalData.wards} onWardSelect={setSelectedWard} />
            </MapContainer>
          </div>
          <div className="space-y-4">
            {selectedWardData ? (
              <div className="glass-card p-6 border-l-[3px] border-l-teal-500/40 animate-fade-in-up">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="font-bold text-slate-800 text-lg font-display">{selectedWardData.name}</h4>
                  <button onClick={() => setSelectedWard(null)} className="p-2 rounded-xl hover:bg-white/50 transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-medium">Zone</span><span className="text-slate-800 font-semibold">{selectedWardData.zone}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-medium">Nodes Deployed</span><span className="font-mono text-slate-800 font-bold">{selectedWardData.nodes_deployed}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-medium">Status</span><Badge color={selectedWardData.status === 'Active' ? 'teal' : selectedWardData.status === 'Pending' ? 'sun' : 'rose'}>{selectedWardData.status}</Badge></div>
                  {selectedWardData.avg_response_hours && <div className="flex justify-between text-sm"><span className="text-slate-400 font-medium">Avg Response</span><span className={`font-mono font-bold ${selectedWardData.avg_response_hours <= 4 ? 'text-violet-500' : selectedWardData.avg_response_hours <= 8 ? 'text-amber-500' : 'text-terracotta-500'}`}>{selectedWardData.avg_response_hours} hrs</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-medium">Overflows (7d)</span><span className="font-mono text-slate-800 font-bold">{selectedWardData.overflows_7d}</span></div>
                  <button onClick={() => { setWardFilter(selectedWardData.name); setSelectedWard(null) }} className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/30 hover:bg-white/40 text-slate-400 text-sm font-bold transition-all border border-white/50 hover:border-violet-200/30">
                    View Response Log <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center">
                <Building2 className="w-14 h-14 text-ocean-700 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">{hasData ? 'Click a ward on the map to view integration details' : 'Ward data will appear once your backend is connected'}</p>
              </div>
            )}
            <div className="glass-card p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Legend</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-teal-500/30 border border-violet-400/30" /><span className="text-slate-400 font-medium">5+ nodes</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-iris-500/30 border border-iris-500/40" /><span className="text-slate-400 font-medium">3-4 nodes</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-teal-400/15 border border-violet-300/20" /><span className="text-slate-400 font-medium">1-2 nodes</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-ocean-800 border border-ocean-600/30" /><span className="text-slate-400 font-medium">Not integrated</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Overflow Response Log</h3>
            <p className="text-sm text-slate-400 font-medium">Time between overflow alert and municipal servicing</p>
          </div>
          {wardFilter && <button onClick={() => setWardFilter('')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 text-slate-400 text-sm font-bold hover:bg-white/40 transition-all border border-white/50">Clear filter: {wardFilter}<X className="w-3.5 h-3.5" /></button>}
        </div>
        {filteredLog.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="w-12 h-12 text-ocean-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No response log entries</p>
            <p className="text-xs text-slate-500 mt-1">Overflow alerts and municipal response times will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/30">
                  {['Bin Location', 'Flagged At', 'Serviced At', 'Response Time', 'Ward', 'Status'].map((col) => (
                    <th key={col} onClick={() => handleSort(col.toLowerCase().replace(/ /g, '_'))} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] py-4 px-4 cursor-pointer hover:text-violet-500 transition-colors">
                      <div className="flex items-center gap-1.5">{col}<ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((row, i) => {
                  const status = getResponseStatus(row.response_time)
                  return (
                    <tr key={i} className="border-b border-white/25 hover:bg-white/30 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-800 font-semibold">{row.bin_location}</td>
                      <td className="py-4 px-4 text-sm text-slate-400 font-mono">{row.flagged_at}</td>
                      <td className="py-4 px-4 text-sm text-slate-400 font-mono">{row.serviced_at || <span className="flex items-center gap-1.5 text-amber-500"><AlertTriangle className="w-3 h-3" />Pending</span>}</td>
                      <td className="py-4 px-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.bg} ${status.color} border border-current/10`}>{row.response_time}</span></td>
                      <td className="py-4 px-4 text-sm text-slate-400 font-medium">{row.ward}</td>
                      <td className="py-4 px-4"><Badge color={row.status === 'Resolved' ? 'mint' : 'sun'} size="sm">{row.status}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
