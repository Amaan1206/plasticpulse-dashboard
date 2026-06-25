import { useCountUp } from '../../hooks/useCountUp.js'

export default function StatCard({ title, value, suffix = '', prefix = '', color = 'teal', subtitle = '', icon: Icon, trend, trendValue }) {
  const animatedValue = useCountUp(value, 1800)

  const colorMap = {
    teal: 'border-teal-500/15 text-teal-400',
    iris: 'border-iris-500/15 text-iris-400',
    rose: 'border-rose-500/15 text-rose-400',
    sun: 'border-sun-500/15 text-sun-400',
    mint: 'border-mint-500/15 text-mint-400',
    ember: 'border-ember-500/15 text-ember-400',
    slate: 'border-slate-500/15 text-slate-400',
    emerald: 'border-teal-500/15 text-teal-400',
    coral: 'border-rose-500/15 text-rose-400',
    gold: 'border-sun-500/15 text-sun-400',
    violet: 'border-iris-500/15 text-iris-400',
    amber: 'border-sun-500/15 text-sun-400',
    cyan: 'border-teal-500/15 text-teal-400',
  }

  const iconBgMap = {
    teal: 'bg-teal-500/10 text-teal-400',
    iris: 'bg-iris-500/10 text-iris-400',
    rose: 'bg-rose-500/10 text-rose-400',
    sun: 'bg-sun-500/10 text-sun-400',
    mint: 'bg-mint-500/10 text-mint-400',
    ember: 'bg-ember-500/10 text-ember-400',
    slate: 'bg-slate-500/10 text-slate-400',
    emerald: 'bg-teal-500/10 text-teal-400',
    coral: 'bg-rose-500/10 text-rose-400',
    gold: 'bg-sun-500/10 text-sun-400',
    violet: 'bg-iris-500/10 text-iris-400',
    amber: 'bg-sun-500/10 text-sun-400',
    cyan: 'bg-teal-500/10 text-teal-400',
  }

  const glowMap = {
    teal: 'group-hover:shadow-[0_0_40px_rgba(0,232,174,0.06)]',
    iris: 'group-hover:shadow-[0_0_40px_rgba(122,104,255,0.06)]',
    rose: 'group-hover:shadow-[0_0_40px_rgba(255,92,133,0.06)]',
    sun: 'group-hover:shadow-[0_0_40px_rgba(255,200,26,0.06)]',
    mint: 'group-hover:shadow-[0_0_40px_rgba(0,230,112,0.06)]',
    ember: 'group-hover:shadow-[0_0_40px_rgba(255,107,26,0.06)]',
    slate: 'group-hover:shadow-[0_0_40px_rgba(90,106,128,0.06)]',
    emerald: 'group-hover:shadow-[0_0_40px_rgba(0,232,174,0.06)]',
    coral: 'group-hover:shadow-[0_0_40px_rgba(255,92,133,0.06)]',
    gold: 'group-hover:shadow-[0_0_40px_rgba(255,200,26,0.06)]',
    violet: 'group-hover:shadow-[0_0_40px_rgba(122,104,255,0.06)]',
    amber: 'group-hover:shadow-[0_0_40px_rgba(255,200,26,0.06)]',
    cyan: 'group-hover:shadow-[0_0_40px_rgba(0,232,174,0.06)]',
  }

  return (
    <div className={`glass-card p-6 border ${colorMap[color]} relative overflow-hidden group card-hover ${glowMap[color]}`}>
      {/* Spotlight glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-2xl ${iconBgMap[color]} flex items-center justify-center relative`}>
            {Icon && <Icon className="w-5 h-5 relative z-10" />}
            {/* Soft icon glow */}
            <div className="absolute inset-0 rounded-2xl bg-current opacity-5 blur-xl" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
              trend === 'up' ? 'bg-teal-500/8 text-teal-400' : 'bg-rose-500/8 text-rose-400'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          {prefix && <span className="text-slate-500 text-lg font-medium">{prefix}</span>}
          <span className="stat-number text-white">{animatedValue.toLocaleString()}</span>
          {suffix && <span className="text-slate-500 text-lg font-medium">{suffix}</span>}
        </div>

        <p className="text-sm text-slate-400 mt-2 font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )
}
