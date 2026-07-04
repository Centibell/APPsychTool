import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────
//  Procedural "realistic" brain skin (Option A: a solid anatomical shell laid
//  over the wireframe). At the overview it is OPAQUE and hides the wireframe so
//  students immediately read it as a brain; it fades out as the camera gets
//  close so the wireframe/internal structures take over for detailed study
//  (fade logic lives in BrainSkin.tsx).
//
//  Fully procedural so the app stays self-contained and lightweight (no GLB
//  download, no licensing). The component boundary is kept clean so a real
//  glTF asset could replace buildBrainSkinParts() later without touching the
//  rest of the scene. Coordinate convention matches regionGeometry.ts:
//    x = right(+)/left(−)   y = up(+)/down(−)   z = front(+)/back(−)
// ─────────────────────────────────────────────────────────────────────────

// ── Smooth value noise (interpolated hash lattice) ──────────────────────────
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
function vhash(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s) // 0..1
}
function vnoise(x: number, y: number, z: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = fade(xf)
  const v = fade(yf)
  const w = fade(zf)
  const c000 = vhash(xi, yi, zi)
  const c100 = vhash(xi + 1, yi, zi)
  const c010 = vhash(xi, yi + 1, zi)
  const c110 = vhash(xi + 1, yi + 1, zi)
  const c001 = vhash(xi, yi, zi + 1)
  const c101 = vhash(xi + 1, yi, zi + 1)
  const c011 = vhash(xi, yi + 1, zi + 1)
  const c111 = vhash(xi + 1, yi + 1, zi + 1)
  const x00 = lerp(c000, c100, u)
  const x10 = lerp(c010, c110, u)
  const x01 = lerp(c001, c101, u)
  const x11 = lerp(c011, c111, u)
  const y0 = lerp(x00, x10, v)
  const y1 = lerp(x01, x11, v)
  return lerp(y0, y1, w) // 0..1
}
/**
 * Ridged fractal noise → sharp winding ridges with grooves between them, which
 * read far more like cortical gyri/sulci than plain lumpy fbm.
 */
function ridged(x: number, y: number, z: number, octaves = 4): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    const n = vnoise(x * freq, y * freq, z * freq) * 2 - 1 // -1..1
    const r = 1 - Math.abs(n) // 0..1, ridged
    sum += amp * r * r
    norm += amp
    freq *= 2.0
    amp *= 0.5
  }
  return sum / norm // ~0..1
}

// ── Cerebrum: the folded dome over both hemispheres ─────────────────────────
function buildCerebrum(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 5)
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()
  // Sized to fully enclose the wireframe region ellipsoids (which reach ≈±1.9 in
  // x and ≈±2.3 in z) so the skin actually hides them at the overview.
  const RX = 2.2
  const RY = 1.52
  const RZ = 2.62
  const CENTER = [0, 0.28, -0.05]

  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    const n = v.clone().normalize()

    // Gyrification (ridged folds).
    const g = ridged(n.x * 3.3, n.y * 3.3, n.z * 3.3, 4)
    let disp = (g - 0.5) * 0.2

    // Interhemispheric (longitudinal) fissure — a shallow narrow groove down the
    // superior midline so the two hemispheres read as separate. Kept shallow so
    // it never cuts below the midline structures and exposes their wireframe.
    disp -= Math.exp(-(n.x * n.x) / 0.006) * Math.max(0, n.y) * 0.14

    const r = 1 + disp
    const x = n.x * r * RX
    let y = n.y * r * RY
    const z = n.z * r * RZ

    // Flatten the underside — a real brain sits flat on its base.
    if (y < 0) y *= 0.62

    posAttr.setXYZ(i, x + CENTER[0], y + CENTER[1], z + CENTER[2])
  }

  geo.computeVertexNormals()
  return geo
}

// ── A generic foliated/smooth shell (cerebellum, brainstem) ─────────────────
function buildShell(
  center: [number, number, number],
  radii: [number, number, number],
  detail: number,
  fold: number,
  foldFreq: number,
): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, detail)
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()

  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    const n = v.clone().normalize()
    const g = ridged(n.x * foldFreq, n.y * foldFreq, n.z * foldFreq, 3)
    const r = 1 + (g - 0.5) * 2 * fold
    v.set(
      n.x * r * radii[0] + center[0],
      n.y * r * radii[1] + center[1],
      n.z * r * radii[2] + center[2],
    )
    posAttr.setXYZ(i, v.x, v.y, v.z)
  }

  geo.computeVertexNormals()
  return geo
}

let cached: THREE.BufferGeometry[] | null = null

/**
 * The parts of the brain skin, sized to fully enclose the wireframe region
 * ellipsoids. Returned as separate geometries so they can share one material.
 */
export function buildBrainSkinParts(): THREE.BufferGeometry[] {
  if (cached) return cached
  cached = [
    buildCerebrum(),
    // Cerebellum — tightly-foliated blob at the back-underside.
    buildShell([0, -0.74, -1.5], [1.05, 0.66, 0.86], 4, 0.12, 9),
    // Brainstem — smooth stalk descending from the midline.
    buildShell([0, -1.15, -0.3], [0.32, 0.62, 0.38], 3, 0.03, 3),
  ]
  return cached
}
