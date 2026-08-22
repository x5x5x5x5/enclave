import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useIsMobile } from '../../lib/useMediaQuery'
import { IconButton } from './Button'

export type SheetSnap = 'peek' | 'full'

/**
 * The one overlay surface on a phone.
 *
 * Every desktop right-panel and centred modal becomes this on mobile: it opens
 * from the bottom edge, has a drag handle, dismisses on a downward flick, snaps
 * between two heights, keeps its footer above the safe area *and* the keyboard,
 * and traps focus. On desktop it can stay a right-hand panel where that reads
 * better, which is why `side` exists — but there is only one component.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'bottom',
  snap: initialSnap = 'peek',
  labelledBy,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Desktop only; a phone always gets the bottom sheet. */
  side?: 'bottom' | 'right'
  snap?: SheetSnap
  labelledBy?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const isMobile = useIsMobile()
  const panel = useRef<HTMLDivElement>(null)
  const [snap, setSnap] = useState<SheetSnap>(initialSnap)

  const asPanel = side === 'right' && !isMobile

  useEffect(() => {
    if (open) setSnap(initialSnap)
  }, [open, initialSnap])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    const t = window.setTimeout(
      () => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(),
      40,
    )
    return () => {
      document.removeEventListener('keydown', onKey, true)
      window.clearTimeout(t)
    }
  }, [open, onClose])

  /** Flick down dismisses; flick up expands. Distance or velocity, either one. */
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = info.offset.y > 120
    const fast = info.velocity.y > 550
    if (far || fast) {
      if (snap === 'full') setSnap('peek')
      else onClose()
      return
    }
    if (info.offset.y < -60 || info.velocity.y < -450) setSnap('full')
  }

  const height = asPanel ? undefined : snap === 'full' ? '92dvh' : 'min(68dvh, 640px)'

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-[color:var(--scrim)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            drag={asPanel || reduce ? false : 'y'}
            dragElastic={{ top: 0.04, bottom: 0.3 }}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={onDragEnd}
            initial={reduce ? { opacity: 0 } : asPanel ? { x: 40, opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : asPanel ? { x: 0, opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : asPanel ? { x: 40, opacity: 0 } : { y: '100%' }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] }}
            style={{ height }}
            className={cx(
              'absolute flex flex-col border-[var(--line)] bg-ink-1 shadow-modal',
              asPanel
                ? 'inset-y-0 right-0 w-[min(420px,88vw)] border-l'
                : 'inset-x-0 bottom-0 rounded-t-modal border-t',
              className,
            )}
          >
            {!asPanel ? (
              <div className="flex shrink-0 cursor-grab justify-center pb-1 pt-2 active:cursor-grabbing">
                <span className="h-1 w-9 rounded-full bg-[var(--line)]" />
              </div>
            ) : null}

            {title ? (
              <header
                className={cx(
                  'flex shrink-0 items-start justify-between gap-3 px-[var(--gutter)] pb-3 hairline-b',
                  asPanel ? 'pt-4' : 'pt-1',
                )}
              >
                <div className="min-w-0">
                  <h2 id={labelledBy} className="font-display text-17 text-hi">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-0.5 text-13 leading-relaxed text-mid">{subtitle}</p>
                  ) : null}
                </div>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X size={16} strokeWidth={1.5} />
                </IconButton>
              </header>
            ) : null}

            <div className="scroll-area min-h-0 flex-1">{children}</div>

            {footer ? (
              <footer
                className="shrink-0 px-[var(--gutter)] pt-3 hairline-t"
                style={{
                  paddingBottom: 'calc(12px + var(--safe-bottom) + var(--keyboard-inset))',
                }}
              >
                {footer}
              </footer>
            ) : (
              <div
                className="shrink-0"
                style={{ height: 'calc(var(--safe-bottom) + var(--keyboard-inset))' }}
              />
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
