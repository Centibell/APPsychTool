import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { makeFaceTexture } from './face'
import { GameAudio } from './audio'

// ─────────────────────────────────────────────────────────────────────────
//  Hidden nextbot horror game. You are Mr. G's chai latte, lost in a dim
//  school after hours; a giant floating photo of his face hunts you. Collect
//  all the hall passes to slip out.
//
//  The level is a "rooms + mazes" dungeon (Bob Nystrom's algorithm): random
//  rectangular rooms carved out of the grid, twisty maze corridors filling the
//  gaps, connectors punched between regions, then dead-ends trimmed. Result:
//  real rooms and open spaces linked by looping halls — learnable but different
//  every run.
//
//  The bot runs a small state machine:
//    • hunt       — BFS-pathfinds to you; locks on and lunges with line-of-sight.
//    • stalk      — teleports into view ahead of you and just *watches*, then
//                   vanishes the moment you look away (classic peek/《SCP-173》/
//                   nextbot "stare" behavior). Builds dread without a chase.
//    • reposition — invisible for a beat, then re-materializes out of sight to
//                   resume the hunt.
//
//  Very rarely the map seeds a powered door: seal it (E) mid-chase to cut him
//  off, forcing a long reroute — or a switch to stalking.
//
//  Deliberately cheap so it runs on weak hardware: flat-shaded instanced walls,
//  no shadows, one spotlight, heavy fog + a film-grain overlay to hide the low
//  fidelity. Lazy-loaded (dynamic import) so none of this ships until unlocked.
// ─────────────────────────────────────────────────────────────────────────

const COLS = 23 // odd for the maze grid
const ROWS = 23
const CELL = 3.4
const WALL_H = 3.2
const EYE = 1.6

// Everything is FAST now — this is a flat-out panic sprint, not a stroll.
const WALK = 6.6
const RUN = 12.2
const BOT_SPEED = 11 // a touch under a full sprint, so straightaways still buy distance…
const BOT_TURN = 2.1 // …and a sluggish turn rate means corners really shake it
const BOT_COUNT = 2 // two of Mr. G's faces hunt you
const CATCH_DIST = 1.5
const HALL_PASSES = 5

// AI tuning
const STALK_MIN_DIST = 8
const STALK_MAX_DIST = 17
const STALK_MAX_TIME = 6.5
const STALK_VANISH_LOOKAWAY = 0.32 // seconds of you looking away before it's gone
const HUNT_BEFORE_STALK: [number, number] = [12, 22] // seconds of hunting first
const REPOSITION_TIME: [number, number] = [0.7, 1.3]
const SHAKE_RANGE = 9 // bot within this many units starts to rattle the camera

// Map generation
const ROOM_TRIES = 90
const ROOM_MIN = 1 // room side = 2*n+1  → 3
const ROOM_MAX = 3 //                    → up to 7
const EXTRA_CONNECTOR = 0.09 // chance to punch a redundant connector (loops)
const WINDINESS = 0.55 // higher = straighter corridors

// Doors (very rare)
const DOOR_COUNT = 2
const DOOR_MIN_DIST_FROM_START = 9 // grid manhattan
const DOOR_REACH = 2.6

// Player-only shortcuts: punched-out gaps in select walls. The bot can't fit
// (it still treats them as solid), but you can vault through with a running jump.
const WINDOW_COUNT = 3
const WINDOW_MIN_DETOUR = 9 // only punch a gap where it saves a real detour
const WINDOW_SILL_H = 1.35 // solid sill you clear
const WINDOW_LINTEL_Y = 2.75 // solid header above the hole
const WINDOW_PASS_Y = 1.95 // camera height needed to be through the gap

type Phase = 'menu' | 'playing' | 'paused' | 'caught' | 'won'
type BotState = 'hunt' | 'stalk' | 'reposition'

interface Door {
  gx: number
  gy: number
  c: THREE.Vector3
  panel: THREE.Mesh
  openY: number
  shutY: number
  shut: boolean
}

// Per-hunter state — each nextbot runs its own copy of the state machine.
interface Bot {
  sprite: THREE.Sprite
  mat: THREE.SpriteMaterial
  state: BotState
  stateT: number
  heading: number
  waypoint: THREE.Vector3
  huntUntilStalk: number
  repositionT: number
  vanishT: number
  bfsTimer: number
  lungeArmed: boolean
}

const key = (x: number, y: number) => y * COLS + x
const cellCenter = (gx: number, gy: number) =>
  new THREE.Vector3(gx * CELL + CELL / 2, 0, gy * CELL + CELL / 2)
const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a)

