import { useState, useEffect } from 'react'
import { useCountUp } from '../hooks/useCountUp.js'
import Badge from '../components/common/Badge.jsx'
import { Trophy, Crown, Medal, ArrowUp, ArrowDown, Minus, MapPin, Star, Award, Inbox } from 'lucide-react'

const medals = {
  0: { icon: Crown, color: 'text-sun-400', bg: 'bg-gradient-to-br from-sun-400 to-ember-500', ring: 'ring-sun-400/30', glow: 'shadow-glow-sun' },
  1: { icon: Medal, color: 'text-slate-300', bg: 'bg-gradient-to-br from-slate-400 to-slate-500', ring: 'ring-slate-400/30', glow: '' },
  2: { icon: Medal, color: 'text-ember-400', bg: 'bg-gradient-to-br from-ember-400 to-ember-600', ring: 'ring-ember-400/30', glow: '' },
}

export default function Scoreboard() {
  const [tab, setTab] = useState('areas')
  const [data, setData] = useState({ area_rankings: [], citizen_leaderboard: [] })

  // Fetch scoreboard from API
  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const res = await fetch('/api/scoreboard')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Server not available
      }
    }
    fetchScoreboard()
    const interval = setInterval(fetchScoreboard, 60000)
    return () => clearInterval(interval)
  }, [])

  const topAreas = data.area_rankings.slice(0, 3)
  const remainingAreas = data.area_rankings.slice(3)

  const hasAreaData = data.area_rankings.length > 0
  const hasCitizenData = data.citizen_leaderboard.length > 0

  const trendIcons = {
    up: { icon: ArrowUp, color: 'text-teal-400' },
    down: { icon: ArrowDown, color: 'text-rose-400' },
    same: { icon: Minus, color: 'text-slate-400' },
  }

  return (
    <div className="space-y-8 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sun-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-iris-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Tab Selector */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex items-center bg-ocean-800/40 rounded-2xl p-1 border border-ocean-600/10">
          {['areas', 'citizens'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 relative z-10 ${
                tab === t
                  ? 'liquid-glass-pill-active-warm text-white'
                  : 'liquid-glass-pill-inactive-warm text-slate-400 hover:text-white'
              }`}
            >
              {t === 'areas' ? '🏘️ Area Rankings' : '👤 Citizen Leaderboard'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'areas' && (
        <>
          {!hasAreaData ? (
            <div className="relative z-10 glass-card p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-ocean-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">No Rankings Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                Area rankings will populate once scan data flows from your backend. Rankings are based on sustainability score, correct segregation rate, and scan volume.
              </p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="relative z-10 grid grid-cols-3 gap-5 items-end">
                {[1, 0, 2].map((rank) => {
                  const area = topAreas[rank]
                  if (!area) return null
                  const medal = medals[rank]
                  const MedalIcon = medal.icon
                  const isChampion = rank === 0
                  const heights = { 0: 'pt-8', 1: 'pt-16', 2: 'pt-20' }

                  return (
                    <div key={area.area} className={`${heights[rank]} ${isChampion ? 'order-2' : rank === 1 ? 'order-1' : 'order-3'}`}>
                      <div className={`glass-card p-6 text-center relative overflow-hidden ${isChampion ? 'shimmer-border' : ''} ${medal.glow} card-hover`}>
                        {isChampion && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sun-400 via-ember-500 to-sun-400" />}
                        <div className={`w-16 h-16 mx-auto rounded-2xl ${medal.bg} flex items-center justify-center mb-4 shadow-xl ring-4 ${medal.ring}`}>
                          <MedalIcon className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-lg font-display">{area.area}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{area.ward}</p>
                        <div className="mt-4">
                          <span className="font-mono text-4xl font-bold text-white">{area.score}</span>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Sustainability Score</p>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-ocean-800/15 rounded-xl border border-ocean-600/5">
                            <p className="text-xs text-slate-400 mb-0.5 font-medium">Correct %</p>
                            <p className="font-mono font-bold text-teal-400">{area.correct_pct}%</p>
                          </div>
                          <div className="p-2.5 bg-ocean-800/15 rounded-xl border border-ocean-600/5">
                            <p className="text-xs text-slate-400 mb-0.5 font-medium">Scans</p>
                            <p className="font-mono font-bold text-white">{area.total_scans}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Remaining Rankings */}
              {remainingAreas.length > 0 && (
                <div className="relative z-10 glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3 font-display">
                    <Award className="w-5 h-5 text-iris-400" />
                    Full Area Rankings
                  </h3>
                  <div className="space-y-2">
                    {remainingAreas.map((area, i) => {
                      const trend = trendIcons[area.trend] || trendIcons.same
                      const TrendIcon = trend.icon
                      return (
                        <div key={area.area} className="flex items-center gap-5 p-4 rounded-2xl bg-ocean-800/15 border border-ocean-600/5 hover:bg-ocean-800/25 transition-all duration-300 group">
                          <div className="w-10 h-10 rounded-xl bg-ocean-700/30 flex items-center justify-center shrink-0 border border-ocean-600/10">
                            <span className="text-sm font-mono font-bold text-slate-400">#{i + 4}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{area.area}</h4>
                            <p className="text-xs text-slate-600 font-medium">{area.ward}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right hidden md:block">
                              <p className="font-mono font-bold text-white">{area.total_scans}</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Scans</p>
                            </div>
                            <div className="text-right hidden md:block">
                              <p className="font-mono font-bold text-teal-400">{area.correct_pct}%</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Correct</p>
                            </div>
                            <div className={`flex items-center gap-1 ${trend.color}`}>
                              <TrendIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-2xl font-bold text-white">{area.score}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'citizens' && (
        <>
          {!hasCitizenData ? (
            <div className="relative z-10 glass-card p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-ocean-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">No Citizens Ranked Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                The citizen leaderboard will show top contributors once user profiles and scan data are connected to your backend.
              </p>
            </div>
          ) : (
            <div className="relative z-10 glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3 font-display">
                <Star className="w-5 h-5 text-sun-400" />
                Top Citizens
              </h3>
              <div className="space-y-2.5">
                {data.citizen_leaderboard.map((citizen, i) => (
                  <div key={citizen.name} className="flex items-center gap-5 p-5 rounded-2xl bg-ocean-800/15 border border-ocean-600/5 hover:bg-ocean-800/25 transition-all duration-300 group">
                    <div className={`w-12 h-12 rounded-2xl ${i < 3 ? medals[i]?.bg || 'bg-ocean-700/30' : 'bg-ocean-700/30'} flex items-center justify-center shadow-lg shrink-0`}>
                      <span className="text-sm font-bold text-white font-mono">#{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-white text-sm">{citizen.name}</h4>
                        {citizen.badges && citizen.badges.map((badge, bi) => (
                          <span key={bi} className="text-sm" title={badge}>
                            {badge === 'top_scanner' ? '🔍' : badge === 'streak' ? '🔥' : badge === 'educator' ? '📚' : badge === 'drive_hero' ? '🏆' : '⭐'}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3" />
                        {citizen.area}
                      </p>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-right hidden md:block">
                        <p className="font-mono font-bold text-teal-400">{citizen.scans}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Scans</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="font-mono font-bold text-iris-400">{citizen.drives_joined}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Drives</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-2xl font-bold text-sun-400">{citizen.points}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
