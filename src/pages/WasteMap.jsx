import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { Search, MapPin, Trash2, Users, Flame, Inbox, Map as MapIcon, Building2, Clock, CheckCircle2, AlertTriangle, ArrowUpDown, ChevronRight, X } from 'lucide-react'
import { useBinStatus } from '../hooks/useBinStatus.js'
import { useCountUp } from '../hooks/useCountUp.js'
import StatCard from '../components/common/StatCard.jsx'
import Badge from '../components/common/Badge.jsx'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function MapFlyTo({ lat, lng, zoom }) {
  const map = useMap()
  useMemo(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom || 14, { duration: 1.5 })
    }
  }, [lat, lng, zoom, map])
  return null
}

// Renders a leaflet.heat heatmap layer on the map
// Points format: [[lat, lng, intensity], ...]
function HeatmapLayer({ points, visible }) {
  const map = useMap()

  useEffect(() => {
    if (!visible || !points || points.length === 0) return

    const heatLayer = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 16,
      max: 1.0,
      minOpacity: 0.35,
      gradient: {
        0.2: '#7A68FF',
        0.4: '#00E8AE',
        0.6: '#FFC81A',
        0.8: '#FF853D',
        1.0: '#FF5C85',
      },
    })

    heatLayer.addTo(map)
    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points, visible])

  return null
}

// ─── Ward Coverage (absorbed from former Municipal page) ────────────────
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

