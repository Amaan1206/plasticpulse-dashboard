import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../context/WebSocketContext.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { useBinStatus } from '../hooks/useBinStatus.js'
import StatCard from '../components/common/StatCard.jsx'
import DetectionCard from '../components/common/DetectionCard.jsx'
import BinStatusPill from '../components/common/BinStatusPill.jsx'
import ScanProgressOverlay from '../components/common/ScanProgressOverlay.jsx'
import { Pause, Play, Radio, RefreshCw, WifiOff, Scan, TrendingUp, Weight, Zap, Inbox } from 'lucide-react'

export default function LiveFeed() {
  const { status, detections, scanProgress } = useWebSocket()
  const { bins } = useBinStatus()
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(0)
  const feedRef = useRef(null)

  const totalScans = detections.length
  const correctCount = detections.filter(d => d.correct_bin).length
  const correctRate = totalScans > 0 ? Math.round((correctCount / totalScans) * 100) : 0
  const kgRecorded = (totalScans * 0.15).toFixed(1)

  const animatedScans = useCountUp(totalScans, 2000)
  const animatedRate = useCountUp(correctRate, 2000)
  const animatedKg = useCountUp(parseFloat(kgRecorded), 2000)

  useEffect(() => {
    const timer = setInterval(() => setLastUpdate(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

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

      {/* Top Stats Bar */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          title="Total Scans Today" 
          value={animatedScans} 
          icon={Scan}
          color="teal"
          subtitle="Across all ESP32 nodes and mobile scans"
          trend={totalScans > 0 ? 'up' : undefined}
          trendValue={totalScans > 0 ? '12%' : undefined}
        />
        <StatCard 
          title="Correct Segregation Rate" 
          value={animatedRate} 
          suffix="%" 
          icon={TrendingUp}
          color={correctRate >= 80 ? 'mint' : correctRate >= 60 ? 'sun' : 'rose'}
          subtitle={totalScans === 0 ? 'Awaiting data' : correctRate >= 80 ? 'Healthy segregation pattern' : correctRate >= 60 ? 'Needs attention' : 'Critical misplacement rate'}
        />
        <StatCard 
          title="Kilograms Recorded" 
          value={animatedKg} 
          suffix=" kg" 
          icon={Weight}
          color="iris"
          subtitle="Estimated from detection count"
        />
      </div>

      {/* Live Scan Progress (shows when ESP32 is actively scanning) */}
      <ScanProgressOverlay scanProgress={scanProgress} />

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
