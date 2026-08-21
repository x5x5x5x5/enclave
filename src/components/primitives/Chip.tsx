import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type ChipTone = 'neutral' | 'accent' | 'ember' | 'breach' | 'mono'

const tones: Record<ChipTone, string> = {
  neutral: 'border-[var(--line)] bg-ink-2 text-mid',
  accent: 'border-[color:var(--accent-line)] bg-accent-soft text-accent',
  ember: 'border-[color:var(--ember-glow)] bg-ember-soft text-ember',
  breach: 'border-[color:var(--breach-glow)] bg-breach-soft text-breach',
  mono: 'border-[var(--line)] bg-ink-2 text-mid font-mono tracking-tight',
}

interface ChipProps {
  tone?: ChipTone
  icon?: ReactNode
  children?: ReactNode
  className?: string
  title?: string
}

export function Chip({ tone = 'neutral', icon, children, className, title }: ChipProps) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex shrink-0 items-center gap-1 rounded-chip border px-1.5 py-0.5 text-12 leading-[18px]',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ChipTone
  selected?: boolean
  icon?: ReactNode
}

export function ChipButton({
  tone = 'neutral',
  selected,
  icon,
  className,
  children,
  ...rest
}: ChipButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-chip border px-2.5 py-1 text-13 transition-colors duration-[var(--dur-micro)] max-md:min-h-9',
        selected
          ? 'border-[color:var(--accent-line)] bg-accent-soft text-accent'
          : tones[tone] + ' hover:bg-ink-3 hover:text-hi',
        className,
      )}
      aria-pressed={selected}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
