import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────
//  Procedural geometry for the stylized brain.
//
//  This is the ONE place that knows where structures sit in space. Content
//  (regions.ts) stays geometry-free, so swapping in a real anatomical GLB later
//  means editing this file only. Coordinate convention:
//    x = right(+)/left(−)   y = up(+)/down(−)   z = front(+)/back(−)
//
//  Each region is a low-poly icosphere, lightly noise-displaced for an organic
//  "folded" read, and rendered as a translucent holographic shell + wireframe.
// ─────────────────────────────────────────────────────────────────────────

export type Side = 'both' | 'left' | 'right'

export interface GeoParams {
  /** Base center (right-hemisphere convention; mirrored for the left). */
  pos: [number, number, number]
  /** Ellipsoid radii. */
  radii: [number, number, number]
  /** 'both' = bilateral mirrored pair; else a single lateralized structure. */
  side: Side
  /** Icosphere subdivision (0–3). Higher = smoother but heavier. */
  detail: number
  /** Surface displacement amount (0 = smooth ellipsoid). */
  noise: number
  /** Displacement spatial frequency. */
  noiseFreq?: number
}

// Placement tuned to read as a recognizable brain, not to be MRI-accurate.
export const GEOMETRY: Record<string, GeoParams> = {
  // ── Cortex lobes (L1) ──
  'frontal-lobe': { pos: [0.82, 0.42, 1.15], radii: [0.82, 0.98, 1.05], side: 'both', detail: 2, noise: 0.14, noiseFreq: 2.2 },
  'parietal-lobe': { pos: [0.82, 0.92, -0.28], radii: [0.8, 0.78, 0.84], side: 'both', detail: 2, noise: 0.14, noiseFreq: 2.4 },
  'temporal-lobe': { pos: [1.12, -0.42, 0.35], radii: [0.62, 0.62, 1.0], side: 'both', detail: 2, noise: 0.13, noiseFreq: 2.3 },
  'occipital-lobe': { pos: [0.66, 0.3, -1.5], radii: [0.72, 0.82, 0.72], side: 'both', detail: 2, noise: 0.13, noiseFreq: 2.4 },

  // ── Cerebellum / brainstem / callosum (L1) ──
  cerebellum: { pos: [0.5, -0.74, -1.35], radii: [0.64, 0.56, 0.64], side: 'both', detail: 2, noise: 0.22, noiseFreq: 5.5 },
  brainstem: { pos: [0, -0.82, -0.45], radii: [0.26, 0.66, 0.32], side: 'both', detail: 2, noise: 0.05 },
  'corpus-callosum': { pos: [0, 0.14, -0.05], radii: [0.16, 0.34, 1.15], side: 'both', detail: 2, noise: 0.03 },

  // ── Cortex sub-areas (L2) ──
  'prefrontal-cortex': { pos: [0.8, 0.5, 1.55], radii: [0.55, 0.6, 0.42], side: 'both', detail: 2, noise: 0.09 },
  'motor-cortex': { pos: [0.82, 0.86, 0.35], radii: [0.62, 0.36, 0.24], side: 'both', detail: 2, noise: 0.06 },
  'somatosensory-cortex': { pos: [0.82, 0.9, -0.02], radii: [0.6, 0.34, 0.24], side: 'both', detail: 2, noise: 0.06 },
  'brocas-area': { pos: [-0.95, 0.16, 0.86], radii: [0.3, 0.32, 0.3], side: 'left', detail: 1, noise: 0.05 },
  'auditory-cortex': { pos: [1.05, -0.16, 0.15], radii: [0.4, 0.32, 0.4], side: 'both', detail: 1, noise: 0.05 },
  'wernickes-area': { pos: [-1.0, -0.16, -0.35], radii: [0.3, 0.3, 0.35], side: 'left', detail: 1, noise: 0.05 },
  'visual-cortex': { pos: [0.5, 0.22, -1.72], radii: [0.5, 0.55, 0.4], side: 'both', detail: 1, noise: 0.06 },

  // ── Limbic (L2) ──
  hippocampus: { pos: [0.62, -0.2, -0.12], radii: [0.46, 0.2, 0.52], side: 'both', detail: 2, noise: 0.06 },
  amygdala: { pos: [0.66, -0.3, 0.34], radii: [0.28, 0.26, 0.28], side: 'both', detail: 1, noise: 0.05 },
  'cingulate-cortex': { pos: [0, 0.56, -0.1], radii: [0.16, 0.32, 0.95], side: 'both', detail: 2, noise: 0.04 },

  // ── Deep structures (L2) ──
  thalamus: { pos: [0.28, 0.08, -0.12], radii: [0.32, 0.34, 0.44], side: 'both', detail: 2, noise: 0.05 },
  hypothalamus: { pos: [0.16, -0.32, 0.12], radii: [0.18, 0.16, 0.2], side: 'both', detail: 1, noise: 0.03 },
  pituitary: { pos: [0, -0.64, 0.28], radii: [0.14, 0.2, 0.14], side: 'both', detail: 1, noise: 0.02 },
  'basal-ganglia': { pos: [0.42, 0.06, 0.15], radii: [0.3, 0.42, 0.46], side: 'both', detail: 2, noise: 0.05 },

  // ── Brainstem sub-parts (L2) ──
  midbrain: { pos: [0, -0.5, -0.35], radii: [0.22, 0.2, 0.24], side: 'both', detail: 1, noise: 0.03 },
  pons: { pos: [0, -0.82, -0.16], radii: [0.26, 0.24, 0.3], side: 'both', detail: 1, noise: 0.03 },
  medulla: { pos: [0, -1.16, -0.28], radii: [0.2, 0.3, 0.22], side: 'both', detail: 1, noise: 0.03 },
  'reticular-formation': { pos: [0, -0.8, -0.3], radii: [0.1, 0.62, 0.12], side: 'both', detail: 1, noise: 0.02 },
}

