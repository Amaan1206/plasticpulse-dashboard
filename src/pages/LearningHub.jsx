import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/common/Modal.jsx'
import { BookOpen, ArrowRight, RotateCcw, CheckCircle2, XCircle, ChevronRight, Droplets, Recycle, Truck, Factory, Shirt, Sparkles, Beaker, Flame, Leaf, Star } from 'lucide-react'
import learnData from '../mock/learn.json'

const resinGradients = {
  1: 'from-violet-500 via-iris-400 to-jade-400',
  2: 'from-jade-400 via-jade-400 to-mint-500',
  3: 'from-terracotta-400 via-terracotta-300 to-ember-400',
  4: 'from-amber-400 via-amber-300 to-ember-400',
  5: 'from-violet-500 via-iris-400 to-iris-600',
  6: 'from-ember-400 via-sun-400 to-sun-500',
  7: 'from-slate-400 via-slate-300 to-slate-500',
}

const binColors = {
  'Blue': 'bg-violet-500/8 text-violet-500 border-violet-400/15',
  'Red': 'bg-rose-500/8 text-terracotta-500 border-terracotta-400/15',
}

const recyclableColors = {
  'Recyclable': 'bg-jade-400/8 text-jade-500 border-jade-400/15',
  'Non-Recyclable': 'bg-rose-500/8 text-terracotta-500 border-terracotta-400/15',
  'Drop-off Only': 'bg-sun-500/8 text-amber-500 border-sun-500/15',
}

