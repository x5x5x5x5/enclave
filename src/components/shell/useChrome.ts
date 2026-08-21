import { useEffect } from 'react'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'

/**
 * The mask tint mechanism, in one place: the active mask's hue is written to
 * <html data-mask-hue>, and every --accent-* token follows it. Density and the
 * reduced-motion override ride along on the same element.
 */
export function useChrome() {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const density = useApp((s) => s.density)
  const motion = useApp((s) => s.motion)

  useEffect(() => {
    const hue = maskById(activeMaskId).hue
    document.documentElement.dataset.maskHue = hue
  }, [activeMaskId])

  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])

  useEffect(() => {
    if (motion === 'reduced') document.documentElement.dataset.motion = 'reduced'
    else delete document.documentElement.dataset.motion
  }, [motion])
}
