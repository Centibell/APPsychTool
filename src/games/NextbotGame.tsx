import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { makeFaceTexture, makeFaceDataURL } from './face'
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
//  Two bots share a coordinated state machine — exactly ONE actively chases at
//  a time (fair, since you don't know the layout), the rest stalk, and they
//  trade off the "hunter" role on a timer:
//    • hunt  — BFS-pathfinds to you; locks on and lunges with line-of-sight.
//    • stalk — pathfinds between spots to slink in and out of view: peek around
//              a corner and hold your gaze, lurk in cover, or rush in close then
//              dart back out (classic peek/《SCP-173》/nextbot dread behavior).
//
//  Very rarely the map seeds a powered door: seal it (E) mid-chase to cut the
//  hunter off, forcing its turn to hand off early — a long reroute or a stalk.
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
const MIN_BOTS = 1
const MAX_BOTS = 5
const DEFAULT_BOTS = 2
const CATCH_DIST = 1.5
const HALL_PASSES = 5

// AI tuning. Only ONE bot actively chases at a time (fair, since you don't know
// the layout); the rest STALK — and stalking is deliberately glimpse-and-flee,
// per documented nextbot/analog-horror behavior: dart across a distant hallway,
// ease a quick peek around a corner then bolt, never linger and stare. The
// "hunter" role reassigns to whichever bot is best placed to chase.
const STALK_MAX_DIST = 20
const HUNT_TURN: [number, number] = [8, 14] // seconds one bot chases before a scheduled handoff
const HANDOFF_MARGIN = 6 // if a lurker is this many grid-cells closer than the hunter, it takes over
const STALK_SPEED = 5.2 // slow creep (lurking in cover)
const STALK_PEEK_SPEED = 7.4 // easing out for a peek
const STALK_RUN_SPEED = 10.5 // a run-by / bolt-back-to-cover dash
const STALK_KEEPAWAY = 6 // a stalker never loiters closer than this — it retreats instead
const STALK_RETARGET: [number, number] = [1.6, 3.0] // how long it commits to one stalk move
const PEEK_HOLD: [number, number] = [0.15, 0.5] // brief moment it lets you see it before bolting
const SHAKE_RANGE = 9 // bot within this many units starts to rattle the camera
const STOMP_RANGE = 11 // chaser within this many units → you hear heavy stomps
const STOMP_SLOW = 0.58 // seconds between stomps at the edge of range…
const STOMP_FAST = 0.26 // …tightening to this when he's right on top of you
const STOMP_SHAKE = 0.09 // radians of jolt kicked into the camera on each footfall

// Flickering ceiling lights for ambiance. Cheap: mostly unlit glowing quads
// (fog-fade in the distance); only a couple also cast a real dim point light.
const FIXTURE_STRIDE = 3 // place a fixture roughly every Nth grid cell
const FIXTURE_MAX = 14 // hard cap on glowing fixtures
const FIXTURE_LIGHTS = 2 // of those, how many also cast a real (flickering) light

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
type BotState = 'hunt' | 'stalk'
// crossby — sprint across a distant sightline (a fleeting "did I see that?")
// peek    — ease out just far enough to be seen, then bolt
// lurk    — creep to cover, out of view
// retreat — dash back to cover after being seen
type StalkKind = 'crossby' | 'peek' | 'lurk' | 'retreat'

interface Door {
  gx: number
  gy: number
  c: THREE.Vector3
  panel: THREE.Mesh
  openY: number
  shutY: number
  shut: boolean
}

