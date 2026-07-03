import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Question, Teaching } from '../content'
import { detectWebGPU } from '../ai/webgpu'
import { DEFAULT_MODEL } from '../ai/models'
import { ensureEngine, generateBatch, isEngineReady } from '../ai/engine'

type Phase = 'checking' | 'unsupported' | 'idle' | 'consent' | 'loading' | 'generating' | 'ready' | 'error'

interface Props {
  item: Teaching
  apUnit: number
  onGenerated: (qs: Question[]) => void
}

export function AiQuizControls({ item, apUnit, onGenerated }: Props) {
  const [phase, setPhase] = useState<Phase>('checking')
  const [reason, setReason] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState<string>()

  useEffect(() => {
    let alive = true
    detectWebGPU().then((tier) => {
      if (!alive) return
      if (tier.supported) setPhase('idle')
      else {
        setPhase('unsupported')
        setReason(tier.reason)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  async function run() {
    setError(undefined)
    try {
      if (!isEngineReady()) {
        setPhase('loading')
        await ensureEngine((p) => {
          setProgress(p.progress)
          setProgressText(p.text)
        })
      }
      setPhase('generating')
      const qs = await generateBatch(item, apUnit, 3)
      if (qs.length === 0) throw new Error('The model returned no valid questions. Try again.')
      onGenerated(qs)
      setPhase('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'On-device generation failed.')
      setPhase('error')
    }
  }

  if (phase === 'checking') return null

  if (phase === 'unsupported') {
    return (
      <p className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-slate-500">
        ✨ On-device AI practice needs WebGPU (desktop Chrome or Edge). {reason} You’re seeing the vetted question bank, which works everywhere.
      </p>
    )
  }

  if (phase === 'consent') {
    return (
      <div className="mt-4 rounded-xl border border-neural-500/25 bg-neural-500/10 p-3">
        <p className="text-sm font-medium text-neural-100">Generate unlimited practice on your device</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">
          This downloads a small AI model (~{Math.round(DEFAULT_MODEL.approxSizeMB)} MB, one time) and runs it
          entirely in your browser — nothing is sent to any server. Questions are grounded in this app’s vetted
          facts, but AI can still err, so verify against your notes.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={run}
            className="rounded-lg bg-neural-500/80 px-3 py-1.5 text-sm font-medium text-void-900 hover:bg-neural-400"
          >
            Download &amp; generate
          </button>
          <button
            onClick={() => setPhase('idle')}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'loading' || phase === 'generating') {
    const pct = Math.round(progress * 100)
    return (
      <div className="mt-4 rounded-xl border border-neural-500/20 bg-neural-500/10 p-3">
        <p className="text-sm font-medium text-neural-100">
          {phase === 'loading' ? 'Preparing the on-device model…' : 'Writing questions…'}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-neural-400"
            animate={{ width: phase === 'generating' ? '100%' : `${pct}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <p className="mt-1.5 truncate text-xs text-slate-400">
          {phase === 'generating' ? 'Grounded in this structure’s vetted facts.' : progressText || `${pct}%`}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => (isEngineReady() ? run() : setPhase('consent'))}
        className="w-full rounded-xl border border-neural-500/30 bg-neural-500/10 px-4 py-2 text-sm font-medium text-neural-100 transition-colors hover:bg-neural-500/20"
      >
        ✨ {phase === 'ready' ? 'Generate more with on-device AI' : 'Generate practice with on-device AI'}
      </button>
      {error && <p className="mt-2 text-xs text-rose-300">{error} Falling back to the vetted bank.</p>}
    </div>
  )
}
