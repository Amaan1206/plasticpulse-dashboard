import { useState, useEffect } from 'react'
import { useWebSocket } from '../context/WebSocketContext.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import ProgressBar from '../components/common/ProgressBar.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import DetectionCard from '../components/common/DetectionCard.jsx'
import { Plus, MapPin, Users, Weight, Calendar, ChevronDown, ChevronUp, Share2, Download, Trophy, Target, Zap, Inbox } from 'lucide-react'

export default function DriveManager() {
  const { driveCounters, detections } = useWebSocket()
  const [drives, setDrives] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedDrive, setExpandedDrive] = useState(null)
  const [newDrive, setNewDrive] = useState({ title: '', area: '', target_kg: '', date: '' })

  // Fetch drives from API
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await fetch('/api/drives')
        if (res.ok) {
          const data = await res.json()
          setDrives(data)
        }
      } catch {
        // Server not available
      }
    }
    fetchDrives()
    const interval = setInterval(fetchDrives, 30000)
    return () => clearInterval(interval)
  }, [])

  const activeDrives = drives.filter(d => d.status === 'active')
  const upcomingDrives = drives.filter(d => d.status === 'upcoming')
  const completedDrives = drives.filter(d => d.status === 'complete')

  const handleCreateDrive = async () => {
    if (!newDrive.title || !newDrive.area || !newDrive.target_kg || !newDrive.date) return
    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDrive),
      })
      if (res.ok) {
        const drive = await res.json()
        setDrives(prev => [drive, ...prev])
      }
    } catch {
      // Fallback: create locally
      const drive = {
        id: `drv-${Date.now()}`,
        title: newDrive.title,
        area: newDrive.area,
        target_kg: parseFloat(newDrive.target_kg),
        collected_kg: 0,
        participant_count: 0,
        date: newDrive.date,
        status: 'upcoming',
        lat: 19.0760,
        lng: 72.8777,
      }
      setDrives(prev => [drive, ...prev])
    }
    setNewDrive({ title: '', area: '', target_kg: '', date: '' })
    setShowCreateModal(false)
  }

  const shareOnWhatsApp = (drive) => {
    const text = `🌊 PlasticPulse Cleanup Drive Report\n\n${drive.title}\n📍 ${drive.area}\n♻️ ${drive.collected_kg} kg collected\n👥 ${drive.participant_count} participants\n\nJoin the movement!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const hasDrives = drives.length > 0

  return (
    <div className="space-y-8 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-sun-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Cleanup Drive Manager</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Organize, monitor, and celebrate community cleanup drives</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="glass">
          <Plus className="w-4 h-4" />
          Create New Drive
        </Button>
      </div>

      {!hasDrives ? (
        <div className="relative z-10 glass-card p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-ocean-800/40 border border-ocean-600/10 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-ocean-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-display">No Cleanup Drives Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed mb-6">
            Create your first cleanup drive to start organizing community efforts. Active drives will show real-time collection data once your backend is connected.
          </p>
          <Button onClick={() => setShowCreateModal(true)} variant="glass">
            <Plus className="w-4 h-4" />
            Create First Drive
          </Button>
        </div>
      ) : (
        <>
          {activeDrives.length > 0 && (
            <div className="relative z-10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 font-display">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-glow-teal" />
                Active Drives
              </h3>
              {activeDrives.map(drive => {
                const liveKg = drive.collected_kg + (driveCounters[drive.id] || 0)
                const progress = Math.min(100, (liveKg / drive.target_kg) * 100)

                return (
                  <div key={drive.id} className="glass-card p-7 animate-fade-in-up card-hover">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-white font-display">{drive.title}</h4>
                            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5" />
                              {drive.area}
                            </p>
                          </div>
                          <Badge color="teal">Active</Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5 bg-ocean-800/25 px-3 py-1.5 rounded-xl border border-ocean-600/5 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {drive.date}
                          </span>
                          <span className="flex items-center gap-1.5 bg-ocean-800/25 px-3 py-1.5 rounded-xl border border-ocean-600/5 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            {drive.participant_count} participants
                          </span>
                        </div>

                        <div className="p-5 bg-ocean-800/15 rounded-2xl border border-ocean-600/8">
                          <div className="flex items-end gap-2 mb-3">
                            <span className="font-mono text-5xl font-bold text-white">{Math.floor(liveKg)}</span>
                            <span className="text-lg text-slate-500 font-semibold mb-2">/ {drive.target_kg} kg</span>
                          </div>
                          <ProgressBar value={liveKg} max={drive.target_kg} color="teal" height="h-3" />
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-slate-600 font-medium">{Math.round(progress)}% of target</span>
                            <span className="text-xs text-slate-600 font-medium">{Math.max(0, drive.target_kg - liveKg)} kg remaining</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="h-44 bg-ocean-800/15 rounded-2xl flex items-center justify-center border border-ocean-600/8 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-iris-500/5" />
                          <div className="text-center relative z-10">
                            <MapPin className="w-10 h-10 text-teal-500/15 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 font-semibold">{drive.area}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedDrive(expandedDrive === drive.id ? null : drive.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean-800/25 hover:bg-ocean-800/40 text-slate-400 text-sm font-bold transition-all duration-300 border border-ocean-600/10 hover:border-ocean-500/15"
                        >
                          {expandedDrive === drive.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          View Full Details
                        </button>
                      </div>
                    </div>

                    {expandedDrive === drive.id && (
                      <div className="mt-7 pt-7 border-t border-ocean-700/15 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="w-4 h-4 text-teal-400" />
                          <p className="text-sm font-bold text-white font-display">Live Scan Feed</p>
                        </div>
                        {detections.length > 0 ? (
                          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                            {detections.slice(0, 5).map((det, i) => (
                              <DetectionCard key={det.id} detection={det} index={i} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600 text-center py-8 font-medium">Live scan data will appear here once connected</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {completedDrives.length > 0 && (
            <div className="relative z-10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 font-display">
                <Trophy className="w-5 h-5 text-sun-400" />
                Completed Drives
              </h3>
              {completedDrives.map(drive => (
                <div key={drive.id} className="glass-card p-7 border-l-[3px] border-l-sun-500/40 card-hover">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-white font-display">{drive.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{drive.area} • {drive.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => shareOnWhatsApp(drive)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 text-sm font-bold hover:bg-teal-500/15 transition-all border border-teal-500/15">
                        <Share2 className="w-4 h-4" /> WhatsApp
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-800/40 text-slate-400 text-sm font-bold hover:bg-ocean-700/40 transition-all border border-ocean-600/10">
                        <Download className="w-4 h-4" /> Image
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'kg collected', value: drive.collected_kg, color: 'text-white' },
                      { label: 'participants', value: drive.participant_count, color: 'text-white' },
                      { label: 'of target', value: `${Math.round((drive.collected_kg / drive.target_kg) * 100)}%`, color: 'text-teal-400' },
                      { label: 'status', value: 'Done', color: 'text-iris-400' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-5 bg-ocean-800/15 rounded-2xl border border-ocean-600/5">
                        <p className={`font-mono text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] text-slate-600 mt-1.5 font-bold uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingDrives.length > 0 && (
            <div className="relative z-10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 font-display">
                <Target className="w-5 h-5 text-iris-400" />
                Upcoming Drives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingDrives.map(drive => (
                  <div key={drive.id} className="glass-card p-6 card-hover">
                    <h4 className="font-bold text-white text-lg font-display">{drive.title}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {drive.area}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-ocean-800/25 px-2.5 py-1 rounded-xl border border-ocean-600/5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {drive.date}
                      </span>
                      <span className="flex items-center gap-1.5 bg-ocean-800/25 px-2.5 py-1 rounded-xl border border-ocean-600/5 font-medium">
                        <Weight className="w-3.5 h-3.5" />
                        {drive.target_kg} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-ocean-700/10">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        {drive.participant_count} registered
                      </span>
                      <button className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-xs font-bold hover:bg-teal-500/15 transition-all border border-teal-500/15">
                        Join Drive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Cleanup Drive">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Drive Title</label>
            <input type="text" value={newDrive.title} onChange={e => setNewDrive(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Sunday Beach Cleanup" className="w-full bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-teal-500/30 transition-colors font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Area / Location</label>
            <input type="text" value={newDrive.area} onChange={e => setNewDrive(prev => ({ ...prev, area: e.target.value }))} placeholder="e.g., Juhu Beach" className="w-full bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-teal-500/30 transition-colors font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Target Kilograms</label>
              <input type="number" value={newDrive.target_kg} onChange={e => setNewDrive(prev => ({ ...prev, target_kg: e.target.value }))} placeholder="500" className="w-full bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-teal-500/30 transition-colors font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Drive Date</label>
              <input type="date" value={newDrive.date} onChange={e => setNewDrive(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-ocean-800/40 border border-ocean-600/15 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-teal-500/30 transition-colors font-medium" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreateDrive} className="flex-1">Launch Drive</Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
