// WebLLM inference worker. Runs the model off the main thread so the UI/3D
// scene stay responsive during generation. Constructed only when the student
// opts into on-device AI, so its code never loads otherwise.
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm'

const handler = new WebWorkerMLCEngineHandler()
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg)
}
