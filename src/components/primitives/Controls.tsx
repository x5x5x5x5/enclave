import type { ReactNode } from 'react'
import { useId } from 'react'
import { cx } from '../../lib/cx'

/* -- Toggle ---------------------------------------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  description,
  tone = 'accent',
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: ReactNode
  description?: ReactNode
  tone?: 'accent' | 'breach'
  disabled?: boolean
}) {
  const id = useId()
  const control = (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={typeof label === 'string' ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-[var(--dur-std)] ease-enclave',
        checked
          ? tone === 'breach'
            ? 'border-[color:var(--breach-glow)] bg-breach-soft'
            : 'border-[color:var(--accent-line)] bg-accent-soft'
          : 'border-[var(--line)] bg-ink-2',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cx(
          'absolute top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full transition-[left,background-color] duration-[var(--dur-std)] ease-enclave',
          checked
            ? tone === 'breach'
              ? 'left-[calc(100%-1.125rem)] bg-breach'
              : 'left-[calc(100%-1.125rem)] bg-accent'
            : 'left-0.5 bg-[var(--text-low)]',
        )}
      />
    </button>
  )

  if (!label) return control

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-14 text-hi">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-12 leading-relaxed text-mid">{description}</p>
        ) : null}
      </div>
      {control}
    </div>
  )
}

/* -- Segmented ------------------------------------------------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ariaLabel,
}: {
  options: readonly { id: T; label: ReactNode }[] | readonly T[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}) {
  const normalised = options.map((o) =>
    typeof o === 'string' ? { id: o as T, label: o as ReactNode } : o,
  )
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(
        'inline-flex rounded-chip border border-[var(--line)] bg-ink-1 p-0.5',
        className,
      )}
    >
      {normalised.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cx(
              'rounded-[4px] transition-colors duration-[var(--dur-micro)] max-md:min-h-9',
              size === 'sm' ? 'px-2 py-1 text-12' : 'px-3 py-1.5 text-13',
              active
                ? 'bg-accent-soft text-accent'
                : 'text-low hover:bg-ink-2 hover:text-mid',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* -- Slider ---------------------------------------------------------------- */

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  valueLabel,
  className,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  label?: string
  valueLabel?: string
  className?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex items-baseline justify-between">
          <span className="text-13 text-mid">{label}</span>
          {valueLabel ? <span className="mono-num text-12 text-low">{valueLabel}</span> : null}
        </div>
      ) : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="enclave-slider h-6 w-full cursor-pointer appearance-none bg-transparent"
        style={
          {
            '--pct': `${pct}%`,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

/* -- Kbd ------------------------------------------------------------------- */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-[var(--line)] bg-ink-2 px-1 font-mono text-12 leading-none text-mid">
      {children}
    </kbd>
  )
}

/* -- Divider --------------------------------------------------------------- */

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cx('flex items-center gap-3', className)}>
        <span className="h-px flex-1 bg-[var(--line-soft)]" />
        <span className="text-12 uppercase tracking-[0.08em] text-low">{label}</span>
        <span className="h-px flex-1 bg-[var(--line-soft)]" />
      </div>
    )
  }
  return <div className={cx('h-px w-full bg-[var(--line-soft)]', className)} />
}
