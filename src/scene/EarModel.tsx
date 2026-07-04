import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { HoloPart } from './parts/HoloPart'

// A stylized 3D ear in the shared holographic style. Sound funnels in from the
// pinna → canal → eardrum → ossicles → cochlea, where hair cells transduce it.
// The animation demonstrates the three AP theories of pitch perception:
//   • PLACE theory  — a glowing "peak" sweeps along the cochlea; WHERE it peaks
//     (base = high pitch, apex = low pitch) codes the pitch.
//   • FREQUENCY theory — the auditory-nerve dots fire at a rate that tracks the
//     pitch (faster for higher tones).
//   • VOLLEY theory — at high pitch, the nerve dots fire in alternating volleys
//     (two groups out of phase) to beat the single-neuron firing limit.
// The auditory nerve exits the back and, via the info panel, jumps the camera to
// the temporal lobe's auditory cortex.

const PINNA = '#f0abfc'
const MID = '#93c5fd'
const COCHLEA = '#54e3fb'
const HAIR = '#fcd34d'
const NERVE = '#6ee7b7'

// Cochlea spiral (in the XY plane): base (outer) = high pitch, apex (inner) = low.
const COCHLEA_CENTER = new THREE.Vector3(0.95, 0.1, 0)
const TURNS = 2.5
const R_OUT = 0.92
const R_IN = 0.12
const START = Math.PI

function spiralPoint(s: number, radialOffset = 0): THREE.Vector3 {
  const angle = START + s * TURNS * Math.PI * 2
  const r = THREE.MathUtils.lerp(R_OUT, R_IN, s) + radialOffset
  return new THREE.Vector3(
    COCHLEA_CENTER.x + Math.cos(angle) * r,
    COCHLEA_CENTER.y + Math.sin(angle) * r,
    0,
  )
}

// The current pitch, sweeping low↔high over time (0 = low, 1 = high).
function pitchAt(t: number): number {
  return 0.5 + 0.5 * Math.sin(t * 0.26)
}

const N_HAIR = 26

function HairCells() {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const base = useMemo(() => new THREE.Color(HAIR), [])
  const positions = useMemo(
    () => Array.from({ length: N_HAIR }, (_, i) => spiralPoint(i / (N_HAIR - 1), 0.17)),
    [],
  )

  useFrame((state) => {
    if (!mesh.current) return
    const t = reducedMotion ? 3 : state.clock.getElapsedTime()
    const pitch = pitchAt(t)
    // Place of peak stimulation: high pitch → base (s≈0), low pitch → apex (s≈1).
    const activeS = 1 - pitch
    for (let i = 0; i < N_HAIR; i++) {
      const s = i / (N_HAIR - 1)
      const d = s - activeS
      const glow = Math.exp(-(d * d) / 0.012)
      dummy.position.copy(positions[i])
      dummy.scale.setScalar(0.045 + glow * 0.12)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, base.clone().multiplyScalar(0.25 + glow * 1.4))
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N_HAIR]} raycast={() => null}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={HAIR} transparent toneMapped={false} />
    </instancedMesh>
  )
}

// The auditory nerve drops down from the cochlea so its firing is clearly in view.
const N_FIRE = 12
const NERVE_X = 0.95
const NERVE_Y0 = -0.9 // top (leaving the cochlea)
const NERVE_Y1 = -1.9 // bottom

function NerveFiring() {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const base = useMemo(() => new THREE.Color(NERVE), [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = reducedMotion ? 3 : state.clock.getElapsedTime()
    const pitch = pitchAt(t)
    const rate = 1.5 + pitch * 7 // firings scale with frequency
    const volley = pitch > 0.55 // high pitch → neurons alternate in volleys
    for (let i = 0; i < N_FIRE; i++) {
      const group = i % 2
      const phase = t * rate + (volley && group ? 0.5 : 0)
      const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2)
      const y = NERVE_Y0 + (NERVE_Y1 - NERVE_Y0) * (i / (N_FIRE - 1))
      dummy.position.set(NERVE_X + (group ? 0.14 : -0.14), y, 0.05)
      dummy.scale.setScalar(0.05 + pulse * 0.07)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, base.clone().multiplyScalar(0.2 + pulse * 1.3))
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N_FIRE]} raycast={() => null}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={NERVE} transparent toneMapped={false} />
    </instancedMesh>
  )
}

export function EarModel() {
  const pinna = useMemo(() => new THREE.TorusGeometry(0.55, 0.17, 10, 20), [])
  const canal = useMemo(() => new THREE.CylinderGeometry(0.13, 0.15, 0.75, 12), [])
  const eardrum = useMemo(() => new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16), [])
  const ossicle = useMemo(() => new THREE.IcosahedronGeometry(0.11, 1), [])
  const nerve = useMemo(() => new THREE.CylinderGeometry(0.15, 0.11, NERVE_Y0 - NERVE_Y1, 10), [])

  const cochlea = useMemo(() => {
    const pts = Array.from({ length: 60 }, (_, i) => spiralPoint(i / 59))
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, 140, 0.12, 8, false)
  }, [])

  const ossicles: [number, number, number][] = [
    [-1.18, 0.06, 0],
    [-1.0, 0.14, 0.05],
    [-0.82, 0.02, -0.04],
  ]

  return (
    <group>
      {/* Outer ear (pinna) — funnels sound in */}
      <HoloPart
        id="ear-pinna"
        color={PINNA}
        geometry={pinna}
        position={[-2.3, 0.1, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 1.25, 1]}
      />

      {/* Ear canal */}
      <HoloPart id="ear-pinna" color={MID} geometry={canal} position={[-1.8, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} decorative />

      {/* Eardrum */}
      <HoloPart id="ear-eardrum" color={MID} geometry={eardrum} position={[-1.42, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} />

      {/* Ossicles — hammer, anvil, stirrup */}
      {ossicles.map((p, i) => (
        <HoloPart key={i} id="ear-ossicles" color={MID} geometry={ossicle} position={p} />
      ))}

      {/* Cochlea (spiral) + hair cells */}
      <HoloPart id="ear-cochlea" color={COCHLEA} geometry={cochlea} />
      <HairCells />

      {/* Auditory nerve dropping from the cochlea → the auditory pathway */}
      <HoloPart id="ear-auditory-nerve" color={NERVE} geometry={nerve} position={[NERVE_X, (NERVE_Y0 + NERVE_Y1) / 2, 0]} />
      <NerveFiring />
    </group>
  )
}
