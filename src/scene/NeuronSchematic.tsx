import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { HoloPart } from './parts/HoloPart'

// A stylized neuron diagram in the shared holographic style. Parts map to
// content ids so clicking teaches the right thing:
//   soma + dendrites → "neuron"   axon + myelin → "action-potential"
//   terminal buttons → "synapse"
// A glowing pulse travels the axon = the action potential (all-or-none).

const BODY = '#22d3ee' // cellular accent
const AXON = '#7fe9ff'
const PULSE = '#f0abfc'

const AXON_X0 = -1.5
const AXON_X1 = 2.3

// Dendrite directions radiating back from the soma (pointing left/back).
const DENDRITES: { rot: [number, number, number]; len: number }[] = [
  { rot: [0, 0, Math.PI / 2 + 0.2], len: 1.2 },
  { rot: [0, 0, Math.PI / 2 - 0.35], len: 1.0 },
  { rot: [0.4, 0.3, Math.PI / 2 + 0.5], len: 1.1 },
  { rot: [-0.4, -0.3, Math.PI / 2 + 0.5], len: 1.1 },
  { rot: [0, 0.6, Math.PI / 2 - 0.1], len: 0.9 },
]

// The nodes of Ranvier sit in the gaps between myelin segments.
const NODE_X = [-1.05, -0.15, 0.75, 1.65]

function AxonPulse() {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    if (reducedMotion) {
      ref.current.position.x = (AXON_X0 + AXON_X1) / 2
      return
    }
    // Saltatory conduction: the pulse jumps from node to node rather than
    // gliding continuously, mirroring how myelinated axons actually conduct.
    const t = (state.clock.getElapsedTime() % 1.8) / 1.8
    const stops = [AXON_X0, ...NODE_X, AXON_X1]
    const idx = Math.min(stops.length - 1, Math.floor(t * (stops.length - 1)))
    ref.current.position.x = stops[idx]
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = Math.sin(t * Math.PI) // fade in/out along the trip
  })
  return (
    <mesh ref={ref} position={[AXON_X0, 0, 0]} raycast={() => null}>
      <sphereGeometry args={[0.17, 16, 16]} />
      <meshBasicMaterial color={PULSE} transparent opacity={0.9} toneMapped={false} />
    </mesh>
  )
}

export function NeuronSchematic() {
  const soma = useMemo(() => new THREE.IcosahedronGeometry(0.52, 1), [])
  const dendrite = useMemo(() => new THREE.CylinderGeometry(0.03, 0.07, 1, 6), [])
  const axon = useMemo(
    () => new THREE.CylinderGeometry(0.08, 0.08, AXON_X1 - AXON_X0, 8),
    [],
  )
  const myelin = useMemo(() => new THREE.CylinderGeometry(0.22, 0.22, 0.62, 8), [])
  const node = useMemo(() => new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), [])
  const terminal = useMemo(() => new THREE.IcosahedronGeometry(0.2, 1), [])

  const myelinX = [-0.55, 0.35, 1.25, 2.05]
  const terminals: [number, number, number][] = [
    [2.55, 0, 0],
    [2.6, 0.34, 0.1],
    [2.6, -0.32, -0.1],
    [2.55, 0.05, 0.36],
  ]

  return (
    <group>
      {/* Cell body (soma) */}
      <HoloPart id="cell-body" color={BODY} geometry={soma} position={[-2, 0, 0]} />

      {/* Dendrites — each stretched to length and butted against the soma. */}
      {DENDRITES.map((d, i) => {
        const dir = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(...d.rot))
        const c = new THREE.Vector3(-2, 0, 0).add(dir.multiplyScalar(d.len / 2 + 0.25))
        return (
          <HoloPart
            key={i}
            id="dendrites"
            color={BODY}
            geometry={dendrite}
            position={[c.x, c.y, c.z]}
            rotation={d.rot}
            scale={[1, d.len, 1]}
          />
        )
      })}

      {/* Axon */}
      <HoloPart
        id="action-potential"
        color={AXON}
        geometry={axon}
        position={[(AXON_X0 + AXON_X1) / 2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      {/* Myelin sheath segments */}
      {myelinX.map((x) => (
        <HoloPart
          key={x}
          id="myelin-sheath"
          color={AXON}
          geometry={myelin}
          position={[x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        />
      ))}
      {/* Nodes of Ranvier — the exposed gaps between myelin segments */}
      {NODE_X.map((x) => (
        <HoloPart
          key={x}
          id="nodes-of-ranvier"
          color={PULSE}
          geometry={node}
          position={[x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        />
      ))}

      <AxonPulse />

      {/* Terminal buttons */}
      {terminals.map((p, i) => (
        <HoloPart key={i} id="axon-terminals" color={PULSE} geometry={terminal} position={p} />
      ))}
    </group>
  )
}
