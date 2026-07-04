import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import {
  getTeaching,
  getRegion,
  childItems,
  parentItem,
  kindOf,
  SYSTEMS,
  EYE_BY_ID,
  EAR_BY_ID,
  type Teaching,
} from '../content'

function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-xs"
      style={{
        borderColor: color ? `${color}55` : 'rgba(148,163,184,0.25)',
        color: color ?? '#cbd5e1',
        background: color ? `${color}14` : 'rgba(148,163,184,0.08)',
      }}
    >
      {children}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {children}
    </div>
  )
}

export function InfoPanel() {
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const drillInto = useStore((s) => s.drillInto)
  const goToParent = useStore((s) => s.goToParent)
  const setQuizOpen = useStore((s) => s.setQuizOpen)

  const item = selectedId ? getTeaching(selectedId) : undefined

  return (
    <AnimatePresence mode="wait">
      {item && (
        <motion.aside
          key={item.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="pointer-events-auto absolute inset-x-3 bottom-16 top-auto z-20 flex max-h-[60%] flex-col sm:inset-x-auto sm:right-3 sm:top-20 sm:bottom-auto sm:max-h-[calc(100%-6rem)] sm:w-[min(92vw,25rem)]"
        >
          <PanelBody item={item} onSelect={select} onDrill={drillInto} onUp={goToParent} onQuiz={() => setQuizOpen(true)} />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function PanelBody({
  item,
  onSelect,
  onDrill,
  onUp,
  onQuiz,
}: {
  item: Teaching
  onSelect: (id: string) => void
  onDrill: (id: string) => void
  onUp: () => void
  onQuiz: () => void
}) {
  const region = getRegion(item.id)
  const sys = region ? SYSTEMS[region.system] : undefined
  const parent = parentItem(item.id)
  const children = childItems(item.id)
  const related = item.relatedIds.map(getTeaching).filter(Boolean) as Teaching[]
  const clearSelection = useStore((s) => s.select)

  return (
    <div className="scroll-slim glass-panel flex min-h-0 flex-col overflow-y-auto rounded-2xl p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          {sys && (
            <button
              onClick={() => parent && onDrill(parent.id)}
              className="text-xs font-medium"
              style={{ color: sys.hex }}
            >
              {sys.label}
            </button>
          )}
          <h2 className="text-xl font-semibold text-slate-50">{item.displayName}</h2>
        </div>
        <button
          onClick={() => clearSelection(null)}
          aria-label="Close"
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {parent && (
        <button
          onClick={onUp}
          className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-slate-400 transition-colors hover:text-neural-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {parent.displayName}
        </button>
      )}

      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-200">{item.functionShort}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.functionDeep}</p>

      {(() => {
        const isEye = !!EYE_BY_ID[item.id]
        const jump = EYE_BY_ID[item.id]?.jumpToRegionId ?? EAR_BY_ID[item.id]?.jumpToRegionId
        const dest = jump ? getTeaching(jump) : undefined
        if (!jump || !dest) return null
        return (
          <button
            onClick={() => onDrill(jump)}
            className="mt-3 w-full rounded-xl border border-sys-occipital/40 bg-sys-occipital/10 px-4 py-2 text-sm font-medium text-sys-occipital transition-transform hover:-translate-y-0.5"
          >
            Follow the {isEye ? 'optic' : 'auditory'} nerve → {dest.displayName}
          </button>
        )
      })()}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.apUnits.map((u) => (
          <Chip key={u} color="#22d3ee">Unit {u}</Chip>
        ))}
      </div>

      {children.length > 0 && (
        <Section title="Explore deeper">
          <div className="flex flex-wrap gap-1.5">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => onDrill(c.id)}
                className="rounded-lg border border-neural-700/40 bg-neural-900/20 px-2.5 py-1 text-xs text-neural-100 transition-colors hover:border-neural-400/60 hover:bg-neural-500/15"
              >
                {c.displayName} →
              </button>
            ))}
          </div>
        </Section>
      )}

      {item.misconceptions && item.misconceptions.length > 0 && (
        <Section title="Watch out">
          <ul className="space-y-1.5">
            {item.misconceptions.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-200/90">
                <span aria-hidden className="mt-0.5 text-amber-400">⚠</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.examTips && item.examTips.length > 0 && (
        <Section title="Exam tips">
          <ul className="space-y-1.5">
            {item.examTips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-emerald-200/90">
                <span aria-hidden className="mt-0.5 text-emerald-400">◎</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.mnemonic && (
        <Section title="Mnemonic">
          <p className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-sm text-violet-100">
            {item.mnemonic}
          </p>
        </Section>
      )}

      {item.apTerms.length > 0 && (
        <Section title="Key terms">
          <div className="flex flex-wrap gap-1.5">
            {item.apTerms.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section title="See also">
          <div className="flex flex-wrap gap-1.5">
            {related.map((r) => {
              const rSys = getRegion(r.id)
              const color = rSys ? SYSTEMS[rSys.system].hex : '#94a3b8'
              const navigate = kindOf(r.id) === 'region' ? onDrill : onSelect
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(r.id)}
                  className="rounded-full border px-2.5 py-0.5 text-xs transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: `${color}55`, color, background: `${color}12` }}
                >
                  {r.displayName}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      <button
        onClick={onQuiz}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-neural-500 to-neural-400 px-4 py-2.5 text-sm font-semibold text-void-900 shadow-glow transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Practice this →
      </button>
    </div>
  )
}