const journeySteps = [
  { icon: Recycle, label: 'PET bottle in correct bin', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: Truck, label: 'Municipal collection truck', color: 'text-amber-500', bg: 'bg-amber-400/10' },
  { icon: Factory, label: 'Arrives at recycling facility', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { icon: Droplets, label: 'Shredded into flakes', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Sparkles, label: 'Flakes cleaned & processed', color: 'text-violet-500', bg: 'bg-iris-500/10' },
  { icon: Shirt, label: 'Spun into polyester fibre', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: CheckCircle2, label: 'Becomes a new T-shirt', color: 'text-jade-500', bg: 'bg-mint-500/10' },
]

// ─── Main Learning Hub ───────────────────────────────────────────────
export default function LearningHub() {
  const [selectedResin, setSelectedResin] = useState(null)
  const [quizState, setQuizState] = useState({ currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showResults: false })
  const [journeyVisible, setJourneyVisible] = useState(false)
  const [journeyStep, setJourneyStep] = useState(0)
  const journeyRef = useRef(null)

  const quiz = learnData.quiz
  const currentQ = quiz[quizState.currentQuestion]

  useEffect(() => {
    const saved = localStorage.getItem('plasticpulse_quiz')
    if (saved) {
      const parsed = JSON.parse(saved)
      setQuizState(prev => ({ ...prev, ...parsed }))
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setJourneyVisible(true) }, { threshold: 0.3 })
    if (journeyRef.current) observer.observe(journeyRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (journeyVisible && journeyStep < journeySteps.length) {
      const timer = setTimeout(() => setJourneyStep(prev => prev + 1), 700)
      return () => clearTimeout(timer)
    }
  }, [journeyVisible, journeyStep])

  const handleAnswer = (index) => {
    if (quizState.answered) return
    const isCorrect = index === currentQ.correct
    const newState = { ...quizState, answered: true, selectedAnswer: index, score: isCorrect ? quizState.score + 1 : quizState.score }
    setQuizState(newState)
    localStorage.setItem('plasticpulse_quiz', JSON.stringify(newState))
  }

  const nextQuestion = () => {
    if (quizState.currentQuestion + 1 >= quiz.length) {
      setQuizState(prev => ({ ...prev, showResults: true }))
    } else {
      const newState = { ...quizState, currentQuestion: quizState.currentQuestion + 1, answered: false, selectedAnswer: null }
      setQuizState(newState)
      localStorage.setItem('plasticpulse_quiz', JSON.stringify(newState))
    }
  }

  const resetQuiz = () => {
    const newState = { currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showResults: false }
    setQuizState(newState)
    localStorage.setItem('plasticpulse_quiz', JSON.stringify(newState))
  }

  const getScoreMessage = (score) => {
    if (score >= 9) return 'Outstanding! You are a PlasticPulse expert!'
    if (score >= 7) return 'Great job! You know your plastics well.'
    if (score >= 5) return 'Good effort! Review the resin codes and try again.'
    return 'Keep learning! Check the resin code cards above.'
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
            <h2 className="text-2xl font-bold text-slate-800 font-display">Plastic Learning Hub</h2>
            <p className="text-sm text-slate-400 font-medium">Know your plastic. Segregate right. Save the city.</p>
          </div>
        </div>
      </div>



      {/* Resin Code Cards */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 font-display">
          <Beaker className="w-5 h-5 text-violet-500" />
          Know Your Plastic
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {learnData.resin_codes.map((resin) => (
            <motion.div
              key={resin.code}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card p-6 cursor-pointer card-hover border-l-[3px] border-l-transparent hover:border-l-teal-500/50 relative overflow-hidden group"
              onClick={() => setSelectedResin(resin)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-jade-400/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resinGradients[resin.code]} flex items-center justify-center mb-5 shadow-lg`}>
                  <span className="text-3xl font-bold text-slate-800 font-mono">{resin.code}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg font-display">{resin.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">{resin.full_name}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${binColors[resin.bin] || binColors.Blue}`}>
                    {resin.bin} Bin
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${recyclableColors[resin.recyclable] || recyclableColors['Recyclable']}`}>
                    {resin.recyclable}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  <span className="font-bold text-slate-400">Common:</span> {resin.examples.slice(0, 2).join(', ')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resin Detail Modal */}
      <Modal isOpen={!!selectedResin} onClose={() => setSelectedResin(null)} title={selectedResin?.full_name} size="lg">
        {selectedResin && (
          <div className="space-y-5">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${resinGradients[selectedResin.code]} flex items-center justify-center shadow-xl`}>
                <span className="text-4xl font-bold text-slate-800 font-mono">{selectedResin.code}</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800 font-display">{selectedResin.name}</h4>
                <p className="text-sm text-slate-400 font-medium">Decomposes in: <span className="text-terracotta-500 font-bold">{selectedResin.decomposition}</span></p>
              </div>
            </div>
            <div className="p-5 bg-ocean-800/30 rounded-2xl border border-white/50">
              <p className="text-sm font-bold text-slate-300 mb-3">Common Indian Examples</p>
              <div className="flex flex-wrap gap-2">
                {selectedResin.examples.map(ex => (
                  <span key={ex} className="px-3 py-2 bg-white/40 rounded-xl text-sm text-slate-300 font-medium border border-white/50">{ex}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 mb-2 font-display">Why It Matters</p>
              <p className="text-sm text-slate-400 leading-relaxed">{selectedResin.why}</p>
            </div>
            <div className="p-5 bg-teal-500/5 border border-teal-500/10 rounded-2xl">
              <p className="text-sm font-bold text-violet-500 mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                What To Do Right Now
              </p>
              <p className="text-sm text-slate-300">{selectedResin.action}</p>
            </div>
            {selectedResin.contamination && (
              <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <p className="text-sm font-bold text-terracotta-500 mb-1 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Contamination Warning
                </p>
                <p className="text-sm text-slate-300">{selectedResin.contamination}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Plastic Journey Animation */}
      <div ref={journeyRef} className="relative z-10 glass-card p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3 font-display">
          <Leaf className="w-5 h-5 text-jade-500" />
          Your Bisleri Bottle's Second Life
        </h3>
        <div className="relative">
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-ocean-800">
            <motion.div className="h-full bg-gradient-to-r from-jade-400 via-iris-500 to-mint-500" initial={{ width: '0%' }} animate={{ width: journeyVisible ? '100%' : '0%' }} transition={{ duration: 5, ease: 'easeInOut' }} />
          </div>
          <div className="grid grid-cols-7 gap-3 relative z-10">
            {journeySteps.map((step, i) => {
              const StepIcon = step.icon
              const isVisible = journeyStep > i
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: isVisible ? 1 : 0.2, y: isVisible ? 0 : 30 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-ocean-800/50 border border-white/50 flex items-center justify-center mb-4 transition-all duration-500 ${isVisible ? 'shadow-lg' : ''}`}>
                    <StepIcon className={`w-8 h-8 transition-colors duration-500 ${isVisible ? step.color : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-xs font-semibold transition-colors duration-500 ${isVisible ? 'text-slate-300' : 'text-slate-400'}`}>{step.label}</p>
                </motion.div>
              )
            })}
          </div>
          {journeyStep >= journeySteps.length && (
            <div className="text-center mt-8">
              <button onClick={() => { setJourneyStep(0); setTimeout(() => setJourneyStep(1), 100) }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/40 hover:bg-white/50 text-slate-400 text-sm font-bold transition-all border border-white/50 hover:border-violet-200/30">
                <RotateCcw className="w-4 h-4" />
                Replay Animation
              </button>
            </div>
          )}
        </div>
      </div>

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
