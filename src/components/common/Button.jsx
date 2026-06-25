export default function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) {
  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-iris-500 hover:from-teal-400 hover:to-iris-400 text-white shadow-lg shadow-teal-500/15 hover:shadow-teal-500/25 border border-teal-500/20 hover:border-teal-400/40',
    secondary: 'bg-ocean-800/60 hover:bg-ocean-700/60 text-slate-300 border border-ocean-600/20 hover:border-ocean-500/30',
    danger: 'bg-gradient-to-r from-rose-500 to-ember-500 hover:from-rose-400 hover:to-ember-400 text-white shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 border border-rose-500/20',
    ghost: 'hover:bg-ocean-800/40 text-slate-400 hover:text-white',
    gold: 'bg-gradient-to-r from-sun-500 to-ember-500 hover:from-sun-400 hover:to-ember-400 text-ocean-950 font-bold shadow-lg shadow-sun-500/15',
    glass: 'liquid-glass-pill-active text-white border-teal-500/20 hover:border-teal-400/40 hover:bg-teal-500/5 shadow-lg shadow-teal-500/5',
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.97] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