// Per-bot state. One is the active hunter; the others stalk with their own
// little peek/lurk/rush sub-behaviour.
interface Bot {
  sprite: THREE.Sprite
  mat: THREE.SpriteMaterial
  state: BotState
  heading: number
  waypoint: THREE.Vector3
  bfsTimer: number
  lungeArmed: boolean
  stalkKind: StalkKind
  stalkTarget: [number, number] | null
  stalkT: number // time left committed to the current stalk move
  peekHold: number // time left visible before darting back to cover
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
  const [botCount, setBotCount] = useState(DEFAULT_BOTS)
  const [scareDone, setScareDone] = useState(false)
  const phaseRef = useRef<Phase>('menu')
  const startRef = useRef<() => void>(() => {})
  phaseRef.current = phase
  // Face used for the full-screen capture jumpscare (placeholder until the real
  // photo lands — see makeFaceDataURL). Built once.
  const faceURL = useMemo(() => makeFaceDataURL(), [])

  // On capture, hold the jumpscare for a beat before revealing the retry menu.
  useEffect(() => {
    if (phase !== 'caught') {
      setScareDone(false)
      return
    }
    setScareDone(false)
    const id = setTimeout(() => setScareDone(true), 1200)
    return () => clearTimeout(id)
  }, [phase])

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
    // Spread the hunters out (farthest-point sampling): seed with the cell
    // farthest from the player, then each new spawn maximizes its distance to the
    // player AND every spawn already placed, so they come from different sides.
    const nBots = Math.max(MIN_BOTS, Math.min(MAX_BOTS, botCount))
    const spawnCells: [number, number][] = [botCell]
    while (spawnCells.length < nBots) {
      const avoid = [startCell, ...spawnCells]
      let best = openCells[0]
      let bestScore = -1
      for (const c of openCells) {
        let score = Infinity
        for (const a of avoid) score = Math.min(score, Math.abs(c[0] - a[0]) + Math.abs(c[1] - a[1]))
        if (score > bestScore) {
          bestScore = score
          best = c
        }
      }
      spawnCells.push(best)
    }

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

    // ── Flickering ceiling lights (ambiance) ──
    // Mostly cheap: unlit additive glow quads that fog-fade into the dark; only
    // FIXTURE_LIGHTS of them also cast a real (flickering) point light.
    interface Fixture {
      mat: THREE.MeshBasicMaterial
      light: THREE.PointLight | null
      seed: number
      base: number // baseline brightness (some tubes are dim/dying)
      strobe: boolean // heavy stutter vs. a steadier hum
    }
    const fixtures: Fixture[] = []
    const fixGeo = new THREE.PlaneGeometry(CELL * 0.55, CELL * 0.55)
    {
      const cands = openCells.filter(([x, y]) => x % FIXTURE_STRIDE === 1 && y % FIXTURE_STRIDE === 1)
      for (let i = cands.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cands[i], cands[j]] = [cands[j], cands[i]]
      }
      cands.slice(0, FIXTURE_MAX).forEach(([gx, gy], i) => {
        const c = cellCenter(gx, gy)
        const mat = new THREE.MeshBasicMaterial({
          color: '#dfe8ff',
          transparent: true,
          opacity: 0.8,
          fog: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
        const m = new THREE.Mesh(fixGeo, mat)
        m.rotation.x = Math.PI / 2 // face down
        m.position.set(c.x, WALL_H - 0.06, c.z)
        scene.add(m)
        let light: THREE.PointLight | null = null
        if (i < FIXTURE_LIGHTS) {
          light = new THREE.PointLight('#cfe0ff', 2.2, 9, 1.4)
          light.position.set(c.x, WALL_H - 0.4, c.z)
          scene.add(light)
        }
        fixtures.push({
          mat,
          light,
          seed: Math.random() * 100,
          base: 0.5 + Math.random() * 0.5,
          strobe: Math.random() < 0.45,
        })
      })
    }
    const fixtureFlicker = (fx: Fixture, tt: number) => {
      let v = 0.82 + 0.18 * Math.sin(tt * (2 + (fx.seed % 3)) + fx.seed)
      if (fx.strobe) {
        const st = Math.sin(tt * 47 + fx.seed * 13) + Math.sin(tt * 23 + fx.seed * 7)
        if (st > 1.4) v *= 0.12 // brief blackout of a failing tube
        else if (st < -1.6) v *= 0.45
      }
      return Math.max(0, Math.min(1, v)) * fx.base
    }

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
        state: (i === 0 ? 'hunt' : 'stalk') as BotState, // exactly one chases at a time
        heading: 0,
        waypoint: new THREE.Vector3(p.x, 0, p.z),
        bfsTimer: 0,
        lungeArmed: true,
        stalkKind: 'lurk' as StalkKind,
        stalkTarget: null,
        stalkT: 0,
        peekHold: 0,
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

    // BFS distance FIELD from a cell to everywhere (grid steps, walls+windows
    // solid). Used to reassign the hunter to whichever bot is genuinely closest
    // *through the halls* — so vaulting a window (which a bot can't follow) makes
    // a nearer lurker take over instead of the now-far chaser.
    const distField = new Int16Array(COLS * ROWS)
    function computeDistField(sx: number, sy: number) {
      distField.fill(-1)
      if (sx < 0 || sy < 0 || sx >= COLS || sy >= ROWS || isSolid(sx, sy)) return
      distField[sy * COLS + sx] = 0
      const q: number[] = [sy * COLS + sx]
      const nb = [1, -1, COLS, -COLS]
      let head = 0
      while (head < q.length) {
        const curc = q[head++]
        const cx = curc % COLS
        const cy = (curc / COLS) | 0
        for (const d of nb) {
          const nx = d === 1 ? cx + 1 : d === -1 ? cx - 1 : cx
          const ny = d === COLS ? cy + 1 : d === -COLS ? cy - 1 : cy
          if (isSolid(nx, ny)) continue
          const ni = ny * COLS + nx
          if (distField[ni] !== -1) continue
          distField[ni] = distField[curc] + 1
          q.push(ni)
        }
      }
    }
    const botCellDist = (b: Bot) => {
      const gx = Math.floor(b.sprite.position.x / CELL)
      const gy = Math.floor(b.sprite.position.z / CELL)
      if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) return 9999
      const v = distField[gy * COLS + gx]
      return v < 0 ? 9999 : v
    }

