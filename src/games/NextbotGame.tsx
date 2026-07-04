import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { makeFaceTexture } from './face'

// ─────────────────────────────────────────────────────────────────────────
//  Hidden nextbot horror game. You are Mr. G's chai latte, lost in a dim maze;
//  a giant floating photo of his face hunts you. It's faster than you in a
//  straight line but slows to turn, so corners are your only escape. Collect
//  all the hall passes to slip out of class.
//
//  Deliberately cheap so it runs on weak hardware: flat-shaded instanced walls,
//  no shadows, one spotlight, heavy fog + a film-grain overlay to hide the low
//  fidelity. Lazy-loaded (dynamic import) so none of this ships until unlocked.
// ─────────────────────────────────────────────────────────────────────────

// Maze (odd dimensions for a recursive-backtracker grid).
const COLS = 15
const ROWS = 15
const CELL = 3.4
const WALL_H = 3.2
const EYE = 1.6

const WALK = 3.3
const RUN = 5.6
const BOT_SPEED = 6.3 // faster than a run…
const BOT_TURN = 2.6 // …but limited turn rate, and it slows while turning
const CATCH_DIST = 1.3
const HALL_PASSES = 5

type Phase = 'menu' | 'playing' | 'paused' | 'caught' | 'won'

// ── Seeded maze (recursive backtracker) ─────────────────────────────────────
function genMaze(seed: number): number[][] {
  let s = seed >>> 0
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const g: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(1))
  const stack: [number, number][] = [[1, 1]]
  g[1][1] = 0
  const dirs = [
    [0, -2],
    [0, 2],
    [-2, 0],
    [2, 0],
  ]
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1]
    const options = dirs
      .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([nx, ny]) => nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && g[ny][nx] === 1)
    if (!options.length) {
      stack.pop()
      continue
    }
    const [nx, ny, dx, dy] = options[Math.floor(rnd() * options.length)]
    g[cy + dy / 2][cx + dx / 2] = 0
    g[ny][nx] = 0
    stack.push([nx, ny])
  }
  // Knock out a few extra walls so it's loopy (more escape routes, less dead-end death).
  for (let i = 0; i < 12; i++) {
    const x = 1 + Math.floor(rnd() * (COLS - 2))
    const y = 1 + Math.floor(rnd() * (ROWS - 2))
    if (g[y][x] === 1 && x > 0 && x < COLS - 1 && y > 0 && y < ROWS - 1) g[y][x] = 0
  }
  return g
}

const cellCenter = (gx: number, gy: number) => new THREE.Vector3(gx * CELL + CELL / 2, 0, gy * CELL + CELL / 2)

