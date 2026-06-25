import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Activity, Map as MapIcon, BarChart3, Trash2, Users, History, BookOpen,
  ArrowRight, ScanLine, Cpu, LineChart, Camera, MapPin,
} from 'lucide-react'
import { CATEGORIES } from '../lib/categories.js'

// Seven dashboard pages, dropped as fixed colour-coded pins over the
// Mumbai landmass (colours mirror the dashboard top-nav).
const places = [
  { to: '/dashboard',           label: 'Live Feed',    desc: 'Real-time detections + ESP32 camera stream', color: '#00E8AE', Icon: Activity,  pos: { top: '17%', right: '27%' } },
  { to: '/dashboard/history',   label: 'Scan Records', desc: 'Searchable, permanent log of every scan',    color: '#FF853D', Icon: History,   pos: { top: '15%', right: '8%' } },
  { to: '/dashboard/map',       label: 'Facility Map', desc: 'Bins, heatmap & municipal ward coverage',    color: '#38BDF8', Icon: MapIcon,   pos: { top: '37%', right: '17%' } },
  { to: '/dashboard/analytics', label: 'Analytics',    desc: 'Trends, breakdowns & segregation accuracy',  color: '#7A68FF', Icon: BarChart3, pos: { top: '42%', right: '37%' } },
  { to: '/dashboard/community', label: 'Community',    desc: 'Cleanup drives, reports & scoreboard',       color: '#FFC81A', Icon: Users,     pos: { top: '60%', right: '31%' } },
  { to: '/dashboard/learn',     label: 'Learning Hub', desc: 'Know your nine waste categories',            color: '#E879F9', Icon: BookOpen,  pos: { top: '66%', right: '11%' } },
  { to: '/dashboard/bins',      label: 'Bins',         desc: 'Smart-bin fill levels & overflow alerts',    color: '#FF5C85', Icon: Trash2,    pos: { top: '80%', right: '25%' } },
]

const workflow = [
  { icon: ScanLine, title: 'Scan', desc: 'An ESP32-S3 camera captures each item dropped at a smart bin.', accent: 'teal' },
  { icon: Cpu, title: 'Classify', desc: 'On-device AI sorts the item into one of nine waste categories.', accent: 'iris' },
  { icon: LineChart, title: 'Track', desc: 'Detections stream live to the dashboard.', accent: 'mint' },
]

const features = [
  { icon: Camera, title: 'Live Monitoring', desc: 'Watch the ESP32 camera feed and scan progress in real time.', accent: 'teal' },
  { icon: Cpu, title: '9-Category AI', desc: 'Biological, Glass, Metal, Paper, Plastic, Textile and more.', accent: 'iris' },
  { icon: History, title: 'Scan History', desc: 'Every scan stored as a permanent, searchable log.', accent: 'sun' },
  { icon: LineChart, title: 'Analytics', desc: 'Trends, breakdowns, and accuracy over time.', accent: 'mint' },
]

const accentText = { teal: 'text-teal-400', iris: 'text-iris-400', mint: 'text-mint-400', sun: 'text-sun-400', sky: 'text-sky-400' }
const accentBg = { teal: 'bg-teal-500/10', iris: 'bg-iris-500/10', mint: 'bg-mint-500/10', sun: 'bg-sun-500/10', sky: 'bg-sky-500/10' }

