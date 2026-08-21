import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface TabItem<T extends string = string> {
  id: T
  label: ReactNode
  count?: number
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  ariaLabel,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  variant?: 'underline' | 'pill'
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'underline' && 'hairline-b',
        className,
      )}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const i = items.findIndex((t) => t.id === value)
        const next = e.key === 'ArrowRight' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
        onChange(items[next].id)
      }}
    >
      {items.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cx(
              'relative shrink-0 whitespace-nowrap transition-colors duration-[var(--dur-micro)] max-md:min-h-11',
              variant === 'underline'
                ? cx(
                    'px-3 py-2 text-13',
                    active ? 'text-hi' : 'text-low hover:text-mid',
                  )
                : cx(
                    'rounded-chip px-3 py-1.5 text-13',
                    active ? 'bg-accent-soft text-accent' : 'text-low hover:bg-ink-2 hover:text-mid',
                  ),
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {t.count ? (
                <span
                  className={cx(
                    'mono-num rounded-full px-1.5 text-11 text-12 leading-[18px]',
                    active ? 'bg-accent-soft text-accent' : 'bg-ink-2 text-low',
                  )}
                >
                  {t.count}
                </span>
              ) : null}
            </span>
            {variant === 'underline' && active ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
