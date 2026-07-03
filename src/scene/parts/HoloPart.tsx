import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useStore } from '../../store'

// A reusable clickable "holographic" part: translucent fill + wireframe overlay,
// with the same hover/select/dim states as brain regions. Used by the neuron,
// synapse, and eye sub-scenes so the whole app shares one visual language.

const STATE = {
  base: { fill: 0.12, wire: 0.32, emissive: 0.4 },
  hover: { fill: 0.26, wire: 0.6, emissive: 0.8 },
  select: { fill: 0.4, wire: 0.9, emissive: 1.2 },
  dim: { fill: 0.05, wire: 0.14, emissive: 0.2 },
}

interface Props {
  id: string
  color: string
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  /** Non-interactive decoration (no raycast, always base state). */
  decorative?: boolean
  children?: ReactNode
}

export function HoloPart({ id, color, geometry, position, rotation, scale, decorative, children }: Props) {
  const hoveredId = useStore((s) => s.hoveredId)
  const selectedId = useStore((s) => s.selectedId)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const setHovered = useStore((s) => s.setHovered)
  const select = useStore((s) => s.select)

  const col = useMemo(() => new THREE.Color(color), [color])
  const fill = useRef<THREE.MeshStandardMaterial>(null)
  const wire = useRef<THREE.MeshBasicMaterial>(null)

  const target = useMemo(() => {
    if (decorative) return STATE.base
    if (selectedId === id) return STATE.select
    if (hoveredId === id) return STATE.hover
    if (selectedId && selectedId !== id) return STATE.dim
    return STATE.base
  }, [decorative, hoveredId, selectedId, id])

  useFrame((_, delta) => {
    const t = Math.min(1, delta * (reducedMotion ? 60 : 9))
    if (fill.current) {
      fill.current.opacity += (target.fill - fill.current.opacity) * t
      fill.current.emissiveIntensity += (target.emissive - fill.current.emissiveIntensity) * t
    }
    if (wire.current) wire.current.opacity += (target.wire - wire.current.opacity) * t
  })

  const handlers = decorative
    ? {}
    : {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(id)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          setHovered(null)
          document.body.style.cursor = 'auto'
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          select(id)
        },
      }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} {...handlers} renderOrder={1}>
        <meshStandardMaterial
          ref={fill}
          color={col}
          emissive={col}
          emissiveIntensity={STATE.base.emissive}
          transparent
          opacity={STATE.base.fill}
          roughness={1}
          metalness={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          flatShading
        />
      </mesh>
      <mesh geometry={geometry} renderOrder={2} raycast={() => null}>
        <meshBasicMaterial ref={wire} color={col} wireframe transparent opacity={STATE.base.wire} depthWrite={false} />
      </mesh>
      {children}
    </group>
  )
}
