export default function ProgressBar({ value, max = 100, color = 'teal', height = 'h-2', animated = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    teal: 'bg-gradient-to-r from-teal-400 to-teal-500',
    iris: 'bg-gradient-to-r from-iris-400 to-iris-500',
    rose: 'bg-gradient-to-r from-rose-400 to-rose-500',
    sun: 'bg-gradient-to-r from-sun-400 to-sun-500',
    mint: 'bg-gradient-to-r from-mint-400 to-mint-500',
    ember: 'bg-gradient-to-r from-ember-400 to-ember-500',
    // Backward compatibility
    cyan: 'bg-gradient-to-r from-teal-400 to-teal-500',
    violet: 'bg-gradient-to-r from-iris-400 to-iris-500',
    coral: 'bg-gradient-to-r from-rose-400 to-rose-500',
    gold: 'bg-gradient-to-r from-sun-400 to-sun-500',
    emerald: 'bg-gradient-to-r from-mint-400 to-mint-500',
    amber: 'bg-gradient-to-r from-sun-400 to-ember-500',
  }

  return (
    <div className={`w-full bg-ocean-800/60 rounded-full overflow-hidden ${height} relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]`}>
      <div 
        className={`h-full rounded-full ${colorMap[color] || colorMap.teal} ${animated ? 'transition-all duration-1000 ease-out' : ''} relative overflow-hidden`}
        style={{ width: `${pct}%` }}
      >
        {/* Shimmer wave */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-wave" style={{ animationDuration: '2s' }} />
        {/* Glow tip */}
        {pct > 5 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 blur-sm" />
        )}
      </div>
    </div>
  )
}
