import { useMemo } from 'react'
import { useStore } from '../store'
import { REGIONS, childrenOf } from '../content'
import { hasGeometry } from './regionGeometry'
import { BrainRegion } from './BrainRegion'

/**
 * Which regions are visible right now. Rule of thumb:
 *   • everything at or above the current view level, plus
 *   • the children of whatever is selected (so drilling in reveals detail).
 * Group nodes without geometry (e.g. limbic-system) are skipped in 3D — the
 * sidebar reaches those.
 */
function visibleRegionIds(viewLevel: number, selectedId: string | null): string[] {
  const ids = new Set<string>()
  for (const r of REGIONS) {
    if (r.kind !== 'anatomical') continue
    if (!hasGeometry(r.id)) continue
    if (r.detailLevel <= viewLevel) ids.add(r.id)
  }
  if (selectedId) {
    for (const child of childrenOf(selectedId)) {
      if (hasGeometry(child.id)) ids.add(child.id)
    }
  }
  return [...ids]
}

export function Brain() {
  const viewLevel = useStore((s) => s.viewLevel)
  const selectedId = useStore((s) => s.selectedId)

  const ids = useMemo(
    () => visibleRegionIds(viewLevel, selectedId),
    [viewLevel, selectedId],
  )

  return (
    <group>
      {ids.map((id) => (
        <BrainRegion key={id} regionId={id} />
      ))}
    </group>
  )
}
