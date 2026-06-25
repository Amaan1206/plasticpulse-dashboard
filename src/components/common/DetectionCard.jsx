import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function DetectionCard({ detection, index }) {
  const isCorrect = detection.correct_bin
  const isContaminated = detection.contaminated
  const confidence = Math.round(detection.confidence * 100)

  const typeConfig = {
    PET: { gradient: 'from-blue-500 to-teal-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/15' },
    HDPE: { gradient: 'from-teal-500 to-mint-400', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/15' },
    PVC: { gradient: 'from-rose-500 to-ember-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/15' },
    LDPE: { gradient: 'from-sun-500 to-sun-300', badge: 'bg-sun-500/10 text-sun-400 border-sun-500/15' },
    PP: { gradient: 'from-iris-500 to-iris-300', badge: 'bg-iris-500/10 text-iris-400 border-iris-500/15' },
    PS: { gradient: 'from-ember-500 to-sun-400', badge: 'bg-ember-500/10 text-ember-400 border-ember-500/15' },
    Other: { gradient: 'from-slate-500 to-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/15' },
  }

  const config = typeConfig[detection.plastic_type] || typeConfig.Other

  return (
    <div 
      className={`glass-card p-5 relative overflow-hidden detection-card-enter stagger-${Math.min(index + 1, 5)}`}
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full ${isCorrect ? 'bg-gradient-to-b from-teal-400 to-teal-600' : 'bg-gradient-to-b from-rose-400 to-rose-600'}`} />
      
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 pl-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-ocean-950/50`}>
              <span className="text-xl font-bold text-white font-mono">#{detection.resin_code}</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-[15px]">{detection.plastic_type} Plastic</h4>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                {detection.location_name || detection.device_id}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isContaminated && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/8 text-rose-400 text-xs font-bold border border-rose-500/15">
                <AlertTriangle className="w-3 h-3" />
                Contaminated
              </span>
            )}
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isCorrect 
                ? 'bg-teal-500/8 text-teal-400 border-teal-500/15' 
                : 'bg-rose-500/8 text-rose-400 border-rose-500/15'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isCorrect ? 'Correct Bin' : 'Wrong Bin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-ocean-700/15">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-500 font-mono">Confidence {confidence}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-500 font-mono">Fill {detection.fill_level_pct}%</span>
          </div>
        </div>

        {isContaminated && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
            <p className="text-xs text-rose-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Rinse Before Recycling — Food residue detected on item
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
