import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, RotateCcw, CheckCircle2, XCircle, ChevronRight, Star, Workflow,
  Trash2, Camera, Cpu, Radio, Gauge, Truck, Building2, ArrowRight,
} from 'lucide-react'
import learnData from '../mock/learn.json'

// ─── End-to-end project journey ─────────────────────────────────────────
const journey = [
  { icon: Trash2,    title: 'Waste Dropped',     desc: 'A citizen drops an item into a WasteWise smart bin.', accent: 'teal',
    detail: 'Smart bins sit at high-traffic civic points. Citizens need no app and no sorting knowledge — they just drop waste as they normally would. The work happens after the drop.' },
  { icon: Camera,    title: 'Camera Captures',   desc: 'The ESP32-S3 camera photographs the item as it falls in.', accent: 'sky',
    detail: 'A low-cost ESP32-S3 board with an onboard camera snaps the item automatically the moment it enters the bin — no staff, no manual scanning, no citizen action required.' },
  { icon: Cpu,       title: 'AI Classifies',     desc: 'On-device AI sorts it into one of nine waste categories.', accent: 'iris',
    detail: 'A lightweight model runs on the device itself — no cloud round-trip — labelling the item as Plastic, Glass, Metal, Paper, Biological and four more in under a second.' },
  { icon: Radio,     title: 'Streamed Live',     desc: 'The detection streams over WebSocket to the dashboard.', accent: 'mint',
    detail: 'Each detection is pushed live with category, confidence, timestamp and bin ID, building a permanent, searchable record the city can audit any time.' },
  { icon: Gauge,     title: 'Bin Monitored',     desc: 'Fill level is tracked; a full bin raises an overflow alert.', accent: 'sun',
    detail: 'Continuous fill tracking shows which bins fill fastest and predicts overflow before it happens — replacing fixed guesswork routes with real demand.' },
  { icon: Truck,     title: 'Municipality Acts', desc: 'The ward office is alerted and dispatches a crew.', accent: 'ember', municipal: true,
    detail: 'Crews are sent only to bins that actually need servicing instead of running fixed daily rounds — cutting fuel, labour hours and missed pickups across the ward.' },
  { icon: Building2, title: 'City Benefits',      desc: 'Cleaner wards, higher recycling, data-driven planning.', accent: 'rose', municipal: true,
    detail: 'Ward officers get live segregation accuracy, hotspot maps and trends — turning street-level waste data into measurable policy and cleaner neighbourhoods.' },
]

const benefits = ['Faster overflow response', 'Less street litter', 'Higher recycling rate', 'Data-driven ward planning']

const jAccent = {
  teal:  { text: 'text-teal-400',  glow: 'rgba(0,232,174,0.5)',  bg: 'bg-teal-500/12' },
  sky:   { text: 'text-sky-400',   glow: 'rgba(56,189,248,0.5)', bg: 'bg-sky-500/12' },
  iris:  { text: 'text-iris-400',  glow: 'rgba(122,104,255,0.5)',bg: 'bg-iris-500/12' },
  mint:  { text: 'text-mint-400',  glow: 'rgba(26,255,136,0.5)', bg: 'bg-mint-500/12' },
  sun:   { text: 'text-sun-400',   glow: 'rgba(255,200,26,0.5)', bg: 'bg-sun-500/12' },
  ember: { text: 'text-ember-400', glow: 'rgba(255,133,61,0.5)', bg: 'bg-ember-500/12' },
  rose:  { text: 'text-rose-400',  glow: 'rgba(255,92,133,0.5)', bg: 'bg-rose-500/12' },
}

