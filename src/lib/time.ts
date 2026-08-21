/** All fixture times are anchored to app start so timers really run. */
export const BOOT = Date.now()

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export const ago = (ms: number) => new Date(BOOT - ms).toISOString()
export const ahead = (ms: number) => new Date(BOOT + ms).toISOString()

const pad = (n: number) => String(n).padStart(2, '0')

/** 24h clock, the product speaks in unambiguous time. */
export function clock(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function dayLabel(iso: string, now = Date.now()): string {
  const d = new Date(iso)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((startOfToday.getTime() - d.getTime()) / DAY)
  if (d.getTime() >= startOfToday.getTime()) return 'Today'
  if (diffDays === 0) return 'Yesterday'
  if (diffDays < 6) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Compact relative stamp for list rows: 4m, 2h, Tue, 12 Mar. */
export function shortStamp(iso: string, now = Date.now()): string {
  const delta = now - new Date(iso).getTime()
  if (delta < MINUTE) return 'now'
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m`
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h`
  if (delta < 6 * DAY) return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** "2h 14m", "44s", "3d 4h" - used by countdowns and retention chips. */
export function humanDuration(ms: number): string {
  if (ms <= 0) return '0s'
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / HOUR)
  const m = Math.floor((ms % HOUR) / MINUTE)
  const s = Math.floor((ms % MINUTE) / SECOND)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}

/** Zero-padded mm:ss for media scrubbers and watch budgets. */
export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

export function retentionLabel(
  r: { mode: 'timer'; seconds: number } | { mode: 'views'; count: number } | { mode: 'daily'; at: string },
): string {
  if (r.mode === 'timer') {
    if (r.seconds >= DAY / SECOND) return `${Math.round(r.seconds / (DAY / SECOND))}d`
    if (r.seconds >= HOUR / SECOND) return `${Math.round(r.seconds / (HOUR / SECOND))}h`
    if (r.seconds >= 60) return `${Math.round(r.seconds / 60)}m`
    return `${r.seconds}s`
  }
  if (r.mode === 'views') return `${r.count} views`
  return `clears ${r.at}`
}

export function retentionSentence(
  r: { mode: 'timer'; seconds: number } | { mode: 'views'; count: number } | { mode: 'daily'; at: string },
): string {
  if (r.mode === 'timer') return `Messages expire ${retentionLabel(r)} after sending.`
  if (r.mode === 'views') return `Each message clears after ${r.count} views.`
  return `Everything here clears daily at ${r.at}.`
}
