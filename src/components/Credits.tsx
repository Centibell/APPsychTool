import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

// About / how-it-works / sources.
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
                Neuromap is an interactive 3D study guide for{' '}
                <strong className="text-slate-100">AP Psychology</strong>. Orbit, zoom, and click your way through the
                brain, the neuron and synapse, the eye, and the ear to learn the biological bases of behavior — mapped
                to the redesigned AP course (5 units + Science Practices).
              </p>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">How to use it</p>
                <p>
                  Click any structure — in the 3D scene or the list on the left — to read what it does, how it ties to
                  the AP units, common misconceptions, and exam tips. Drill into sub-structures, play the guided
                  “brain activity” scenarios that light up regions step by step, or practice with the built-in
                  question bank.
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">How it works</p>
                <p>
                  It’s a single web page that runs entirely in your browser — no accounts, no servers, nothing to
                  install. The brain, neuron, synapse, eye, and ear aren’t downloaded models; they’re all generated
                  procedurally in code and drawn as a live 3D scene with WebGL. The whole thing is data-driven: each
                  structure’s teaching text lives in one place, and both the 3D scene and the panels read from it.
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">A note on accuracy</p>
                <p>
                  Anatomy and AP definitions follow the College Board Course &amp; Exam Description and a
                  college-level intro-psychology textbook. Where the AP course simplifies the science (e.g. “the
                  amygdala is the fear center”), it’s presented at AP level, not as absolute neuroscience.
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">Built with</p>
                <p className="text-slate-400">
                  React · Three.js · React-Three-Fiber &amp; drei · Zustand · Tailwind CSS · Framer Motion · Vite.
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
