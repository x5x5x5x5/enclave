import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../lib/cx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
  invalid?: boolean
  mono?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leading, trailing, invalid, mono, className, ...rest },
  ref,
) {
  return (
    <div
      className={cx(
        'flex h-10 items-center gap-2 rounded-chip border bg-ink-1 px-3 transition-colors duration-[var(--dur-micro)]',
        invalid ? 'border-[color:var(--breach)]' : 'border-[var(--line)] focus-within:border-[color:var(--accent-line)]',
        'focus-within:bg-ink-2',
        className,
      )}
    >
      {leading ? <span className="shrink-0 text-low">{leading}</span> : null}
      <input
        ref={ref}
        className={cx(
          'min-w-0 flex-1 bg-transparent text-14 text-hi outline-none placeholder:text-low',
          mono && 'font-mono tracking-tight',
        )}
        {...rest}
      />
      {trailing ? <span className="shrink-0 text-low">{trailing}</span> : null}
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx(
        'w-full resize-none rounded-chip border border-[var(--line)] bg-ink-1 px-3 py-2.5 text-14 text-hi outline-none transition-colors placeholder:text-low focus:border-[color:var(--accent-line)] focus:bg-ink-2',
        className,
      )}
      {...rest}
    />
  )
})

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cx('flex flex-col gap-1.5', className)}>
      <span className="text-13 font-medium text-mid">{label}</span>
      {children}
      {hint ? <span className="text-12 leading-relaxed text-low">{hint}</span> : null}
    </label>
  )
}