// ── Cheap deterministic value noise (hash-based; no external deps) ──────────
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return s - Math.floor(s) // 0..1
}

/**
 * Build a low-poly, noise-displaced ellipsoid geometry for one region.
 * Non-indexed + flat normals give crisp faceted facets that read well as
 * wireframe. Geometries are cached by (id, side) so re-renders are free.
 */
const cache = new Map<string, THREE.BufferGeometry>()

export function buildRegionGeometry(id: string): THREE.BufferGeometry {
  const cached = cache.get(id)
  if (cached) return cached

  const p = GEOMETRY[id]
  if (!p) {
    const fallback = new THREE.IcosahedronGeometry(0.3, 1)
    cache.set(id, fallback)
    return fallback
  }

  const geo = new THREE.IcosahedronGeometry(1, p.detail)
  const freq = p.noiseFreq ?? 3
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()

  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    const n = v.clone().normalize()
    // Displace along the normal by a smooth-ish noise, then shape to ellipsoid.
    const noise =
      (hash3(n.x * freq, n.y * freq, n.z * freq) - 0.5) * 2 * p.noise
    const r = 1 + noise
    v.set(n.x * r * p.radii[0], n.y * r * p.radii[1], n.z * r * p.radii[2])
    posAttr.setXYZ(i, v.x, v.y, v.z)
  }

  const flat = geo.toNonIndexed()
  flat.computeVertexNormals()
  flat.translate(p.pos[0], p.pos[1], p.pos[2])
  geo.dispose()
  cache.set(id, flat)
  return flat
}

/** Instances (mesh copies) for a region: bilateral pairs mirror across x. */
export interface RegionInstance {
  key: string
  regionId: string
  mirrored: boolean
}

export function instancesFor(id: string): RegionInstance[] {
  const p = GEOMETRY[id]
  if (!p) return [{ key: id, regionId: id, mirrored: false }]
  if (p.side === 'both') {
    return [
      { key: `${id}:r`, regionId: id, mirrored: false },
      { key: `${id}:l`, regionId: id, mirrored: true },
    ]
  }
  // Lateralized: the params already place it on the correct side.
  return [{ key: id, regionId: id, mirrored: false }]
}

/** World-space center of a region (right instance), for camera framing. */
export function regionCenter(id: string): THREE.Vector3 {
  const p = GEOMETRY[id]
  if (!p) return new THREE.Vector3(0, 0, 0)
  // For bilateral structures, frame the midline (x≈0) so both halves show.
  const x = p.side === 'both' ? 0 : p.pos[0]
  return new THREE.Vector3(x, p.pos[1], p.pos[2])
}

/** Which regions have real geometry (group nodes like limbic-system do not). */
export const hasGeometry = (id: string): boolean => id in GEOMETRY
