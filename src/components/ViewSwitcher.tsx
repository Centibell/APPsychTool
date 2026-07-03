import { useStore } from '../store'
import type { SceneView } from '../store'

const VIEWS: { id: SceneView; label: string }[] = [
  { id: 'brain', label: 'Brain' },
  { id: 'cell', label: 'Neuron' },
  { id: 'eye', label: 'Eye' },
]

// Segmented control to jump between the three sub-scenes. Selection normally
// drives the view; this is the explicit way back out.
export function ViewSwitcher() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div className="glass-panel flex items-center gap-1 rounded-full p-1 shadow-panel">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            aria-pressed={view === v.id}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === v.id
                ? 'bg-neural-500/25 text-neural-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
