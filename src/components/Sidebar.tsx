import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import {
  ROOT_REGIONS,
  childItems,
  EYE_STRUCTURES,
  EAR_STRUCTURES,
  SYSTEMS,
  REGIONS,
  CONCEPTS,
  getRegion,
  type SystemId,
  type Teaching,
} from '../content'

// The eye/ear sub-scenes have no `system`; give their sidebar sections colors.
const EAR_COLOR = '#fcd34d'

// Left navigation tree. Every structure is reachable here by keyboard — the
// accessibility guarantee (§7): content is never 3D-mouse-only.

function TreeRow({
  item,
  depth,
  color,
}: {
  item: Teaching
  depth: number
  color: string
}) {
  const selectedId = useStore((s) => s.selectedId)
  const drillInto = useStore((s) => s.drillInto)
  // childItems (not childrenOf) so the eye's sub-structures — rods, cones,
  // fovea, blind spot — nest under the Retina too, not just brain regions.
  const kids = childItems(item.id)
  const isSel = selectedId === item.id

  return (
    <>
      <button
        onClick={() => drillInto(item.id)}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        className={`group flex w-full items-center gap-2 rounded-md py-1 pr-2 text-left text-sm transition-colors ${
          isSel ? 'bg-neural-500/20 text-neural-50' : 'text-slate-300 hover:bg-white/5'
        }`}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: color, opacity: isSel ? 1 : 0.5 }}
        />
        <span className="truncate">{item.displayName}</span>
      </button>
      {kids.map((k) => (
        <TreeRow key={k.id} item={k} depth={depth + 1} color={color} />
      ))}
    </>
  )
}

function SearchResults({ query }: { query: string }) {
  const drillInto = useStore((s) => s.drillInto)
  const q = query.toLowerCase()

  const pool: Teaching[] = useMemo(
    () => [...REGIONS, ...EYE_STRUCTURES, ...EAR_STRUCTURES, ...CONCEPTS],
    [],
  )
  const results = pool
    .filter(
      (t) =>
        t.displayName.toLowerCase().includes(q) ||
        t.apTerms.some((term) => term.toLowerCase().includes(q)) ||
        t.oneLiner.toLowerCase().includes(q),
    )
    .slice(0, 40)

  if (results.length === 0)
    return <p className="px-2 py-4 text-sm text-slate-500">No matches for “{query}”.</p>

  return (
    <ul>
      {results.map((r) => (
        <li key={r.id}>
          <button
            onClick={() => drillInto(r.id)}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/5"
          >
            <span className="text-slate-100">{r.displayName}</span>
            <span className="ml-2 text-xs text-slate-500">{r.oneLiner}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setConceptsOpen = useStore((s) => s.setConceptsOpen)
  const setNervousSystemOpen = useStore((s) => s.setNervousSystemOpen)
  const [query, setQuery] = useState('')

  // Root regions grouped by system, in a sensible reading order.
  const groups = useMemo(() => {
    const order: SystemId[] = [
      'cortex-frontal', 'cortex-parietal', 'cortex-temporal', 'cortex-occipital',
      'limbic', 'deep', 'cerebellum', 'brainstem',
    ]
    const bySystem: Partial<Record<SystemId, typeof ROOT_REGIONS>> = {}
    for (const r of ROOT_REGIONS) (bySystem[r.system] ??= []).push(r)
    return order
      .filter((s) => bySystem[s]?.length)
      .map((s) => ({ system: s, regions: bySystem[s]! }))
  }, [])

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.nav
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="pointer-events-auto absolute left-3 top-20 bottom-3 z-20 flex w-64 flex-col"
          aria-label="Brain structures"
        >
          <div className="glass-panel flex min-h-0 flex-1 flex-col rounded-2xl p-3 shadow-panel">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search structures & terms…"
              className="mb-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-neural-400/50 focus:outline-none"
            />
            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto pr-1">
              {query ? (
                <SearchResults query={query} />
              ) : (
                <>
                  {groups.map(({ system, regions }) => (
                    <div key={system} className="mb-2">
                      <p
                        className="mb-0.5 px-2 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: SYSTEMS[system].hex }}
                      >
                        {SYSTEMS[system].label}
                      </p>
                      {regions.map((r) => (
                        <TreeRow key={r.id} item={r} depth={0} color={SYSTEMS[system].hex} />
                      ))}
                    </div>
                  ))}
                  <div className="mb-2">
                    <p className="mb-0.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-neural-300">
                      The Eye
                    </p>
                    {EYE_STRUCTURES.filter((e) => !e.parentId).map((e) => (
                      <TreeRow key={e.id} item={e} depth={0} color={SYSTEMS.eye.hex} />
                    ))}
                  </div>
                  <div className="mb-2">
                    <p className="mb-0.5 px-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: EAR_COLOR }}>
                      The Ear
                    </p>
                    {EAR_STRUCTURES.filter((e) => !e.parentId).map((e) => (
                      <TreeRow key={e.id} item={e} depth={0} color={EAR_COLOR} />
                    ))}
                  </div>
                  <div className="mb-2">
                    <p className="mb-0.5 px-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: SYSTEMS.cellular.hex }}>
                      Cellular / Schematic
                    </p>
                    {getRegion('neuron') && (
                      <TreeRow item={getRegion('neuron')!} depth={0} color={SYSTEMS.cellular.hex} />
                    )}
                  </div>
                  <button
                    onClick={() => setNervousSystemOpen(true)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-white/10"
                  >
                    Nervous system map →
                  </button>
                  <button
                    onClick={() => setConceptsOpen(true)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-white/10"
                  >
                    Concept browser · full course →
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
