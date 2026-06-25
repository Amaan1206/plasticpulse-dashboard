export default function Badge({ children, color = 'teal', size = 'sm' }) {
  const colorMap = {
    teal: 'bg-teal-500/8 text-teal-400 border-teal-500/15',
    iris: 'bg-iris-500/8 text-iris-400 border-iris-500/15',
    rose: 'bg-rose-500/8 text-rose-400 border-rose-500/15',
    sun: 'bg-sun-500/8 text-sun-400 border-sun-500/15',
    mint: 'bg-mint-500/8 text-mint-400 border-mint-500/15',
    ember: 'bg-ember-500/8 text-ember-400 border-ember-500/15',
    slate: 'bg-slate-500/8 text-slate-400 border-slate-500/15',
    // Backward compatibility
    cyan: 'bg-teal-500/8 text-teal-400 border-teal-500/15',
    violet: 'bg-iris-500/8 text-iris-400 border-iris-500/15',
    coral: 'bg-rose-500/8 text-rose-400 border-rose-500/15',
    gold: 'bg-sun-500/8 text-sun-400 border-sun-500/15',
    emerald: 'bg-teal-500/8 text-teal-400 border-teal-500/15',
    amber: 'bg-sun-500/8 text-sun-400 border-sun-500/15',
  }

  const sizeMap = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border font-bold ${colorMap[color] || colorMap.teal} ${sizeMap[size]}`}>
      {children}
    </span>
  )
}
