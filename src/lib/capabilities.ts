// ─────────────────────────────────────────────────────────────────────────
//  Capability detection — the weak-hardware gate.
//
//  Decides three things up front:
//   • webglOk   — can we render the 3D scene at all? (else DOM fallback)
//   • tier      — 'full' | 'lite'  performance profile for the scene
//   • reducedMotion — honor the OS "reduce motion" preference
//
//  WebGPU / on-device-LLM capability is detected separately in Phase 5, only
//  when the student opts into the quiz.
// ─────────────────────────────────────────────────────────────────────────

export type PerfTier = 'full' | 'lite'

export interface Capabilities {
  webglOk: boolean
  tier: PerfTier
  reducedMotion: boolean
  /** Human-readable reason we chose lite (for a small diagnostics note). */
  liteReason?: string
  rendererName?: string
}

function detectWebGL(): { ok: boolean; renderer?: string } {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return { ok: false }
    let renderer: string | undefined
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    if (dbg) renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string
    // Release the context promptly so we don't hold a GPU slot.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { ok: true, renderer }
  } catch {
    return { ok: false }
  }
}

const SOFTWARE_RENDERERS = ['swiftshader', 'software', 'llvmpipe', 'microsoft basic', 'mesa offscreen']

export function detectCapabilities(): Capabilities {
  const reducedMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches

  const { ok: webglOk, renderer } = detectWebGL()
  if (!webglOk) {
    return { webglOk: false, tier: 'lite', reducedMotion }
  }

  const reasons: string[] = []
  const rl = (renderer ?? '').toLowerCase()

  if (SOFTWARE_RENDERERS.some((s) => rl.includes(s))) reasons.push('software renderer')

  // Device memory (Chromium-only). <= 4 GB → lean.
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
  if (typeof mem === 'number' && mem <= 4) reasons.push(`${mem}GB RAM`)

  // Logical cores. <= 4 → lean.
  const cores = navigator.hardwareConcurrency
  if (typeof cores === 'number' && cores <= 4) reasons.push(`${cores} cores`)

  // Small / touch-primary screens (most school Chromebooks, phones).
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 640
  if (coarse && smallScreen) reasons.push('small touch screen')

  const tier: PerfTier = reasons.length > 0 || reducedMotion ? 'lite' : 'full'

  return {
    webglOk,
    tier,
    reducedMotion,
    liteReason: reasons[0],
    rendererName: renderer,
  }
}
