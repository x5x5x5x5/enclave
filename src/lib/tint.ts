import type { Hue } from '../mock/types'

/* ============================================================================
   The mask crossfade.

   The tokens are still declared per `[data-mask-hue]` in tokens.css — that is
   the source of truth and the app works with JavaScript off the critical path.
   What this module adds is the 250ms interpolation between two masks.

   It is driven rather than declared because transitioning registered custom
   properties (`@property --accent`) does not advance reliably in every engine:
   the computed value sticks at the start of the transition, so the interface
   never actually changes allegiance. Interpolating the values ourselves and
   writing them inline for the duration of the switch is exact, cancellable,
   and honours reduced motion by snapping.
   ========================================================================== */

export const HUE_RGB: Record<Hue, [number, number, number]> = {
  cove: [51, 198, 181],
  iris: [139, 124, 246],
  saffron: [224, 172, 79],
  rose: [226, 122, 151],
  moss: [140, 190, 109],
  sky: [88, 166, 232],
  clay: [208, 138, 99],
  fog: [143, 160, 179],
}

/** Fog is deliberately quieter than the rest, at every stop. */
const ALPHA: Record<Hue, { soft: number; glow: number; line: number }> = {
  cove: { soft: 0.12, glow: 0.4, line: 0.24 },
  iris: { soft: 0.12, glow: 0.4, line: 0.24 },
  saffron: { soft: 0.12, glow: 0.4, line: 0.24 },
  rose: { soft: 0.12, glow: 0.4, line: 0.24 },
  moss: { soft: 0.12, glow: 0.4, line: 0.24 },
  sky: { soft: 0.12, glow: 0.4, line: 0.24 },
  clay: { soft: 0.12, glow: 0.4, line: 0.24 },
  fog: { soft: 0.1, glow: 0.32, line: 0.18 },
}

const VARS = ['--accent', '--accent-soft', '--accent-glow', '--accent-line', '--accent-rgb'] as const

/** cubic-bezier(.2, 0, 0, 1), the one easing this product uses. */
function ease(t: number): number {
  const cx = 3 * 0.2
  const bx = 3 * (0 - 0.2) - cx
  const ax = 1 - cx - bx
  const cy = 3 * 0
  const by = 3 * (1 - 0) - cy
  const ay = 1 - cy - by
  // Solve x(s) = t for s with a few Newton steps, then return y(s).
  let s = t
  for (let i = 0; i < 5; i++) {
    const x = ((ax * s + bx) * s + cx) * s - t
    const dx = (3 * ax * s + 2 * bx) * s + cx
    if (Math.abs(dx) < 1e-6) break
    s -= x / dx
  }
  s = Math.min(1, Math.max(0, s))
  return ((ay * s + by) * s + cy) * s
}

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

let frame: number | undefined

function write(root: HTMLElement, rgb: [number, number, number], alpha: { soft: number; glow: number; line: number }) {
  const [r, g, b] = rgb
  root.style.setProperty('--accent', `rgb(${r} ${g} ${b})`)
  root.style.setProperty('--accent-soft', `rgb(${r} ${g} ${b} / ${alpha.soft})`)
  root.style.setProperty('--accent-glow', `rgb(${r} ${g} ${b} / ${alpha.glow})`)
  root.style.setProperty('--accent-line', `rgb(${r} ${g} ${b} / ${alpha.line})`)
  root.style.setProperty('--accent-rgb', `${r} ${g} ${b}`)
}

function clear(root: HTMLElement) {
  VARS.forEach((v) => root.style.removeProperty(v))
}

/**
 * Crossfade the accent aliases from `from` to `to`. Passing the same hue twice
 * (or `reduce`) settles immediately on the declared tokens.
 */
export function crossfadeAccent(from: Hue | null, to: Hue, reduce: boolean, duration = 250) {
  const root = document.documentElement
  if (frame !== undefined) cancelAnimationFrame(frame)

  root.dataset.maskHue = to

  if (reduce || !from || from === to) {
    clear(root)
    return
  }

  const a = HUE_RGB[from]
  const b = HUE_RGB[to]
  const alphaFrom = ALPHA[from]
  const alphaTo = ALPHA[to]
  const start = performance.now()

  const step = (now: number) => {
    const raw = Math.min(1, (now - start) / duration)
    const t = ease(raw)
    write(
      root,
      [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)],
      {
        soft: alphaFrom.soft + (alphaTo.soft - alphaFrom.soft) * t,
        glow: alphaFrom.glow + (alphaTo.glow - alphaFrom.glow) * t,
        line: alphaFrom.line + (alphaTo.line - alphaFrom.line) * t,
      },
    )
    if (raw < 1) {
      frame = requestAnimationFrame(step)
    } else {
      frame = undefined
      // Hand control back to the declared [data-mask-hue] tokens.
      clear(root)
    }
  }

  frame = requestAnimationFrame(step)
}
