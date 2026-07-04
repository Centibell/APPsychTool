import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useStore } from '../store'

// A hierarchical map of how the nervous system divides — CNS/PNS, then somatic
// vs. autonomic, then sympathetic vs. parasympathetic. Rendered as an indented,
// color-coded tree so the branching structure reads at a glance.

function Branch({
  color,
  title,
  tag,
  desc,
  children,
}: {
  color: string
  title: string
  tag?: string
  desc: string
  children?: ReactNode
}) {
  return (
    <div>
      <div
        className="rounded-xl border px-3 py-2"
        style={{ borderColor: `${color}55`, background: `${color}12` }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold text-slate-100">{title}</span>
          {tag && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ color, background: `${color}22` }}
            >
              {tag}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
      </div>
      {children && (
        <div className="ml-3 mt-2 space-y-2 border-l border-white/10 pl-4">{children}</div>
      )}
    </div>
  )
}

export function NervousSystemDiagram() {
  const open = useStore((s) => s.nervousSystemOpen)
  const setOpen = useStore((s) => s.setNervousSystemOpen)

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
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">The Nervous System</h2>
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
              How your neurons are organized, from the whole system down to its two opposing branches.
            </p>

            <Branch
              color="#22d3ee"
              title="Nervous System"
              desc="Every neuron in your body, split into two great divisions."
            >
              <Branch
                color="#60a5fa"
                title="Central Nervous System"
                tag="CNS"
                desc="The brain and spinal cord — the body’s command and processing center."
              />
              <Branch
                color="#a78bfa"
                title="Peripheral Nervous System"
                tag="PNS"
                desc="Every nerve outside the brain and spinal cord, linking the CNS to the rest of the body."
              >
                <Branch
                  color="#34d399"
                  title="Somatic"
                  tag="voluntary"
                  desc="Controls skeletal muscles and carries sensory input — the actions you take on purpose."
                />
                <Branch
                  color="#fbbf24"
                  title="Autonomic"
                  tag="involuntary"
                  desc="Runs organs and glands automatically — heartbeat, digestion, breathing."
                >
                  <Branch
                    color="#fb7185"
                    title="Sympathetic"
                    tag="fight-or-flight"
                    desc="Arouses the body for action: raises heart rate, dilates pupils, releases adrenaline."
                  />
                  <Branch
                    color="#2dd4bf"
                    title="Parasympathetic"
                    tag="rest-and-digest"
                    desc="Calms the body back down: lowers heart rate and conserves and restores energy."
                  />
                </Branch>
              </Branch>
            </Branch>

            <div className="mt-4 rounded-xl border border-neural-500/20 bg-neural-500/10 p-3 text-xs leading-relaxed text-slate-300">
              <span className="font-semibold text-neural-200">Exam tip · </span>
              Somatic = voluntary, autonomic = involuntary. The autonomic branches are opposites:
              <span className="text-rose-300"> sympathetic</span> stresses/sprints,
              <span className="text-teal-300"> parasympathetic</span> pauses/relaxes.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
