import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────
//  Audio framework for the nextbot game. Sounds are driven by the AI: footsteps
//  when it hunts, a heartbeat that swells as it closes in, a stinger when it
//  materializes to stalk, a lunge growl, and the catch scream.
//
//  DROP-IN POINT: put audio files in `public/sfx/` (see public/sfx/README.md).
//  They're loaded by URL at runtime, so MISSING FILES ARE HARMLESS — the game
//  just stays silent for that cue. No rebuild needed to add them.
//
//  Uses the Web Audio graph via THREE's AudioListener (cheap; one panner for the
//  positional footsteps). The context starts suspended and is resumed on the
//  first user gesture (clicking “Enter the dark”), per browser autoplay rules.
// ─────────────────────────────────────────────────────────────────────────

export type SoundName = 'ambient' | 'heartbeat' | 'footsteps' | 'stomp' | 'stalk' | 'lunge' | 'catch' | 'voiceline'

interface SoundDef {
  url: string
  loop?: boolean
  volume?: number
  positional?: boolean
  refDistance?: number
}

const MANIFEST: Record<SoundName, SoundDef> = {
  // Low bed of dread, always looping while you play.
  ambient: { url: '/sfx/ambient.mp3', loop: true, volume: 0.35 },
  // Loops at volume 0; the game ramps it with proximity/danger.
  heartbeat: { url: '/sfx/heartbeat.mp3', loop: true, volume: 0 },
  // Spatialized footsteps emitted from the bot while it hunts.
  footsteps: { url: '/sfx/footsteps.mp3', loop: true, volume: 0.7, positional: true, refDistance: 4 },
  // Heavy floor-shaking stomp, played on a tightening cadence as the chaser
  // nears. Ships with a synthesized placeholder (.wav); swap for a real .mp3.
  stomp: { url: '/sfx/stomp.wav', volume: 0.95 },
  // One-shot stinger when it appears to stalk.
  stalk: { url: '/sfx/stalk.mp3', volume: 0.8 },
  // One-shot growl when it locks on and lunges point-blank.
  lunge: { url: '/sfx/lunge.mp3', volume: 0.9 },
  // The jumpscare on capture.
  catch: { url: '/sfx/catch.mp3', volume: 1 },
  // Mr. G's voice line on the capture jumpscare. Ships with a spoken
  // placeholder (.wav, SAPI TTS); swap for a real recording.
  voiceline: { url: '/sfx/voiceline.wav', volume: 1 },
}

export class GameAudio {
  readonly listener: THREE.AudioListener
  private sounds = new Map<SoundName, THREE.Audio | THREE.PositionalAudio>()
  private ready = new Set<SoundName>()
  private muted = false

  constructor(camera: THREE.Camera, botAnchor: THREE.Object3D) {
    this.listener = new THREE.AudioListener()
    camera.add(this.listener)
    const loader = new THREE.AudioLoader()

    ;(Object.keys(MANIFEST) as SoundName[]).forEach((name) => {
      const def = MANIFEST[name]
      const snd = def.positional ? new THREE.PositionalAudio(this.listener) : new THREE.Audio(this.listener)
      if (def.positional) {
        const p = snd as THREE.PositionalAudio
        p.setRefDistance(def.refDistance ?? 5)
        p.setRolloffFactor(1.7)
        botAnchor.add(p) // rides with the bot, so it pans/attenuates in 3D
      }
      this.sounds.set(name, snd)
      loader.load(
        def.url,
        (buffer) => {
          snd.setBuffer(buffer)
          snd.setLoop(!!def.loop)
          snd.setVolume(def.volume ?? 1)
          this.ready.add(name)
        },
        undefined,
        () => {
          /* file not present yet — stay silent, don't throw */
        },
      )
    })
  }

  /** Resume the AudioContext (call from a user gesture). */
  resume() {
    const ctx = this.listener.context
    if (ctx.state === 'suspended') void ctx.resume()
  }

  /** Suspend while paused so loops don't play under the menu. */
  suspend() {
    const ctx = this.listener.context
    if (ctx.state === 'running') void ctx.suspend()
  }

  /** Fire a one-shot (restarts if already playing). */
  play(name: SoundName) {
    const s = this.sounds.get(name)
    if (!s || !this.ready.has(name) || this.muted) return
    if (s.isPlaying) s.stop()
    s.play()
  }

  /** Start a loop if it isn't already going. */
  startLoop(name: SoundName) {
    const s = this.sounds.get(name)
    if (!s || !this.ready.has(name) || this.muted || s.isPlaying) return
    s.play()
  }

  stopLoop(name: SoundName) {
    const s = this.sounds.get(name)
    if (s && s.isPlaying) s.stop()
  }

  setVolume(name: SoundName, v: number) {
    const s = this.sounds.get(name)
    if (s) s.setVolume(Math.max(0, v))
  }

  stopAll() {
    this.sounds.forEach((s) => {
      if (s.isPlaying) s.stop()
    })
  }

  dispose() {
    this.stopAll()
    this.sounds.forEach((s) => {
      const src = s as unknown as { disconnect?: () => void }
      src.disconnect?.()
    })
    this.listener.parent?.remove(this.listener)
  }
}
