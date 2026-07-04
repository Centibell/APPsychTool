import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { SCENARIOS } from '../content'

// How long each step holds before auto-advancing.
const STEP_MS = 5200

export function ScenarioPlayer() {
  const open = useStore((s) => s.scenariosOpen)
  const beginScenario = useStore((s) => s.beginScenario)
  const stopScenario = useStore((s) => s.stopScenario)
  const closeScenarios = useStore((s) => s.closeScenarios)
  const setHighlight = useStore((s) => s.setHighlight)

  const [scenarioId, setScenarioId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? null
  const atEnd = scenario ? step >= scenario.steps.length - 1 : false

  // Reset local state whenever the panel closes (store side-effects already
  // handled by closeScenarios / the top-bar toggle).
  useEffect(() => {
    if (!open) {
      setScenarioId(null)
      setStep(0)
      setPlaying(true)
    }
  }, [open])

  // Light up the region for the current step.
  useEffect(() => {
    if (scenario) setHighlight(scenario.steps[step].regionId)
  }, [scenario, step, setHighlight])

  // Auto-advance while playing; stop at the last step.
  useEffect(() => {
    if (!scenario || !playing) return
    const id = setTimeout(() => {
      setStep((s) => {
        if (s < scenario.steps.length - 1) return s + 1
        setPlaying(false)
        return s
      })
    }, STEP_MS)
    return () => clearTimeout(id)
  }, [scenario, step, playing])

  function choose(id: string) {
    setScenarioId(id)
    setStep(0)
    setPlaying(true)
    beginScenario()
  }
  function toMenu() {
    setScenarioId(null)
    setStep(0)
    setPlaying(true)
    stopScenario()
  }
  function replay() {
    setStep(0)
    setPlaying(true)
  }
  function go(delta: number) {
    if (!scenario) return
    setPlaying(false)
    setStep((s) => Math.min(scenario.steps.length - 1, Math.max(0, s + delta)))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          // Centered via auto-margins (not translate) so framer's transform
          // animation doesn't fight the horizontal centering.
          className="pointer-events-none absolute inset-x-0 bottom-4 z-30 mx-auto w-[min(30rem,calc(100vw-1.5rem))]"
        >
          <div className="glass-panel pointer-events-auto rounded-2xl p-4 shadow-panel">
            {!scenario ? (
              // ── Scenario picker ──
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neural-300">
                    Brain activity · pick a scenario
                  </p>
                  <button
                    onClick={closeScenarios}
                    aria-label="Close"
                    className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="grid gap-1.5">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => choose(s.id)}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-colors hover:border-neural-400/40 hover:bg-white/10"
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-100">{s.title}</span>
                        <span className="block truncate text-xs text-slate-400">{s.blurb}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // ── Player ──
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button
                    onClick={toMenu}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Scenarios
                  </button>
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-neural-300">
                    {scenario.icon} {scenario.title}
                  </p>
                  <button
                    onClick={closeScenarios}
                    aria-label="Close"
                    className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Step caption */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="min-h-[5.5rem] rounded-xl border border-neural-500/20 bg-neural-500/10 p-3"
                  >
                    <p className="text-sm font-semibold text-neural-100">
                      <span className="mr-1.5 font-mono text-xs text-neural-300">
                        {step + 1}/{scenario.steps.length}
                      </span>
                      {scenario.steps[step].label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">
                      {scenario.steps[step].text}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {scenario.steps.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? 'w-5 bg-neural-400' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => go(-1)}
                    disabled={step === 0}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30 enabled:hover:bg-white/5"
                  >
                    ← Prev
                  </button>
                  {atEnd && !playing ? (
                    <button
                      onClick={replay}
                      className="rounded-lg bg-neural-500/25 px-4 py-1.5 text-sm font-medium text-neural-100 hover:bg-neural-500/35"
                    >
                      ↻ Replay
                    </button>
                  ) : (
                    <button
                      onClick={() => setPlaying((p) => !p)}
                      className="rounded-lg bg-neural-500/25 px-4 py-1.5 text-sm font-medium text-neural-100 hover:bg-neural-500/35"
                    >
                      {playing ? '❚❚ Pause' : '▶ Play'}
                    </button>
                  )}
                  <button
                    onClick={() => go(1)}
                    disabled={atEnd}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30 enabled:hover:bg-white/5"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
