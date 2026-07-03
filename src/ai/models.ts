// On-device model choice. Owner-approved tier: ~1.5B Int4. WebLLM caches the
// weights in IndexedDB after the first download, so subsequent loads are instant
// and work offline.

export interface ModelChoice {
  /** WebLLM prebuilt model id (must exist in prebuiltAppConfig). */
  id: string
  label: string
  /** Approx one-time download, shown in the consent UI. */
  approxSizeMB: number
}

export const DEFAULT_MODEL: ModelChoice = {
  id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  label: 'Qwen2.5 1.5B (Int4)',
  approxSizeMB: 1050,
}

// A lighter fallback if the 1.5B fails to fit / load.
export const LIGHT_MODEL: ModelChoice = {
  id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  label: 'Llama 3.2 1B (Int4)',
  approxSizeMB: 710,
}