// ── Rooms-and-mazes level generator ─────────────────────────────────────────
function genMap(seed: number) {
  let s = seed >>> 0
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const g: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(1))
  const region: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(-1))
  let cur = -1
  const carve = (x: number, y: number) => {
    g[y][x] = 0
    region[y][x] = cur
  }
  const DIRS = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]

  // 1. Rooms
  for (let i = 0; i < ROOM_TRIES; i++) {
    const w = 2 * (ROOM_MIN + Math.floor(rnd() * (ROOM_MAX - ROOM_MIN + 1))) + 1
    const h = 2 * (ROOM_MIN + Math.floor(rnd() * (ROOM_MAX - ROOM_MIN + 1))) + 1
    const maxX = COLS - 1 - w
    const maxY = ROWS - 1 - h
    if (maxX < 1 || maxY < 1) continue
    const x = 1 + 2 * Math.floor(rnd() * (Math.floor((maxX - 1) / 2) + 1))
    const y = 1 + 2 * Math.floor(rnd() * (Math.floor((maxY - 1) / 2) + 1))
    let overlaps = false
    for (let yy = y - 1; yy <= y + h && !overlaps; yy++)
      for (let xx = x - 1; xx <= x + w; xx++) {
        if (yy < 0 || xx < 0 || yy >= ROWS || xx >= COLS || g[yy][xx] === 0) {
          overlaps = true
          break
        }
      }
    if (overlaps) continue
    cur++
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) carve(xx, yy)
  }

  // 2. Maze-fill the leftover solid with corridors (recursive backtracker)
  const canCarve = (x: number, y: number, dx: number, dy: number) => {
    const nx = x + dx * 2
    const ny = y + dy * 2
    if (nx < 1 || ny < 1 || nx >= COLS - 1 || ny >= ROWS - 1) return false
    return g[ny][nx] === 1
  }
  const growMaze = (sx: number, sy: number) => {
    cur++
    carve(sx, sy)
    const stack: [number, number][] = [[sx, sy]]
    let last: number[] | null = null
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1]
      const opts = DIRS.filter(([dx, dy]) => canCarve(cx, cy, dx, dy))
      if (!opts.length) {
        stack.pop()
        last = null
        continue
      }
      let dir: number[]
      if (last && opts.some(([dx, dy]) => dx === last![0] && dy === last![1]) && rnd() < WINDINESS)
        dir = last
      else dir = opts[Math.floor(rnd() * opts.length)]
      carve(cx + dir[0], cy + dir[1])
      carve(cx + dir[0] * 2, cy + dir[1] * 2)
      stack.push([cx + dir[0] * 2, cy + dir[1] * 2])
      last = dir
    }
  }
  for (let y = 1; y < ROWS - 1; y += 2)
    for (let x = 1; x < COLS - 1; x += 2) if (g[y][x] === 1) growMaze(x, y)

  // 3. Connect the regions (union-find), opening a door between each pair; keep
  //    a few redundant connectors for loops.
  const connectorRegions = new Map<number, Set<number>>()
  for (let y = 1; y < ROWS - 1; y++)
    for (let x = 1; x < COLS - 1; x++) {
      if (g[y][x] !== 1) continue
      const set = new Set<number>()
      for (const [dx, dy] of DIRS) {
        const r = region[y + dy][x + dx]
        if (r !== -1) set.add(r)
      }
      if (set.size >= 2) connectorRegions.set(key(x, y), set)
    }
  let connectors = [...connectorRegions.keys()]
  const merged: number[] = []
  const openRegions = new Set<number>()
  for (let r = 0; r <= cur; r++) {
    merged[r] = r
    openRegions.add(r)
  }
  while (openRegions.size > 1 && connectors.length) {
    const pos = connectors[Math.floor(rnd() * connectors.length)]
    const px = pos % COLS
    const py = (pos / COLS) | 0
    g[py][px] = 0
    const regs = [...connectorRegions.get(pos)!].map((r) => merged[r])
    const dest = regs[0]
    const sources = regs.slice(1)
    for (let r = 0; r <= cur; r++) if (sources.includes(merged[r])) merged[r] = dest
    for (const src of sources) openRegions.delete(src)
    connectors = connectors.filter((p) => {
      const qx = p % COLS
      const qy = (p / COLS) | 0
      if (Math.abs(qx - px) + Math.abs(qy - py) === 1) return false // no doubled doors
      const rs = new Set([...connectorRegions.get(p)!].map((r) => merged[r]))
      if (rs.size <= 1) {
        if (rnd() < EXTRA_CONNECTOR) g[qy][qx] = 0
        return false
      }
      return true
    })
  }

  // 4. Trim dead-ends so the map is rooms + looping halls (no 1-wide traps).
  let changed = true
  while (changed) {
    changed = false
    for (let y = 1; y < ROWS - 1; y++)
      for (let x = 1; x < COLS - 1; x++) {
        if (g[y][x] !== 0) continue
        let exits = 0
        for (const [dx, dy] of DIRS) if (g[y + dy][x + dx] === 0) exits++
        if (exits === 1) {
          g[y][x] = 1
          changed = true
        }
      }
  }

  return g
}

