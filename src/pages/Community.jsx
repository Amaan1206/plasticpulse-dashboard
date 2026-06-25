import { useState } from 'react'
import { Users, FileBarChart, Trophy } from 'lucide-react'
import DriveManager from './DriveManager.jsx'
import AreaReport from './AreaReport.jsx'
import Scoreboard from './Scoreboard.jsx'

const tabs = [
  { key: 'drives', label: 'Drives', icon: Users },
  { key: 'reports', label: 'Reports', icon: FileBarChart },
  { key: 'scoreboard', label: 'Scoreboard', icon: Trophy },
]

export default function Community() {
  const [tab, setTab] = useState('drives')

  return (
    <div className="space-y-6 page-transition">
      {/* Tab switcher */}
      <div className="relative z-10 flex items-center">
        <div className="flex items-center bg-ocean-800/40 rounded-2xl p-1 border border-ocean-600/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === t.key
                  ? 'bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(0,232,174,0.08)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'drives' && <DriveManager />}
      {tab === 'reports' && <AreaReport />}
      {tab === 'scoreboard' && <Scoreboard />}
    </div>
  )
}