    // Pick a random-ish cell near the player matching a visibility want:
    //   'seen'   — in the player's view cone WITH line of sight (to peek/appear)
    //   'hidden' — out of view (to lurk / dart back to cover)
    //   'any'    — anything in the distance band (fallback)
    // Returns a grid cell the bot then paths to, so it moves through the halls
    // and slips in and out of sight naturally instead of teleporting.
    function findCell(
      px: number,
      pz: number,
      fx: number,
      fz: number,
      want: 'seen' | 'hidden' | 'any',
      minD: number,
      maxD: number,
      minDot = 0.2,
    ): [number, number] | null {
      let best: [number, number] | null = null
      let bestScore = -1
      for (const [gx, gy] of openCells) {
        const c = cellCenter(gx, gy)
        const dx = c.x - px
        const dz = c.z - pz
        const d = Math.hypot(dx, dz)
        if (d < minD || d > maxD) continue
        const dot = d > 0 ? (fx * dx + fz * dz) / d : 1
        const los = hasLOS(c.x, c.z, px, pz)
        if (want === 'seen' && !(los && dot > minDot)) continue
        if (want === 'hidden' && los && dot > 0.26) continue // visible → not hidden
        const score = (want === 'seen' ? dot : maxD - d) + Math.random() * 3
        if (score > bestScore) {
          bestScore = score
          best = [gx, gy]
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

    // Which bot is currently "it", and time until the role hands off.
    let hunterTurnT = rand(HUNT_TURN)

    const shutNearestDoor = () => {
      for (const d of doors) {
        if (d.shut) continue
        if (Math.hypot(d.c.x - camera.position.x, d.c.z - camera.position.z) < DOOR_REACH) {
          d.shut = true
          shutDoors.add(key(d.gx, d.gy))
          // If the active hunter can't see you now, cut its turn short — it hands
          // off to a lurker (which may be better placed), forcing the reroute.
          const hunter = bots.find((b) => b.state === 'hunt')
          if (
            hunter &&
            !hasLOS(hunter.sprite.position.x, hunter.sprite.position.z, camera.position.x, camera.position.z)
          )
            hunterTurnT = Math.min(hunterTurnT, 0.2)
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

    const makeHunter = (b: Bot) => {
      b.state = 'hunt'
      b.bfsTimer = 0
      b.lungeArmed = true
    }
    const enterStalk = (b: Bot) => {
      b.state = 'stalk'
      b.stalkTarget = null // pick a fresh move next frame
      b.stalkT = 0
      b.bfsTimer = 0
    }
    // A "run-by" target: a far cell on the OPPOSITE lateral side from where the
    // bot is now, biased toward the front — so pathing there sends it sprinting
    // across a distant sightline in front of you (a fleeting silhouette).
    const findCrossCell = (b: Bot, px: number, pz: number, fx: number, fz: number): [number, number] | null => {
      const rx = -fz // right vector (perpendicular to forward)
      const rz = fx
      const botLat = (b.sprite.position.x - px) * rx + (b.sprite.position.z - pz) * rz
      let best: [number, number] | null = null
      let bestScore = -1
      for (const [gx, gy] of openCells) {
        const c = cellCenter(gx, gy)
        const dx = c.x - px
        const dz = c.z - pz
        const d = Math.hypot(dx, dz)
        if (d < 9 || d > STALK_MAX_DIST) continue
        const lat = dx * rx + dz * rz
        if (botLat !== 0 && Math.sign(lat) === Math.sign(botLat)) continue // same side → no crossing
        const fwdAmt = (dx * fx + dz * fz) / d
        if (fwdAmt < -0.15) continue // keep the crossing roughly ahead of you
        const score = Math.abs(lat) + Math.max(0, fwdAmt) * 4 + Math.random() * 3
        if (score > bestScore) {
          bestScore = score
          best = [gx, gy]
        }
      }
      return best
    }
    // Choose the stalker's next move. Heavily biased to glimpse-and-flee:
    // run across the distance, or a quick corner peek — rarely just lurk.
    const chooseStalkMove = (b: Bot, px: number, pz: number, fx: number, fz: number) => {
      const roll = Math.random()
      let kind: StalkKind
      let target: [number, number] | null
      if (roll < 0.5) {
        kind = 'crossby' // sprint across a distant hallway
        target = findCrossCell(b, px, pz, fx, fz) ?? findCell(px, pz, fx, fz, 'seen', 9, STALK_MAX_DIST, 0.1)
      } else if (roll < 0.82) {
        kind = 'peek' // ease out around a corner just far enough to be seen
        target = findCell(px, pz, fx, fz, 'seen', 6, 13, 0.5)
      } else {
        kind = 'lurk' // brief reposition in cover
        target = findCell(px, pz, fx, fz, 'hidden', 6, 14)
      }
      if (!target) target = findCell(px, pz, fx, fz, 'any', 6, 16)
      b.stalkKind = kind
      b.stalkTarget = target
      b.stalkT = rand(STALK_RETARGET)
      b.peekHold = rand(PEEK_HOLD)
      if (kind !== 'lurk') audio.play('stalk') // a little scrape as it moves into view
    }
    // Bolt back to cover (the "…then it's gone" beat) at a run.
    const startRetreat = (b: Bot, px: number, pz: number, fx: number, fz: number) => {
      b.stalkKind = 'retreat'
      b.stalkTarget = findCell(px, pz, fx, fz, 'hidden', 7, 16) ?? findCell(px, pz, fx, fz, 'any', 6, 18)
      b.stalkT = rand(STALK_RETARGET)
      b.peekHold = rand(PEEK_HOLD)
    }
    const stalkSpeed = (k: StalkKind) =>
      k === 'crossby' || k === 'retreat' ? STALK_RUN_SPEED : k === 'peek' ? STALK_PEEK_SPEED : STALK_SPEED
    // Move a bot one step toward a grid cell via BFS; returns true once close.
    const stepToward = (b: Bot, target: [number, number], spd: number, dt: number, t: number) => {
      const bp = b.sprite.position
      const bgx = Math.floor(bp.x / CELL)
      const bgy = Math.floor(bp.z / CELL)
      b.bfsTimer -= dt
      if (b.bfsTimer <= 0) {
        b.bfsTimer = 0.15
        const step = bfsStep(bgx, bgy, target[0], target[1])
        const c = step ? cellCenter(step[0], step[1]) : cellCenter(target[0], target[1])
        b.waypoint.set(c.x, 0, c.z)
      }
      const desired = Math.atan2(b.waypoint.x - bp.x, b.waypoint.z - bp.z)
      let diff = desired - b.heading
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI
      const turn = BOT_TURN * 1.6 // stalkers are nimble at low speed
      b.heading += Math.max(-turn * dt, Math.min(turn * dt, diff))
      const align = 1 - Math.min(Math.abs(diff) / (Math.PI / 2), 1) * 0.5
      const bs = spd * align * dt
      tmp.set(bp.x + Math.sin(b.heading) * bs, 0, bp.z + Math.cos(b.heading) * bs)
      collide(tmp, 0.6)
      bp.x = tmp.x
      bp.z = tmp.z
      bp.y = 1.5 + Math.sin(t * 3 + b.heading) * 0.1
      const tc = cellCenter(target[0], target[1])
      return Math.hypot(bp.x - tc.x, bp.z - tc.z) < 1.3
    }

    // ── Loop ──
    const clock = new THREE.Clock()
    let bob = 0
    let raf = 0
    let stompTimer = 0
    let stompShake = 0 // discrete jolt that spikes on each footfall and decays
    let distFieldTimer = 0 // throttle the BFS field used for hunter reassignment
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

        // ── Bots: exactly ONE hunts at a time; the rest stalk. ──
        const px = camera.position.x
        const pz = camera.position.z

        // Refresh the path-distance field from the player (throttled) so hunter
        // reassignment reflects real reachability through the halls.
        distFieldTimer -= dt
        if (distFieldTimer <= 0) {
          distFieldTimer = 0.3
          computeDistField(Math.floor(px / CELL), Math.floor(pz / CELL))
        }

        hunterTurnT -= dt
        let hunter = bots.find((b) => b.state === 'hunt') ?? null
        // The best-placed lurker (closest to you through the halls) is the natural
        // next hunter — this is what makes a window vault flip the chase to the bot
        // on your side instead of the one now stuck far away.
        let closest: Bot | null = null
        let closestD = Infinity
        for (const b of bots) {
          if (b === hunter) continue
          const dd = botCellDist(b)
          if (dd < closestD) {
            closestD = dd
            closest = b
          }
        }
        const hunterD = hunter ? botCellDist(hunter) : Infinity
        const wantHandoff =
          !hunter || hunterTurnT <= 0 || (closest !== null && closestD + HANDOFF_MARGIN < hunterD)
        if (bots.length > 1 && wantHandoff && closest) {
          if (hunter) enterStalk(hunter)
          makeHunter(closest)
          hunter = closest
          hunterTurnT = rand(HUNT_TURN)
        } else if (!hunter) {
          makeHunter(bots[0])
          hunter = bots[0]
        }

        let footstepBot: Bot | null = null
        let hunterDist = Infinity
        let maxDanger = 0
        let caught = false

        for (const b of bots) {
          const bp = b.sprite.position
          const toBotX = bp.x - px
          const toBotZ = bp.z - pz
          const distP = Math.hypot(toBotX, toBotZ) || 0.001
          const losBot = hasLOS(bp.x, bp.z, px, pz)
          const dotB = (fwd.x * toBotX + fwd.z * toBotZ) / distP
          const seen = losBot && dotB > 0.45 // player currently has it in view

          if (b.state === 'hunt') {
            footstepBot = b
            hunterDist = distP
            // BFS/LOS chase
            const pgx = Math.floor(px / CELL)
            const pgy = Math.floor(pz / CELL)
            const bgx = Math.floor(bp.x / CELL)
            const bgy = Math.floor(bp.z / CELL)
            b.bfsTimer -= dt
            if (losBot) {
              b.waypoint.set(px, 0, pz)
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

            // Catch (only the active hunter bites)
            if (distP < CATCH_DIST) caught = true
          } else {
            // ── Stalk: glimpse-and-flee, PATHING between spots — sprint across a
            //    far hallway, quick corner peek, then bolt back to cover. ──
            if (!b.stalkTarget || b.stalkT <= 0) chooseStalkMove(b, px, pz, fwd.x, fwd.z)
            b.stalkT -= dt
            // Never loiter close and stare: if it drifts too near you (and isn't
            // already fleeing), it bolts.
            if (distP < STALK_KEEPAWAY && b.stalkKind !== 'retreat') {
              startRetreat(b, px, pz, fwd.x, fwd.z)
            } else if ((b.stalkKind === 'peek' || b.stalkKind === 'crossby') && seen) {
              // The instant you clock it, it holds only a beat, then bolts.
              b.peekHold -= dt
              if (b.peekHold <= 0) startRetreat(b, px, pz, fwd.x, fwd.z)
            }
            if (b.stalkTarget) {
              if (stepToward(b, b.stalkTarget, stalkSpeed(b.stalkKind), dt, t)) {
                if (b.stalkKind === 'lurk' || b.stalkKind === 'retreat')
                  b.stalkT = Math.min(b.stalkT, rand([0.2, 0.7] as [number, number])) // brief pause, then a new move
                else startRetreat(b, px, pz, fwd.x, fwd.z) // reached a peek/cross point → gone
              }
            }
          }

          // Bots stay solid; you glimpse the stalkers as they slip through halls.
          b.mat.opacity += (1 - b.mat.opacity) * Math.min(1, dt * 8)
          b.sprite.visible = true

          // Scariest bot drives camera shake + heartbeat.
          let d = 0
          if (b.state === 'hunt') d = Math.max(0, 1 - distP / SHAKE_RANGE)
          else if (seen) d = 0.28 + 0.22 * Math.max(0, 1 - distP / STALK_MAX_DIST) // a peek is a jolt
          if (d > maxDanger) maxDanger = d
        }

        // Positional footsteps ride the active hunter.
        if (footstepBot) {
          audioAnchor.position.copy(footstepBot.sprite.position)
          audio.startLoop('footsteps')
        } else {
          audio.stopLoop('footsteps')
        }

        // Heavy stomps once the chaser is nearby; cadence tightens as he closes,
        // and each footfall kicks a big synced jolt into the camera.
        if (hunterDist < STOMP_RANGE) {
          stompTimer -= dt
          if (stompTimer <= 0) {
            audio.play('stomp')
            const closeness = 1 - hunterDist / STOMP_RANGE // 0 at edge → 1 point-blank
            stompTimer = STOMP_SLOW - (STOMP_SLOW - STOMP_FAST) * closeness
            stompShake = Math.max(stompShake, 0.45 + 0.55 * closeness) // spike the jolt
          }
        } else {
          stompTimer = 0 // ready to thud the instant he's close again
        }
        stompShake = Math.max(0, stompShake - dt * 7) // fast decay → a sharp kick

        if (caught) {
          ending = true
          audio.stopLoop('footsteps')
          audio.stopLoop('heartbeat')
          audio.stopLoop('ambient')
          audio.play('catch') // scream stinger
          audio.play('voiceline') // Mr. G's line over the jumpscare
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
        // Big discrete stomp jolt (jj) rides on top of the smooth proximity shake:
        // a sharp downward pitch dip + roll on every footfall.
        const jj = stompShake * stompShake
        camera.rotation.y = yaw + nX * 0.02 * shakeAmt + nZ * STOMP_SHAKE * 0.5 * jj
        camera.rotation.x = pitch + nY * 0.02 * shakeAmt - STOMP_SHAKE * jj
        camera.rotation.z = nZ * 0.035 * shakeAmt + Math.sign(nZ) * STOMP_SHAKE * 0.6 * jj

        // Heartbeat swells as he closes in.
        audio.setVolume('heartbeat', Math.min(0.95, shakeAmt * 1.1))
      }

      // Subtle flashlight flicker (cheap mood; runs even in menus).
      const flick = 0.9 + 0.08 * Math.sin(t * 26) + 0.04 * Math.sin(t * 11.3)
      flashlight.intensity = FLASH_BASE * flick

      // Flickering ceiling fixtures (ambiance; also runs on the menu).
      for (const fx of fixtures) {
        const v = fixtureFlicker(fx, t)
        fx.mat.opacity = 0.12 + 0.88 * v
        if (fx.light) fx.light.intensity = 0.35 + 2.4 * v
      }

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
      fixGeo.dispose()
      fixtures.forEach((f) => f.mat.dispose())
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // Rebuild the level when the hunter count changes (only ever tweaked from the
    // menu, so the rebuild is invisible to the player).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, botCount])

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

      {/* Capture jumpscare: Mr. G's face lunges to fill the screen */}
      {phase === 'caught' && !scareDone && (
        <div className="pointer-events-none absolute inset-0 z-[70] overflow-hidden bg-black">
          <div className="absolute inset-0" style={{ animation: 'nb-scare-shake 0.11s steps(2) infinite' }}>
            <img
              src={faceURL}
              alt=""
              className="h-full w-full object-cover"
              style={{ animation: 'nb-scare-in 0.32s ease-out both' }}
            />
          </div>
          <div
            className="absolute inset-0 mix-blend-overlay"
            style={{ background: 'radial-gradient(circle, rgba(150,0,0,0) 42%, rgba(130,0,0,0.65) 100%)' }}
          />
        </div>
      )}

      {/* Overlays */}
      {phase !== 'playing' && !(phase === 'caught' && !scareDone) && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center backdrop-blur-sm">
          <div className="max-w-sm">
            {phase === 'menu' && (
              <>
                <h1 className="text-2xl font-bold text-slate-50">Don’t Get Sipped ☕</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  You’re Mr. G’s chai latte, lost in the dark. His face is loose in the halls — but only{' '}
                  <span className="text-rose-300">one gives chase</span> at a time, fast in the open and slow to turn. Any
                  others lurk: peeking around corners, darting in and out of sight… and they trade off. Round corners to
                  shake the chaser, and don’t trust the quiet. Spot a rare hole punched in a wall? Take a running jump
                  through it — they’re too big to follow. Grab all {HALL_PASSES} hall passes to escape.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  WASD move · Shift run · Space jump · Mouse look · <span className="text-cyan-300">E</span> seal a
                  powered door (rare) · Esc pause
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="uppercase tracking-wide">Hunters</span>
                  {Array.from({ length: MAX_BOTS - MIN_BOTS + 1 }, (_, k) => MIN_BOTS + k).map((n) => (
                    <button
                      key={n}
                      onClick={() => setBotCount(n)}
                      className={`grid h-7 w-7 place-items-center rounded-md border text-sm font-semibold transition-colors ${
                        botCount === n
                          ? 'border-rose-400/60 bg-rose-500/25 text-rose-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
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
