import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../context/WebSocketContext.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { useBinStatus } from '../hooks/useBinStatus.js'
import StatCard from '../components/common/StatCard.jsx'
import DetectionCard from '../components/common/DetectionCard.jsx'
import BinStatusPill from '../components/common/BinStatusPill.jsx'
import ScanProgressOverlay from '../components/common/ScanProgressOverlay.jsx'
import { Pause, Play, Radio, RefreshCw, WifiOff, Scan, Recycle, Layers, Zap, Inbox, Camera, Settings, Check, X } from 'lucide-react'

// Build a usable MJPEG stream URL from either a full URL or a bare ESP32 IP.
function resolveStreamUrl(input) {
  if (!input) return ''
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}:81/stream`
}

export default function LiveFeed() {
  const { status, detections, scanProgress, cameraStreamUrl, setCameraStreamUrl } = useWebSocket()
  const { bins } = useBinStatus()
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [draftUrl, setDraftUrl] = useState(cameraStreamUrl || '')
  const [streamError, setStreamError] = useState(false)
  const feedRef = useRef(null)

  const totalItems = detections.length
  const recyclableCount = detections.filter(d => d.handling_action === 'Recycle').length
  const recyclableRate = totalItems > 0 ? Math.round((recyclableCount / totalItems) * 100) : 0
  const activeCategories = new Set(detections.map(d => d.material_category).filter(Boolean)).size

  const animatedItems = useCountUp(totalItems, 2000)
  const animatedRate = useCountUp(recyclableRate, 2000)
  const animatedCategories = useCountUp(activeCategories, 2000)

  const streamUrl = resolveStreamUrl(cameraStreamUrl)
  const activeScanCount = Object.keys(scanProgress || {}).length

  useEffect(() => {
    const timer = setInterval(() => setLastUpdate(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setStreamError(false)
  }, [cameraStreamUrl])

  const saveCameraUrl = () => {
    setCameraStreamUrl(draftUrl.trim())
    setShowSettings(false)
  }

  const displayedDetections = isPaused ? detections.slice(0, 5) : detections.slice(0, 50)

  const statusConfig = {
    live: { icon: Radio, color: 'text-teal-400', label: 'Live WebSocket', dot: 'bg-teal-400', glow: 'shadow-glow-teal' },
    polling: { icon: RefreshCw, color: 'text-iris-400', label: 'Polling Fallback', dot: 'bg-iris-400', glow: 'shadow-glow-iris' },
    offline: { icon: WifiOff, color: 'text-rose-400', label: 'Disconnected', dot: 'bg-rose-400', glow: 'shadow-glow-rose' },
    connecting: { icon: RefreshCw, color: 'text-slate-400', label: 'Connecting...', dot: 'bg-slate-400', glow: '' },
  }

  const currentStatus = statusConfig[status] || statusConfig.connecting
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-6 page-transition">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/[0.03] rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-iris-500/[0.03] rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Live Camera View */}
      <div className="relative z-10 glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ocean-700/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-iris-500/10 flex items-center justify-center">
              <Camera className="w-4.5 h-4.5 text-iris-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Camera View</h3>
              <p className="text-xs text-slate-500">ESP32-S3 camera stream</p>
            </div>
          </div>
          <button
            onClick={() => { setDraftUrl(cameraStreamUrl || ''); setShowSettings(s => !s) }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
              showSettings
                ? 'bg-iris-500/10 text-iris-400 border-iris-500/20'
                : 'bg-ocean-800/40 text-slate-400 border-ocean-600/10 hover:bg-ocean-700/40 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Camera Settings
          </button>
        </div>

        {showSettings && (
          <div className="p-5 border-b border-ocean-700/15 bg-ocean-800/15">
            <label className="block text-xs font-bold text-slate-400 mb-2">ESP32 Camera IP or Stream URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={draftUrl}
                onChange={e => setDraftUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveCameraUrl()}
                placeholder="e.g. 192.168.1.42  or  http://192.168.1.42:81/stream"
                className="flex-1 bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-iris-500/30 transition-colors font-medium"
              />
              <button onClick={saveCameraUrl} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 text-sm font-bold border border-teal-500/15 hover:bg-teal-500/15 transition-all">
                <Check className="w-4 h-4" /> Save
              </button>
              {cameraStreamUrl && (
                <button onClick={() => { setCameraStreamUrl(''); setDraftUrl(''); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-bold border border-rose-500/15 hover:bg-rose-500/15 transition-all">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-2">A bare IP is expanded to <span className="font-mono text-slate-500">http://&lt;ip&gt;:81/stream</span> (default ESP32-S3 MJPEG port).</p>
          </div>
        )}

        <div className="relative aspect-video bg-ocean-950/60 flex items-center justify-center overflow-hidden">
          {streamUrl && !streamError ? (
            <img
              src={streamUrl}
              alt="ESP32 live camera feed"
              className="w-full h-full object-cover"
              onError={() => setStreamError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-3xl bg-ocean-800/50 border border-ocean-600/15 flex items-center justify-center">
                  <Camera className="w-9 h-9 text-iris-400/70" />
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-iris-500/15 animate-ping" style={{ animationDuration: '2.5s' }} />
              </div>
              <p className="text-sm font-bold text-slate-400">
                {streamError ? 'Camera stream unavailable' : 'Waiting for ESP32 camera…'}
              </p>
              <p className="text-xs text-slate-600 mt-1.5 max-w-xs">
                {streamError
                  ? 'Check that the ESP32 is powered on and reachable on your network.'
                  : 'Add your ESP32 camera IP in Camera Settings to view the live feed.'}
              </p>
            </div>
          )}

          {/* Scan progress overlaid prominently on the camera feed */}
          {activeScanCount > 0 && (
            <div className="absolute inset-0 bg-ocean-950/55 backdrop-blur-sm flex items-center justify-center p-5">
              <div className="w-full max-w-xl">
                <ScanProgressOverlay scanProgress={scanProgress} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Stats Bar */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Items"
          value={animatedItems}
          icon={Scan}
          color="teal"
          subtitle="Items detected across all ESP32 nodes"
          trend={totalItems > 0 ? 'up' : undefined}
          trendValue={totalItems > 0 ? '12%' : undefined}
        />
        <StatCard
          title="Recyclable Rate"
          value={animatedRate}
          suffix="%"
          icon={Recycle}
          color={recyclableRate >= 80 ? 'mint' : recyclableRate >= 60 ? 'sun' : 'rose'}
          subtitle={totalItems === 0 ? 'Awaiting data' : recyclableRate >= 80 ? 'Excellent recyclable stream' : recyclableRate >= 60 ? 'Room to improve' : 'High non-recyclable share'}
        />
        <StatCard
          title="Active Categories"
          value={animatedCategories}
          suffix=" / 9"
          icon={Layers}
          color="iris"
          subtitle="Distinct waste categories seen"
        />
      </div>

      {/* Bin Status Strip */}
      <div className="relative z-10 glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bin Status Overview</h3>
              <p className="text-xs text-slate-500">Real-time fill levels across Mumbai</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-600 font-mono bg-ocean-800/40 px-3 py-1.5 rounded-xl border border-ocean-600/10">Updated {lastUpdate}s ago</span>
        </div>
        {bins.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {bins.map(bin => (
              <BinStatusPill key={bin.id} bin={bin} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600">
            <Inbox className="w-10 h-10 text-ocean-700 mb-3" />
            <p className="text-sm font-semibold text-slate-500">No bins connected</p>
            <p className="text-xs text-slate-700 mt-1">Bin data will appear here once your backend is connected</p>
          </div>
        )}
      </div>

      {/* Live Detection Feed */}
      <div className="relative z-10 glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ocean-700/15">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${currentStatus.dot} ${status === 'live' ? 'animate-pulse' : ''}`} />
                {status === 'live' && <div className={`absolute inset-0 rounded-full ${currentStatus.dot} animate-ring-pulse`} />}
              </div>
              <h3 className="text-lg font-bold text-white font-display">Live Detections</h3>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ocean-800/40 border border-ocean-600/10 ${currentStatus.glow}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${currentStatus.color}`} />
              <span className={`text-xs font-bold ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              isPaused
                ? 'bg-iris-500/10 text-iris-400 border border-iris-500/20 hover:bg-iris-500/15'
                : 'bg-ocean-800/40 text-slate-400 border border-ocean-600/10 hover:bg-ocean-700/40 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume Feed' : 'Pause Feed'}
          </button>
        </div>

        <div ref={feedRef} className="p-5 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {displayedDetections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <div className="w-16 h-16 rounded-2xl bg-ocean-800/40 flex items-center justify-center mb-4 border border-ocean-600/10">
                <WifiOff className="w-7 h-7 text-slate-700" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No detections yet</p>
              <p className="text-xs text-slate-700 mt-1">Connect your backend to start receiving live scan data</p>
            </div>
          ) : (
            displayedDetections.map((detection, index) => (
              <DetectionCard key={detection.id} detection={detection} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
