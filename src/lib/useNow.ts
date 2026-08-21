import { useEffect, useState } from 'react'

/**
 * One shared clock. Timers, ember rings and countdowns all read from it so the
 * whole prototype ages together instead of drifting per-component.
 */
const subscribers = new Set<(t: number) => void>()
let timer: number | undefined

function ensureTimer(interval: number) {
  if (timer !== undefined) return
  timer = window.setInterval(() => {
    const t = Date.now()
    subscribers.forEach((fn) => fn(t))
  }, interval)
}

export function useNow(interval = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    ensureTimer(interval)
    subscribers.add(setNow)
    return () => {
      subscribers.delete(setNow)
      if (subscribers.size === 0 && timer !== undefined) {
        window.clearInterval(timer)
        timer = undefined
      }
    }
  }, [interval])
  return now
}
