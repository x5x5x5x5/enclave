import { useEffect, useState } from 'react'

/**
 * How much of the viewport the soft keyboard is covering, in pixels.
 *
 * `window.visualViewport` is the only honest source for this: on iOS the layout
 * viewport does not change when the keyboard opens, so `innerHeight` lies. The
 * value is also written to `--keyboard-inset` on <html> so pure-CSS surfaces
 * (sheets, docked footers) can ride above the keyboard without prop drilling.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const read = () => {
      // Layout height minus what is actually visible, minus how far the page
      // has been scrolled up to keep the focused field in view.
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      // Ignore the few pixels a URL bar collapse produces.
      const next = covered > 80 ? Math.round(covered) : 0
      setInset((prev) => (prev === next ? prev : next))
      document.documentElement.style.setProperty('--keyboard-inset', `${next}px`)
    }

    read()
    vv.addEventListener('resize', read)
    vv.addEventListener('scroll', read)
    return () => {
      vv.removeEventListener('resize', read)
      vv.removeEventListener('scroll', read)
      document.documentElement.style.setProperty('--keyboard-inset', '0px')
    }
  }, [])

  return inset
}
