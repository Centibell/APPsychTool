import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

// Hidden easter-egg mini-game: the Stroop test. Name the INK color of the word,
// not the word itself — reading is automatic, so a mismatched word fights you.
// A real cognitive-psychology demo (selective attention / interference).

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
]

const ROUND_SECONDS = 30
const BEST_KEY = 'neuromap-stroop-best'

function randInt(n: number) {
  return Math.floor(Math.random() * n)
}

export function StroopGame() {
  const open = useStore((s) => s.gameOpen)
  const setOpen = useStore((s) => s.setGameOpen)

  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [wordIdx, setWordIdx] = useState(0)
  const [inkIdx, setInkIdx] = useState(1)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [best, setBest] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)

  const roundStart = useRef(0)
  const rtSum = useRef(0)
  const rtCount = useRef(0)

  useEffect(() => {
    const stored = Number(localStorage.getItem(BEST_KEY) || 0)
    if (!Number.isNaN(stored)) setBest(stored)
  }, [])

  // Reset when the panel closes.
  useEffect(() => {
    if (!open) {
      setState('idle')
      setScore(0)
      setTimeLeft(ROUND_SECONDS)
      setFlash(null)
    }
  }, [open])

  // Countdown while playing.
  useEffect(() => {
    if (state !== 'playing') return
    if (timeLeft <= 0) {
      setState('over')
      setBest((b) => {
        const next = Math.max(b, score)
        localStorage.setItem(BEST_KEY, String(next))
        return next
      })
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [state, timeLeft, score])

  function nextRound() {
    const w = randInt(COLORS.length)
    // Bias toward a mismatched ink so it's actually a Stroop challenge.
    let ink = randInt(COLORS.length)
    if (ink === w && Math.random() < 0.75) ink = (ink + 1 + randInt(COLORS.length - 1)) % COLORS.length
    setWordIdx(w)
    setInkIdx(ink)
    roundStart.current = performance.now()
  }

  function start() {
    setScore(0)
    setTimeLeft(ROUND_SECONDS)
    rtSum.current = 0
    rtCount.current = 0
    nextRound()
    setState('playing')
  }

  function answer(i: number) {
    if (state !== 'playing') return
    if (i === inkIdx) {
      rtSum.current += performance.now() - roundStart.current
      rtCount.current += 1
      setScore((s) => s + 1)
      setFlash('ok')
      nextRound()
    } else {
      setTimeLeft((t) => Math.max(0, t - 2)) // 2s penalty
      setFlash('bad')
    }
    setTimeout(() => setFlash(null), 180)
  }

  const avgRt = rtCount.current ? Math.round(rtSum.current / rtCount.current) : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
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
              <h2 className="text-lg font-semibold text-slate-50">
                Stroop Test <span className="text-xs font-normal text-neural-300">· hidden game</span>
              </h2>
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

            {state === 'idle' && (
              <div>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  Tap the button matching the <strong className="text-slate-100">ink color</strong> of the word — not
                  what the word says. Reading is automatic, so a mismatched word fights you. That interference is the
                  <strong className="text-neural-200"> Stroop effect</strong>. Score as many as you can in {ROUND_SECONDS}s;
                  a wrong tap costs 2 seconds.
                </p>
                {best > 0 && <p className="mb-3 text-xs text-slate-500">Best: {best}</p>}
                <div className="grid place-items-center">
                  <button
                    onClick={start}
                    className="rounded-xl bg-neural-500/80 px-5 py-2 text-sm font-semibold text-void-900 hover:bg-neural-400"
                  >
                    Start
                  </button>
                </div>
              </div>
            )}

            {state === 'playing' && (
              <div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Score <span className="font-semibold text-slate-100">{score}</span></span>
                  <span className={`font-mono ${timeLeft <= 5 ? 'text-rose-300' : 'text-slate-300'}`}>{timeLeft}s</span>
                </div>
                <div
                  className={`mb-5 grid h-28 place-items-center rounded-xl border transition-colors ${
                    flash === 'ok' ? 'border-emerald-400/50 bg-emerald-400/10' : flash === 'bad' ? 'border-rose-400/50 bg-rose-400/10' : 'border-white/10 bg-black/20'
                  }`}
                >
                  <span className="text-5xl font-extrabold tracking-wide" style={{ color: COLORS[inkIdx].hex }}>
                    {COLORS[wordIdx].name}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => answer(i)}
                      aria-label={c.name}
                      className="h-11 rounded-lg border border-white/15 transition-transform hover:-translate-y-0.5"
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {state === 'over' && (
              <div className="text-center">
                <p className="text-sm text-slate-400">Time!</p>
                <p className="my-1 text-4xl font-extrabold text-neural-100">{score}</p>
                <p className="text-xs text-slate-500">
                  Best {best}
                  {avgRt > 0 && <> · avg {avgRt} ms / answer</>}
                </p>
                <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-slate-400">
                  Naming the ink is slower when the word disagrees because reading is an automatic, over-learned
                  process that interferes with the color task — the classic Stroop effect.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={start}
                    className="rounded-lg bg-neural-500/25 px-4 py-1.5 text-sm font-medium text-neural-100 hover:bg-neural-500/35"
                  >
                    Play again
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-1.5 text-sm text-slate-300 hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
