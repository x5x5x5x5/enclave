/**
 * Mobile audit. Walks every route at phone widths and reports the defects that
 * are cheap for a machine to find and expensive for a human to notice:
 * horizontal overflow, sub-16px inputs (the iOS zoom-on-focus tell), touch
 * targets under 44px, and elements escaping the viewport.
 *
 *   npm run dev              # in one terminal
 *   node scripts/audit-mobile.mjs
 *
 * Writes MOBILE_AUDIT.md findings to stdout as JSON; the checklist itself is
 * curated by hand from this plus a visual pass.
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
  '/chats/th-friday',
  '/chats/th-stranger',
  '/spaces',
  '/space/c-lostera',
  '/space/c-lostera/ch-raids',
  '/space/c-lostera/ch-general',
  '/space/c-lostera/ch-trade',
  '/space/c-atelier/ch-designcrit',
  '/space/c-reading',
  '/space/c-reading/ch-foyer',
  '/voice/c-lostera/ch-lounge',
  '/voice/c-lostera/ch-raidnight',
  '/you',
  '/vault',
  '/discover',
  '/settings',
  '/settings/masks',
  '/settings/privacy',
  '/settings/notifications',
  '/settings/data',
  '/settings/security',
  '/settings/appearance',
  '/settings/language',
  '/mod',
]

const VIEWPORTS = [
  { w: 360, h: 800, label: '360x800' },
  { w: 390, h: 844, label: '390x844' },
  { w: 430, h: 932, label: '430x932' },
  { w: 390, h: 460, label: '390x460 (keyboard open)' },
]

const PORT = Number(process.env.ENCLAVE_CDP_PORT ?? 9334)
const profile = join(tmpdir(), 'enclave-audit-profile')
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

const AUDIT = () => {
  const out = { overflowX: null, smallInputs: [], smallTargets: [], escaping: [] }
  const vw = window.innerWidth
  const doc = document.scrollingElement

  if (doc.scrollWidth > vw + 1) {
    out.overflowX = { scrollWidth: doc.scrollWidth, innerWidth: vw }
  }

  const label = (el) =>
    (
      el.getAttribute('aria-label') ||
      el.getAttribute('placeholder') ||
      (el.textContent || '').trim().slice(0, 30) ||
      el.tagName
    ).replace(/\s+/g, ' ')

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = getComputedStyle(el)
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0'
  }

  for (const el of document.querySelectorAll('input, textarea, select')) {
    if (!visible(el)) continue
    const size = parseFloat(getComputedStyle(el).fontSize)
    if (size < 16) out.smallInputs.push({ label: label(el), size })
  }

  for (const el of document.querySelectorAll('button, a[href], [role="tab"], [role="radio"], [role="switch"]')) {
    if (!visible(el)) continue
    const r = el.getBoundingClientRect()
    if (r.width < 44 || r.height < 44) {
      out.smallTargets.push({ label: label(el), w: Math.round(r.width), h: Math.round(r.height) })
    }
  }

  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue
    const r = el.getBoundingClientRect()
    if (r.right > vw + 1 && r.width <= vw) {
      out.escaping.push({ label: label(el), right: Math.round(r.right) })
    }
  }
  // Deduplicate noisy repeats.
  const uniq = (arr, key) => {
    const seen = new Set()
    return arr.filter((x) => {
      const k = key(x)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }
  out.smallTargets = uniq(out.smallTargets, (x) => `${x.label}:${x.w}x${x.h}`).slice(0, 12)
  out.escaping = uniq(out.escaping, (x) => x.label).slice(0, 8)
  out.smallInputs = uniq(out.smallInputs, (x) => x.label)
  return out
}

const findings = []

for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    await sleep(350)
    const r = await page.evaluate(AUDIT)
    const hasIssue =
      r.overflowX || r.smallInputs.length || r.smallTargets.length || r.escaping.length
    if (hasIssue) findings.push({ viewport: vp.label, route, ...r })
  }
  await page.close()
}

const overflow = findings.filter((f) => f.overflowX)
const zoomers = findings.filter((f) => f.smallInputs.length)
const targets = findings.filter((f) => f.smallTargets.length)

if (process.env.ENCLAVE_AUDIT_JSON) {
  console.log(JSON.stringify(findings, null, 1))
} else {
  const line = (label, list) =>
    console.log(`${list.length === 0 ? 'PASS' : 'FAIL'}  ${label}: ${list.length}`)
  console.log(`Audited ${ROUTES.length} routes x ${VIEWPORTS.length} viewports
`)
  line('routes with horizontal overflow', overflow)
  line('routes with inputs under 16px', zoomers)
  console.log(`${targets.length === 0 ? 'PASS' : 'WARN'}  routes with sub-44px targets: ${targets.length}`)
  for (const f of [...overflow, ...zoomers].slice(0, 10)) {
    console.log(`  - ${f.viewport} ${f.route}`)
  }
}

await browser.close()
try {
  process.kill(child.pid)
} catch {
  /* already gone */
}

// The two rules that are non-negotiable in §8 gate the exit code.
if (overflow.length || zoomers.length) process.exit(1)
