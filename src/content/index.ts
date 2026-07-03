import type { ConceptCard, EyeStructure, Question, Region, Teaching } from './types'
import { REGIONS } from './regions'
import { EYE_STRUCTURES } from './eye'
import { CONCEPTS } from './concepts'
import { QUESTIONS } from './questions'

export * from './types'
export { SYSTEMS, systemColor } from './systems'
export { REGIONS } from './regions'
export { EYE_STRUCTURES } from './eye'
export { CONCEPTS } from './concepts'
export { QUESTIONS } from './questions'

// ── Lookup indices ──────────────────────────────────────────────────────────

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
)
export const EYE_BY_ID: Record<string, EyeStructure> = Object.fromEntries(
  EYE_STRUCTURES.map((e) => [e.id, e]),
)
export const CONCEPT_BY_ID: Record<string, ConceptCard> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
)

/** Every teachable item, regardless of kind — for the info panel & cross-links. */
export const TEACHING_BY_ID: Record<string, Teaching> = {
  ...CONCEPT_BY_ID,
  ...EYE_BY_ID,
  ...REGION_BY_ID,
}

export const getTeaching = (id: string): Teaching | undefined => TEACHING_BY_ID[id]
export const getRegion = (id: string): Region | undefined => REGION_BY_ID[id]

export type ItemKind = 'region' | 'eye' | 'concept' | 'unknown'
export function kindOf(id: string): ItemKind {
  if (id in REGION_BY_ID) return 'region'
  if (id in EYE_BY_ID) return 'eye'
  if (id in CONCEPT_BY_ID) return 'concept'
  return 'unknown'
}

/** Children of any item (region or eye), for the drill-down UI. */
export function childItems(id: string): Teaching[] {
  const region = REGION_BY_ID[id]
  if (region?.childIds) return region.childIds.map((c) => TEACHING_BY_ID[c]).filter(Boolean)
  const eye = EYE_BY_ID[id]
  if (eye?.childIds) return eye.childIds.map((c) => TEACHING_BY_ID[c]).filter(Boolean)
  return []
}

/** Direct parent of any item, if any. */
export function parentItem(id: string): Teaching | undefined {
  const pid = REGION_BY_ID[id]?.parentId ?? EYE_BY_ID[id]?.parentId
  return pid ? TEACHING_BY_ID[pid] : undefined
}

// ── Tree helpers (drill-down navigation) ────────────────────────────────────

/** Top-level brain regions (no parent) — the entry points at L1. */
export const ROOT_REGIONS: Region[] = REGIONS.filter((r) => !r.parentId)

export const childrenOf = (id: string): Region[] =>
  REGIONS.filter((r) => r.parentId === id)

/** Path from a root region down to `id`, for breadcrumbs. */
export function ancestryOf(id: string): Region[] {
  const path: Region[] = []
  let current: Region | undefined = REGION_BY_ID[id]
  while (current) {
    path.unshift(current)
    current = current.parentId ? REGION_BY_ID[current.parentId] : undefined
  }
  return path
}

// ── Concept helpers ─────────────────────────────────────────────────────────

/** Concept cards grouped by topic, for the concept browser. */
export function conceptsByTopic(): Record<string, ConceptCard[]> {
  const out: Record<string, ConceptCard[]> = {}
  for (const c of CONCEPTS) {
    ;(out[c.topic] ??= []).push(c)
  }
  return out
}

/** Concepts anchored to a given region id (e.g. dopamine → basal-ganglia). */
export const conceptsAnchoredTo = (regionId: string): ConceptCard[] =>
  CONCEPTS.filter((c) => c.anchorRegionId === regionId)

// ── Quiz helpers ────────────────────────────────────────────────────────────

/** Static-bank questions relevant to the current context (region/concept/eye). */
export function questionsForContext(contextId?: string): Question[] {
  if (!contextId) return QUESTIONS
  const item = getTeaching(contextId)
  const relatedIds = new Set<string>([contextId, ...(item?.relatedIds ?? [])])
  const matches = QUESTIONS.filter(
    (q) => q.contextId && relatedIds.has(q.contextId),
  )
  return matches.length ? matches : QUESTIONS
}

export const questionsForUnit = (unit: number): Question[] =>
  QUESTIONS.filter((q) => q.apUnit === unit)

// ── Coverage summary (drives a small "AP coverage" readout) ─────────────────

export const AP_UNITS: { unit: number; title: string }[] = [
  { unit: 0, title: 'Science Practices' },
  { unit: 1, title: 'Biological Bases of Behavior' },
  { unit: 2, title: 'Cognition' },
  { unit: 3, title: 'Development & Learning' },
  { unit: 4, title: 'Social Psychology & Personality' },
  { unit: 5, title: 'Mental & Physical Health' },
]
