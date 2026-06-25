import { NavLink, useLocation } from 'react-router-dom'
import { useWebSocket } from '../../context/WebSocketContext.jsx'
import { useState } from 'react'
import {
  Activity, BarChart3, Map, Trash2, Users, Trophy, BookOpen,
  Building2, FileBarChart, Radio, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, Zap, History
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Live Feed', icon: Activity, accent: 'teal' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, accent: 'iris' },
  { path: '/map', label: 'Waste Map', icon: Map, accent: 'teal' },
  { path: '/bins', label: 'Bin Monitor', icon: Trash2, accent: 'rose' },
  { path: '/drives', label: 'Drives', icon: Users, accent: 'sun' },
  { path: '/scoreboard', label: 'Scoreboard', icon: Trophy, accent: 'ember' },
  { path: '/learn', label: 'Learning Hub', icon: BookOpen, accent: 'mint' },
]

const secondaryNav = [
  { path: '/municipal', label: 'Municipal', icon: Building2, accent: 'iris' },
  { path: '/reports', label: 'Reports', icon: FileBarChart, accent: 'teal' },
  { path: '/history', label: 'Scan History', icon: History, accent: 'sun' },
]

const accentMap = {
  teal: {
    active: 'bg-teal-500/10 text-teal-400 border-l-teal-400',
    icon: 'text-teal-400',
    glow: 'shadow-[0_0_20px_rgba(0,232,174,0.08)]',
    dot: 'bg-teal-400',
  },
  iris: {
    active: 'bg-iris-500/10 text-iris-400 border-l-iris-400',
    icon: 'text-iris-400',
    glow: 'shadow-[0_0_20px_rgba(122,104,255,0.08)]',
    dot: 'bg-iris-400',
  },
  rose: {
    active: 'bg-rose-500/10 text-rose-400 border-l-rose-400',
    icon: 'text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(255,92,133,0.08)]',
    dot: 'bg-rose-400',
  },
  sun: {
    active: 'bg-sun-500/10 text-sun-400 border-l-sun-400',
    icon: 'text-sun-400',
    glow: 'shadow-[0_0_20px_rgba(255,200,26,0.08)]',
    dot: 'bg-sun-400',
  },
  ember: {
    active: 'bg-ember-500/10 text-ember-400 border-l-ember-400',
    icon: 'text-ember-400',
    glow: 'shadow-[0_0_20px_rgba(255,107,26,0.08)]',
    dot: 'bg-ember-400',
  },
  mint: {
    active: 'bg-mint-500/10 text-mint-400 border-l-mint-400',
    icon: 'text-mint-400',
    glow: 'shadow-[0_0_20px_rgba(0,230,112,0.08)]',
    dot: 'bg-mint-400',
  },
}

export default function Sidebar() {
  const { status, detections, scanProgress } = useWebSocket()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const activeScanCount = Object.keys(scanProgress || {}).length
  const hasHistoricalDetections = detections.length > 0

  const statusConfig = {
    live: { icon: Radio, color: 'text-teal-400', label: 'Backend Live', bg: 'bg-teal-500/8', dot: 'bg-teal-400', border: 'border-teal-500/15' },
    polling: { icon: RefreshCw, color: 'text-iris-400', label: 'Backend Polling', bg: 'bg-iris-500/8', dot: 'bg-iris-400', border: 'border-iris-500/15' },
    offline: { icon: WifiOff, color: 'text-rose-400', label: 'Backend Offline', bg: 'bg-rose-500/8', dot: 'bg-rose-400', border: 'border-rose-500/15' },
    connecting: { icon: Wifi, color: 'text-slate-400', label: 'Connecting Backend', bg: 'bg-slate-500/8', dot: 'bg-slate-400', border: 'border-slate-500/15' },
  }

  const currentStatus = statusConfig[status] || statusConfig.connecting
  const StatusIcon = currentStatus.icon
  const statusDetail =
    activeScanCount > 0
      ? `${activeScanCount} scanner${activeScanCount === 1 ? '' : 's'} active`
      : hasHistoricalDetections
        ? `${detections.length} stored scan${detections.length === 1 ? '' : 's'} loaded`
        : 'No ESP32 scan activity yet'

  return (
    <aside className={`${collapsed ? 'w-[76px]' : 'w-[280px]'} bg-ocean-900/70 backdrop-blur-2xl border-r border-ocean-700/20 flex flex-col shrink-0 transition-all duration-500 ease-out relative z-30`}>
      {/* Subtle side gradient */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-teal-500/10 via-iris-500/10 to-transparent" />

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-9 w-7 h-7 rounded-full bg-ocean-800 border border-ocean-600/30 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:shadow-glow-teal transition-all duration-300 z-40"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg shadow-teal-500/20 relative overflow-hidden bg-[#060A14]/60">
              <img src="/screen.png" alt="PlasticPulse Logo" className="w-full h-full object-cover relative z-10" />
            </div>
            {/* Pulse ring behind logo */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-iris-500 animate-pulse opacity-20 blur-md" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg tracking-tight">
                <span className="text-gradient">PlasticPulse</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-[0.2em] uppercase mt-0.5">Civic Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* Gradient divider */}
      <div className="mx-4 gradient-divider" />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isHovered = hoveredItem === item.path
          const colors = accentMap[item.accent] || accentMap.teal

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group border-l-2 ${
                isActive
                  ? `${colors.active} ${colors.glow}`
                  : 'border-l-transparent text-slate-500 hover:text-slate-200 hover:bg-ocean-800/40'
              } ${collapsed ? 'justify-center border-l-0 px-2' : ''}`}
            >
              <div className={`relative ${isActive ? '' : ''}`}>
                <item.icon className={`w-[18px] h-[18px] transition-all duration-300 ${
                  isActive ? colors.icon : isHovered ? 'text-slate-300 scale-110' : ''
                }`} />
                {isActive && (
                  <span className={`absolute -inset-1.5 rounded-full ${colors.dot} opacity-15 blur-sm`} />
                )}
              </div>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
              )}
            </NavLink>
          )
        })}

        <div className="my-3 mx-2 gradient-divider" />

        {secondaryNav.map((item) => {
          const isActive = location.pathname === item.path
          const colors = accentMap[item.accent] || accentMap.teal

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 border-l-2 ${
                isActive
                  ? `${colors.active} ${colors.glow}`
                  : 'border-l-transparent text-slate-500 hover:text-slate-200 hover:bg-ocean-800/40'
              } ${collapsed ? 'justify-center border-l-0 px-2' : ''}`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? colors.icon : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Status & Version */}
      <div className="p-4 space-y-3">
        <div className="mx-1 gradient-divider mb-3" />
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${currentStatus.bg} border ${currentStatus.border} transition-all duration-300`}>
          <div className="relative">
            <StatusIcon className={`w-4 h-4 ${currentStatus.color} ${status === 'live' ? 'animate-pulse' : status === 'polling' ? 'animate-spin-slow' : ''}`} />
            {status === 'live' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${currentStatus.color}`}>{currentStatus.label}</p>
              <p className="text-[10px] text-slate-600">{statusDetail}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <p className="text-[10px] text-slate-700 text-center font-mono tracking-wider">v2.0.0 — MUMBAI PILOT</p>
        )}
      </div>
    </aside>
  )
}
