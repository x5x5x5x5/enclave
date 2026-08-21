import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'

export function Group({
  title,
  note,
  children,
  className,
}: {
  title?: string
  note?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('mb-7', className)}>
      {title ? (
        <h3 className="mb-1 font-display text-15 text-hi">{title}</h3>
      ) : null}
      {note ? <p className="mb-3 max-w-xl text-13 leading-relaxed text-mid">{note}</p> : null}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

export function Panel({
  children,
  className,
  tone = 'default',
}: {
  children: ReactNode
  className?: string
  tone?: 'default' | 'breach' | 'ember'
}) {
  return (
    <div
      className={cx(
        'rounded-card border p-4',
        tone === 'breach'
          ? 'border-[color:var(--breach-glow)] bg-breach-soft'
          : tone === 'ember'
            ? 'border-[color:var(--ember-glow)] bg-ember-soft'
            : 'border-[var(--line)] bg-ink-1',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Rowed({
  label,
  note,
  control,
  className,
}: {
  label: ReactNode
  note?: ReactNode
  control: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-14 text-hi">{label}</p>
        {note ? <p className="mt-0.5 text-12 leading-relaxed text-mid">{note}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}