export default function NextbotGame() {
  const setNextbotOpen = useStore((s) => s.setNextbotOpen)
  const mountRef = useRef<HTMLDivElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)
  const dangerRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('menu')
  const [passes, setPasses] = useState(0)
  const [runId, setRunId] = useState(0)
  const phaseRef = useRef<Phase>('menu')
  const startRef = useRef<() => void>(() => {})
  phaseRef.current = phase

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const maze = genMap((Math.random() * 1e9) | 0)
    const openCells: [number, number][] = []
    for (let y = 1; y < ROWS - 1; y++)
      for (let x = 1; x < COLS - 1; x++) if (maze[y][x] === 0) openCells.push([x, y])

    // Player start: open cell nearest a corner. Bot start: farthest cell.
    const startCell = openCells.reduce(
      (best, c) => {
        const d = c[0] + c[1]
        return d < best.d ? { c, d } : best
      },
      { c: openCells[0], d: Infinity },
    ).c
    const botCell = openCells.reduce(
      (best, c) => {
        const d = Math.abs(c[0] - startCell[0]) + Math.abs(c[1] - startCell[1])
        return d > best.d ? { c, d } : best
      },
      { c: openCells[0], d: -1 },
    ).c
    // Second hunter starts far from BOTH the player and the first bot, so the two
    // approach from different sides rather than stacking on one another.
    const botCell2 = openCells.reduce(
      (best, c) => {
        const d =
          Math.abs(c[0] - startCell[0]) +
          Math.abs(c[1] - startCell[1]) +
          Math.abs(c[0] - botCell[0]) +
          Math.abs(c[1] - botCell[1])
        return d > best.d ? { c, d } : best
      },
      { c: openCells[0], d: -1 },
    ).c
    const spawnCells = [botCell, botCell2].slice(0, BOT_COUNT)

    // ── Doors: rare corridor chokepoints that don't disconnect the map when
    //    sealed (so the bot can always reroute — you never hard-trap him).
    const shutDoors = new Set<number>()
    const isSolid = (gx: number, gy: number) =>
      gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || maze[gy][gx] === 1 || shutDoors.has(key(gx, gy))
    const isCutVertex = (cx: number, cy: number) => {
      // Would blocking (cx,cy) leave any open cell unreachable from start?
      const blocked = key(cx, cy)
      const seen = new Set<number>([key(startCell[0], startCell[1])])
      const q = [startCell[0], startCell[1]]
      let count = 1
      for (let i = 0; i < q.length; i += 2) {
        const x = q[i]
        const y = q[i + 1]
        for (const [dx, dy] of [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ]) {
          const nx = x + dx
          const ny = y + dy
          const k = key(nx, ny)
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || maze[ny][nx] === 1) continue
          if (k === blocked || seen.has(k)) continue
          seen.add(k)
          count++
          q.push(nx, ny)
        }
      }
      return count < openCells.length - 1
    }
    const doorCandidates = openCells.filter(([x, y]) => {
      if (Math.abs(x - startCell[0]) + Math.abs(y - startCell[1]) < DOOR_MIN_DIST_FROM_START)
        return false
      // Straight 1-wide corridor cell (two opposite open neighbors only).
      const horiz = maze[y][x - 1] === 0 && maze[y][x + 1] === 0
      const vert = maze[y - 1][x] === 0 && maze[y + 1][x] === 0
      const openN =
        (maze[y][x - 1] === 0 ? 1 : 0) +
        (maze[y][x + 1] === 0 ? 1 : 0) +
        (maze[y - 1][x] === 0 ? 1 : 0) +
        (maze[y + 1][x] === 0 ? 1 : 0)
      if (openN !== 2 || (!horiz && !vert)) return false
      return !isCutVertex(x, y)
    })
    for (let i = doorCandidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[doorCandidates[i], doorCandidates[j]] = [doorCandidates[j], doorCandidates[i]]
    }
    const doorCells: [number, number][] = []
    for (const cand of doorCandidates) {
      if (doorCells.length >= DOOR_COUNT) break
      if (doorCells.every(([x, y]) => Math.abs(x - cand[0]) + Math.abs(y - cand[1]) > 5))
        doorCells.push(cand)
    }

    // ── Player-only "punch-out" gaps: pick wall cells that separate two open
    //    cells which are otherwise a long walk apart, so vaulting through is a
    //    real shortcut. The bot still can't fit (window cells stay solid to it).
    const gridDist = (ax: number, ay: number, bx: number, by: number) => {
      const dist = new Int16Array(COLS * ROWS).fill(-1)
      dist[ay * COLS + ax] = 0
      const q = [ax, ay]
      for (let i = 0; i < q.length; i += 2) {
        const x = q[i]
        const y = q[i + 1]
        const dc = dist[y * COLS + x]
        if (x === bx && y === by) return dc
        for (const [dx, dy] of [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ]) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || maze[ny][nx] === 1) continue
          const ni = ny * COLS + nx
          if (dist[ni] !== -1) continue
          dist[ni] = dc + 1
          q.push(nx, ny)
        }
      }
      return -1
    }
    const windowCandidates: { x: number; y: number; gain: number }[] = []
    for (let y = 1; y < ROWS - 1; y++)
      for (let x = 1; x < COLS - 1; x++) {
        if (maze[y][x] !== 1) continue
        // A clean wall segment: open on two opposite sides, solid on the other two.
        const horiz = maze[y][x - 1] === 0 && maze[y][x + 1] === 0 && maze[y - 1][x] === 1 && maze[y + 1][x] === 1
        const vert = maze[y - 1][x] === 0 && maze[y + 1][x] === 0 && maze[y][x - 1] === 1 && maze[y][x + 1] === 1
        if (!horiz && !vert) continue
        const [ax, ay, bx, by] = horiz ? [x - 1, y, x + 1, y] : [x, y - 1, x, y + 1]
        const d = gridDist(ax, ay, bx, by)
        if (d >= WINDOW_MIN_DETOUR) windowCandidates.push({ x, y, gain: d })
      }
    windowCandidates.sort((a, b) => b.gain - a.gain)
    const windowCells: [number, number][] = []
    const windowSet = new Set<number>()
    for (const c of windowCandidates) {
      if (windowCells.length >= WINDOW_COUNT) break
      if (windowCells.every(([wx, wy]) => Math.abs(wx - c.x) + Math.abs(wy - c.y) > 3)) {
        windowCells.push([c.x, c.y])
        windowSet.add(key(c.x, c.y))
      }
    }

    // ── Renderer / scene / camera ──
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#05070e')
    // Exponential fog reads moodier than linear and costs the same — it swallows
    // the low-poly geometry into darkness a few cells out.
    scene.fog = new THREE.FogExp2('#05070e', 0.05)

    const camera = new THREE.PerspectiveCamera(74, mount.clientWidth / mount.clientHeight, 0.1, 60)
    const start = cellCenter(startCell[0], startCell[1])
    camera.position.set(start.x, EYE, start.z)
    camera.rotation.order = 'YXZ'
    scene.add(camera)

    // ── Lights ──
    //   Weak-Chromebook budget: no shadow maps, a handful of cheap lights. The
    //   world sits in near-darkness (low cool ambient + hemisphere fill) so the
    //   real star — a bright, tight flashlight spot from the camera — carves a
    //   crisp pool of illumination wherever you look. A small point light at the
    //   lens gives a warm bubble around you so nearby geometry isn't pitch black.
    // A real ambient floor so nothing is pure black and the game stays playable,
    // then a big warm flashlight on top so the pool you're looking at is brightly
    // lit — you can read the whole room in the beam.
    scene.add(new THREE.AmbientLight('#2a3350', 0.85))
    scene.add(new THREE.HemisphereLight('#3a4a6a', '#0a0e18', 0.6))
    // SpotLight(color, intensity, distance, angle, penumbra, decay). Wide + very
    // bright = a broad, strongly-lit circle wherever you look.
    const FLASH_BASE = 34
    const flashlight = new THREE.SpotLight('#fff3da', FLASH_BASE, 46, 0.62, 0.32, 1.05)
    flashlight.position.set(0, 0, 0.2)
    camera.add(flashlight)
    const flashTarget = new THREE.Object3D()
    flashTarget.position.set(0, 0, -1)
    camera.add(flashTarget)
    flashlight.target = flashTarget
    // Warm short-range fill riding the camera so your hands/cup and the walls
    // right beside you are clearly lit even outside the beam.
    const lensGlow = new THREE.PointLight('#ffe1b0', 5, 10, 1.4)
    lensGlow.position.set(0, -0.05, 0.1)
    camera.add(lensGlow)

    // ── Floor + ceiling ──
    // Lambert (cheap diffuse) instead of Standard/PBR everywhere — invisible
    // difference in this gloom, far lighter on weak integrated GPUs.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL),
      new THREE.MeshLambertMaterial({ color: '#0b0d14' }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set((COLS * CELL) / 2, 0, (ROWS * CELL) / 2)
    scene.add(floor)
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL),
      new THREE.MeshLambertMaterial({ color: '#080a10' }),
    )
    ceil.rotation.x = Math.PI / 2
    ceil.position.set((COLS * CELL) / 2, WALL_H, (ROWS * CELL) / 2)
    scene.add(ceil)

    // ── Walls (instanced) ── window cells are drawn separately (sill + header).
    const wallCells: [number, number][] = []
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) if (maze[y][x] === 1 && !windowSet.has(key(x, y))) wallCells.push([x, y])
    const wallMat = new THREE.MeshLambertMaterial({ color: '#161a26', flatShading: true })
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(CELL, WALL_H, CELL), wallMat, wallCells.length)
    const dummy = new THREE.Object3D()
    wallCells.forEach(([x, y], i) => {
      dummy.position.set(x * CELL + CELL / 2, WALL_H / 2, y * CELL + CELL / 2)
      dummy.updateMatrix()
      walls.setMatrixAt(i, dummy.matrix)
    })
    scene.add(walls)

    // ── Window gaps: a low sill + high header leave a hole you can jump through.
    //    Faint teal emissive rim (like the doors) hints "this one's special."
    const windowMat = new THREE.MeshLambertMaterial({
      color: '#1b2130',
      emissive: '#0b2a30',
      emissiveIntensity: 0.5,
      flatShading: true,
    })
    for (const [gx, gy] of windowCells) {
      const c = cellCenter(gx, gy)
      const sill = new THREE.Mesh(new THREE.BoxGeometry(CELL, WINDOW_SILL_H, CELL), windowMat)
      sill.position.set(c.x, WINDOW_SILL_H / 2, c.z)
      scene.add(sill)
      const headerH = WALL_H - WINDOW_LINTEL_Y
      const header = new THREE.Mesh(new THREE.BoxGeometry(CELL, headerH, CELL), windowMat)
      header.position.set(c.x, WINDOW_LINTEL_Y + headerH / 2, c.z)
      scene.add(header)
    }

    // ── Doors (powered) ──
    const doorMat = new THREE.MeshLambertMaterial({
      color: '#232838',
      emissive: '#0f3a3f',
      emissiveIntensity: 0.6,
      flatShading: true,
    })
    const plateMat = new THREE.MeshBasicMaterial({ color: '#0ea5b7', fog: true })
    const doors: Door[] = doorCells.map(([gx, gy]) => {
      const c = cellCenter(gx, gy)
      const panel = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.98, WALL_H, CELL * 0.98), doorMat)
      const openY = WALL_H + WALL_H / 2 + 0.4 // tucked above the ceiling = open
      const shutY = WALL_H / 2
      panel.position.set(c.x, openY, c.z)
      scene.add(panel)
      // Floor plate so the door is discoverable even while open.
      const plate = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.8, 0.06, CELL * 0.8), plateMat)
      plate.position.set(c.x, 0.03, c.z)
      scene.add(plate)
      const marker = new THREE.PointLight('#22d3ee', 0.7, 5)
      marker.position.set(c.x, 0.6, c.z)
      scene.add(marker)
      return { gx, gy, c, panel, openY, shutY, shut: false }
    })

    // ── Hall passes (collectibles) ──
    const passMat = new THREE.MeshBasicMaterial({ color: '#67e8f9', fog: true })
    const passGeo = new THREE.BoxGeometry(0.5, 0.7, 0.06)
    const shuffled = [...openCells].sort(() => Math.random() - 0.5)
    const passMeshes: THREE.Mesh[] = []
    for (const [x, y] of shuffled) {
      if (passMeshes.length >= HALL_PASSES) break
      if (Math.abs(x - startCell[0]) + Math.abs(y - startCell[1]) < 6) continue
      const c = cellCenter(x, y)
      const m = new THREE.Mesh(passGeo, passMat)
      m.position.set(c.x, 1.1, c.z)
      scene.add(m)
      passMeshes.push(m)
    }

    // ── Nextbots (billboards of the teacher's face) ──
    const faceTex = makeFaceTexture()
    const bots: Bot[] = spawnCells.map((cell, i) => {
      const mat = new THREE.SpriteMaterial({ map: faceTex, fog: true, depthWrite: false, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(2.6, 2.6, 1)
      const p = cellCenter(cell[0], cell[1])
      sprite.position.set(p.x, 1.5, p.z)
      scene.add(sprite)
      return {
        sprite,
        mat,
        state: 'hunt' as BotState,
        stateT: 0,
        heading: 0,
        waypoint: new THREE.Vector3(p.x, 0, p.z),
        // Stagger the first stalk so both don't peel off to stare at once.
        huntUntilStalk: rand(HUNT_BEFORE_STALK) + i * 6,
        repositionT: 0,
        vanishT: 0,
        bfsTimer: 0,
        lungeArmed: true,
      }
    })

    // ── Audio (positional footsteps ride a moving anchor kept on the nearest
    //    hunting bot, so we get 3D panning without a panner per hunter). ──
    const audioAnchor = new THREE.Object3D()
    audioAnchor.position.copy(bots[0].sprite.position)
    scene.add(audioAnchor)
    const audio = new GameAudio(camera, audioAnchor)

    // ── Player "chai latte" viewmodel ──
    const cup = new THREE.Group()
    const cupBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.11, 0.28, 12),
      new THREE.MeshLambertMaterial({ color: '#e7d3b3' }),
    )
    const cupFoam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.05, 12),
      new THREE.MeshLambertMaterial({ color: '#fff7e8', emissive: '#3a3020', emissiveIntensity: 0.4 }),
    )
    cupFoam.position.y = 0.16
    cup.add(cupBody, cupFoam)
    cup.position.set(0.32, -0.42, -0.75)
    cup.rotation.set(0.1, 0, -0.15)
    camera.add(cup)

    // ── Collision (circle vs solid cells) ──
    //   `camY` (player only) lets you clear a window gap mid-jump; the bot passes
    //   no height, so window cells always block it.
    function collide(pos: THREE.Vector3, r: number, camY?: number) {
      const cgx = Math.floor(pos.x / CELL)
      const cgy = Math.floor(pos.z / CELL)
      for (let gy = cgy - 1; gy <= cgy + 1; gy++) {
        for (let gx = cgx - 1; gx <= cgx + 1; gx++) {
          if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) continue
          if (!isSolid(gx, gy)) continue
          // Vault-through: a jumping player above the sill passes the window cell.
          if (windowSet.has(key(gx, gy)) && camY !== undefined && camY > WINDOW_PASS_Y) continue
          const minX = gx * CELL
          const minZ = gy * CELL
          const cx = Math.max(minX, Math.min(pos.x, minX + CELL))
          const cz = Math.max(minZ, Math.min(pos.z, minZ + CELL))
          const dx = pos.x - cx
          const dz = pos.z - cz
          const d2 = dx * dx + dz * dz
          if (d2 > r * r) continue // circle clear of this cell
          if (d2 > 1e-6) {
            const d = Math.sqrt(d2)
            pos.x += (dx / d) * (r - d)
            pos.z += (dz / d) * (r - d)
          } else {
            // Center is INSIDE the cell (fast tunneling): eject out the nearest
            // face so it can't punch through a one-cell-thick wall like a window.
            const left = pos.x - minX
            const right = minX + CELL - pos.x
            const near = pos.z - minZ
            const far = minZ + CELL - pos.z
            const m = Math.min(left, right, near, far)
            if (m === left) pos.x = minX - r
            else if (m === right) pos.x = minX + CELL + r
            else if (m === near) pos.z = minZ - r
            else pos.z = minZ + CELL + r
          }
        }
      }
    }

    // ── Line of sight ──
    function hasLOS(ax: number, az: number, bx: number, bz: number) {
      const steps = Math.ceil((Math.hypot(bx - ax, bz - az) / CELL) * 2)
      for (let i = 1; i < steps; i++) {
        const t = i / steps
        const gx = Math.floor((ax + (bx - ax) * t) / CELL)
        const gy = Math.floor((az + (bz - az) * t) / CELL)
        if (isSolid(gx, gy)) return false
      }
      return true
    }

    // ── BFS next-step toward the player ──
    function bfsStep(fromX: number, fromY: number, toX: number, toY: number): [number, number] | null {
      if (fromX === toX && fromY === toY) return null
      const prev = new Int32Array(COLS * ROWS).fill(-1)
      const from = fromY * COLS + fromX
      const q: number[] = [from]
      prev[from] = from
      const nb = [1, -1, COLS, -COLS]
      let head = 0
      while (head < q.length) {
        const curc = q[head++]
        if (curc === toY * COLS + toX) break
        const cx = curc % COLS
        const cy = (curc / COLS) | 0
        for (const d of nb) {
          const nx = d === 1 ? cx + 1 : d === -1 ? cx - 1 : cx
          const ny = d === COLS ? cy + 1 : d === -COLS ? cy - 1 : cy
          if (isSolid(nx, ny)) continue
          const ni = ny * COLS + nx
          if (prev[ni] !== -1) continue
          prev[ni] = curc
          q.push(ni)
        }
      }
      let curc = toY * COLS + toX
      if (prev[curc] === -1) return null
      while (prev[curc] !== from) {
        curc = prev[curc]
        if (curc === from) return null
      }
      return [curc % COLS, (curc / COLS) | 0]
    }

    // Find a cell in front of the player (central, in view, with LOS) to stalk from.
    function findStalkSpot(px: number, pz: number, fx: number, fz: number) {
      let best: THREE.Vector3 | null = null
      let bestDot = 0.87
      for (const [gx, gy] of openCells) {
        const c = cellCenter(gx, gy)
        const dx = c.x - px
        const dz = c.z - pz
        const d = Math.hypot(dx, dz)
        if (d < STALK_MIN_DIST || d > STALK_MAX_DIST) continue
        const dot = (fx * dx + fz * dz) / d
        if (dot < bestDot) continue
        if (!hasLOS(c.x, c.z, px, pz)) continue
        best = c
        bestDot = dot
      }
      return best
    }
    // Find a cell out of view to re-materialize and resume the hunt.
    function findHuntSpot(px: number, pz: number, fx: number, fz: number) {
      let best: [THREE.Vector3, number, number] | null = null
      let bestScore = -1
      for (const [gx, gy] of openCells) {
        const c = cellCenter(gx, gy)
        const dx = c.x - px
        const dz = c.z - pz
        const d = Math.hypot(dx, dz)
        if (d < 6 || d > 16) continue
        const dot = d > 0 ? (fx * dx + fz * dz) / d : 1
        if (dot > 0.26 && hasLOS(c.x, c.z, px, pz)) continue // must be hidden
        const score = 16 - d + Math.random() * 5
        if (score > bestScore) {
          bestScore = score
          best = [c, gx, gy]
        }
      }
      return best
    }

    // ── Input ──
    const keys: Record<string, boolean> = {}
    let yaw = maze[startCell[1]][startCell[0] + 1] === 0 ? -Math.PI / 2 : Math.PI
    camera.rotation.y = yaw
    let pitch = 0
    let vy = 0
    let grounded = true

    const shutNearestDoor = () => {
      for (const d of doors) {
        if (d.shut) continue
        if (Math.hypot(d.c.x - camera.position.x, d.c.z - camera.position.z) < DOOR_REACH) {
          d.shut = true
          shutDoors.add(key(d.gx, d.gy))
          // Cut them off: any hunter that can't see you must reroute — or stalk.
          for (const b of bots) {
            if (
              b.state === 'hunt' &&
              !hasLOS(b.sprite.position.x, b.sprite.position.z, camera.position.x, camera.position.z)
            )
              b.huntUntilStalk = Math.min(b.huntUntilStalk, 0.1)
          }
          return
        }
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true
      if (e.code === 'KeyE' && phaseRef.current === 'playing') shutNearestDoor()
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

    let ending = false
    const onLockChange = () => {
      if (document.pointerLockElement === renderer.domElement) {
        setPhase('playing')
        audio.resume()
      } else if (!ending && phaseRef.current === 'playing') {
        setPhase('paused')
        audio.suspend()
      }
    }
    document.addEventListener('pointerlockchange', onLockChange)
    startRef.current = () => {
      audio.resume()
      audio.startLoop('ambient')
      audio.startLoop('heartbeat') // loops silently; volume tracks danger
      renderer.domElement.requestPointerLock()
    }

    // ── AI state ──
    let dangerSmooth = 0

    const enterStalk = (b: Bot, spot: THREE.Vector3) => {
      b.sprite.position.set(spot.x, 1.55, spot.z)
      b.mat.opacity = 0 // materialize in
      b.state = 'stalk'
      b.stateT = 0
      b.vanishT = 0
      audio.play('stalk')
    }
    const enterReposition = (b: Bot) => {
      b.state = 'reposition'
      b.stateT = 0
      b.repositionT = rand(REPOSITION_TIME)
    }

    // ── Loop ──
    const clock = new THREE.Clock()
    let bob = 0
    let raf = 0
    const tmp = new THREE.Vector3()

    function frame() {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const playing = phaseRef.current === 'playing'
      let shakeAmt = 0

      if (playing) {
        // ── Player movement ──
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
        collide(camera.position, 0.5, camera.position.y)

        // Jump / gravity
        if (keys['Space'] && grounded) {
          vy = 6.4
          grounded = false
        }
        vy -= 20 * dt
        camera.position.y += vy * dt
        bob += moving && grounded ? dt * (speed === RUN ? 13 : 8) : 0
        const groundY = EYE + (moving && grounded ? Math.sin(bob) * 0.05 : 0)
        if (camera.position.y <= groundY) {
          camera.position.y = groundY
          vy = 0
          grounded = true
        }

        // ── Bots: each runs its own copy of the state machine ──
        let anyHunting = false
        let footstepBot: Bot | null = null
        let footstepDist = Infinity
        let maxDanger = 0
        let caught = false

        for (const b of bots) {
          const bp = b.sprite.position
          const toBotX = bp.x - camera.position.x
          const toBotZ = bp.z - camera.position.z
          const distP = Math.hypot(toBotX, toBotZ) || 0.001
          const losBot = hasLOS(bp.x, bp.z, camera.position.x, camera.position.z)
          const dotB = (fwd.x * toBotX + fwd.z * toBotZ) / distP
          const seen = losBot && dotB > 0.62 // player is looking at it

          b.stateT += dt

          if (b.state === 'hunt') {
            anyHunting = true
            if (distP < footstepDist) {
              footstepDist = distP
              footstepBot = b
            }
            // BFS/LOS chase
            const pgx = Math.floor(camera.position.x / CELL)
            const pgy = Math.floor(camera.position.z / CELL)
            const bgx = Math.floor(bp.x / CELL)
            const bgy = Math.floor(bp.z / CELL)
            b.bfsTimer -= dt
            if (losBot) {
              b.waypoint.set(camera.position.x, 0, camera.position.z)
            } else if (b.bfsTimer <= 0) {
              b.bfsTimer = 0.15
              const step = bfsStep(bgx, bgy, pgx, pgy)
              if (step) {
                const c = cellCenter(step[0], step[1])
                b.waypoint.set(c.x, 0, c.z)
              }
            }
            const desired = Math.atan2(b.waypoint.x - bp.x, b.waypoint.z - bp.z)
            let diff = desired - b.heading
            while (diff > Math.PI) diff -= 2 * Math.PI
            while (diff < -Math.PI) diff += 2 * Math.PI
            const lunging = losBot && distP < 3.8
            if (lunging) {
              if (b.lungeArmed) {
                audio.play('lunge')
                b.lungeArmed = false
              }
            } else b.lungeArmed = true
            const turnRate = losBot ? BOT_TURN * 1.7 : BOT_TURN
            if (lunging) b.heading = desired
            else b.heading += Math.max(-turnRate * dt, Math.min(turnRate * dt, diff))
            const floorSpd = losBot ? 0.78 : 0.4
            const align = lunging ? 1 : 1 - Math.min(Math.abs(diff) / (Math.PI / 2), 1) * (1 - floorSpd)
            const bs = BOT_SPEED * align * dt
            tmp.set(bp.x + Math.sin(b.heading) * bs, 0, bp.z + Math.cos(b.heading) * bs)
            collide(tmp, 0.6)
            bp.x = tmp.x
            bp.z = tmp.z
            bp.y = 1.5 + Math.sin(t * 3 + b.heading) * 0.12

            // Occasionally break off to stalk (not while pouncing on you).
            b.huntUntilStalk -= dt
            if (b.huntUntilStalk <= 0 && distP > 7 && !(losBot && distP < 6)) {
              const spot = findStalkSpot(camera.position.x, camera.position.z, fwd.x, fwd.z)
              if (spot) enterStalk(b, spot)
              else b.huntUntilStalk = 1.5
            }

            // Catch (only a solid, hunting bot bites)
            if (distP < CATCH_DIST && b.mat.opacity > 0.6) caught = true
          } else if (b.state === 'stalk') {
            // Motionless stare; vanishes when you look away or come too close.
            bp.y = 1.55 + Math.sin(t * 1.4) * 0.04
            if (!seen) b.vanishT += dt
            else b.vanishT = 0
            if (distP < 5 || b.vanishT > STALK_VANISH_LOOKAWAY || b.stateT > STALK_MAX_TIME) enterReposition(b)
          } else {
            // reposition — invisible, then re-materialize out of view and hunt
            b.repositionT -= dt
            if (b.repositionT <= 0) {
              const spot = findHuntSpot(camera.position.x, camera.position.z, fwd.x, fwd.z)
              if (spot) {
                b.sprite.position.set(spot[0].x, 1.5, spot[0].z)
                b.heading = Math.atan2(camera.position.x - spot[0].x, camera.position.z - spot[0].z)
              }
              b.state = 'hunt'
              b.stateT = 0
              b.huntUntilStalk = rand(HUNT_BEFORE_STALK)
              b.bfsTimer = 0
            }
          }

          // Opacity: fade in when present, fade out while repositioning.
          const targetOp = b.state === 'reposition' ? 0 : 1
          b.mat.opacity += (targetOp - b.mat.opacity) * Math.min(1, dt * 7)
          b.sprite.visible = b.mat.opacity > 0.02

          // Scariest bot drives camera shake + heartbeat.
          let d = 0
          if (b.state === 'hunt') d = Math.max(0, 1 - distP / SHAKE_RANGE)
          else if (b.state === 'stalk') d = 0.3 + 0.25 * Math.max(0, 1 - distP / STALK_MAX_DIST)
          if (d > maxDanger) maxDanger = d
        }

        // Positional footsteps ride the nearest hunter; silent when none hunt.
        if (anyHunting && footstepBot) {
          audioAnchor.position.copy(footstepBot.sprite.position)
          audio.startLoop('footsteps')
        } else {
          audio.stopLoop('footsteps')
        }

        if (caught) {
          ending = true
          audio.stopLoop('footsteps')
          audio.stopLoop('heartbeat')
          audio.stopLoop('ambient')
          audio.play('catch')
          document.exitPointerLock()
          setPhase('caught')
        }

        // ── Doors: animate + discovery prompt ──
        let nearDoor = false
        for (const d of doors) {
          const ty = d.shut ? d.shutY : d.openY
          d.panel.position.y += (ty - d.panel.position.y) * Math.min(1, dt * 8)
          if (!d.shut && Math.hypot(d.c.x - camera.position.x, d.c.z - camera.position.z) < DOOR_REACH)
            nearDoor = true
        }
        if (promptRef.current) promptRef.current.style.display = nearDoor ? 'block' : 'none'

        // ── Hall passes ──
        for (let i = passMeshes.length - 1; i >= 0; i--) {
          const m = passMeshes[i]
          m.rotation.y += dt * 2
          if (Math.hypot(m.position.x - camera.position.x, m.position.z - camera.position.z) < 0.9) {
            scene.remove(m)
            passMeshes.splice(i, 1)
            setPasses(HALL_PASSES - passMeshes.length)
            if (passMeshes.length === 0) {
              ending = true
              audio.stopAll()
              document.exitPointerLock()
              setPhase('won')
            }
          }
        }

        // ── Danger → camera shake + grain/red-vignette ──
        dangerSmooth += (Math.min(1, maxDanger) - dangerSmooth) * Math.min(1, dt * 6)
        shakeAmt = dangerSmooth * dangerSmooth

        const ms = t * 1000
        const nX = (Math.sin(ms * 0.013) + Math.sin(ms * 0.007)) * 0.5
        const nY = (Math.sin(ms * 0.011 + 1.7) + Math.sin(ms * 0.006 + 0.5)) * 0.5
        const nZ = Math.sin(ms * 0.017 + 3.1)
        camera.rotation.y = yaw + nX * 0.02 * shakeAmt
        camera.rotation.x = pitch + nY * 0.02 * shakeAmt
        camera.rotation.z = nZ * 0.035 * shakeAmt

        // Heartbeat swells as he closes in.
        audio.setVolume('heartbeat', Math.min(0.95, shakeAmt * 1.1))
      }

      // Subtle flashlight flicker (cheap mood; runs even in menus).
      const flick = 0.9 + 0.08 * Math.sin(t * 26) + 0.04 * Math.sin(t * 11.3)
      flashlight.intensity = FLASH_BASE * flick

      if (grainRef.current) grainRef.current.style.opacity = (0.07 + shakeAmt * 0.3).toFixed(3)
      if (dangerRef.current) dangerRef.current.style.opacity = (shakeAmt * 0.55).toFixed(3)

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
      audio.dispose()
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

      {/* Film grain (opacity driven from the loop) + red danger wash + vignette */}
      <div ref={grainRef} className="pointer-events-none absolute inset-0 grain-overlay mix-blend-screen" style={{ opacity: 0.07 }} />
      <div
        ref={dangerRef}
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, boxShadow: 'inset 0 0 260px 90px rgba(120,0,0,0.75)' }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 220px 60px rgba(0,0,0,0.9)' }} />

      {/* HUD */}
      {phase === 'playing' && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40">+</div>
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-black/40 px-3 py-1.5 text-sm text-cyan-200">
            Hall passes {passes}/{HALL_PASSES}
          </div>
          <div
            ref={promptRef}
            className="pointer-events-none absolute left-1/2 bottom-24 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-sm font-semibold text-cyan-200"
            style={{ display: 'none' }}
          >
            Press <span className="text-cyan-100">E</span> to seal the door
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
                  You’re Mr. G’s chai latte, lost in the dark. <span className="text-rose-300">Two</span> of his faces hunt
                  you — fast in the open, slow to turn. Round corners to lose them, and watch for the times one just… stops
                  and stares. Spot a rare hole punched in a wall? Take a running jump through it — they’re too big to
                  follow. Grab all {HALL_PASSES} hall passes to escape.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  WASD move · Shift run · Space jump · Mouse look · <span className="text-cyan-300">E</span> seal a
                  powered door (rare) · Esc pause
                </p>
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
