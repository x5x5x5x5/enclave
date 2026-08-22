import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cx } from '../../lib/cx'
import { IconButton } from '../primitives/Button'

/**
 * Every route renders inside a Screen.
 *
 * It owns the three things that used to drift screen by screen: the gutter
 * (`--gutter`, one value for the whole app), the safe-area padding at both
 * edges, and a scroll container that contains its own overscroll. A screen
 * cannot opt out, which is the point — this is why P4 fixes are systemic
 * rather than 20 different paddings.
 */
export function Screen({
  header,
  footer,
  children,
  gutter = true,
  className,
  contentClassName,
  center,
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /** Turn off only when the content manages its own horizontal padding. */
  gutter?: boolean
  className?: string
  contentClassName?: string
  /** Vertically centre short content instead of leaving a void below it. */
  center?: boolean
}) {
  return (
    <div className={cx('flex min-h-0 min-w-0 flex-1 flex-col bg-ink-0', className)}>
      {header ? (
        <div className="shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
          {header}
        </div>
      ) : null}

      <div
        className={cx(
          'scroll-area min-h-0 flex-1',
          center && 'flex flex-col justify-center',
          gutter && 'px-[var(--gutter)]',
          contentClassName,
        )}
      >
        {children}
        {!footer ? <div style={{ height: 'var(--safe-bottom)' }} /> : null}
      </div>

      {footer ? (
        <div
          className="shrink-0"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + var(--keyboard-inset))' }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The mobile header shape the whole app shares: back chevron, a title that is
 * allowed to truncate, and trailing actions that never are.
 */
export function ScreenHeader({
  title,
  subtitle,
  backTo,
  onBack,
  leading,
  trailing,
  meta,
  className,
  showBackOnDesktop,
}: {
  title: ReactNode
  subtitle?: ReactNode
  backTo?: string
  onBack?: () => void
  leading?: ReactNode
  trailing?: ReactNode
  /** Chips that sit under the title when there is no room beside it. */
  meta?: ReactNode
  className?: string
  showBackOnDesktop?: boolean
}) {
  const navigate = useNavigate()
  const back = onBack ?? (backTo ? () => navigate(backTo) : undefined)

  return (
    <header
      className={cx(
        'atm-chrome flex items-center gap-2 px-[var(--gutter)] py-2.5',
        className,
      )}
    >
      {back ? (
        <span className={cx('inline-flex', !showBackOnDesktop && 'md:hidden')}>
          <IconButton label="Back" onClick={back}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </IconButton>
        </span>
      ) : null}

      {leading}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 truncate font-display text-17 text-hi md:text-20">{title}</h1>
          {subtitle ? (
            <span className="hidden shrink-0 truncate text-13 text-low sm:inline">{subtitle}</span>
          ) : null}
        </div>
        {meta ? <div className="mt-1 flex flex-wrap items-center gap-1.5">{meta}</div> : null}
      </div>

      {trailing ? <div className="flex shrink-0 items-center gap-1">{trailing}</div> : null}
    </header>
  )
}
