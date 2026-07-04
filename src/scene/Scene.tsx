import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { useStore } from '../store'
import { Brain } from '../brain/Brain'
import { BrainSkin } from '../brain/BrainSkin'
import { CellScene } from './CellScene'
import { EyeModel } from './EyeModel'
import { EarModel } from './EarModel'
import { CameraRig } from './CameraRig'

/**
 * The 3D stage. Deliberately lightweight for weak hardware:
 *   • no shadow maps, no post-processing
 *   • emissive + wireframe materials that barely touch the lighting pipeline
 *   • adaptive DPR + a PerformanceMonitor that drops to lite mode if FPS sags
 * The canvas is transparent so the CSS nebula gradient shows through.
 */
export function Scene() {
  const liteMode = useStore((s) => s.liteMode)
  const setLiteMode = useStore((s) => s.setLiteMode)
  const select = useStore((s) => s.select)
  const view = useStore((s) => s.view)

  return (
    <Canvas
      className="absolute inset-0"
      onPointerMissed={() => select(null)}
      dpr={liteMode ? [1, 1.25] : [1, 1.8]}
      gl={{
        antialias: !liteMode,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ position: [4.5, 1.7, 4.6], fov: 45, near: 0.1, far: 100 }}
    >
      {/* Auto-degrade: if the GPU can't keep up, commit to lite mode. */}
      <PerformanceMonitor
        onDecline={() => setLiteMode(true)}
        flipflops={2}
        onFallback={() => setLiteMode(true)}
      />
      <AdaptiveDpr pixelated={false} />

      {/* Soft fill + two colored rim lights give the shells subtle form. */}
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#bfe9ff', '#0a0e1a', 0.5]} />
      <pointLight position={[5, 4, 5]} intensity={40} color="#7fe9ff" distance={30} decay={2} />
      <pointLight position={[-6, -2, -4]} intensity={26} color="#f0abfc" distance={30} decay={2} />

      <Suspense fallback={null}>
        {view === 'brain' && (
          <>
            <BrainSkin />
            <Brain />
          </>
        )}
        {view === 'cell' && <CellScene />}
        {view === 'eye' && <EyeModel />}
        {view === 'ear' && <EarModel />}
      </Suspense>

      <CameraRig />
    </Canvas>
  )
}
