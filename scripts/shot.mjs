// Dev-only visual QA helper. Drives the already-installed Chrome via
// puppeteer-core (no bundled browser download) to screenshot the running app.
//
// Usage:
//   node scripts/shot.mjs <url> <out.png> [waitMs] [clickSelector]
//
// WebGL runs on SwiftShader in headless, which is enough to verify the scene
// renders and is laid out correctly.
import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'shot.png'
const waitMs = Number(process.argv[4] ?? 3500)
const clickSel = process.argv[5]
// Optional "WIDTHxHEIGHT" viewport, e.g. "390x844" for a phone.
const [vpW, vpH] = (process.argv[6] ?? '1600x1000').split('x').map(Number)

const exe = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!exe) {
  console.error('No Chrome/Edge found')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: 'new',
  args: [
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1600,1000',
  ],
})

const page = await browser.newPage()
await page.setViewport({ width: vpW, height: vpH, deviceScaleFactor: 1, isMobile: vpW < 700, hasTouch: vpW < 700 })

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console.error: ' + m.text())
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise((r) => setTimeout(r, waitMs))

if (clickSel) {
  // Support a sequence of clicks separated by ';' (e.g. "@620,430;@1386,850").
  for (const step of clickSel.split(';')) {
    try {
      if (step.startsWith('@')) {
        const [x, y] = step.slice(1).split(',').map(Number)
        await page.mouse.click(x, y)
      } else {
        await page.click(step)
      }
      await new Promise((r) => setTimeout(r, 1400))
    } catch (e) {
      errors.push('click failed (' + step + '): ' + e.message)
    }
  }
}

await page.screenshot({ path: out })
await browser.close()

if (errors.length) {
  console.log('PAGE ERRORS:\n' + errors.join('\n'))
} else {
  console.log('OK (no console/page errors)')
}
console.log('Saved ' + out)