export default function NextbotGame() {
  const setNextbotOpen = useStore((s) => s.setNextbotOpen)
  const mountRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('menu')
  const [passes, setPasses] = useState(0)
  const [runId, setRunId] = useState(0)
  const phaseRef = useRef<Phase>('menu')
  const startRef = useRef<() => void>(() => {})
  phaseRef.current = phase

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const maze = genMaze((Math.random() * 1e9) | 0)
    const openCells: [number, number][] = []
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (maze[y][x] === 0) openCells.push([x, y])

    // ── Renderer / scene / camera ──
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#05060a')
    scene.fog = new THREE.Fog('#05060a', 2.5, 17)

    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.1, 60)
    const start = cellCenter(1, 1)
    camera.position.set(start.x, EYE, start.z)
    camera.rotation.order = 'YXZ'
    scene.add(camera)

    // ── Lights ──
    scene.add(new THREE.AmbientLight('#20263a', 1.1))
    const flashlight = new THREE.SpotLight('#ffe9c4', 4.4, 26, 0.6, 0.45, 1.05)
    flashlight.position.set(0, 0, 0.2)
    camera.add(flashlight)
    const flashTarget = new THREE.Object3D()
    flashTarget.position.set(0, 0, -1)
    camera.add(flashTarget)
    flashlight.target = flashTarget

    // ── Floor + ceiling ──
    const floorMat = new THREE.MeshStandardMaterial({ color: '#0b0d14', roughness: 1, metalness: 0 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL), floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.set((COLS * CELL) / 2, 0, (ROWS * CELL) / 2)
    scene.add(floor)
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL), new THREE.MeshStandardMaterial({ color: '#080a10', roughness: 1 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.set((COLS * CELL) / 2, WALL_H, (ROWS * CELL) / 2)
    scene.add(ceil)

    // ── Walls (instanced) ──
    const wallCells: [number, number][] = []
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (maze[y][x] === 1) wallCells.push([x, y])
    const wallMat = new THREE.MeshStandardMaterial({ color: '#161a26', roughness: 1, metalness: 0, flatShading: true })
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(CELL, WALL_H, CELL), wallMat, wallCells.length)
    const dummy = new THREE.Object3D()
    wallCells.forEach(([x, y], i) => {
      dummy.position.set(x * CELL + CELL / 2, WALL_H / 2, y * CELL + CELL / 2)
      dummy.updateMatrix()
      walls.setMatrixAt(i, dummy.matrix)
    })
    scene.add(walls)

    // ── Hall passes (collectibles) ──
    const passMat = new THREE.MeshBasicMaterial({ color: '#67e8f9', fog: true })
    const passGeo = new THREE.BoxGeometry(0.5, 0.7, 0.06)
    const shuffled = [...openCells].sort(() => Math.random() - 0.5)
    const passMeshes: THREE.Mesh[] = []
    for (const [x, y] of shuffled) {
      if (passMeshes.length >= HALL_PASSES) break
      if (Math.abs(x - 1) + Math.abs(y - 1) < 6) continue // not too close to start
      const c = cellCenter(x, y)
      const m = new THREE.Mesh(passGeo, passMat)
      m.position.set(c.x, 1.1, c.z)
      scene.add(m)
      passMeshes.push(m)
    }

    // ── Nextbot (billboard of the teacher's face) ──
    const faceTex = makeFaceTexture()
    const bot = new THREE.Sprite(new THREE.SpriteMaterial({ map: faceTex, fog: true, depthWrite: false }))
    bot.scale.set(2.6, 2.6, 1)
    const botCell = openCells.reduce((best, c) => {
      const d = Math.abs(c[0] - 1) + Math.abs(c[1] - 1)
      return d > best.d ? { c, d } : best
    }, { c: openCells[0], d: 0 }).c
    const botStart = cellCenter(botCell[0], botCell[1])
    bot.position.set(botStart.x, 1.5, botStart.z)
    scene.add(bot)
    let botHeading = 0

    // ── Player "chai latte" viewmodel (a cup at the bottom of the view) ──
    const cup = new THREE.Group()
    const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.28, 12), new THREE.MeshStandardMaterial({ color: '#e7d3b3', roughness: 0.9 }))
    const cupFoam = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.05, 12), new THREE.MeshStandardMaterial({ color: '#fff7e8', emissive: '#3a3020', emissiveIntensity: 0.4 }))
    cupFoam.position.y = 0.16
    cup.add(cupBody, cupFoam)
    cup.position.set(0.32, -0.42, -0.75)
    cup.rotation.set(0.1, 0, -0.15)
    camera.add(cup)

    // ── Collision (circle vs solid grid cells) ──
    function collide(pos: THREE.Vector3, r: number) {
      const cgx = Math.floor(pos.x / CELL)
      const cgy = Math.floor(pos.z / CELL)
      for (let gy = cgy - 1; gy <= cgy + 1; gy++) {
        for (let gx = cgx - 1; gx <= cgx + 1; gx++) {
          if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || maze[gy][gx] !== 1) continue
          const minX = gx * CELL
          const minZ = gy * CELL
          const cx = Math.max(minX, Math.min(pos.x, minX + CELL))
          const cz = Math.max(minZ, Math.min(pos.z, minZ + CELL))
          const dx = pos.x - cx
          const dz = pos.z - cz
          const d2 = dx * dx + dz * dz
          if (d2 < r * r && d2 > 1e-6) {
            const d = Math.sqrt(d2)
            pos.x += (dx / d) * (r - d)
            pos.z += (dz / d) * (r - d)
          }
        }
      }
    }

    // ── Line of sight (grid supercover) ──
    function hasLOS(ax: number, az: number, bx: number, bz: number) {
      const steps = Math.ceil((Math.hypot(bx - ax, bz - az) / CELL) * 2)
      for (let i = 1; i < steps; i++) {
        const t = i / steps
        const gx = Math.floor((ax + (bx - ax) * t) / CELL)
        const gy = Math.floor((az + (bz - az) * t) / CELL)
        if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || maze[gy][gx] === 1) return false
      }
      return true
    }

    // ── BFS next-step toward the player ──
    function bfsStep(fromX: number, fromY: number, toX: number, toY: number): [number, number] | null {
      if (fromX === toX && fromY === toY) return null
      const prev = new Int32Array(COLS * ROWS).fill(-1)
      const q: number[] = [fromY * COLS + fromX]
      prev[fromY * COLS + fromX] = fromY * COLS + fromX
      const nb = [1, -1, COLS, -COLS]
      let head = 0
      while (head < q.length) {
        const cur = q[head++]
        if (cur === toY * COLS + toX) break
        const cx = cur % COLS
        const cy = (cur / COLS) | 0
        for (const d of nb) {
          const nx = d === 1 ? cx + 1 : d === -1 ? cx - 1 : cx
          const ny = d === COLS ? cy + 1 : d === -COLS ? cy - 1 : cy
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || maze[ny][nx] === 1) continue
          const ni = ny * COLS + nx
          if (prev[ni] !== -1) continue
          prev[ni] = cur
          q.push(ni)
        }
      }
      let cur = toY * COLS + toX
      if (prev[cur] === -1) return null
      while (prev[cur] !== fromY * COLS + fromX) {
        cur = prev[cur]
        if (cur === fromY * COLS + fromX) return null
      }
      return [cur % COLS, (cur / COLS) | 0]
    }

    // ── Input ──
    const keys: Record<string, boolean> = {}
    // Face an open neighbor so we don't spawn staring at a border wall.
    let yaw = maze[1][2] === 0 ? -Math.PI / 2 : Math.PI
    camera.rotation.y = yaw
    let pitch = 0
    let vy = 0
    let grounded = true
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true
      if (e.code === 'Escape') return
    }
    const onKeyUp = (e: KeyboardEvent) => (keys[e.code] = false)
    const onMouse = (e: MouseEvent) => {
      if (phaseRef.current !== 'playing') return
      yaw -= e.movementX * 0.0022
      pitch -= e.movementY * 0.0022
      pitch = Math.max(-1.3, Math.min(1.3, pitch))
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('mousemove', onMouse)

    let ending = false // set when the round ends (caught/won) so the lock-change
    // handler below doesn't clobber that with 'paused'.
    const onLockChange = () => {
      if (document.pointerLockElement === renderer.domElement) {
        setPhase('playing')
      } else if (!ending && phaseRef.current === 'playing') {
        setPhase('paused')
      }
    }
    document.addEventListener('pointerlockchange', onLockChange)
    startRef.current = () => renderer.domElement.requestPointerLock()

    // ── Loop ──
    const clock = new THREE.Clock()
    let bfsTimer = 0
    let botWaypoint = new THREE.Vector3(bot.position.x, 0, bot.position.z)
    let bob = 0
    let raf = 0
    const tmp = new THREE.Vector3()

    function frame() {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(clock.getDelta(), 0.05)
      const playing = phaseRef.current === 'playing'

      if (playing) {
        // Player movement
        camera.rotation.y = yaw
        camera.rotation.x = pitch
        const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
        const move = new THREE.Vector3()
        if (keys['KeyW']) move.add(fwd)
        if (keys['KeyS']) move.sub(fwd)
        if (keys['KeyD']) move.add(right)
        if (keys['KeyA']) move.sub(right)
        const moving = move.lengthSq() > 0
        if (moving) move.normalize()
        const speed = keys['ShiftLeft'] || keys['ShiftRight'] ? RUN : WALK
        camera.position.x += move.x * speed * dt
        camera.position.z += move.z * speed * dt
        collide(camera.position, 0.5)

        // Jump / gravity
        if ((keys['Space'] && grounded)) {
          vy = 6.2
          grounded = false
        }
        vy -= 20 * dt
        camera.position.y += vy * dt
        bob += moving && grounded ? dt * (speed === RUN ? 12 : 8) : 0
        const groundY = EYE + (moving && grounded ? Math.sin(bob) * 0.05 : 0)
        if (camera.position.y <= groundY) {
          camera.position.y = groundY
          vy = 0
          grounded = true
        }

        // Nextbot chase
        const pgx = Math.floor(camera.position.x / CELL)
        const pgy = Math.floor(camera.position.z / CELL)
        const bgx = Math.floor(bot.position.x / CELL)
        const bgy = Math.floor(bot.position.z / CELL)
        bfsTimer -= dt
        const los = hasLOS(bot.position.x, bot.position.z, camera.position.x, camera.position.z)
        if (los) {
          botWaypoint.set(camera.position.x, 0, camera.position.z)
        } else if (bfsTimer <= 0) {
          bfsTimer = 0.2
          const step = bfsStep(bgx, bgy, pgx, pgy)
          if (step) {
            const c = cellCenter(step[0], step[1])
            botWaypoint.set(c.x, 0, c.z)
          }
        }
        // Steer toward the waypoint. With line-of-sight the bot locks on and
        // turns/chases hard; blind (feeling its way around corners via BFS) it
        // turns slowly and bleeds speed — so rounding corners is your escape.
        const desired = Math.atan2(botWaypoint.x - bot.position.x, botWaypoint.z - bot.position.z)
        let diff = desired - botHeading
        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI
        const distP = Math.hypot(bot.position.x - camera.position.x, bot.position.z - camera.position.z)
        // Point-blank lunge: once it sees you up close, it snaps on and pounces.
        const lunging = los && distP < 3.8
        const turnRate = los ? BOT_TURN * 2.4 : BOT_TURN
        if (lunging) botHeading = desired
        else botHeading += Math.max(-turnRate * dt, Math.min(turnRate * dt, diff))
        const floor = los ? 0.78 : 0.4
        const align = lunging ? 1 : 1 - Math.min(Math.abs(diff) / (Math.PI / 2), 1) * (1 - floor)
        const bs = BOT_SPEED * align * dt
        tmp.set(bot.position.x + Math.sin(botHeading) * bs, 0, bot.position.z + Math.cos(botHeading) * bs)
        collide(tmp, 0.6)
        bot.position.x = tmp.x
        bot.position.z = tmp.z
        bot.position.y = 1.5 + Math.sin(clock.elapsedTime * 3) * 0.12

        // Catch?
        if (Math.hypot(bot.position.x - camera.position.x, bot.position.z - camera.position.z) < CATCH_DIST) {
          ending = true
          document.exitPointerLock()
          setPhase('caught')
        }

        // Hall passes
        for (let i = passMeshes.length - 1; i >= 0; i--) {
          const m = passMeshes[i]
          m.rotation.y += dt * 2
          if (Math.hypot(m.position.x - camera.position.x, m.position.z - camera.position.z) < 0.9) {
            scene.remove(m)
            passMeshes.splice(i, 1)
            setPasses(HALL_PASSES - passMeshes.length)
            if (passMeshes.length === 0) {
              ending = true
              document.exitPointerLock()
              setPhase('won')
            }
          }
        }
      }

      renderer.render(scene, camera)
    }
    frame()

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousemove', onMouse)
      document.removeEventListener('pointerlockchange', onLockChange)
      window.removeEventListener('resize', onResize)
      if (document.pointerLockElement) document.exitPointerLock()
      renderer.dispose()
      faceTex.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [runId])

  function retry() {
    setPasses(0)
    setPhase('menu')
    setRunId((n) => n + 1)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Film grain + vignette */}
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.10] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 220px 60px rgba(0,0,0,0.9)' }} />

      {/* HUD */}
      {phase === 'playing' && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40">+</div>
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-black/40 px-3 py-1.5 text-sm text-cyan-200">
            Hall passes {passes}/{HALL_PASSES}
          </div>
        </>
      )}

      {/* Overlays */}
      {phase !== 'playing' && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center backdrop-blur-sm">
          <div className="max-w-sm">
            {phase === 'menu' && (
              <>
                <h1 className="text-2xl font-bold text-slate-50">Don’t Get Sipped ☕</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  You’re Mr. G’s chai latte, lost in the dark. His face hunts you — faster than you in the open, but he
                  slows to turn. Round corners to lose him. Grab all {HALL_PASSES} hall passes to escape.
                </p>
                <p className="mt-3 text-xs text-slate-500">WASD move · Shift run · Space jump · Mouse look · Esc pause</p>
                <button
                  onClick={() => startRef.current()}
                  className="mt-5 rounded-xl bg-cyan-500/80 px-6 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
                >
                  Enter the dark
                </button>
                <button onClick={() => setNextbotOpen(false)} className="ml-3 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5">
                  Leave
                </button>
              </>
            )}
            {phase === 'paused' && (
              <>
                <h1 className="text-xl font-bold text-slate-100">Paused</h1>
                <p className="mt-2 text-xs text-slate-500">Hall passes {passes}/{HALL_PASSES}</p>
                <div className="mt-5">
                  <button onClick={() => startRef.current()} className="rounded-xl bg-cyan-500/80 px-6 py-2 text-sm font-semibold text-black hover:bg-cyan-400">
                    Resume
                  </button>
                  <button onClick={() => setNextbotOpen(false)} className="ml-3 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5">
                    Leave
                  </button>
                </div>
              </>
            )}
            {phase === 'caught' && (
              <>
                <h1 className="text-3xl font-extrabold text-rose-400">SIPPED.</h1>
                <p className="mt-2 text-sm text-slate-300">Mr. G got his chai latte. Better luck next period.</p>
                <div className="mt-5">
                  <button onClick={retry} className="rounded-xl bg-cyan-500/80 px-6 py-2 text-sm font-semibold text-black hover:bg-cyan-400">
                    Try again
                  </button>
                  <button onClick={() => setNextbotOpen(false)} className="ml-3 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5">
                    Leave
                  </button>
                </div>
              </>
            )}
            {phase === 'won' && (
              <>
                <h1 className="text-3xl font-extrabold text-cyan-300">You escaped! ☕💨</h1>
                <p className="mt-2 text-sm text-slate-300">All {HALL_PASSES} hall passes collected. Freedom.</p>
                <div className="mt-5">
                  <button onClick={retry} className="rounded-xl bg-cyan-500/80 px-6 py-2 text-sm font-semibold text-black hover:bg-cyan-400">
                    Play again
                  </button>
                  <button onClick={() => setNextbotOpen(false)} className="ml-3 rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5">
                    Leave
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
