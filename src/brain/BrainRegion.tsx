import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useStore } from '../store'
import { SYSTEMS } from '../content'
import { getRegion } from '../content'
import { buildRegionGeometry, instancesFor } from './regionGeometry'

// Visual states → target opacities. Kept as data so the look is easy to tune.
const STATE = {
  base: { fill: 0.1, wire: 0.28, emissive: 0.35 },
  hover: { fill: 0.24, wire: 0.55, emissive: 0.7 },
  select: { fill: 0.36, wire: 0.85, emissive: 1.15 },
  dim: { fill: 0.035, wire: 0.1, emissive: 0.15 },
}

interface Props {
  regionId: string
}

export function BrainRegion({ regionId }: Props) {
  const hoveredId = useStore((s) => s.hoveredId)
  const selectedId = useStore((s) => s.selectedId)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const setHovered = useStore((s) => s.setHovered)
  const select = useStore((s) => s.select)

  const region = getRegion(regionId)
  const color = useMemo(
    () => new THREE.Color(region ? SYSTEMS[region.system].hex : '#22d3ee'),
    [region],
  )
  const geometry = useMemo(() => buildRegionGeometry(regionId), [regionId])
  const instances = useMemo(() => instancesFor(regionId), [regionId])

  const fillRefs = useRef<THREE.MeshStandardMaterial[]>([])
  const wireRefs = useRef<THREE.MeshBasicMaterial[]>([])

  // Resolve the target visual state each frame from the store.
  const target = useMemo(() => {
    const isHovered = hoveredId === regionId
    const isSelected = selectedId === regionId
    const somethingElseSelected = !!selectedId && selectedId !== regionId
    if (isSelected) return STATE.select
    if (isHovered) return STATE.hover
    if (somethingElseSelected) return STATE.dim
    return STATE.base
  }, [hoveredId, selectedId, regionId])

  useFrame((_, delta) => {
    const t = Math.min(1, delta * (reducedMotion ? 60 : 9))
    for (const m of fillRefs.current) {
      if (!m) continue
      m.opacity += (target.fill - m.opacity) * t
      m.emissiveIntensity += (target.emissive - m.emissiveIntensity) * t
    }
    for (const m of wireRefs.current) {
      if (!m) continue
      m.opacity += (target.wire - m.opacity) * t
    }
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(regionId)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHovered(null)
    document.body.style.cursor = 'auto'
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(regionId)
  }

  return (
    <>
      {instances.map((inst, i) => (
        <group key={inst.key} scale={inst.mirrored ? [-1, 1, 1] : [1, 1, 1]}>
          {/* Translucent holographic shell */}
          <mesh
            geometry={geometry}
            onPointerOver={onOver}
            onPointerOut={onOut}
            onClick={onClick}
            renderOrder={1}
          >
            <meshStandardMaterial
              ref={(m) => m && (fillRefs.current[i] = m)}
              color={color}
              emissive={color}
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
          {/* Wireframe overlay — the "neural interface" edges */}
          <mesh geometry={geometry} renderOrder={2} raycast={() => null}>
            <meshBasicMaterial
              ref={(m) => m && (wireRefs.current[i] = m)}
              color={color}
              wireframe
              transparent
              opacity={STATE.base.wire}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
