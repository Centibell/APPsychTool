import { create } from 'zustand'
import type { DetailLevel } from './content/types'
import { ancestryOf, getRegion, kindOf } from './content'
import { detectCapabilities } from './lib/capabilities'

// The shared bridge between the WebGL scene and the DOM UI. Both read/write
// here, avoiding prop-drilling across the canvas boundary.

const caps = detectCapabilities()

export type FocusMode = 'brain' | 'eye'

/** Which 3D sub-scene is on stage. Driven automatically by selection. */
export type SceneView = 'brain' | 'eye' | 'cell'

/** A fly-to request the camera rig consumes, then clears. */
export interface FocusTarget {
  id: string
  /** Monotonic token so repeated selects of the same id still retrigger. */
  token: number
}

/** Decide which sub-scene an item belongs to (undefined = keep current). */
function viewForId(id: string): SceneView | undefined {
  const kind = kindOf(id)
  if (kind === 'eye') return 'eye'
  if (kind === 'region') {
    return getRegion(id)?.kind === 'schematic' ? 'cell' : 'brain'
  }
  return undefined // concepts don't own a scene
}

interface AppState {
  // ── environment ──
  webglOk: boolean
  liteMode: boolean
  reducedMotion: boolean
  liteReason?: string
  rendererName?: string

  // ── navigation ──
  focus: FocusMode
  /** Which 3D sub-scene is showing. */
  view: SceneView
  /** Deepest detail level currently revealed in the scene. */
  viewLevel: DetailLevel
  selectedId: string | null
  hoveredId: string | null
  /** Latest camera fly-to target (id + token); null when idle. */
  focusTarget: FocusTarget | null

  // ── UI panels ──
  sidebarOpen: boolean
  quizOpen: boolean
  conceptsOpen: boolean
  creditsOpen: boolean

  // ── actions ──
  setHovered: (id: string | null) => void
  select: (id: string | null) => void
  drillInto: (id: string) => void
  goToParent: () => void
  setViewLevel: (level: DetailLevel) => void
  setFocus: (focus: FocusMode) => void
  setView: (view: SceneView) => void
  resetView: () => void
  toggleLiteMode: () => void
  setLiteMode: (on: boolean) => void
  setSidebar: (open: boolean) => void
  setQuizOpen: (open: boolean) => void
  setConceptsOpen: (open: boolean) => void
  setCreditsOpen: (open: boolean) => void
}

let focusToken = 0

export const useStore = create<AppState>((set, get) => ({
  webglOk: caps.webglOk,
  liteMode: caps.tier === 'lite',
  reducedMotion: caps.reducedMotion,
  liteReason: caps.liteReason,
  rendererName: caps.rendererName,

  focus: 'brain',
  view: 'brain',
  viewLevel: 1,
  selectedId: null,
  hoveredId: null,
  focusTarget: null,

  // Default the tree open on desktop, closed on phones (it would cover the scene).
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  quizOpen: false,
  conceptsOpen: false,
  creditsOpen: false,

  setHovered: (id) => set({ hoveredId: id }),

  select: (id) => {
    if (!id) {
      set({ selectedId: null })
      return
    }
    // Selecting a region reveals its level and flies the camera to it.
    const region = getRegion(id)
    const level = (region?.detailLevel ?? get().viewLevel) as DetailLevel
    const nextView = viewForId(id) ?? get().view
    set({
      selectedId: id,
      view: nextView,
      viewLevel: Math.max(get().viewLevel, level) as DetailLevel,
      focusTarget: { id, token: ++focusToken },
    })
  },

  drillInto: (id) => {
    const region = getRegion(id)
    const nextView = viewForId(id) ?? get().view
    if (!region) {
      set({ selectedId: id, view: nextView, focusTarget: { id, token: ++focusToken } })
      return
    }
    set({
      selectedId: id,
      view: nextView,
      viewLevel: region.detailLevel,
      focusTarget: { id, token: ++focusToken },
    })
  },

  goToParent: () => {
    const { selectedId } = get()
    if (!selectedId) return
    const chain = ancestryOf(selectedId)
    const parent = chain.length >= 2 ? chain[chain.length - 2] : undefined
    if (parent) {
      get().drillInto(parent.id)
    } else {
      get().resetView()
    }
  },

  setViewLevel: (viewLevel) => set({ viewLevel }),
  setFocus: (focus) =>
    set({ focus, selectedId: null, hoveredId: null, viewLevel: 1 }),

  setView: (view) => {
    // Switching sub-scene clears selection and seeds a sensible default focus.
    const seed = view === 'cell' ? 'neuron' : view === 'eye' ? 'eye-retina' : null
    set({
      view,
      selectedId: null,
      hoveredId: null,
      viewLevel: 1,
      focusTarget: { id: seed ?? '__root__', token: ++focusToken },
    })
  },

  resetView: () =>
    set({
      selectedId: null,
      hoveredId: null,
      view: 'brain',
      viewLevel: 1,
      focusTarget: { id: '__root__', token: ++focusToken },
    }),

  toggleLiteMode: () => set((s) => ({ liteMode: !s.liteMode })),
  setLiteMode: (on) => set({ liteMode: on }),
  setSidebar: (open) => set({ sidebarOpen: open }),
  setQuizOpen: (open) => set({ quizOpen: open }),
  setConceptsOpen: (open) => set({ conceptsOpen: open }),
  setCreditsOpen: (open) => set({ creditsOpen: open }),
}))
