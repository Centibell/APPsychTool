import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { GEOMETRY, regionCenter } from '../brain/regionGeometry'
import { NEURON_SCENE_IDS, SYNAPSE_SCENE_IDS } from '../content'

// Per-view overview poses (also the reset pose for each sub-scene).
type Pose = { pos: [number, number, number]; target: [number, number, number] }
const OVERVIEWS: Record<string, Pose> = {
  brain: { pos: [4.5, 1.7, 4.6], target: [0, -0.15, -0.15] },
  neuron: { pos: [0, 1.6, 7], target: [-0.2, 0, 0] },
  synapse: { pos: [0, 0.5, 5.6], target: [0, 0.25, 0] },
  eye: { pos: [2.6, 1.2, 4.4], target: [0, 0, 0] },
  ear: { pos: [0.6, 1.4, 6.6], target: [0.2, 0, 0] },
}

function overviewFor(id: string): Pose {
  if (SYNAPSE_SCENE_IDS.has(id)) return OVERVIEWS.synapse
  if (id.startsWith('eye-')) return OVERVIEWS.eye
  if (id.startsWith('ear-')) return OVERVIEWS.ear
  if (NEURON_SCENE_IDS.has(id)) return OVERVIEWS.neuron
  return OVERVIEWS.brain
}

/**
 * Consumes `focusTarget` and frames the right thing:
 *   • a brain region with geometry → dolly in on it (keeping the view angle)
 *   • anything else (schematics, eye, reset) → that sub-scene's overview pose
 */
export function CameraRig() {
  const controls = useRef<CameraControls>(null)
  const focusTarget = useStore((s) => s.focusTarget)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useEffect(() => {
    const c = controls.current
    if (!c || !focusTarget) return
    const animate = !reducedMotion
    const id = focusTarget.id

    // Brain region: frame its geometry, preserving the current orbit direction.
    if (id in GEOMETRY) {
      const params = GEOMETRY[id]
      const center = regionCenter(id)
      const dist = Math.max(1.6, Math.max(...params.radii) * 3.4 + 1.1)
      const dir = new THREE.Vector3()
      c.camera.getWorldDirection(dir)
      dir.negate().normalize()
      if (dir.lengthSq() < 1e-4) dir.set(0.35, 0.25, 1).normalize()
      const pos = center.clone().add(dir.multiplyScalar(dist))
      c.setLookAt(pos.x, pos.y, pos.z, center.x, center.y, center.z, animate)
      return
    }

    // Everything else → the overview pose for the relevant sub-scene.
    const pose = id === '__root__' ? OVERVIEWS.brain : overviewFor(id)
    c.setLookAt(...pose.pos, ...pose.target, animate)
  }, [focusTarget, reducedMotion])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.2}
      maxDistance={13}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      smoothTime={reducedMotion ? 0 : 0.4}
      draggingSmoothTime={reducedMotion ? 0 : 0.18}
    />
  )
}
