import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useWebSocket } from '../../context/WebSocketContext.jsx'
import {
  Activity, BarChart3, Map, Trash2, Users, History, BookOpen,
  Bell, User, X, Menu, Radio, RefreshCw, WifiOff, Wifi,
  AlertTriangle, CheckCircle2, Info,
} from 'lucide-react'

// Each nav item carries its own accent so the bar reads as distinct,
// colour-coded destinations rather than one uniform green.
const navItems = [
  { path: '/dashboard', label: 'Live Feed', icon: Activity, accent: 'teal', end: true },
  { path: '/dashboard/map', label: 'Facility Map', icon: Map, accent: 'sky' },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, accent: 'iris' },
  { path: '/dashboard/bins', label: 'Bins', icon: Trash2, accent: 'rose' },
  { path: '/dashboard/community', label: 'Community', icon: Users, accent: 'sun' },
  { path: '/dashboard/history', label: 'Scan Records', icon: History, accent: 'ember' },
  { path: '/dashboard/learn', label: 'Learn', icon: BookOpen, accent: 'fuchsia' },
]

// Literal class strings (kept whole so Tailwind doesn't purge them).
const accentMap = {
  teal:    { icon: 'text-teal-400',    active: 'bg-teal-500/12 text-teal-200 border-teal-500/25' },
  sky:     { icon: 'text-sky-400',     active: 'bg-sky-500/12 text-sky-200 border-sky-500/25' },
  iris:    { icon: 'text-iris-400',    active: 'bg-iris-500/12 text-iris-200 border-iris-500/25' },
  rose:    { icon: 'text-rose-400',    active: 'bg-rose-500/12 text-rose-200 border-rose-500/25' },
  sun:     { icon: 'text-sun-400',     active: 'bg-sun-500/12 text-sun-200 border-sun-500/25' },
  ember:   { icon: 'text-ember-400',   active: 'bg-ember-500/12 text-ember-200 border-ember-500/25' },
  fuchsia: { icon: 'text-fuchsia-400', active: 'bg-fuchsia-500/12 text-fuchsia-200 border-fuchsia-500/25' },
}

const statusConfig = {
  live: { icon: Radio, color: 'text-teal-400', label: 'Live', dot: 'bg-teal-400' },
  polling: { icon: RefreshCw, color: 'text-iris-400', label: 'Polling', dot: 'bg-iris-400' },
  offline: { icon: WifiOff, color: 'text-rose-400', label: 'Offline', dot: 'bg-rose-400' },
  connecting: { icon: Wifi, color: 'text-slate-400', label: 'Connecting', dot: 'bg-slate-400' },
}

const initialNotifications = [
  { id: 1, type: 'info', title: 'Backend Not Connected', message: 'WebSocket and REST endpoints are offline. Connect your backend to see live data.', time: 'System', read: false },
  { id: 2, type: 'warning', title: 'AI Scanner — Model Pending', message: 'The waste classification model is not yet integrated. Camera capture is functional.', time: 'System', read: false },
  { id: 3, type: 'success', title: 'Dashboard Ready', message: 'All dashboard pages are built and functional. Ready for backend integration.', time: 'System', read: false },
]

const notifIcons = {
  info: { icon: Info, color: 'text-iris-400', bg: 'bg-iris-500/10' },
  warning: { icon: AlertTriangle, color: 'text-sun-400', bg: 'bg-sun-500/10' },
  success: { icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
}

export default function TopNav() {
  const { status } = useWebSocket()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [mobileOpen, setMobileOpen] = useState(false)
  const notifRef = useRef(null)

  const currentStatus = statusConfig[status] || statusConfig.connecting
  const StatusIcon = currentStatus.icon
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifs])

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const dismissNotif = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id))

  const linkClass = (accent) => ({ isActive }) =>
    `flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-semibold leading-none whitespace-nowrap transition-all duration-300 border ${
      isActive
        ? accentMap[accent].active
        : 'border-transparent text-slate-400 hover:text-white hover:bg-ocean-800/50'
    }`

  return (
    <header className="h-16 bg-ocean-900/70 backdrop-blur-2xl border-b border-ocean-700/15 flex items-center gap-4 px-4 lg:px-6 shrink-0 z-30 relative">
      {/* Animated gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/25 to-transparent" />

      {/* Left — full logo lockup */}
      <button onClick={() => navigate('/')} className="flex items-center shrink-0">
        <img src="/wastewise-logo.png" alt="WasteWise — Scan. Sort. Streamline." className="h-9 w-auto object-contain" />
      </button>

      {/* Center — nav (horizontal, centred, colour-coded) */}
      <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end} className={linkClass(item.accent)}>
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? '' : accentMap[item.accent].icon}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right — status, notifications, avatar (single line, no stacks) */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto lg:ml-0">
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-ocean-800/50 border border-ocean-600/15">
          <span className="relative flex h-2 w-2">
            {status === 'live' && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.dot} opacity-60`} />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.dot}`} />
          </span>
          <StatusIcon className={`w-3.5 h-3.5 ${currentStatus.color} ${status === 'polling' ? 'animate-spin-slow' : ''}`} />
          <span className={`text-xs font-bold leading-none ${currentStatus.color}`}>{currentStatus.label}</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs((p) => !p)}
            className={`relative grid place-items-center w-9 h-9 rounded-xl border transition-all duration-300 group ${
              showNotifs ? 'bg-ocean-700/50 border-teal-500/25' : 'bg-ocean-800/50 border-ocean-600/15 hover:bg-ocean-700/40'
            }`}
          >
            <Bell className={`w-[18px] h-[18px] transition-colors ${showNotifs ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-[17px] h-[17px] rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-3 w-[360px] bg-ocean-900/95 backdrop-blur-2xl border border-ocean-600/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-reveal">
              <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-700/20">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-bold">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-teal-400 hover:text-teal-300 font-bold transition-colors">Mark all read</button>
                )}
              </div>
              <div className="max-h-[340px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-ocean-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = notifIcons[notif.type] || notifIcons.info
                    const NotifIcon = config.icon
                    return (
                      <div key={notif.id} className={`flex items-start gap-3.5 px-5 py-4 border-b border-ocean-700/10 last:border-0 transition-colors ${notif.read ? 'opacity-60' : 'bg-ocean-800/20'}`}>
                        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <NotifIcon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-white truncate">{notif.title}</p>
                            <button onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id) }} className="p-1 rounded-lg hover:bg-ocean-700/40 text-slate-600 hover:text-slate-400 transition-all shrink-0">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1.5 font-medium">{notif.time}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar (icon only — no stacked name/role) */}
        <div className="relative hidden md:block">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-iris-500 grid place-items-center shadow-lg shadow-teal-500/15">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-ocean-900" />
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen((p) => !p)} className="lg:hidden grid place-items-center w-9 h-9 rounded-xl bg-ocean-800/50 border border-ocean-600/15 text-slate-300">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-ocean-900/97 backdrop-blur-2xl border-b border-ocean-700/20 shadow-2xl z-40 animate-slide-reveal">
          <nav className="p-4 grid gap-1">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setMobileOpen(false)} className={linkClass(item.accent)}>
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? '' : accentMap[item.accent].icon}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
