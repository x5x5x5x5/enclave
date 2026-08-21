import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { IconButton } from './Button'

/* -- Modal ----------------------------------------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  labelledBy?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
    }
    document.addEventListener('keydown', onKey, true)
    const t = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }, 30)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      window.clearTimeout(t)
    }
  }, [open, onClose])

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-[rgb(4_6_10/.66)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cx(
              'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden border border-[var(--line)] bg-ink-1 shadow-modal',
              'rounded-t-modal sm:rounded-modal',
              widths[size],
            )}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] }}
          >
            {title ? (
              <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 hairline-b">
                <div className="min-w-0">
                  <h2 className="font-display text-17 text-hi">{title}</h2>
                  {subtitle ? (
                    <p className="mt-0.5 text-13 leading-relaxed text-mid">{subtitle}</p>
                  ) : null}
                </div>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X size={16} strokeWidth={1.5} />
                </IconButton>
              </header>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <footer className="flex items-center justify-end gap-2 px-5 py-3 hairline-t">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

/* -- Sheet (mobile right panel) -------------------------------------------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  side?: 'right' | 'bottom' | 'left'
}) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const geometry =
    side === 'bottom'
      ? { className: 'inset-x-0 bottom-0 max-h-[80dvh] rounded-t-modal', axis: { y: 40 } }
      : side === 'left'
        ? { className: 'inset-y-0 left-0 w-[86vw] max-w-sm', axis: { x: -40 } }
        : { className: 'inset-y-0 right-0 w-[86vw] max-w-sm', axis: { x: 40 } }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40">
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-[rgb(4_6_10/.6)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className={cx(
              'absolute flex flex-col border-[var(--line)] bg-ink-1 shadow-modal',
              side === 'right' && 'border-l',
              side === 'left' && 'border-r',
              side === 'bottom' && 'border-t',
              geometry.className,
            )}
            initial={reduce ? { opacity: 0 } : { opacity: 0, ...geometry.axis }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, ...geometry.axis }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] }}
          >
            {title ? (
              <header className="flex items-center justify-between gap-3 px-4 py-3 hairline-b">
                <h2 className="font-display text-15 text-hi">{title}</h2>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X size={16} strokeWidth={1.5} />
                </IconButton>
              </header>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

/* -- Popover --------------------------------------------------------------- */

export function Popover({
  trigger,
  children,
  align = 'start',
  side = 'top',
  className,
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom'
  className?: string
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrap} className={cx('relative', className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: [0.2, 0, 0, 1] }}
            className={cx(
              'absolute z-40 min-w-56 rounded-card border border-[var(--line)] bg-ink-2 p-2 shadow-modal',
              side === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]',
              align === 'start' && 'left-0',
              align === 'center' && 'left-1/2 -translate-x-1/2',
              align === 'end' && 'right-0',
              panelClassName,
            )}
          >
            {typeof children === 'function' ? children(() => setOpen(false)) : children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* -- Tooltip --------------------------------------------------------------- */

export function Tooltip({
  label,
  children,
  side = 'top',
  className,
}: {
  label: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'right'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className={cx(
            'pointer-events-none absolute z-50 w-max max-w-64 rounded-chip border border-[var(--line)] bg-ink-2 px-2 py-1.5 text-12 leading-snug text-mid shadow-modal',
            side === 'top' && 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2',
            side === 'bottom' && 'left-1/2 top-[calc(100%+6px)] -translate-x-1/2',
            side === 'right' && 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}
