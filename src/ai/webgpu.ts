// WebGPU capability gate for the on-device quiz generator. Separate from the
// scene's WebGL lite-mode detection — a machine can render the 3D brain fine yet
// have no WebGPU (or too little VRAM) for a 1.5B model.

export interface GpuTier {
  supported: boolean
  reason?: string
  adapterInfo?: string
}

// Minimal structural types (avoids pulling in @webgpu/types just for a check).
interface GpuAdapterLike {
  limits?: { maxStorageBufferBindingSize?: number }
  requestAdapterInfo?: () => Promise<{ description?: string; vendor?: string }>
}
interface GpuLike {
  requestAdapter: (opts?: { powerPreference?: string }) => Promise<GpuAdapterLike | null>
}

export async function detectWebGPU(): Promise<GpuTier> {
  const gpu = (navigator as unknown as { gpu?: GpuLike }).gpu
  if (!gpu) return { supported: false, reason: 'This browser does not support WebGPU.' }
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' })
    if (!adapter) return { supported: false, reason: 'No compatible GPU was found.' }

    // Storage-buffer headroom is the practical limiter for LLM weights.
    const maxBuf = adapter.limits?.maxStorageBufferBindingSize ?? 0
    if (maxBuf > 0 && maxBuf < 128 * 1024 * 1024) {
      return { supported: false, reason: 'This GPU has too little memory for on-device AI.' }
    }

    let adapterInfo: string | undefined
    try {
      const info = await (adapter as unknown as { requestAdapterInfo?: () => Promise<{ description?: string; vendor?: string }> })
        .requestAdapterInfo?.()
      adapterInfo = info?.description || info?.vendor
    } catch {
      /* adapter info is best-effort */
    }
    return { supported: true, adapterInfo }
  } catch {
    return { supported: false, reason: 'WebGPU could not be initialized.' }
  }
}
