# Neuromap — Session Handoff

A static, no-backend web app: a stylized 3D brain + eye students orbit/zoom/click to learn **AP Psychology** (redesigned course, 5 units + Unit 0), with an optional **on-device** AI quiz generator. Everything runs client-side; no accounts, no servers, no API keys.

**Do not change the app's purpose or what it does.** Built from a detailed handoff (owner-approved decisions below).

## Run it
- Node LTS 24 (installed via winget). If `node` isn't on PATH in a fresh shell, prefix commands with:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User");`
- `npm run dev` → http://localhost:5173 · `npx tsc -b` typecheck · `npm run build`
- Visual QA: `node scripts/shot.mjs <url> <out.png> [waitMs] [clicks] [WxH]` drives installed Chrome via puppeteer-core (dev-only dep; no browser download). Clicks support coords + sequences, e.g. `"@620,430;@1386,850"`. Headless uses SwiftShader (software WebGL) → trips lite-mode + reports "no WebGPU" (expected).

## Stack
Vite + React 18 + TS + Tailwind + React-Three-Fiber/drei + Zustand + Framer Motion. On-device LLM = `@mlc-ai/web-llm` (WebGPU), code-split.

## Owner-approved decisions
- **Brain asset**: lightweight stylized **wireframe/holographic** look, generated procedurally in code, architected swappable for a real GLB later. Geometry lives in `src/brain/regionGeometry.ts` keyed by region id; content is geometry-free.
- **AI model**: Qwen2.5-1.5B-Instruct Int4 (~1 GB, one-time). Light fallback: Llama-3.2-1B.
- **PWA/offline**: deferred (WebLLM already caches weights in IndexedDB).
- **L3 depth ceiling**: neuron → synapse → neurotransmitter action/reuptake/agonist-antagonist + all-or-none/threshold/refractory. No ionic-channel detail.

## Architecture map
- `src/content/` — the teaching spine (regions, eye, concepts, questions, systems, types) + selectors in `index.ts`. **Both the 3D scene and all UI read from here; meshes reference content by `id` only.**
- `src/brain/` — `regionGeometry.ts` (procedural placement + geometry builder), `Brain.tsx`, `BrainRegion.tsx`.
- `src/scene/` — `Scene.tsx` (Canvas/lights/perf), `CameraRig.tsx` (per-view framing), `CellScene.tsx`/`NeuronSchematic.tsx`/`SynapseSchematic.tsx`, `EyeModel.tsx`, `parts/HoloPart.tsx` (reusable holographic clickable part).
- `src/ai/` — `webgpu.ts` (gate), `models.ts`, `prompt.ts` (grounding + JSON validation = accuracy guardrail), `worker.ts` (WebLLM worker), `engine.ts` (dynamic-imported client).
- `src/components/` — Sidebar, InfoPanel, Breadcrumb, ViewSwitcher, QuizModal, AiQuizControls, ConceptBrowser, Credits, NoWebGLFallback.
- `src/store.ts` — Zustand: selection, hover, `view` ('brain'|'eye'|'cell'), viewLevel, focusTarget (camera), lite-mode, panel toggles. `select`/`drillInto` auto-set the view from the item.
- `src/lib/capabilities.ts` — WebGL + lite-mode + reduced-motion detection.

## Status: Phases 0–5 DONE, screenshot-verified
Brain render, interaction/LOD/info-panel/sidebar/breadcrumb, static context-aware quiz (MCQ + AAQ/EBQ), neuron (with traveling action-potential pulse), synapse (NT particles → receptors), 3D eye + optic-nerve→visual-cortex jump, view switcher, concept browser, WebGPU-gated on-device AI (consent/progress/grounded generation/graceful fallback), mobile bottom-sheet layout, credits/attribution, favicon, vendor code-splitting. Initial load ~352 KB gzip; WebLLM 2.1 MB gzip lazy-loads only on opt-in.

## Remaining / next iteration
1. **Content coverage (main task)** — expand `src/content/concepts.ts`, `regions.ts`, `questions.ts` toward full CED completeness. Unit 1 anatomical core is thorough; Units 0/2/3/4/5 are representative, not exhaustive. Framework accepts new entries trivially. Pull exact vocab from the College Board CED PDF (apcentral.collegeboard.org/courses/ap-psychology). Ask owner which units to prioritize.
2. **Live on-device inference is untested** — headless has no WebGPU. Verify download+generate in real desktop Chrome/Edge with a GPU; tune the 1.5B model / retry logic in `src/ai/`.
3. Optional polish: eye camera angle, PWA/service worker, more L3 animation, deploy (static host).

See also `.claude/.../memory/neuromap-project.md` and `neuromap-env-setup.md`.
