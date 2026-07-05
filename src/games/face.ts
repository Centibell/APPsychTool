import * as THREE from 'three'

// The nextbot's face texture.
//
// SWAP-IN POINT: when the teacher's photo is added to this folder (e.g.
// `teacher.jpg`), replace the body of makeFaceTexture with:
//     import teacher from './teacher.jpg'
//     export const makeFaceTexture = () => new THREE.TextureLoader().load(teacher)
// The rest of the game reads only this function, so nothing else changes.
//
// Until then, this draws a deliberately-unsettling placeholder so the game is
// fully playable and verifiable.

// Draws the placeholder face onto a fresh canvas and returns it. Shared by the
// in-world sprite texture and the full-screen capture jumpscare.
export function makeFaceCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!

  // Pale face
  ctx.fillStyle = '#0a0b10'
  ctx.fillRect(0, 0, 256, 256)
  const g = ctx.createRadialGradient(128, 120, 20, 128, 128, 130)
  g.addColorStop(0, '#d8c9b0')
  g.addColorStop(1, '#5a4f42')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(128, 132, 82, 100, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (wide, staring)
  for (const ex of [96, 160]) {
    ctx.fillStyle = '#f4f1ea'
    ctx.beginPath()
    ctx.ellipse(ex, 118, 20, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(ex, 120, 7, 0, Math.PI * 2)
    ctx.fill()
  }
  // Angry brows
  ctx.strokeStyle = '#1a1410'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(74, 98)
  ctx.lineTo(112, 110)
  ctx.moveTo(182, 98)
  ctx.lineTo(144, 110)
  ctx.stroke()

  // Grim mouth
  ctx.beginPath()
  ctx.moveTo(98, 178)
  ctx.quadraticCurveTo(128, 168, 158, 178)
  ctx.lineWidth = 6
  ctx.stroke()

  ctx.fillStyle = '#8a8378'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MR. G', 128, 232)

  return c
}

export function makeFaceTexture(): THREE.Texture {
  const tex = new THREE.CanvasTexture(makeFaceCanvas())
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// PNG data URL of the placeholder face, for the DOM capture jumpscare overlay.
// SWAP-IN POINT: when the real photo lands, return its imported URL instead.
export function makeFaceDataURL(): string {
  return makeFaceCanvas().toDataURL('image/png')
}
