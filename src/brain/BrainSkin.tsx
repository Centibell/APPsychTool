import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { buildBrainSkinParts } from './brainSkinGeometry'

// Roughly the center of the whole brain, for measuring camera proximity.
const BRAIN_CENTER = new THREE.Vector3(0, 0.2, -0.1)
// Camera distance at/above which the skin is fully opaque, and at/below which
// it is fully gone. Between them it cross-fades to reveal the wireframe as the
// student zooms in. (Overview sits at ~6.7.)
const DIST_FULL = 6.2
const DIST_GONE = 4.2

/**
 * The solid anatomical shell (Option A). Renders in front of the wireframe and:
 *   • only in the brain sub-scene, only while the toggle is on,
 *   • OPAQUE at the overview so students read it as a brain (it hides the
 *     wireframe), then fades out as the camera gets close so the internal
 *     structures take over.
 * Non-interactive: raycasting is disabled so clicks pass through to the regions.
 */
export function BrainSkin() {
  const brainSkin = useStore((s) => s.brainSkin)
  const view = useStore((s) => s.view)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const setSkinOpaque = useStore((s) => s.setSkinOpaque)
  // Clear the covering flag if we ever leave the brain view / unmount.
  useEffect(() => () => setSkinOpaque(false), [setSkinOpaque])

  const parts = useMemo(() => buildBrainSkinParts(), [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c9a394'), // fleshy pink-tan cortex
        emissive: new THREE.Color('#4a2a28'),
        emissiveIntensity: 0.35,
        roughness: 0.85,
        metalness: 0,
        transparent: true,
        opacity: 0,
        depthWrite: true, // opaque phase occludes the wireframe behind it
        side: THREE.FrontSide,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  const groupRef = useRef<THREE.Group>(null)

  const enabled = brainSkin && view === 'brain'

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return

    // Proximity fade: full when far (overview), gone when close (zoomed in).
    const dist = state.camera.position.distanceTo(BRAIN_CENTER)
    const proximity = THREE.MathUtils.clamp(
      (dist - DIST_GONE) / (DIST_FULL - DIST_GONE),
      0,
      1,
    )
    const target = enabled ? proximity : 0

    const t = Math.min(1, delta * (reducedMotion ? 60 : 8))
    material.opacity += (target - material.opacity) * t

    // When fully up, render as a genuinely opaque object so the depth buffer
    // hides the wireframe behind it (a transparent material won't occlude
    // reliably). While fading, switch to transparent so it blends out cleanly.
    const solid = material.opacity > 0.98
    if (material.transparent === solid) {
      material.transparent = !solid
      // Solid → write depth to occlude the skin's own parts. Fading → don't.
      material.depthWrite = solid
      material.needsUpdate = true
      // While fully opaque, tell the scene to hide the wireframe entirely so
      // nothing pokes through; it returns as the skin fades on zoom-in.
      setSkinOpaque(solid)
    }
    g.visible = material.opacity > 0.01
  })

  return (
    <group ref={groupRef} visible={false}>
      {parts.map((geo, i) => (
        <mesh key={i} geometry={geo} material={material} raycast={() => null} renderOrder={0} />
      ))}
    </group>
  )
}
