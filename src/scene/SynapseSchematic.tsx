import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { HoloPart } from './parts/HoloPart'

// The synapse: a presynaptic terminal releasing neurotransmitter particles that
// drift across the synaptic gap to receptor sites on the postsynaptic membrane.
// Some particles are reabsorbed by the sending neuron (reuptake) instead of
// binding. Sub-parts map to their own content ids so each is clickable.

const PRE = '#7fe9ff'
const POST = '#6ee7b7'
const NT = '#f0abfc'
const REUPTAKE = '#fcd34d'

const N_PARTICLES = 14
const TOP_Y = 0.9
const BOTTOM_Y = -0.85

function Neurotransmitters() {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(NT), [])
  const reuptakeColor = useMemo(() => new THREE.Color(REUPTAKE), [])
  // Stable per-particle lane + phase offset (no per-frame randomness). Every
  // third particle is a "reuptake" particle: it drifts partway down, then is
  // reabsorbed back up into the terminal instead of binding.
  const lanes = useMemo(
    () =>
      Array.from({ length: N_PARTICLES }, (_, i) => ({
        x: -1.1 + (2.2 * i) / (N_PARTICLES - 1) + (i % 2 ? 0.12 : -0.12),
        z: ((i * 0.37) % 1) * 0.6 - 0.3,
        phase: (i * 0.137) % 1,
        speed: 0.4 + (i % 3) * 0.06,
        reuptake: i % 4 === 0,
      })),
    [],
  )

  // Colour reuptake particles differently, once.
  const initialized = useRef(false)
  useFrame((state) => {
    if (!mesh.current) return
    if (!initialized.current) {
      for (let i = 0; i < N_PARTICLES; i++) {
        mesh.current.setColorAt(i, lanes[i].reuptake ? reuptakeColor : color)
      }
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
      initialized.current = true
    }
    const time = reducedMotion ? 0.4 : state.clock.getElapsedTime()
    for (let i = 0; i < N_PARTICLES; i++) {
      const l = lanes[i]
      const p = reducedMotion ? i / N_PARTICLES : (time * l.speed + l.phase) % 1
      // Reuptake particles trace a there-and-back path (down then back up);
      // crossing particles go all the way down to the receptors.
      const travel = l.reuptake ? 0.55 * (1 - Math.abs(2 * p - 1)) : p
      const y = TOP_Y - travel * (TOP_Y - BOTTOM_Y)
      const wobble = Math.sin((p + l.phase) * 6.28) * 0.06
      dummy.position.set(l.x + wobble, y, l.z)
      const s = 0.06 + Math.sin(p * Math.PI) * 0.03
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N_PARTICLES]} raycast={() => null}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.9} toneMapped={false} />
    </instancedMesh>
  )
}

export function SynapseSchematic() {
  const preBulb = useMemo(() => new THREE.IcosahedronGeometry(1, 2), [])
  const vesicle = useMemo(() => new THREE.IcosahedronGeometry(0.16, 1), [])
  const gap = useMemo(() => new THREE.BoxGeometry(2.6, 0.06, 1.2), [])
  const membrane = useMemo(() => new THREE.BoxGeometry(2.8, 0.28, 1.4), [])
  const receptor = useMemo(() => new THREE.CylinderGeometry(0.16, 0.1, 0.28, 6), [])
  const transporter = useMemo(() => new THREE.CylinderGeometry(0.12, 0.18, 0.3, 8), [])

  const vesicles: [number, number, number][] = [
    [-0.35, 1.15, 0.1],
    [0.3, 1.25, -0.15],
    [0.05, 1.4, 0.2],
  ]
  const receptorX = [-0.9, -0.3, 0.3, 0.9]

  return (
    <group>
      {/* Presynaptic terminal (flattened bulb) */}
      <HoloPart id="synapse" color={PRE} geometry={preBulb} position={[0, 1.7, 0]} scale={[1.2, 0.7, 1]} />

      {/* Synaptic vesicles inside the terminal */}
      {vesicles.map((p, i) => (
        <HoloPart key={i} id="synaptic-vesicles" color={NT} geometry={vesicle} position={p} />
      ))}

      {/* Reuptake transporter on the presynaptic membrane */}
      <HoloPart id="reuptake" color={REUPTAKE} geometry={transporter} position={[-1.0, 0.95, 0]} />

      {/* Synaptic gap (invisible-ish click target for the cleft) */}
      <HoloPart id="synaptic-gap" color={PRE} geometry={gap} position={[0, 0.15, 0]} />

      <Neurotransmitters />

      {/* Postsynaptic membrane + receptor sites */}
      <HoloPart id="receptor-sites" color={POST} geometry={membrane} position={[0, -1.15, 0]} />
      {receptorX.map((x) => (
        <HoloPart key={x} id="receptor-sites" color={POST} geometry={receptor} position={[x, -0.92, 0]} decorative />
      ))}
    </group>
  )
}
