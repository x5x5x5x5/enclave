import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Below Tailwind's `md`. The single definition of "this is a phone". */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/** Coarse pointer — drives press-and-hold, swipe and drag affordances. */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none)')
}
