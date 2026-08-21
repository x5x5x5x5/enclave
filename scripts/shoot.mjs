/**
 * Screenshot manifest capture.
 *
 * Drives the already-running dev server with the system browser through
 * puppeteer-core, so nothing is downloaded and nothing ships in the app bundle.
 *
 *   npm run dev            # in one terminal
 *   node scripts/shoot.mjs # in another
 *
 * Output: docs/screenshots/<name>@<width>.png
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE = process.env.ENCLAVE_URL ?? 'http://localhost:5180'
const OUT = 'docs/screenshots'

const CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
]

const executablePath = process.env.ENCLAVE_BROWSER ?? CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error('No Edge or Chrome found. Set ENCLAVE_BROWSER to a browser binary.')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Click the first element matching a predicate over aria-label / text. */
async function click(page, match, { exact = false } = {}) {
  const ok = await page.evaluate(
    (m, isExact) => {
      const nodes = [...document.querySelectorAll('button, a, [role="tab"], [role="radio"]')]
      const hit = nodes.find((n) => {
        const label = (n.getAttribute('aria-label') || n.textContent || '').trim()
        return isExact ? label === m : label.includes(m)
      })
      if (!hit) return false
      hit.click()
      return true
    },
    match,
    exact,
  )
  if (!ok) console.warn(`  ! could not find "${match}"`)
  await sleep(320)
  return ok
}

async function chord(page, key) {
  await page.keyboard.down('Control')
  await page.keyboard.press(key)
  await page.keyboard.up('Control')
  await sleep(420)
}

/** Scroll the message stream to the very top so the Horizon is in frame. */
async function scrollStreamTop(page) {
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find(
      (d) => d.scrollHeight > d.clientHeight + 40 && d.className.includes('overflow-y-auto'),
    )
    if (el) el.scrollTop = 0
  })
  await sleep(260)
}

const SHOTS = [
  {
    name: '01-onboarding-mask',
    path: '/welcome',
    async act(page) {
      await page.type('input', 'nightramp', { delay: 8 })
      await sleep(200)
      await click(page, 'Continue')
      await sleep(200)
      await page.evaluate(() => {
        const input = [...document.querySelectorAll('input')].pop()
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          ).set
          setter.call(input, 'Ash')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
      await sleep(200)
      await click(page, 'Iris')
      await sleep(400)
    },
  },
  { name: '02-chats-all', path: '/chats' },
  {
    name: '03-raids-horizon',
    path: '/space/c-lostera/ch-raids',
    async act(page) {
      await scrollStreamTop(page)
    },
  },
  { name: '04-unsealed-banner', path: '/space/c-lostera/ch-general' },
  { name: '05-reading-room-salon', path: '/space/c-reading/ch-foyer' },
  { name: '06-community-lostera', path: '/space/c-lostera' },
  { name: '07-voice-lounge', path: '/voice/c-lostera/ch-lounge' },
  {
    name: '08-mask-switcher',
    path: '/chats',
    async act(page) {
      await chord(page, 'i')
    },
  },
  {
    name: '09-profile-audience-lens',
    path: '/you',
    async act(page) {
      await click(page, 'Edit', { exact: true })
      await click(page, 'LostEra member', { exact: true })
    },
  },
  {
    name: '10-social-card',
    path: '/you',
    async act(page) {
      await click(page, 'Social card', { exact: true })
      await sleep(400)
    },
  },
  {
    name: '11-story-viewer',
    path: '/chats',
    async act(page) {
      await click(page, 'Stories from Mira')
      await sleep(500)
    },
  },
  {
    name: '12-vault-clipboard',
    path: '/vault',
    async act(page) {
      await click(page, 'Clipboard', { exact: true })
    },
  },
  { name: '13-settings-duress', path: '/settings/security' },
  {
    name: '14-report-step-2',
    path: '/space/c-lostera/ch-raids',
    async act(page) {
      await click(page, 'Message actions')
      await click(page, 'Report', { exact: true })
      await sleep(300)
      await click(page, 'Continue', { exact: true })
      await sleep(400)
    },
  },
  { name: '15-transfer-relay', path: '/chats/th-mira' },
  { name: '16-discover', path: '/discover' },
  {
    name: '17-command-palette',
    path: '/chats',
    async act(page) {
      await chord(page, 'k')
    },
  },
  { name: '18-playground', path: '/playground' },
]

const WIDTHS = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 },
]

/*
 * Launch, then connect — rather than puppeteer.launch().
 *
 * On Windows `msedge.exe` is a GUI-subsystem binary: it never writes the
 * "DevTools listening on ws://..." line to an inherited stderr pipe, so
 * puppeteer.launch() waits, gives up, and reports an exit it never saw. Opening
 * a fixed debugging port and connecting over HTTP sidesteps that entirely and
 * works the same with Chrome.
 */
const PORT = Number(process.env.ENCLAVE_CDP_PORT ?? 9333)
const profile = join(tmpdir(), 'enclave-shoot-profile')
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
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--font-render-hinting=none',
    '--disable-extensions',
    '--disable-background-networking',
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
  throw new Error(`Browser never opened a debugging port on ${PORT}`)
}

const version = await waitForCdp()
console.log(`Driving ${version.Browser}\n`)

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${PORT}`,
  defaultViewport: null,
})

mkdirSync(OUT, { recursive: true })

for (const { w, h } of WIDTHS) {
  for (const shot of SHOTS) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
    await page.goto(BASE + shot.path, { waitUntil: 'networkidle0', timeout: 30000 })
    // Fonts settle before anything is measured or captured.
    await page.evaluate(() => document.fonts.ready)
    await sleep(700)
    if (shot.act) await shot.act(page)
    await sleep(300)
    const file = join(OUT, `${shot.name}@${w}.png`)
    await page.screenshot({ path: file })
    console.log(`${file}`)
    await page.close()
  }
}

await browser.close()
try {
  process.kill(child.pid)
} catch {
  /* already gone */
}
console.log(`\n${SHOTS.length * WIDTHS.length} screenshots in ${OUT}`)
