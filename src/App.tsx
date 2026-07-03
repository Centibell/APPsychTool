import { useStore } from './store'
import { Scene } from './scene/Scene'
import { NoWebGLFallback } from './components/NoWebGLFallback'
import { Sidebar } from './components/Sidebar'
import { InfoPanel } from './components/InfoPanel'
import { Breadcrumb } from './components/Breadcrumb'
import { ConceptBrowser } from './components/ConceptBrowser'
import { QuizModal } from './components/QuizModal'
import { ViewSwitcher } from './components/ViewSwitcher'
import { Credits } from './components/Credits'

function IconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
        active
          ? 'border-neural-400/50 bg-neural-500/20 text-neural-100'
          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

export default function App() {
  const webglOk = useStore((s) => s.webglOk)
  const liteMode = useStore((s) => s.liteMode)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebar = useStore((s) => s.setSidebar)
  const toggleLiteMode = useStore((s) => s.toggleLiteMode)
  const resetView = useStore((s) => s.resetView)
  const setCreditsOpen = useStore((s) => s.setCreditsOpen)

  if (!webglOk) return <NoWebGLFallback />

  return (
    <main className="relative h-full w-full overflow-hidden">
      <Scene />

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <IconButton
            label={sidebarOpen ? 'Hide structures' : 'Show structures'}
            active={sidebarOpen}
            onClick={() => setSidebar(!sidebarOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </IconButton>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-slate-100">
              Neuromap <span className="text-neural-400">· AP Psychology</span>
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Click a structure, or search the list, to explore it.
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {liteMode && (
            <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200 sm:inline">
              Lite mode
            </span>
          )}
          <IconButton label="Toggle lite mode" active={liteMode} onClick={toggleLiteMode}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <IconButton label="Reset view" onClick={resetView}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <IconButton label="About & credits" onClick={() => setCreditsOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
      </header>

      <Breadcrumb />
      <Sidebar />
      <InfoPanel />
      <ViewSwitcher />
      <ConceptBrowser />
      <QuizModal />
      <Credits />
    </main>
  )
}
