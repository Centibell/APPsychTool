import type { Question, Teaching } from '../content'
import { DEFAULT_MODEL } from './models'
import { buildMessages, parseGenerated } from './prompt'

// Main-thread client for the on-device model. Everything WebLLM is loaded via
// dynamic import here, so the ~MBs of engine code (and the model weights) only
// download after the student opts in.

export interface InitProgress {
  progress: number // 0..1
  text: string
}

type Engine = {
  chat: {
    completions: {
      create: (req: unknown) => Promise<{ choices?: { message?: { content?: string } }[] }>
    }
  }
  unload?: () => Promise<void>
}

let enginePromise: Promise<Engine> | null = null

/** Load (once) the worker-hosted engine, reporting download/compile progress. */
export async function ensureEngine(
  onProgress?: (p: InitProgress) => void,
  modelId: string = DEFAULT_MODEL.id,
): Promise<Engine> {
  if (enginePromise) return enginePromise
  enginePromise = (async () => {
    const webllm = await import('@mlc-ai/web-llm')
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    const engine = (await webllm.CreateWebWorkerMLCEngine(worker, modelId, {
      initProgressCallback: (r: { progress?: number; text?: string }) =>
        onProgress?.({ progress: r.progress ?? 0, text: r.text ?? '' }),
    })) as unknown as Engine
    return engine
  })()
  return enginePromise
}

export function isEngineReady(): boolean {
  return enginePromise !== null
}

/** Generate one grounded, validated AP question for the given item. */
export async function generateQuestion(
  item: Teaching,
  apUnit: number,
  avoidStems: string[] = [],
): Promise<Question | null> {
  const engine = await ensureEngine()
  const messages = buildMessages(item, avoidStems)
  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 520,
    response_format: { type: 'json_object' },
  })
  const text = reply.choices?.[0]?.message?.content ?? ''
  return parseGenerated(text, item, apUnit)
}

/** Generate several questions, retrying malformed ones a little. */
export async function generateBatch(
  item: Teaching,
  apUnit: number,
  count: number,
  onEach?: (q: Question, i: number) => void,
): Promise<Question[]> {
  const out: Question[] = []
  let attempts = 0
  const maxAttempts = count * 2
  while (out.length < count && attempts < maxAttempts) {
    attempts++
    const q = await generateQuestion(item, apUnit, out.map((x) => x.stem))
    if (q) {
      out.push(q)
      onEach?.(q, out.length - 1)
    }
  }
  return out
}