function WardCoverage() {
  const [selectedWard, setSelectedWard] = useState(null)
  const [sortField, setSortField] = useState('flagged_at')
  const [sortDir, setSortDir] = useState('desc')
  const [wardFilter, setWardFilter] = useState('')
  const [municipalData, setMunicipalData] = useState({ wards: [], response_log: [] })

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Wards Integrated" value={animatedIntegrated} suffix={totalWards > 0 ? ` / ${totalWards}` : ''} icon={Building2} color="teal" subtitle={hasData ? `${Math.round((integratedWards / totalWards) * 100)}% of city wards` : 'Awaiting backend data'} />
        <StatCard title="Avg Response Time" value={animatedAvg} suffix=" hrs" icon={Clock} color={avgResponse <= 4 ? 'mint' : avgResponse <= 8 ? 'sun' : 'rose'} subtitle="Time from overflow alert to servicing" />
        <StatCard title="Alerts Resolved This Month" value={animatedResolved} icon={CheckCircle2} color="iris" subtitle="Overflow bins cleared by municipal teams" />
      </div>

      <div className="glass-card p-6">
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

      <div className="glass-card p-6">
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

// ─── Page ───────────────────────────────────────────────────────────────
export default function WasteMap() {
  const { bins } = useBinStatus()
  const [view, setView] = useState('map') // 'map' | 'wards'
  const [layers, setLayers] = useState({ bins: true, heatmap: true, drives: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [flyTo, setFlyTo] = useState(null)

  const [drives, setDrives] = useState([])
  const [heatmapPoints, setHeatmapPoints] = useState([])

  // Fetch drives and heatmap from API
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [drivesRes, heatRes] = await Promise.all([
          fetch('/api/drives'),
          fetch('/api/heatmap'),
        ])
        if (drivesRes.ok) {
          const drivesData = await drivesRes.json()
          setDrives(drivesData)
        }
        if (heatRes.ok) {
          const heatData = await heatRes.json()
          if (heatData.points) {
            setHeatmapPoints(heatData.points.map(p => [p.lat, p.lng, p.intensity]))
          }
        }
      } catch {
        // Server not available
      }
    }
    fetchMapData()
    const interval = setInterval(fetchMapData, 30000)
    return () => clearInterval(interval)
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return [
      ...bins.filter(b => b.location_name?.toLowerCase().includes(query)),
      ...drives.filter(d => d.area?.toLowerCase().includes(query) || d.title?.toLowerCase().includes(query))
    ].slice(0, 5)
  }, [searchQuery, bins, drives])

  const handleSearchSelect = (item) => {
    setFlyTo({ lat: item.lat, lng: item.lng, zoom: 15 })
    setSearchQuery('')
  }

  const binColor = (fill) => {
    if (fill >= 90) return '#FF5C85'
    if (fill >= 70) return '#FFC81A'
    return '#00E8AE'
  }

  const layerConfig = [
    { key: 'bins', label: 'Bin Markers', icon: Trash2, color: 'teal', activeClasses: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { key: 'heatmap', label: 'Waste Heatmap', icon: Flame, color: 'rose', activeClasses: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { key: 'drives', label: 'Drive Locations', icon: Users, color: 'sun', activeClasses: 'bg-sun-500/10 text-sun-400 border-sun-500/20' },
  ]

  const dotColors = {
    teal: 'bg-teal-400',
    rose: 'bg-rose-400',
    sun: 'bg-sun-400',
  }

  const viewTabs = [
    { key: 'map', label: 'Map View', icon: MapIcon },
    { key: 'wards', label: 'Ward Coverage', icon: Building2 },
  ]

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      {/* View toggle — floating top center */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1100]">
        <div className="flex items-center bg-ocean-900/90 backdrop-blur-2xl rounded-2xl p-1 border border-ocean-600/20 shadow-2xl">
          {viewTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                view === t.key ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'wards' ? (
        <div className="absolute inset-0 overflow-auto p-6 lg:p-8 pt-24">
          <div className="max-w-[1400px] mx-auto">
            <WardCoverage />
          </div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="absolute top-5 left-5 z-[1000] w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search area or ward..."
                className="w-full pl-11 pr-4 py-3.5 bg-ocean-900/90 backdrop-blur-2xl border border-ocean-600/20 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/30 focus:shadow-glow-teal transition-all shadow-2xl font-medium"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-ocean-900/95 backdrop-blur-2xl border border-ocean-600/20 rounded-2xl overflow-hidden shadow-2xl">
                  {searchResults.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full text-left px-5 py-3.5 hover:bg-ocean-800/40 transition-colors flex items-center gap-3 border-b border-ocean-700/10 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.location_name || item.title}</p>
                        <p className="text-xs text-slate-500">{item.area || `Fill: ${item.fill_level_pct}%`}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Layer Toggle Panel */}
          <div className="absolute top-5 right-5 z-[1000]">
            <div className="bg-ocean-900/90 backdrop-blur-2xl border border-ocean-600/20 rounded-2xl p-4 space-y-1.5 min-w-[190px] shadow-2xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Map Layers</p>
              {layerConfig.map(layer => (
                <button
                  key={layer.key}
                  onClick={() => setLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key] }))}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 border ${
                    layers[layer.key]
                      ? layer.activeClasses
                      : 'bg-transparent text-slate-600 border-transparent hover:bg-ocean-800/30'
                  }`}
                >
                  <layer.icon className="w-4 h-4" />
                  {layer.label}
                  {layers[layer.key] && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${dotColors[layer.color]}`} />}
                </button>
              ))}
            </div>
          </div>

          {/* No data overlay */}
          {bins.length === 0 && drives.length === 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
              <div className="bg-ocean-900/90 backdrop-blur-2xl border border-ocean-600/20 rounded-3xl p-10 text-center shadow-2xl pointer-events-auto max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-5">
                  <Inbox className="w-8 h-8 text-ocean-700" />
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-2">No Map Data</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Bins, drives, and heatmap data will appear on the map once your backend is connected.</p>
              </div>
            </div>
          )}

          {/* Map */}
          <MapContainer center={[19.0760, 72.8777]} zoom={13} scrollWheelZoom={true} className="w-full h-full" style={{ background: '#060A14' }}>
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
            {flyTo && <MapFlyTo {...flyTo} />}

            {/* Heatmap Layer — renders when backend provides heatmapPoints */}
            <HeatmapLayer points={heatmapPoints} visible={layers.heatmap} />

            {layers.bins && bins.map(bin => (
              <CircleMarker key={bin.id} center={[bin.lat, bin.lng]} radius={8 + bin.fill_level_pct / 15}
                fillColor={binColor(bin.fill_level_pct)} color={binColor(bin.fill_level_pct)} fillOpacity={0.6} weight={2} opacity={0.8}
                eventHandlers={{ click: () => setFlyTo({ lat: bin.lat, lng: bin.lng, zoom: 15 }) }}
              >
                <Popup>
                  <div className="bg-ocean-900/95 backdrop-blur-xl text-white p-5 min-w-[240px] rounded-2xl border border-ocean-600/20 shadow-2xl">
                    <h4 className="font-bold text-[15px] mb-4 font-display">{bin.location_name}</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Fill Level</span>
                        <span className="font-mono font-bold" style={{ color: binColor(bin.fill_level_pct) }}>{bin.fill_level_pct}%</span>
                      </div>
                      <div className="h-2 bg-ocean-800/60 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                        <div className="h-full rounded-full transition-all relative overflow-hidden" style={{ width: `${bin.fill_level_pct}%`, backgroundColor: binColor(bin.fill_level_pct) }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Most Common</span>
                        <span className="text-teal-400 font-semibold">{bin.most_detected_category}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {layers.drives && drives.filter(d => d.status !== 'complete').map(drive => (
              <Marker key={drive.id} position={[drive.lat, drive.lng]}>
                <Popup>
                  <div className="bg-ocean-900/95 backdrop-blur-xl text-white p-5 min-w-[260px] rounded-2xl border border-ocean-600/20 shadow-2xl">
                    <h4 className="font-bold text-[15px] mb-4 font-display">{drive.title}</h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Area</span><span className="font-medium">{drive.area}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Collected</span><span className="font-mono font-bold text-teal-400">{drive.collected_kg} / {drive.target_kg} kg</span></div>
                      <div className="h-2 bg-ocean-800/60 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-iris-500 rounded-full relative overflow-hidden" style={{ width: `${(drive.collected_kg / drive.target_kg) * 100}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                      </div>
                      <div className="flex justify-between"><span className="text-slate-400">Participants</span><span className="font-medium">{drive.participant_count}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-medium">{drive.date}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
    </div>
  )
}
