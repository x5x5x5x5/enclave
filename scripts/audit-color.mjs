/**
 * Colour audit. Implements the two objective tests from docs/CALM_PASS.md §1:
 *
 *   1. the two-hue rule — a viewport shows at most 2 non-neutral hues
 *   2. the grayscale test — colour must never be the only carrier of meaning,
 *      approximated here by how much of the screen is non-neutral at all
 *
 * It walks the rendered DOM rather than the pixels: every element's effective
 * colour, background, border and SVG fill/stroke is converted to HSL, weighted
 * by the area it covers, and clustered into 30-degree hue buckets. Anything
 * under a saturation floor counts as ink.
 *
 *   npm run dev
 *   node scripts/audit-color.mjs          # summary
 *   ENCLAVE_AUDIT_JSON=1 node scripts/audit-color.mjs > out.json
 */
import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE = process.env.ENCLAVE_URL ?? 'http://localhost:5180'
const CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const executablePath = process.env.ENCLAVE_BROWSER ?? CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error('No Edge or Chrome found.')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ROUTES = [
  '/welcome',
  '/chats',
  '/chats/th-mira',
  '/spaces',
  '/space/c-lostera',
  '/space/c-lostera/ch-raids',
  '/space/c-lostera/ch-general',
  '/space/c-lostera/ch-trade',
  '/space/c-reading/ch-foyer',
  '/voice/c-lostera/ch-lounge',
  '/you',
  '/vault',
  '/discover',
  '/settings/masks',
  '/settings/security',
  '/mod',
]

const VIEWPORTS = [
  { w: 1440, h: 900, label: 'desktop' },
  { w: 390, h: 844, label: 'phone' },
]

/** Hues we are allowed to see anywhere, by design. */
const SANCTIONED = ['/settings/masks']

const MEASURE = () => {
  /*
   * Absolute chroma (max - min channel), not HSL saturation. The ink ramp is
   * deliberately blue (#11151D), which HSL calls 26% saturated while the eye
   * calls it grey; its chroma is 0.05. cove is 0.58, ember 0.67. A 0.15 floor
   * separates ink from colour the way looking at the screen does.
   */
  const CHROMA_FLOOR = 0.15
  const AREA_FLOOR = 0.0015 // fraction of the viewport a hue must cover to count

  /*
   * Chrome serialises resolved custom properties as oklch() now that the
   * palette is defined that way, so parsing rgb() alone made the audit blind to
   * the exact colours it exists to measure. Both forms are handled.
   */
  const oklchToRgb = (L, C, Hdeg) => {
    const h = (Hdeg * Math.PI) / 180
    const a = C * Math.cos(h)
    const bb = C * Math.sin(h)
    const l_ = L + 0.3963377774 * a + 0.2158037573 * bb
    const m_ = L - 0.1055613458 * a - 0.0638541728 * bb
    const s_ = L - 0.0894841775 * a - 1.291485548 * bb
    const l = l_ ** 3
    const m = m_ ** 3
    const sc = s_ ** 3
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * sc,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * sc,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * sc,
    ]
    return lin.map((v) => {
      const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055
      return Math.max(0, Math.min(1, g))
    })
  }

  const parse = (value) => {
    if (!value) return null
    const ok = value.match(/oklch\(([^)]+)\)/)
    if (ok) {
      const raw = ok[1].split(/[\s/]+/).filter(Boolean)
      const num = (t) => (t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t))
      const L = num(raw[0])
      const C = num(raw[1])
      const H = parseFloat(raw[2])
      const a = raw[3] !== undefined ? num(raw[3]) : 1
      if (![L, C, H].every(Number.isFinite) || a === 0) return null
      const [r, g, b] = oklchToRgb(L, C, H)
      return { r, g, b, a }
    }
    const m = value.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    const [r, g, b] = parts
    const a = parts.length > 3 ? parts[3] : 1
    if (!Number.isFinite(r) || a === 0) return null
    return { r: r / 255, g: g / 255, b: b / 255, a }
  }

  const hsl = ({ r, g, b }) => {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min
    if (d === 0) return { h: 0, s: 0, l }
    const s = d / (1 - Math.abs(2 * l - 1))
    let h
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = (h * 60 + 360) % 360
    return { h, s, l }
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const viewportArea = vw * vh
  const buckets = new Map()
  let colouredArea = 0
  const samples = []

  const add = (raw, area, tag, label) => {
    const c = parse(raw)
    if (!c) return
    const { h, l } = hsl(c)
    const chroma = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)
    // Alpha over a dark ground dilutes chroma before the eye sees it.
    const effective = chroma * c.a
    if (effective < CHROMA_FLOOR || l < 0.04 || l > 0.98) return
    const weighted = area * c.a
    colouredArea += weighted
    const bucket = Math.round(h / 30) % 12
    const prev = buckets.get(bucket) ?? { area: 0, examples: [] }
    prev.area += weighted
    if (prev.examples.length < 4) prev.examples.push(`${tag}:${label}`)
    buckets.set(bucket, prev)
    if (samples.length < 400) samples.push({ h: Math.round(h), s: +effective.toFixed(2), tag, label })
  }

  for (const el of document.querySelectorAll('body *')) {
    // Imagery is content, not chrome: an avatar, a space emblem, a record
    // sleeve or an attachment carries its own colour the way a photograph does.
    // The two-hue rule governs the interface around them.
    if (el.closest('[data-imagery]')) continue
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) continue
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue

    const visibleArea =
      Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) *
      Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
    if (visibleArea <= 0) continue

    const label = (
      el.getAttribute('aria-label') ||
      (el.textContent || '').trim().slice(0, 22) ||
      el.tagName
    ).replace(/\s+/g, ' ')

    add(cs.backgroundColor, visibleArea, 'bg', label)
    // Text and borders cover far less ground than their box.
    if (el.childElementCount === 0 && (el.textContent || '').trim()) {
      add(cs.color, visibleArea * 0.35, 'text', label)
    }
    for (const side of ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor']) {
      const width = parseFloat(cs[side.replace('Color', 'Width')]) || 0
      if (width > 0) add(cs[side], (r.width + r.height) * width, 'border', label)
    }
    if (el instanceof SVGElement) {
      add(cs.fill, visibleArea * 0.5, 'fill', label)
      add(cs.stroke, (r.width + r.height) * 2, 'stroke', label)
    }
    if (cs.boxShadow && cs.boxShadow !== 'none' && /rgb/.test(cs.boxShadow)) {
      const first = cs.boxShadow.match(/rgba?\([^)]+\)/)
      if (first) add(first[0], (r.width + r.height) * 3, 'shadow', label)
    }
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
      const stops = cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []
      for (const stop of stops) add(stop, visibleArea / Math.max(1, stops.length), 'gradient', label)
    }
  }

  const hues = [...buckets.entries()]
    .map(([bucket, v]) => ({
      bucket,
      degrees: bucket * 30,
      share: +(v.area / viewportArea).toFixed(4),
      examples: v.examples,
    }))
    .filter((h) => h.share >= AREA_FLOOR)
    .sort((a, b) => b.share - a.share)

  return {
    hueCount: hues.length,
    hues,
    colouredShare: +(colouredArea / viewportArea).toFixed(4),
    samples: samples.slice(0, 40),
  }
}

