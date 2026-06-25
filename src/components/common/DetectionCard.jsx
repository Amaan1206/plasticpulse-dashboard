import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { getCategory } from '../../lib/categories.js'

export default function DetectionCard({ detection, index }) {
  const isContaminated = detection.contaminated
  const confidence = Math.round(detection.confidence * 100)
  const category = getCategory(detection.material_category)
  const handlingAction = detection.handling_action || category.handling_action

  return (
    <div
      className={`glass-card p-5 relative overflow-hidden detection-card-enter stagger-${Math.min(index + 1, 5)}`}
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b ${category.gradient}`} />

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 pl-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg shadow-ocean-950/50`}>
              <category.Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white text-[15px]">{category.key}</h4>
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
            {handlingAction && (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${category.badge}`}>
                {handlingAction}
              </span>
            )}
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
              Rinse Before Recycling — Residue detected on item
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
