// ─────────────────────────────────────────────────────────────────────────
//  Neuromap content model
//
//  The single source of teaching truth. The 3D scene and every UI panel read
//  from these types; meshes only ever reference content by `id`. This keeps
//  anatomy (geometry) and pedagogy (content) fully decoupled — a higher-
//  fidelity brain asset can be swapped in later without touching this file.
// ─────────────────────────────────────────────────────────────────────────

/** How deep in the zoom hierarchy an item becomes the focus. */
export type DetailLevel = 0 | 1 | 2 | 3
//  0 = whole-brain overview
//  1 = major structures / systems (lobes, limbic system, brainstem)
//  2 = specific structures (hippocampus, amygdala, Broca's area …)
//  3 = cellular / schematic (neuron, synapse, neurotransmitter action)

/** Systems drive color-coding and grouping. */
export type SystemId =
  | 'cortex-frontal'
  | 'cortex-parietal'
  | 'cortex-temporal'
  | 'cortex-occipital'
  | 'limbic'
  | 'brainstem'
  | 'cerebellum'
  | 'deep' // diencephalon + basal ganglia (thalamus, hypothalamus, basal ganglia)
  | 'cellular'
  | 'eye'

export interface SystemMeta {
  id: SystemId
  label: string
  /** Tailwind `sys.*` token name, e.g. "frontal". */
  colorToken: string
  /** Resolved hex for use inside the WebGL scene (Three has no Tailwind). */
  hex: string
  description: string
}

/**
 * Teaching content, shared by every explorable item (brain region, eye part,
 * or non-anatomical concept). Depth-scaled prose lets the info panel show more
 * as the student zooms in.
 */
export interface Teaching {
  id: string
  displayName: string

  /** One line — hover / low-zoom / list subtitle. */
  oneLiner: string
  /** Shown on select. 1–2 sentences of core AP function. */
  functionShort: string
  /** Shown at deepest zoom / "Learn more". Richer, still AP-level. */
  functionDeep: string

  /** Which AP units this connects to, e.g. [1, 2]. */
  apUnits: number[]
  /** Exact CED vocabulary anchored here — drives quiz grounding. */
  apTerms: string[]
  /** Other item ids to cross-link to. */
  relatedIds: string[]

  /** Common student errors — excellent quiz fuel + a "watch out" panel. */
  misconceptions?: string[]
  /** Exam-strategy notes ("often confused with ___"). */
  examTips?: string[]
  mnemonic?: string
}

/** Distinguishes realistic-ish anatomy from purely schematic diagrams. */
export type RegionKind = 'anatomical' | 'schematic'

/** A selectable structure in the 3D brain scene. */
export interface Region extends Teaching {
  kind: RegionKind
  system: SystemId
  detailLevel: DetailLevel

  /** Drill-down tree. */
  parentId?: string
  childIds?: string[]

  /**
   * Names of glTF nodes this region maps to, for a future realistic asset.
   * Unused by the procedural brain (which keys meshes by `id`), but kept so
   * the swap is a data change, not a code change.
   */
  meshNames?: string[]
}

/** A selectable structure in the 3D eye scene. */
export interface EyeStructure extends Teaching {
  detailLevel: DetailLevel
  parentId?: string
  childIds?: string[]
  /** If set, "optic-nerve" → jumps the camera to this brain region id. */
  jumpToRegionId?: string
}

/** A selectable structure in the 3D ear scene (audition + pitch theories). */
export interface EarStructure extends Teaching {
  detailLevel: DetailLevel
  parentId?: string
  childIds?: string[]
  /** If set, "auditory-nerve" → jumps the camera to this brain region id. */
  jumpToRegionId?: string
}

/**
 * Non-anatomical AP content (research methods, social psych, personality,
 * developmental theories, most disorders). No geometry — surfaced through the
 * concept browser and the quiz generator so coverage spans the whole course.
 */
export interface ConceptCard extends Teaching {
  /** Grouping for the concept browser, e.g. "Memory", "Social Psychology". */
  topic: string
  /** Optional anchor to a region, e.g. dopamine → nucleus-accumbens. */
  anchorRegionId?: string
}

// ── Quiz ──────────────────────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'AAQ' | 'EBQ'

export interface MCQOption {
  text: string
  correct: boolean
  /** Why this distractor is wrong — shown after answering. */
  rationale?: string
}

export interface Question {
  id: string
  type: QuestionType
  apUnit: number
  /** Region/eye/concept id this question is tied to, if any. */
  contextId?: string
  /** CED term(s) the item assesses. */
  targetTerms: string[]

  stem: string
  options?: MCQOption[] // MCQ
  /** AAQ/EBQ: summarized study/studies the student reasons over. */
  scenario?: string
  explanation: string
  misconceptionAddressed?: string

  /** True when produced by the on-device model (labeled in the UI). */
  aiGenerated?: boolean
}
