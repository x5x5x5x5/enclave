import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Button } from './Button'

/** Empty states are invitations with exactly one action, set in Bricolage. */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon,
  className,
}: {
  title: string
  body?: ReactNode
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-ink-1 text-low">
          {icon}
        </span>
      ) : null}
      <h3 className="max-w-sm font-display text-20 leading-tight text-hi">{title}</h3>
      {body ? <p className="max-w-sm text-13 leading-relaxed text-mid">{body}</p> : null}
      {actionLabel ? (
        <Button variant="outline" size="md" className="mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        'px-1 text-12 font-medium uppercase tracking-[0.08em] text-low',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function Card({
  children,
  className,
  raised,
  as: As = 'div',
}: {
  children: ReactNode
  className?: string
  raised?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <As
      className={cx(
        'rounded-card border border-[var(--line)]',
        raised ? 'bg-ink-2' : 'bg-ink-1',
        className,
      )}
    >
      {children}
    </As>
  )
}
