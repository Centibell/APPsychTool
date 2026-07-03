import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { conceptsByTopic, AP_UNITS } from '../content'

// Full-course concept browser. Covers the non-anatomical material (research
// methods, social, personality, development, disorders) that has no geometry,
// so coverage spans all AP units. Selecting a concept routes through the same
// InfoPanel used by 3D structures.
export function ConceptBrowser() {
  const open = useStore((s) => s.conceptsOpen)
  const setOpen = useStore((s) => s.setConceptsOpen)
  const select = useStore((s) => s.select)

  const byTopic = conceptsByTopic()
  const unitTitle = (u: number) => AP_UNITS.find((x) => x.unit === u)?.title ?? `Unit ${u}`

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
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl p-6 shadow-panel"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Concept Browser</h2>
                <p className="text-sm text-slate-400">
                  The full course — including topics the brain map doesn’t cover.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="scroll-slim grid min-h-0 flex-1 gap-4 overflow-y-auto sm:grid-cols-2">
              {Object.entries(byTopic).map(([topic, concepts]) => (
                <div key={topic} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-2 text-sm font-semibold text-neural-200">{topic}</p>
                  <ul className="space-y-1">
                    {concepts.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            select(c.id)
                            setOpen(false)
                          }}
                          className="w-full rounded-md px-2 py-1 text-left text-sm text-slate-300 transition-colors hover:bg-white/5"
                        >
                          <span className="text-slate-100">{c.displayName}</span>
                          <span className="ml-1.5 text-xs text-slate-500">
                            · {unitTitle(c.apUnits[0])}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
