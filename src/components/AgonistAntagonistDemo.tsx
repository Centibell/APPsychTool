import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

// An interactive look at how drugs act at a receptor site: the natural
// neurotransmitter activates it, an agonist mimics it, an antagonist blocks it.

type Mode = 'nt' | 'agonist' | 'antagonist'

const MODES: { id: Mode; label: string; color: string }[] = [
  { id: 'nt', label: 'Neurotransmitter', color: '#f0abfc' },
  { id: 'agonist', label: 'Agonist', color: '#22d3ee' },
  { id: 'antagonist', label: 'Antagonist', color: '#fb7185' },
]

const COPY: Record<Mode, { fires: boolean; caption: string }> = {
  nt: {
    fires: true,
    caption:
      'The natural neurotransmitter fits its receptor like a key in a lock and activates it — the signal passes to the next neuron.',
  },
  agonist: {
    fires: true,
    caption:
      'An agonist is a drug shaped enough like the neurotransmitter to fit and turn the lock too. It mimics or boosts the normal signal.',
  },
  antagonist: {
    fires: false,
    caption:
      'An antagonist fits the receptor but doesn’t activate it — it jams the lock so the real neurotransmitter can’t bind. The signal is blocked.',
  },
}

export function AgonistAntagonistDemo() {
  const open = useStore((s) => s.drugDemoOpen)
  const setOpen = useStore((s) => s.setDrugDemoOpen)
  const [mode, setMode] = useState<Mode>('nt')

  const m = MODES.find((x) => x.id === mode)!
  const fires = COPY[mode].fires

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
            className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-panel"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">Agonists &amp; Antagonists</h2>
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

            {/* Tabs */}
            <div className="mb-4 grid grid-cols-3 gap-1.5">
              {MODES.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setMode(x.id)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    mode === x.id ? 'text-void-900' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                  style={mode === x.id ? { background: x.color, borderColor: x.color } : undefined}
                >
                  {x.label}
                </button>
              ))}
            </div>

            {/* Diagram */}
            <div className="relative grid h-52 place-items-end overflow-hidden rounded-xl border border-white/10 bg-black/30 p-4">
              {/* Blocked NT trying to get in (antagonist mode) */}
              {mode === 'antagonist' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute left-6 top-4 flex items-center gap-1"
                >
                  <span className="h-5 w-5 rounded-full" style={{ background: '#f0abfc', opacity: 0.5 }} />
                  <span className="text-[10px] text-rose-300">locked out ✕</span>
                </motion.div>
              )}

              {/* Docking molecule */}
              <motion.div
                key={mode}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="absolute left-1/2 top-8 -translate-x-1/2"
              >
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-[10px] font-bold text-void-900 shadow-lg"
                  style={{ background: m.color }}
                >
                  {mode === 'nt' ? 'NT' : mode === 'agonist' ? 'AG' : 'AN'}
                </div>
              </motion.div>

              {/* Receptor on the membrane */}
              <div className="relative flex w-full items-end justify-center">
                <div
                  className="grid h-10 w-20 place-items-center rounded-t-2xl border-2 transition-colors"
                  style={{
                    borderColor: fires ? '#34d399' : '#64748b',
                    background: fires ? 'rgba(52,211,153,0.18)' : 'rgba(100,116,139,0.12)',
                    boxShadow: fires ? '0 0 24px 2px rgba(52,211,153,0.45)' : 'none',
                  }}
                >
                  <span className="text-[9px] uppercase tracking-wide text-slate-400">receptor</span>
                </div>
              </div>
              {/* Membrane */}
              <div className="absolute inset-x-0 bottom-0 h-3 bg-emerald-300/20" />
            </div>

            {/* Signal status */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  fires ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'
                }`}
              >
                {fires ? '✓ Signal fires' : '✕ Signal blocked'}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-300">{COPY[mode].caption}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
