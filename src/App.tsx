import { useEffect, useRef, lazy, Suspense } from 'react'
import { useStore } from './store'
import { Scene } from './scene/Scene'

// Hidden nextbot horror game — code-split so it (and its assets) only load when
// unlocked by typing "chai".
const NextbotGame = lazy(() => import('./games/NextbotGame'))
import { NoWebGLFallback } from './components/NoWebGLFallback'
import { Sidebar } from './components/Sidebar'
import { InfoPanel } from './components/InfoPanel'
import { Breadcrumb } from './components/Breadcrumb'
import { ConceptBrowser } from './components/ConceptBrowser'
import { QuizModal } from './components/QuizModal'
import { ViewSwitcher } from './components/ViewSwitcher'
import { ScenarioPlayer } from './components/ScenarioPlayer'
import { NervousSystemDiagram } from './components/NervousSystemDiagram'
import { AfterimageDemo } from './components/AfterimageDemo'
import { AgonistAntagonistDemo } from './components/AgonistAntagonistDemo'
import { SleepCycleDemo } from './components/SleepCycleDemo'
import { StroopGame } from './components/StroopGame'
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
  const view = useStore((s) => s.view)
  const brainSkin = useStore((s) => s.brainSkin)
  const toggleBrainSkin = useStore((s) => s.toggleBrainSkin)
  const setBrainSkin = useStore((s) => s.setBrainSkin)
  const scenariosOpen = useStore((s) => s.scenariosOpen)
  const openScenarios = useStore((s) => s.openScenarios)
  const closeScenarios = useStore((s) => s.closeScenarios)
  const setGameOpen = useStore((s) => s.setGameOpen)
  const nextbotOpen = useStore((s) => s.nextbotOpen)
  const setNextbotOpen = useStore((s) => s.setNextbotOpen)

  // Intro: the brain opens with the realistic skin on, then it fades off after a
  // few seconds to reveal the interactive wireframe. Cancelled if the user
  // touches the toggle first, so we never override a deliberate choice.
  const introTimer = useRef<ReturnType<typeof setTimeout>>()
  const cancelIntro = () => {
    if (introTimer.current) {
      clearTimeout(introTimer.current)
      introTimer.current = undefined
    }
  }
  useEffect(() => {
    introTimer.current = setTimeout(() => setBrainSkin(false), 3200)
    return cancelIntro
    // Run once on mount; setBrainSkin is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Easter egg: the Konami code unlocks the hidden Stroop mini-game.
  useEffect(() => {
    const CODE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
    ]
    let pos = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0
      if (pos === CODE.length) {
        pos = 0
        setGameOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setGameOpen])

  // Second easter egg: type "chai" (anywhere but a text field) to unlock the
  // hidden nextbot horror game, which then lazy-loads.
  useEffect(() => {
    let buf = ''
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key.length !== 1) return
      buf = (buf + e.key.toLowerCase()).slice(-4)
      if (buf === 'chai') setNextbotOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setNextbotOpen])

  // Mobile/discoverable fallback: tap the title 5 times quickly.
  const titleTaps = useRef<number[]>([])
  const onTitleTap = () => {
    const now = Date.now()
    titleTaps.current = [...titleTaps.current, now].filter((t) => now - t < 1500)
    if (titleTaps.current.length >= 5) {
      titleTaps.current = []
      setGameOpen(true)
    }
  }

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
            <h1
              onClick={onTitleTap}
              className="cursor-default select-none text-base font-bold leading-tight tracking-tight text-slate-100"
            >
              Neuromap <span className="text-neural-400">· AP Psychology</span>
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Click a structure, or search the list, to explore it.
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {view === 'brain' && (
            <IconButton
              label={scenariosOpen ? 'Close brain activity' : 'Brain activity scenarios'}
              active={scenariosOpen}
              onClick={() => {
                cancelIntro()
                scenariosOpen ? closeScenarios() : openScenarios()
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h4l2.5-7 4 14 2.5-7H21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          )}
          {view === 'brain' && (
            <IconButton
              label={brainSkin ? 'Hide realistic brain' : 'Show realistic brain'}
              active={brainSkin}
              onClick={() => {
                cancelIntro()
                toggleBrainSkin()
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M9 3a4 4 0 0 0-3.9 5A3.5 3.5 0 0 0 5 15a3.5 3.5 0 0 0 4 3 3 3 0 0 0 3-1 3 3 0 0 0 3 1 3.5 3.5 0 0 0 4-3 3.5 3.5 0 0 0-.1-7A4 4 0 0 0 15 3a3 3 0 0 0-3 1 3 3 0 0 0-3-1z"
                  strokeLinejoin="round"
                />
                <path d="M12 4v14" strokeLinecap="round" />
              </svg>
            </IconButton>
          )}
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
      {/* The scenario player occupies the bottom-center slot; hide the switcher then. */}
      {!scenariosOpen && <ViewSwitcher />}
      <ScenarioPlayer />
      <ConceptBrowser />
      <QuizModal />
      <NervousSystemDiagram />
      <AfterimageDemo />
      <AgonistAntagonistDemo />
      <SleepCycleDemo />
      <StroopGame />
      <Credits />

      {nextbotOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] grid place-items-center bg-black text-sm text-slate-500">Loading…</div>}>
          <NextbotGame />
        </Suspense>
      )}
    </main>
  )
}
