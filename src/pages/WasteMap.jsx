import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { Search, Layers, MapPin, Trash2, Users, Flame, Navigation, Crosshair, Inbox } from 'lucide-react'
import { useBinStatus } from '../hooks/useBinStatus.js'

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

export default function WasteMap() {
  const { bins } = useBinStatus()
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
    { key: 'heatmap', label: 'Plastic Heatmap', icon: Flame, color: 'rose', activeClasses: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { key: 'drives', label: 'Drive Locations', icon: Users, color: 'sun', activeClasses: 'bg-sun-500/10 text-sun-400 border-sun-500/20' },
  ]

  const dotColors = {
    teal: 'bg-teal-400',
    rose: 'bg-rose-400',
    sun: 'bg-sun-400',
  }

  return (
    <div className="relative w-full h-[calc(100vh-4.25rem)]">
      {/* Search Bar */}
      <div className="absolute top-5 left-5 z-[1000] w-96">
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
                    <span className="text-teal-400 font-semibold">{bin.top_plastic_type}</span>
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
    </div>
  )
}
