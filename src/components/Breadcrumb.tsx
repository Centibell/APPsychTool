import { useStore } from '../store'
import { ancestryOf, kindOf, getTeaching } from '../content'

// Shows where you are in the drill-down and lets you jump back up a level.
export function Breadcrumb() {
  const selectedId = useStore((s) => s.selectedId)
  const drillInto = useStore((s) => s.drillInto)
  const resetView = useStore((s) => s.resetView)

  if (!selectedId) return null

  const isRegion = kindOf(selectedId) === 'region'
  const chain = isRegion ? ancestryOf(selectedId) : []
  const item = getTeaching(selectedId)

  return (
    <nav
      aria-label="Breadcrumb"
      className="pointer-events-auto absolute left-1/2 top-4 z-10 hidden -translate-x-1/2 sm:block"
    >
      <div className="glass-panel flex items-center gap-1 rounded-full px-3 py-1.5 text-xs shadow-panel">
        <button onClick={resetView} className="text-slate-400 transition-colors hover:text-neural-300">
          Brain
        </button>
        {chain.length > 0
          ? chain.map((r, i) => (
              <span key={r.id} className="flex items-center gap-1">
                <span className="text-slate-600">/</span>
                <button
                  onClick={() => drillInto(r.id)}
                  className={
                    i === chain.length - 1
                      ? 'font-medium text-slate-100'
                      : 'text-slate-400 transition-colors hover:text-neural-300'
                  }
                >
                  {r.displayName}
                </button>
              </span>
            ))
          : item && (
              <span className="flex items-center gap-1">
                <span className="text-slate-600">/</span>
                <span className="font-medium text-slate-100">{item.displayName}</span>
              </span>
            )}
      </div>
    </nav>
  )
}