function ProjectJourney() {
  const total = journey.length
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(null)

  // Auto-orbit through the steps; pause while the user is exploring a node.
  useEffect(() => {
    if (hovered !== null) return
    const id = setInterval(() => setActive((a) => (a + 1) % total), 1500)
    return () => clearInterval(id)
  }, [hovered, total])

  // Geometry — place nodes evenly around a circle, starting at the top.
  const R = 41 // radius as % of the square container
  const nodePos = journey.map((_, i) => {
    const theta = (-90 + i * (360 / total)) * (Math.PI / 180)
    return { left: 50 + R * Math.cos(theta), top: 50 + R * Math.sin(theta) }
  })

  const C = 2 * Math.PI * R
  const progress = (active + 1) / total // arc fill follows the orbit
  const shownIndex = hovered !== null ? hovered : active
  const shown = journey[shownIndex]
  const showDetail = hovered !== null
  const sa = jAccent[shown.accent]

  return (
    <div className="relative z-10 glass-card p-6 lg:p-9 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-iris-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <Workflow className="w-5 h-5 text-teal-400" />
          <h3 className="text-xl font-bold text-white font-display">How WasteWise Works — End to End</h3>
        </div>
        <p className="text-sm text-slate-400 font-medium mb-8">
          From the moment waste is dropped to a cleaner, smarter city.
          <span className="text-slate-500"> Hover any step to learn more.</span>
        </p>

        <div className="relative mx-auto w-full max-w-[560px] aspect-square">
          {/* Orbit ring + animated progress arc */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" strokeDasharray="0.6 2.4" />
            <motion.circle
              cx="50" cy="50" r={R} fill="none" stroke="url(#jgrad)" strokeWidth="1.1" strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 3px rgba(0,232,174,0.5))' }}
            />
            <defs>
              <linearGradient id="jgrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E8AE" />
                <stop offset="50%" stopColor="#FFC81A" />
                <stop offset="100%" stopColor="#FF5C85" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center hub — reflects the active step, or the hovered one in detail */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52%] aspect-square rounded-full bg-ocean-900/70 border border-white/10 backdrop-blur-xl grid place-items-center text-center p-5 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={shownIndex + (showDetail ? '-d' : '')}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-2xl grid place-items-center mb-3 ${sa.bg}`} style={{ boxShadow: `0 0 22px -2px ${sa.glow}` }}>
                  <shown.icon className={`w-6 h-6 ${sa.text}`} />
                </div>
                <span className={`text-[10px] font-bold font-mono ${sa.text}`}>STEP {shownIndex + 1} / {total}</span>
                <h4 className="text-base lg:text-lg font-bold text-white font-display mt-1">{shown.title}</h4>
                <p className="text-[11px] lg:text-xs text-slate-400 font-medium mt-1.5 leading-relaxed max-w-[200px]">
                  {showDetail ? shown.detail : shown.desc}
                </p>
                {shown.municipal && (
                  <span className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-ember-400 bg-ember-500/10 border border-ember-500/20 px-2 py-0.5 rounded-md">
                    <Building2 className="w-3 h-3" /> MUNICIPAL BENEFIT
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step nodes around the circle */}
          {journey.map((step, i) => {
            const a = jAccent[step.accent]
            const on = i === shownIndex || i === active
            const pos = nodePos[i]
            return (
              <button
                key={step.title}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: 'translate(-50%,-50%)' }}
                className="absolute z-10 group"
                aria-label={step.title}
              >
                <motion.div
                  animate={{ scale: on ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                  className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-2xl grid place-items-center ring-1 transition-colors duration-300 ${on ? `${a.bg} ring-white/25` : 'bg-ocean-800/80 ring-white/10 hover:bg-ocean-700/80'}`}
                  style={on ? { boxShadow: `0 0 24px -2px ${a.glow}` } : undefined}
                >
                  <step.icon className={`w-[22px] h-[22px] transition-colors duration-300 ${on ? a.text : 'text-slate-400'}`} />
                  {i === active && hovered === null && (
                    <span className="absolute inset-0 rounded-2xl animate-ping" style={{ boxShadow: `0 0 0 2px ${a.glow}` }} />
                  )}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ocean-900 border border-white/15 grid place-items-center text-[9px] font-bold font-mono text-slate-300">{i + 1}</span>
                </motion.div>
              </button>
            )
          })}
        </div>

        {/* Municipal impact chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mr-1">Municipal impact</span>
          {benefits.map((b) => (
            <span key={b} className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LearningHub() {
  const [quizState, setQuizState] = useState({ currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showResults: false })

  const quiz = learnData.quiz
  const currentQ = quiz[quizState.currentQuestion]

  useEffect(() => {
    const saved = localStorage.getItem('wastewise_quiz')
    if (saved) {
      const parsed = JSON.parse(saved)
      setQuizState(prev => ({ ...prev, ...parsed }))
    }
  }, [])

  const handleAnswer = (index) => {
    if (quizState.answered) return
    const isCorrect = index === currentQ.correct
    const newState = { ...quizState, answered: true, selectedAnswer: index, score: isCorrect ? quizState.score + 1 : quizState.score }
    setQuizState(newState)
    localStorage.setItem('wastewise_quiz', JSON.stringify(newState))
  }

  const nextQuestion = () => {
    if (quizState.currentQuestion + 1 >= quiz.length) {
      setQuizState(prev => ({ ...prev, showResults: true }))
    } else {
      const newState = { ...quizState, currentQuestion: quizState.currentQuestion + 1, answered: false, selectedAnswer: null }
      setQuizState(newState)
      localStorage.setItem('wastewise_quiz', JSON.stringify(newState))
    }
  }

  const resetQuiz = () => {
    const newState = { currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showResults: false }
    setQuizState(newState)
    localStorage.setItem('wastewise_quiz', JSON.stringify(newState))
  }

  const getScoreMessage = (score) => {
    const pct = (score / quiz.length) * 100
    if (pct >= 90) return 'Outstanding! You are a segregation pro.'
    if (pct >= 70) return 'Great job! You know your waste categories well.'
    if (pct >= 50) return 'Good effort! Review the category cards and try again.'
    return 'Keep learning! Check the category guide above.'
  }

  return (
    <div className="space-y-10 page-transition">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-mint-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 glass-card p-7">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-500 to-jade-400 flex items-center justify-center shadow-lg shadow-mint-500/20">
            <BookOpen className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-display">WasteWise Learning Hub</h2>
            <p className="text-sm text-slate-400 font-medium">Know your categories. Segregate right. Save the city.</p>
          </div>
        </div>
      </div>

      {/* End-to-end animated project journey */}
      <ProjectJourney />

      {/* Quiz Mode */}
      <div className="relative z-10 glass-card p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 font-display">
          <Star className="w-5 h-5 text-amber-500" />
          Test Your Segregation IQ
        </h3>

        {quizState.showResults ? (
          <div className="text-center py-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-sun-400 to-ember-400 flex items-center justify-center mb-6 shadow-xl shadow-sun-500/20">
              <span className="text-4xl font-bold text-slate-800 font-mono">{quizState.score}/{quiz.length}</span>
            </motion.div>
            <p className="text-xl text-slate-800 font-bold font-display mb-2">{getScoreMessage(quizState.score)}</p>
            <button onClick={resetQuiz} className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-violet-500/10 text-violet-500 font-bold hover:bg-violet-500/15 transition-all border border-violet-400/15">
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Question {quizState.currentQuestion + 1} of {quiz.length}</span>
                <span className="text-xs text-slate-400 font-bold">Score: {quizState.score}</span>
              </div>
              <div className="h-2.5 bg-ocean-800/50 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                <motion.div className="h-full bg-gradient-to-r from-jade-400 to-violet-500 relative overflow-hidden" initial={{ width: 0 }} animate={{ width: `${((quizState.currentQuestion + 1) / quiz.length) * 100}%` }} transition={{ duration: 0.5 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-wave" />
                </motion.div>
              </div>
            </div>

            <div className="text-center mb-8">
              <motion.div key={currentQ.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl mb-6">{currentQ.image}</motion.div>
              <p className="text-xl text-slate-800 font-bold font-display">{currentQ.question}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {currentQ.options.map((option, i) => {
                const isSelected = quizState.selectedAnswer === i
                const isCorrect = i === currentQ.correct
                const showCorrect = quizState.answered && isCorrect
                const showWrong = quizState.answered && isSelected && !isCorrect

                return (
                  <motion.button
                    key={i}
                    whileHover={!quizState.answered ? { scale: 1.02 } : {}}
                    whileTap={!quizState.answered ? { scale: 0.97 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={quizState.answered}
                    className={`p-5 rounded-2xl border text-sm font-bold transition-all duration-300 ${
                      showCorrect ? 'bg-violet-500/10 border-teal-500/30 text-violet-500' :
                      showWrong ? 'bg-terracotta-400/10 border-rose-500/30 text-terracotta-500' :
                      isSelected ? 'bg-violet-500/10 border-teal-500/30 text-violet-500' :
                      'bg-ocean-800/20 border-white/50 text-slate-300 hover:bg-white/40 hover:border-ocean-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2.5">
                      {showCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showWrong && <XCircle className="w-5 h-5" />}
                      {option}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {quizState.answered && (
                <motion.div initial={{ opacity: 0, height: 0, y: 20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="mt-8 p-6 bg-ocean-800/20 rounded-2xl border border-white/50 max-w-xl mx-auto">
                  <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                  <button onClick={nextQuestion} className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500/10 text-violet-500 font-bold hover:bg-violet-500/15 transition-all border border-violet-400/15">
                    {quizState.currentQuestion + 1 >= quiz.length ? 'See Results' : 'Next Question'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
