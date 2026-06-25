import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ocean-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} bg-ocean-900/95 border border-ocean-600/20 rounded-3xl shadow-2xl animate-scale-in overflow-hidden`}>
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="flex items-center justify-between p-6 border-b border-ocean-700/15">
          <h3 className="text-xl font-bold text-white font-display">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-ocean-800/40 hover:bg-ocean-700/50 transition-all group border border-ocean-600/10">
            <X className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
