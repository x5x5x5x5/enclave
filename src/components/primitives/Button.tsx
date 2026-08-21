import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../lib/cx'

export type ButtonVariant = 'solid' | 'ghost' | 'quiet' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  trailing?: ReactNode
  full?: boolean
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-13 gap-1.5 rounded-chip',
  md: 'h-9 px-3.5 text-14 gap-2 rounded-chip',
  lg: 'h-11 px-5 text-15 gap-2 rounded-card',
}

const variants: Record<ButtonVariant, string> = {
  // The send button wears the mask. So does every primary action.
  solid:
    'bg-accent text-[var(--ink-0)] font-medium hover:brightness-110 active:brightness-95 disabled:opacity-40',
  ghost:
    'text-mid hover:text-hi hover:bg-ink-2 active:bg-ink-3 disabled:opacity-40',
  quiet:
    'bg-ink-2 text-hi hover:bg-ink-3 border border-[var(--line)] disabled:opacity-40',
  outline:
    'text-accent border border-[var(--accent-line)] hover:bg-accent-soft disabled:opacity-40',
  danger:
    'bg-breach-soft text-breach border border-[color:var(--breach-glow)] hover:bg-[color:var(--breach-glow)] hover:text-hi disabled:opacity-40',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'quiet', size = 'md', icon, trailing, full, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap transition-[background-color,color,filter,border-color] duration-[var(--dur-micro)] ease-enclave',
        'max-md:min-h-11',
        sizes[size],
        variants[variant],
        full && 'w-full',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {trailing}
    </button>
  )
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  active?: boolean
}

const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-7 w-7 rounded-chip',
  md: 'h-9 w-9 rounded-chip',
  lg: 'h-11 w-11 rounded-card',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', active, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-[var(--dur-micro)] ease-enclave',
        'max-md:min-h-11 max-md:min-w-11',
        iconSizes[size],
        variants[variant],
        active && 'bg-accent-soft text-accent',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
