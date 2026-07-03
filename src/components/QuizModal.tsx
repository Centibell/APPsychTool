import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import {
  questionsForContext,
  getTeaching,
  type Question,
  type MCQOption,
} from '../content'
import { AiQuizControls } from './AiQuizControls'

// Deterministic shuffle so options don't jump between renders.
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function seedFrom(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff
  return h
}

function MCQView({ q }: { q: Question }) {
  const [picked, setPicked] = useState<number | null>(null)
  const options = useMemo(
    () => shuffle(q.options ?? [], seedFrom(q.id)),
    [q.id, q.options],
  )
  const answered = picked !== null

  const optionState = (opt: MCQOption, i: number) => {
    if (!answered) return 'idle'
    if (opt.correct) return 'correct'
    if (i === picked) return 'wrong'
    return 'muted'
  }

  return (
    <div>
      <p className="text-[15px] leading-relaxed text-slate-100">{q.stem}</p>
      <div className="mt-4 space-y-2">
        {options.map((opt, i) => {
          const state = optionState(opt, i)
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                state === 'idle'
                  ? 'border-white/10 bg-white/5 text-slate-200 hover:border-neural-400/40 hover:bg-white/10'
                  : state === 'correct'
                    ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
                    : state === 'wrong'
                      ? 'border-rose-400/50 bg-rose-400/15 text-rose-100'
                      : 'border-white/5 bg-white/[0.02] text-slate-500'
              }`}
            >
              <span className="mr-2 font-mono text-xs opacity-60">
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
              {answered && state === 'wrong' && opt.rationale && (
                <span className="mt-1 block text-xs text-rose-200/70">{opt.rationale}</span>
              )}
            </button>
          )
        })}
      </div>
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-neural-500/20 bg-neural-500/10 p-3 text-sm text-slate-200"
        >
          <p className="mb-1 font-semibold text-neural-200">Explanation</p>
          <p className="leading-relaxed text-slate-300">{q.explanation}</p>
        </motion.div>
      )}
    </div>
  )
}

function FRQView({ q }: { q: Question }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div>
      <div className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">
          {q.type === 'AAQ' ? 'Article Analysis (AAQ)' : 'Evidence-Based (EBQ)'} · study material
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{q.scenario}</p>
      </div>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-100">{q.stem}</p>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
      >
        {revealed ? 'Hide model answer' : 'Reveal model answer'}
      </button>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-relaxed text-slate-200"
        >
          {q.explanation}
        </motion.div>
      )}
    </div>
  )
}

export function QuizModal() {
  const open = useStore((s) => s.quizOpen)
  const setOpen = useStore((s) => s.setQuizOpen)
  const selectedId = useStore((s) => s.selectedId)

  const [index, setIndex] = useState(0)
  const [aiQuestions, setAiQuestions] = useState<Question[]>([])
  const context = selectedId ? getTeaching(selectedId) : undefined
  const bank = useMemo(
    () => questionsForContext(selectedId ?? undefined),
    [selectedId],
  )
  // AI-generated questions come first so the student sees fresh material.
  const questions = useMemo(() => [...aiQuestions, ...bank], [aiQuestions, bank])
  const q = questions[Math.min(index, questions.length - 1)]

  // Reset to first question + clear AI batch whenever context changes / reopens.
  const openKey = `${open}:${selectedId}`
  const [lastKey, setLastKey] = useState(openKey)
  if (openKey !== lastKey) {
    setLastKey(openKey)
    setIndex(0)
    setAiQuestions([])
  }

  return (
    <AnimatePresence>
      {open && q && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel flex max-h-[88vh] w-full max-w-xl flex-col rounded-2xl p-6 shadow-panel"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-neural-300">
                Practice{context ? ` · ${context.displayName}` : ''}
              </p>
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
            <p className="mb-4 text-xs text-slate-500">
              Question {index + 1} of {questions.length} · vetted question bank
              {q.aiGenerated && ' · AI-generated — verify against your notes'}
            </p>

            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto pr-1">
              {q.type === 'MCQ' ? <MCQView key={q.id} q={q} /> : <FRQView key={q.id} q={q} />}
              {context && (
                <AiQuizControls
                  item={context}
                  apUnit={context.apUnits[0] ?? 1}
                  onGenerated={(qs) => {
                    setAiQuestions((prev) => [...qs, ...prev])
                    setIndex(0)
                  }}
                />
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30 enabled:hover:bg-white/5"
              >
                ← Prev
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={index >= questions.length - 1}
                className="rounded-lg bg-neural-500/20 px-4 py-1.5 text-sm font-medium text-neural-100 disabled:opacity-30 enabled:hover:bg-neural-500/30"
              >
                Next →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
