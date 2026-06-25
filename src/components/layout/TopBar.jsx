import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, User, Search, Sparkles, X, Wifi, WifiOff, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const pageTitles = {
  '/': 'Live Feed',
  '/analytics': 'Analytics',
  '/map': 'Community Waste Map',
  '/bins': 'Smart Bin Monitor',
  '/drives': 'Cleanup Drive Manager',
  '/scoreboard': 'Sustainability Scoreboard',
  '/learn': 'Plastic Learning Hub',
  '/municipal': 'Municipal Integration',
  '/reports': 'Before / After Area Report',
}

const pageSubtitles = {
  '/': 'Real-time plastic detection across Mumbai',
  '/analytics': 'Time-series and categorical analysis',
  '/map': 'Geographic visualization of waste patterns',
  '/bins': 'Operational overview of ESP32 nodes',
  '/drives': 'Create and monitor cleanup drives',
  '/scoreboard': 'Gamified civic accountability rankings',
  '/learn': 'Know your plastic. Segregate right.',
  '/municipal': 'Ward integration & overflow response tracking',
  '/reports': 'Measure real-world impact of interventions',
}

const pageIcons = {
  '/': Sparkles,
  '/analytics': Sparkles,
  '/map': Sparkles,
  '/bins': Sparkles,
  '/drives': Sparkles,
  '/scoreboard': Sparkles,
  '/learn': Sparkles,
  '/municipal': Sparkles,
  '/reports': Sparkles,
}

const initialNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'Backend Not Connected',
    message: 'WebSocket and REST endpoints are offline. Connect your backend to see live data.',
    time: 'System',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'AI Scanner — Model Pending',
    message: 'The plastic classification model is not yet integrated. Camera capture is functional.',
    time: 'System',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Dashboard Ready',
    message: 'All 9 dashboard pages are built and functional. Ready for backend integration.',
    time: 'System',
    read: false,
  },
]

const notifIcons = {
  info: { icon: Info, color: 'text-iris-400', bg: 'bg-iris-500/10' },
  warning: { icon: AlertTriangle, color: 'text-sun-400', bg: 'bg-sun-500/10' },
  success: { icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
}

export default function TopBar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'PlasticPulse'
  const subtitle = pageSubtitles[location.pathname] || ''

  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifs])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <header className="h-[68px] bg-ocean-900/50 backdrop-blur-2xl border-b border-ocean-700/15 flex items-center justify-between px-6 lg:px-8 shrink-0 z-20 relative">
      {/* Animated gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      <div className="absolute top-0 left-1/4 w-48 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent animate-pulse" />

      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-white tracking-tight font-display">{title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center bg-ocean-800/40 border border-ocean-600/15 rounded-2xl px-4 py-2.5 gap-2.5 focus-within:border-teal-500/25 focus-within:shadow-glow-teal transition-all duration-300 group">
          <Search className="w-3.5 h-3.5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-52 font-medium"
          />
          <kbd className="hidden lg:flex items-center px-1.5 py-0.5 rounded-md bg-ocean-700/40 text-[10px] text-slate-600 font-mono">⌘K</kbd>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(prev => !prev)}
            className={`relative p-2.5 rounded-xl border transition-all duration-300 group ${
              showNotifs
                ? 'bg-ocean-700/50 border-teal-500/25 shadow-glow-teal'
                : 'bg-ocean-800/40 border-ocean-600/15 hover:bg-ocean-700/40 hover:border-ocean-500/20'
            }`}
          >
            <Bell className={`w-[18px] h-[18px] transition-colors ${showNotifs ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold shadow-glow-rose">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-3 w-[380px] bg-ocean-900/95 backdrop-blur-2xl border border-ocean-600/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-reveal">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-700/20">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-bold">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-teal-400 hover:text-teal-300 font-bold transition-colors">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-[340px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-ocean-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => {
                    const config = notifIcons[notif.type] || notifIcons.info
                    const NotifIcon = config.icon
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3.5 px-5 py-4 border-b border-ocean-700/10 last:border-0 transition-colors ${
                          notif.read ? 'opacity-60' : 'bg-ocean-800/20'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <NotifIcon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-white truncate">{notif.title}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id) }}
                              className="p-1 rounded-lg hover:bg-ocean-700/40 text-slate-600 hover:text-slate-400 transition-all shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1.5 font-medium">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-2" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-ocean-700/20">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-iris-500 flex items-center justify-center shadow-lg shadow-teal-500/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
              <User className="w-4 h-4 text-white relative z-10" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-ocean-900" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white leading-none">Admin</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Mumbai Corp</p>
          </div>
        </div>
      </div>
    </header>
  )
}

