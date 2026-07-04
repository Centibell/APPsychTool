import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

// A hands-on demo of opponent-process theory: stare at the color-reversed flag,
// then at a blank white field, and the afterimage appears in true red/white/blue
// as the fatigued opponent channels rebound.

const STARE_SECONDS = 12

// Color-reversed "flag": cyan↔red, orange↔blue, black↔white in the afterimage.
function ReverseFlag() {
  const stripes = Array.from({ length: 13 }, (_, i) => (i % 2 === 0 ? '#3ad1c9' : '#101418'))
  return (
    <div className="relative overflow-hidden rounded-md" style={{ width: 320, height: 208 }}>
      <div className="flex h-full w-full flex-col">
        {stripes.map((c, i) => (
          <div key={i} className="w-full" style={{ flex: 1, background: c }} />
        ))}
      </div>
      {/* Canton */}
      <div
        className="absolute left-0 top-0 grid place-content-center gap-[6px] p-[8px]"
        style={{ width: '42%', height: `${(7 / 13) * 100}%`, background: '#101418', gridTemplateColumns: 'repeat(6, 1fr)' }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className="block h-[7px] w-[7px] rounded-full" style={{ background: '#f5a623' }} />
        ))}
      </div>
    </div>
  )
}

function Dot() {
  return <span className="absolute left-1/2 top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/70" />
}

export function AfterimageDemo() {
  const open = useStore((s) => s.afterimageOpen)
  const setOpen = useStore((s) => s.setAfterimageOpen)

  const [phase, setPhase] = useState<'intro' | 'stare' | 'reveal'>('intro')
  const [count, setCount] = useState(STARE_SECONDS)

  // Reset when closed.
  useEffect(() => {
    if (!open) {
      setPhase('intro')
      setCount(STARE_SECONDS)
    }
  }, [open])

  // Countdown during the stare phase.
  useEffect(() => {
    if (phase !== 'stare') return
    if (count <= 0) {
      setPhase('reveal')
      return
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, count])

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
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">Afterimage demo</h2>
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

            {phase === 'intro' && (
              <div>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  This flag is painted in the “wrong” colors. Stare at the black dot in its center without moving your
                  eyes for {STARE_SECONDS} seconds — then it’ll vanish and you’ll see the flag rebound in true
                  <span className="text-rose-300"> red</span>,<span className="text-slate-100"> white</span>, and
                  <span className="text-sky-300"> blue</span>. That afterimage is opponent-process theory in action.
                </p>
                <div className="grid place-items-center">
                  <button
                    onClick={() => {
                      setCount(STARE_SECONDS)
                      setPhase('stare')
                    }}
                    className="rounded-xl bg-neural-500/80 px-4 py-2 text-sm font-medium text-void-900 hover:bg-neural-400"
                  >
                    Start
                  </button>
                </div>
              </div>
            )}

            {phase === 'stare' && (
              <div className="grid place-items-center gap-3">
                <div className="relative grid place-items-center">
                  <ReverseFlag />
                  <Dot />
                </div>
                <p className="text-sm text-slate-400">
                  Keep your eyes on the dot… <span className="font-mono text-neural-200">{count}s</span>
                </p>
              </div>
            )}

            {phase === 'reveal' && (
              <div className="grid place-items-center gap-4">
                <div className="relative grid place-items-center rounded-md bg-white" style={{ width: 320, height: 208 }}>
                  <Dot />
                </div>
                <p className="text-center text-sm leading-relaxed text-slate-300">
                  See the ghostly <span className="text-rose-300">red</span>/<span className="text-slate-100">white</span>/
                  <span className="text-sky-300">blue</span> flag? The green, orange, and black channels fatigued, so
                  their opponents rebounded when you looked at white.
                </p>
                <button
                  onClick={() => {
                    setCount(STARE_SECONDS)
                    setPhase('stare')
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10"
                >
                  ↻ Try again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
