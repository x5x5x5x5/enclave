import type { ReactNode } from 'react'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { cx } from '../../lib/cx'
import { useIsTouch } from '../../lib/useMediaQuery'

export interface SwipeAction {
  label: string
  icon: ReactNode
  tone?: 'neutral' | 'accent' | 'breach'
  onAction: () => void
}

const REVEAL = 132

/**
 * Swipe a list row left to reveal its actions. Touch only — on a pointer device
 * the same actions live in a menu, because a mouse has no swipe.
 */
export function SwipeRow({
  actions,
  children,
  className,
}: {
  actions: SwipeAction[]
  children: ReactNode
  className?: string
}) {
  const isTouch = useIsTouch()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)

  if (!isTouch || actions.length === 0) return <>{children}</>

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const shouldOpen = info.offset.x < -48 || info.velocity.x < -400
    setOpen(shouldOpen && info.offset.x < 0)
  }

  return (
    <div className={cx('relative overflow-hidden', className)}>
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => {
              a.onAction()
              setOpen(false)
            }}
            className={cx(
              'flex w-16 flex-col items-center justify-center gap-1 text-12',
              a.tone === 'breach'
                ? 'bg-breach-soft text-breach'
                : a.tone === 'accent'
                  ? 'bg-accent-soft text-accent'
                  : 'bg-ink-2 text-mid',
            )}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -REVEAL, right: 0 }}
        dragElastic={{ left: 0.05, right: 0 }}
        onDragEnd={onDragEnd}
        animate={{ x: open ? -REVEAL : 0 }}
        transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
        className="relative bg-ink-1"
      >
        {children}
      </motion.div>
    </div>
  )
}