const PORT = Number(process.env.ENCLAVE_CDP_PORT ?? 9335)
const profile = join(tmpdir(), 'enclave-color-profile')
rmSync(profile, { recursive: true, force: true })

const child = spawn(
  executablePath,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank',
  ],
  { detached: true, stdio: 'ignore' },
)
child.unref()

async function waitForCdp(deadlineMs = 25000) {
  const started = Date.now()
  while (Date.now() - started < deadlineMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* not up yet */
    }
    await sleep(300)
  }
  throw new Error(`No debugging port on ${PORT}`)
}

await waitForCdp()
const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${PORT}`,
  defaultViewport: null,
})

const findings = []
for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 })
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    await sleep(400)
    const r = await page.evaluate(MEASURE)
    findings.push({ viewport: vp.label, route, ...r })
  }
  await page.close()
}

const offenders = findings.filter((f) => f.hueCount > 2 && !SANCTIONED.includes(f.route))

if (process.env.ENCLAVE_AUDIT_JSON) {
  console.log(JSON.stringify(findings, null, 1))
} else {
  console.log(`Measured ${ROUTES.length} routes x ${VIEWPORTS.length} viewports\n`)
  console.log(`${offenders.length === 0 ? 'PASS' : 'FAIL'}  two-hue rule: ${offenders.length} viewports over 2 hues`)
  const worst = [...findings].sort((a, b) => b.hueCount - a.hueCount).slice(0, 8)
  for (const f of worst) {
    console.log(
      `  ${String(f.hueCount).padStart(2)} hues · ${(f.colouredShare * 100).toFixed(1)}% coloured · ${f.viewport} ${f.route}`,
    )
    for (const h of f.hues.slice(0, 4)) {
      console.log(`       ${String(h.degrees).padStart(3)}deg ${(h.share * 100).toFixed(2)}%  ${h.examples.join(', ')}`)
    }
  }
  const avg = findings.reduce((n, f) => n + f.colouredShare, 0) / findings.length
  console.log(`\nmean coloured area: ${(avg * 100).toFixed(2)}%`)
}

await browser.close()
try {
  process.kill(child.pid)
} catch {
  /* already gone */
}

if (offenders.length) process.exit(1)
