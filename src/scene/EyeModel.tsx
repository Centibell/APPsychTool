import { useMemo } from 'react'
import * as THREE from 'three'
import { HoloPart } from './parts/HoloPart'

// A stylized 3D eye in the shared holographic style. Front faces +Z (toward the
// camera's default overview); the optic nerve exits the back (−Z) and, via the
// info panel, jumps the camera to the occipital lobe's visual cortex.

const SCLERA = '#54e3fb'
const FRONT = '#93c5fd'
const RETINA = '#f0abfc'
const NERVE = '#6ee7b7'

export function EyeModel() {
  const sclera = useMemo(() => new THREE.IcosahedronGeometry(1.5, 3), [])
  const cornea = useMemo(() => new THREE.SphereGeometry(0.62, 16, 12), [])
  const iris = useMemo(() => new THREE.TorusGeometry(0.42, 0.13, 8, 20), [])
  const pupil = useMemo(() => new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16), [])
  const lens = useMemo(() => new THREE.IcosahedronGeometry(0.36, 2), [])
  const retina = useMemo(() => new THREE.SphereGeometry(1.28, 20, 16), [])
  const spot = useMemo(() => new THREE.IcosahedronGeometry(0.14, 1), [])
  const nerve = useMemo(() => new THREE.CylinderGeometry(0.34, 0.24, 1.3, 10), [])

  return (
    <group>
      {/* Eyeball shell (context, non-clickable so inner parts stay reachable) */}
      <HoloPart id="eye-sclera" color={SCLERA} geometry={sclera} decorative />

      {/* Retina — inner light-sensitive layer */}
      <HoloPart id="eye-retina" color={RETINA} geometry={retina} />

      {/* Front optics */}
      <HoloPart id="eye-cornea" color={FRONT} geometry={cornea} position={[0, 0, 1.15]} scale={[1, 1, 0.7]} />
      <HoloPart id="eye-iris" color={FRONT} geometry={iris} position={[0, 0, 1.12]} />
      <HoloPart id="eye-pupil" color="#0a0e1a" geometry={pupil} position={[0, 0, 1.16]} rotation={[Math.PI / 2, 0, 0]} />
      <HoloPart id="eye-lens" color={FRONT} geometry={lens} position={[0, 0, 0.82]} scale={[1, 1, 0.55]} />

      {/* Fovea (sharp-vision pit) + blind spot at the back of the retina */}
      <HoloPart id="eye-fovea" color={RETINA} geometry={spot} position={[0, 0, -1.16]} />
      <HoloPart id="eye-blind-spot" color="#fcd34d" geometry={spot} position={[0.42, 0.1, -1.08]} scale={[0.8, 0.8, 0.8]} />

      {/* Optic nerve exiting the back → the visual pathway */}
      <HoloPart id="eye-optic-nerve" color={NERVE} geometry={nerve} position={[0.42, 0.1, -1.9]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}
