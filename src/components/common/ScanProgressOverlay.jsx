import { useEffect, useState, useRef } from 'react'
import { Scan, CheckCircle2, Cpu } from 'lucide-react'

export default function ScanProgressOverlay({ scanProgress }) {
  const entries = Object.entries(scanProgress)
  if (entries.length === 0) return null

  return (
    <div className="relative z-10 space-y-4">
      {entries.map(([deviceId, session]) => (
        <ScanCard key={deviceId} deviceId={deviceId} session={session} />
      ))}
    </div>
  )
}

function ScanCard({ deviceId, session }) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const animRef = useRef(null)
  const isComplete = session.status === 'complete'

  // Smooth progress animation
  useEffect(() => {
    const target = session.progress || 0
    const animate = () => {
      setDisplayProgress(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 0.5) return target
        const next = prev + diff * 0.08
        animRef.current = requestAnimationFrame(animate)
        return next
      })
    }
    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [session.progress])

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference

  return (
    <div className={`glass-card overflow-hidden transition-all duration-500 ${
      isComplete ? 'border-teal-500/20' : 'border-iris-500/15'
    }`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {!isComplete && (
          <>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-iris-500/[0.06] rounded-full blur-[60px] animate-float" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/[0.04] rounded-full blur-[60px] animate-float" style={{ animationDelay: '1.5s' }} />
          </>
        )}
        {isComplete && (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/[0.03] to-transparent animate-pulse" />
        )}
      </div>

      <div className="relative z-10 p-6 flex items-center gap-6">
        {/* Circular Progress Ring */}
        <div className="relative flex-shrink-0">
          {/* Radar pulse effect */}
          {!isComplete && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-iris-500/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[-4px] rounded-full border border-iris-500/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </>
          )}
          
          <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke={isComplete ? 'url(#completeGrad)' : 'url(#scanGrad)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-200 ease-out"
              style={{ filter: isComplete ? 'drop-shadow(0 0 8px rgba(0,232,174,0.4))' : 'drop-shadow(0 0 6px rgba(108,92,231,0.3))' }}
            />
            <defs>
              <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C5CE7" />
                <stop offset="100%" stopColor="#7A68FF" />
              </linearGradient>
              <linearGradient id="completeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E8AE" />
                <stop offset="100%" stopColor="#2DFFC4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isComplete ? (
              <CheckCircle2 className="w-8 h-8 text-teal-400 animate-bounce" style={{ animationDuration: '0.6s', animationIterationCount: 2 }} />
            ) : (
              <>
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {Math.round(displayProgress)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest">PERCENT</span>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {isComplete ? (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/15">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Scan Complete
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-iris-500/10 text-iris-400 text-xs font-bold border border-iris-500/15">
                <Scan className="w-3.5 h-3.5 animate-pulse" />
                Scanning...
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white font-display truncate mb-1">
            {isComplete && session.result
              ? `Detected: ${session.result.plastic_type} Plastic`
              : 'Analyzing Object'
            }
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-600" />
              {deviceId}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              {session.location_name || 'Unknown'}
            </span>
            {isComplete && session.result && (
              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {Math.round((session.result.confidence || 0) * 100)}% confidence
              </span>
            )}
          </div>

          {/* Progress bar backup (thin line) */}
          {!isComplete && (
            <div className="mt-3 h-1 bg-ocean-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-iris-500 to-iris-400 transition-all duration-300 ease-out"
                style={{ width: `${displayProgress}%`, boxShadow: '0 0 8px rgba(108,92,231,0.4)' }}
              />
            </div>
          )}

          {/* Composition preview on completion */}
          {isComplete && session.result?.composition && Object.keys(session.result.composition).length > 0 && (
            <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-ocean-800/40">
              {Object.entries(session.result.composition).map(([key, value]) => {
                const colors = {
                  plastic: 'bg-iris-500', metal: 'bg-slate-400', organic: 'bg-teal-500',
                  glass: 'bg-sun-400', other: 'bg-slate-600',
                }
                return (
                  <div
                    key={key}
                    className={`${colors[key] || 'bg-slate-500'} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                    title={`${key}: ${value}%`}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