// Animated "how it works" — a pulse travels Scan → Classify → Track,
// lighting each step in sequence on a continuous loop.
function HowItWorks() {
  const [active, setActive] = useState(0)
  const steps = workflow.length

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % (steps + 1)), 1100)
    return () => clearInterval(id)
  }, [steps])

  const clamped = Math.min(active, steps - 1)
  const progress = clamped / (steps - 1) // 0 → 0.5 → 1
  const moving = active < steps

  return (
    <div className="relative grid md:grid-cols-3 gap-12 md:gap-6">
      {/* Track + animated progress + traveller */}
      <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[2px] z-0">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-400 via-iris-400 to-mint-400"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 12px rgba(0,232,174,0.5)' }}
        />
        <motion.div
          className="absolute top-1/2 w-3 h-3 rounded-full bg-white"
          animate={{ left: `${progress * 100}%`, opacity: moving ? 1 : 0, scale: moving ? 1 : 0.5 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ translateX: '-50%', translateY: '-50%', boxShadow: '0 0 14px 4px rgba(0,232,174,0.7)' }}
        />
      </div>

      {workflow.map((step, i) => {
        const lit = active > i || active === steps
        return (
          <div key={step.title} className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              animate={{ scale: lit ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={`relative w-16 h-16 rounded-2xl grid place-items-center mb-5 ring-1 transition-colors duration-500 ${
                lit ? `${accentBg[step.accent]} ring-white/20` : 'bg-ocean-800/60 ring-white/10'
              }`}
              style={lit ? { boxShadow: `0 0 26px -2px ${{ teal: 'rgba(0,232,174,0.45)', iris: 'rgba(122,104,255,0.45)', mint: 'rgba(26,255,136,0.45)' }[step.accent]}` } : undefined}
            >
              <step.icon className={`w-7 h-7 transition-colors duration-500 ${lit ? accentText[step.accent] : 'text-slate-500'}`} />
              <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold font-mono border transition-colors duration-500 ${
                lit ? 'bg-ocean-900 border-white/20 text-white' : 'bg-ocean-900 border-white/10 text-slate-500'
              }`}>{i + 1}</span>
              {lit && (
                <span className="absolute inset-0 rounded-2xl ring-2 animate-ping" style={{ borderColor: 'transparent', boxShadow: `0 0 0 2px ${{ teal: 'rgba(0,232,174,0.3)', iris: 'rgba(122,104,255,0.3)', mint: 'rgba(26,255,136,0.3)' }[step.accent]}` }} />
              )}
            </motion.div>
            <h4 className={`text-lg font-bold font-display transition-colors duration-500 ${lit ? 'text-white' : 'text-slate-300'}`}>{step.title}</h4>
            <p className="text-sm text-slate-400 font-medium mt-1.5 max-w-xs leading-relaxed">{step.desc}</p>
          </div>
        )
      })}
    </div>
  )
}

function GlassCTA({ onClick, children, className = '' }) {
  return (
    <button onClick={onClick} className={`group relative overflow-hidden liquid-glass liquid-glass-hover px-7 py-3.5 rounded-2xl font-bold text-white ${className}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-teal-500/35 via-teal-500/15 to-iris-500/35 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center justify-center gap-2.5">{children}</span>
    </button>
  )
}

function Pin({ place, navigate, interactive }) {
  const { Icon } = place
  return (
    <button
      onClick={() => navigate(place.to)}
      style={{ top: place.pos.top, right: place.pos.right }}
      className={`group absolute z-20 -translate-y-full ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Preview card — opens to the left, appears on hover (no click needed) */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-60 opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 z-30">
        <div className="liquid-glass rounded-2xl overflow-hidden text-left">
          <div className="relative z-10 flex items-center gap-3 px-3.5 py-3.5">
            <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0 shadow-lg" style={{ backgroundColor: place.color }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-bold text-white leading-tight">{place.label}</h4>
              <p className="text-xs text-slate-400 leading-snug mt-0.5">{place.desc}</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5 border-t border-white/10 bg-white/[0.02]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Open page</span>
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: place.color }}>
              Enter <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      <span className="ww-pin" style={{ '--c': place.color }}>
        <span className="ww-pin-ring" />
        <span className="ww-pin-head"><Icon className="w-[18px] h-[18px] text-white" /></span>
        <span className="ww-pin-tip" />
      </span>
    </button>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef(null)

  // Map drifts vertically with scroll only (not the cursor).
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const parallax = Math.max(-200, -scrollY * 0.12)
  // Pins ride the map; fade them out once the hero is scrolled past.
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const heroOpacity = Math.max(0, Math.min(1, 1 - scrollY / (vh * 0.55)))
  const pinsInteractive = heroOpacity > 0.1

  return (
    <div className="relative w-full bg-ocean-950 text-white overflow-x-hidden">
      {/* ── Map background across the whole page (fixed, scroll-parallax) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 will-change-transform"
          style={{ top: '-25%', height: '150%', transform: `translateY(${parallax}px)` }}
        >
          <MapContainer
            center={[19.05, 72.83]}
            zoom={12}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            className="w-full h-full"
            style={{ background: '#060A14' }}
          >
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        </div>
        {/* Single uniform tint — even everywhere, so it can never read as a frame */}
        <div className="absolute inset-0 bg-ocean-950/45" />
      </div>

      {/* Pins ride a fixed layer with the SAME parallax transform as the map,
          so they stay locked to it; they fade out past the hero. */}
      <div
        className="fixed inset-0 z-[15] pointer-events-none"
        style={{ transform: `translateY(${parallax}px)`, opacity: heroOpacity }}
      >
        {places.map((p) => (
          <Pin key={p.to} place={p} navigate={navigate} interactive={pinsInteractive} />
        ))}
      </div>

      {/* Top brand bar — overlays the hero (no layout seam) */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center px-6 lg:px-10 py-5">
        <div className="flex items-center">
          <img src="/wastewise-logo.png" alt="WasteWise — Scan. Sort. Streamline." className="h-10 w-auto object-contain" />
        </div>
      </header>

      {/* ── Hero: overview panel (LHS, over water) + fixed pins (RHS) ──── */}
      <section className="relative z-10 h-screen">
        <div className="absolute inset-y-0 left-0 z-20 flex items-center px-6 lg:px-12 w-full lg:w-[46%] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="liquid-glass rounded-[2rem] p-8 lg:p-9 max-w-xl pointer-events-auto"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-bold text-teal-400 mb-6">
                <MapPin className="w-3.5 h-3.5" /> Mumbai Pilot · v2.0
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight leading-[1.05]">
                Sort smarter with <span className="text-gradient">WasteWise</span>
              </h1>
              <p className="mt-5 text-[15px] lg:text-base text-slate-300 font-medium leading-relaxed">
                Real-time waste detection across nine categories — from a smart
                ESP32 camera straight to a live dashboard. Every pin on the map
                is a doorway into the platform.
              </p>
              <div className="mt-7">
                <GlassCTA onClick={() => navigate('/dashboard')}>
                  Enter Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GlassCTA>
              </div>
              <p className="mt-6 text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                Hover a pin to preview · click to open
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Below the fold: open, box-free editorial layout over the map ── */}
      <div className="relative z-10 [&_h3]:[text-shadow:0_2px_18px_rgba(6,10,20,0.9)] [&_p]:[text-shadow:0_2px_14px_rgba(6,10,20,0.85)]">
        {/* How it works — horizontal timeline, no boxes */}
        <section className="px-6 lg:px-12 pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl font-bold font-display">
              How it works
            </motion.h3>
            <p className="text-slate-400 font-medium mt-2 mb-14">Three steps from bin to dashboard.</p>

            <HowItWorks />
          </div>
        </section>

        {/* Nine categories — inline, no boxes */}
        <section className="px-6 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-2">One model</p>
              <h3 className="text-3xl font-bold font-display mb-8"><span className="text-gradient">Nine</span> waste categories</h3>
            </motion.div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {CATEGORIES.map((c, i) => (
                <motion.span
                  key={c.key}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-900/40 border border-white/10 text-sm font-semibold text-slate-200 backdrop-blur-sm"
                >
                  <c.Icon className="w-4 h-4" style={{ color: c.color }} />
                  {c.key}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Features — clean columns separated by hairlines, no boxes */}
        <section className="px-6 lg:px-12 py-20">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-center text-3xl font-bold font-display mb-3">Everything in one place</h3>
            <p className="text-center text-slate-400 font-medium mb-14">A complete civic waste intelligence platform.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-white/10">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="px-6 py-4"
                >
                  <div className={`w-12 h-12 rounded-2xl ${accentBg[f.accent]} grid place-items-center mb-4 ring-1 ring-white/10`}>
                    <f.icon className={`w-6 h-6 ${accentText[f.accent]}`} />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1.5">{f.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-6 py-10 text-center text-xs text-slate-600 font-mono tracking-wider">
          WASTEWISE · CIVIC WASTE INTELLIGENCE · MUMBAI PILOT
        </footer>
      </div>
    </div>
  )
}
