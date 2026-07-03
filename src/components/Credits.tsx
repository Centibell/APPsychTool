import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { DEFAULT_MODEL } from '../ai/models'

// Credits, sources, and honesty notes (handoff §7/§8/§10).
export function Credits() {
  const open = useStore((s) => s.creditsOpen)
  const setOpen = useStore((s) => s.setCreditsOpen)
  const rendererName = useStore((s) => s.rendererName)

  return (
    <AnimatePresence>
      {open && (
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
            onClick={(e) => e.stopPropagation()}
            className="glass-panel scroll-slim max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-panel"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">About Neuromap</h2>
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

            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <p>
                An interactive 3D brain and eye for learning <strong className="text-slate-100">AP Psychology</strong>,
                mapped to the redesigned course (5 units + Science Practices). Everything runs in your browser — no
                accounts, no servers.
              </p>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">A note on accuracy</p>
                <p>
                  Anatomy and AP definitions follow the College Board Course &amp; Exam Description and a
                  college-level intro-psychology textbook. Where the AP course simplifies the science (e.g. “the
                  amygdala is the fear center”), it’s presented at AP level, not as absolute neuroscience.
                  <strong className="text-amber-200"> AI-generated questions can still contain errors — verify them against your notes.</strong>
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">3D & on-device AI</p>
                <p>
                  The brain, neuron, synapse, and eye are generated procedurally in code — no third-party anatomical
                  assets. Optional practice questions are written on your own GPU by {DEFAULT_MODEL.label} via WebLLM
                  (WebGPU); the model downloads once and is cached for offline use. It never contacts a server.
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">Built with</p>
                <p className="text-slate-400">
                  React · Three.js · React-Three-Fiber &amp; drei · Zustand · Tailwind CSS · Framer Motion · Vite ·
                  @mlc-ai/web-llm. Model weights are subject to their respective licenses (Qwen / Llama).
                </p>
              </div>

              {rendererName && (
                <p className="text-xs text-slate-600">Renderer detected: {rendererName}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
