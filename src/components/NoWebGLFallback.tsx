import { useState } from 'react'
import { REGIONS, EYE_STRUCTURES, SYSTEMS, type Teaching } from '../content'

// A complete, keyboard-accessible experience for machines without WebGL
// (common on locked-down school hardware). No 3D — just the same content,
// browsable. This is also the accessibility backbone referenced in Phase 7.

function InfoBlock({ item }: { item: Teaching }) {
  return (
    <div className="animate-fade-up">
      <h3 className="text-lg font-semibold text-neural-200">{item.displayName}</h3>
      <p className="mt-1 text-sm text-slate-300">{item.functionShort}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.functionDeep}</p>
      {item.apTerms.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.apTerms.map((t) => (
            <span
              key={t}
              className="rounded-full border border-neural-700/50 bg-neural-900/30 px-2 py-0.5 text-xs text-neural-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function NoWebGLFallback() {
  const [selected, setSelected] = useState<Teaching>(REGIONS[0])

  const grouped = REGIONS.reduce<Record<string, typeof REGIONS>>((acc, r) => {
    ;(acc[r.system] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Neuromap <span className="text-neural-400">· AP Psychology</span>
        </h1>
        <p className="text-sm text-amber-300/80">
          3D graphics aren’t available on this device — showing the full text explorer instead.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1fr_1.4fr]">
        <nav className="scroll-slim glass-panel min-h-0 overflow-y-auto rounded-xl p-3">
          {Object.entries(grouped).map(([sysId, regions]) => (
            <div key={sysId} className="mb-3">
              <p
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: SYSTEMS[sysId as keyof typeof SYSTEMS]?.hex }}
              >
                {SYSTEMS[sysId as keyof typeof SYSTEMS]?.label ?? sysId}
              </p>
              <ul>
                {regions.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r)}
                      className={`w-full rounded-md px-2 py-1 text-left text-sm transition-colors ${
                        selected.id === r.id
                          ? 'bg-neural-500/20 text-neural-100'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {r.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mb-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neural-300">
              The Eye
            </p>
            <ul>
              {EYE_STRUCTURES.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setSelected(e)}
                    className={`w-full rounded-md px-2 py-1 text-left text-sm transition-colors ${
                      selected.id === e.id
                        ? 'bg-neural-500/20 text-neural-100'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {e.displayName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <section className="scroll-slim glass-panel min-h-0 overflow-y-auto rounded-xl p-5">
          <InfoBlock item={selected} />
        </section>
      </div>
    </div>
  )
}
