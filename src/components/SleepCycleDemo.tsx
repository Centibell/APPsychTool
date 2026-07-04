import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

// A simple hypnogram: sleep stages across a night. Deep NREM-3 dominates early;
// REM periods lengthen toward morning.

const ROWS = ['Awake', 'REM', 'N1', 'N2', 'N3'] // stage index 0..4 (top → deep)

// [hours, stage]
const POINTS: [number, number][] = [
  [0, 0], [0.15, 2], [0.35, 3], [0.6, 4], [1.0, 4], [1.2, 3], [1.4, 1], [1.65, 2],
  [1.9, 3], [2.25, 4], [2.5, 3], [2.7, 1], [2.95, 2], [3.25, 3], [3.6, 4], [3.85, 3],
  [4.05, 1], [4.35, 2], [4.6, 3], [4.9, 2], [5.15, 1], [5.45, 2], [5.7, 3], [5.95, 2],
  [6.2, 1], [6.5, 2], [6.75, 1], [7.0, 0],
]

const W = 340
const H = 190
const LEFT = 42
const TOP = 12
const PLOT_W = W - LEFT - 12
const ROW_H = 30
const HOURS = 7

const xAt = (t: number) => LEFT + (t / HOURS) * PLOT_W
const yAt = (stage: number) => TOP + stage * ROW_H + ROW_H / 2

// Stepped path (hold each stage, then drop/rise to the next).
function stepPath() {
  let d = `M ${xAt(POINTS[0][0])} ${yAt(POINTS[0][1])}`
  for (let i = 1; i < POINTS.length; i++) {
    d += ` L ${xAt(POINTS[i][0])} ${yAt(POINTS[i - 1][1])}`
    d += ` L ${xAt(POINTS[i][0])} ${yAt(POINTS[i][1])}`
  }
  return d
}

export function SleepCycleDemo() {
  const open = useStore((s) => s.sleepCycleOpen)
  const setOpen = useStore((s) => s.setSleepCycleOpen)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-panel"
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">A night of sleep</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Stages cycle about every 90 minutes. Notice how deep sleep (N3) shrinks and REM grows toward morning.
            </p>

            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
                {ROWS.map((label, i) => (
                  <g key={label}>
                    <line x1={LEFT} y1={yAt(i)} x2={W - 12} y2={yAt(i)} stroke="rgba(255,255,255,0.06)" />
                    <text x={LEFT - 8} y={yAt(i) + 3} textAnchor="end" fontSize="10" fill={i === 1 ? '#a78bfa' : '#94a3b8'}>
                      {label}
                    </text>
                  </g>
                ))}
                {/* Hour ticks */}
                {Array.from({ length: HOURS + 1 }, (_, h) => (
                  <text key={h} x={xAt(h)} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b">
                    {h}h
                  </text>
                ))}
                <path d={stepPath()} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
                {/* REM highlight dots */}
                {POINTS.filter((p) => p[1] === 1).map((p, i) => (
                  <circle key={i} cx={xAt(p[0])} cy={yAt(1)} r="3" fill="#a78bfa" />
                ))}
              </svg>
            </div>

            <div className="mt-3 rounded-xl border border-neural-500/20 bg-neural-500/10 p-3 text-xs leading-relaxed text-slate-300">
              <span className="font-semibold text-neural-200">Exam tip · </span>
              Order down: NREM-1 → 2 → 3, then back up into <span className="text-[#a78bfa]">REM</span>. Deep slow-wave
              sleep (N3) is front-loaded; REM (where vivid dreams happen) lengthens as the night goes on.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
