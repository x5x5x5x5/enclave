import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { crossfadeAccent } from '../../lib/tint'
import { maskById } from '../../mock/masks'
import type { Hue } from '../../mock/types'
import { useApp } from '../../state/app'

/**
 * The mask tint mechanism, in one place: the active mask's hue is written to
 * <html data-mask-hue>, and every --accent-* token follows it. The 250ms
 * crossfade between two hues is driven in `lib/tint`. Density and the
 * reduced-motion override ride along on the same element.
 */
export function useChrome() {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const contextMaskId = useApp((s) => s.contextMaskId)
  const density = useApp((s) => s.density)
  const motion = useApp((s) => s.motion)
  const systemReduce = useReducedMotion()
  const previousHue = useRef<Hue | null>(null)

  const reduce = motion === 'reduced' || !!systemReduce

  useEffect(() => {
    // The tint follows who you are *here*, not who you were last. Walking into
    // The Reading Room as Courier-7 drains the whole interface grey.
    const hue = maskById(contextMaskId ?? activeMaskId).hue
    crossfadeAccent(previousHue.current, hue, reduce)
    previousHue.current = hue
  }, [activeMaskId, contextMaskId, reduce])

  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])

  useEffect(() => {
    if (motion === 'reduced') document.documentElement.dataset.motion = 'reduced'
    else delete document.documentElement.dataset.motion
  }, [motion])
}

/** Declare which mask a screen is being viewed as, for the duration it is open. */
export function useContextMask(maskId: string | undefined, label?: string) {
  const setContextMask = useApp((s) => s.setContextMask)
  useEffect(() => {
    setContextMask(maskId ?? null, label ?? null)
    return () => setContextMask(null, null)
  }, [maskId, label, setContextMask])
}

/**
 * Atmospheres reshape the shell per space. Setting the attribute swaps a whole
 * token set (type sizes, list density, chrome opacity, column width), so no
 * component needs to know which kind of room it is standing in.
 */
export function useAtmosphere(atmosphere: 'hall' | 'studio' | 'salon' | undefined) {
  useEffect(() => {
    if (!atmosphere) {
      delete document.documentElement.dataset.atmosphere
      return
    }
    document.documentElement.dataset.atmosphere = atmosphere
    return () => {
      delete document.documentElement.dataset.atmosphere
    }
  }, [atmosphere])
}
