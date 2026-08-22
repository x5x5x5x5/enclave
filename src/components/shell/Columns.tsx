import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ============================================================================
   The three content columns. Atmospheres change their widths and whether they
   appear at all; mobile shows exactly one at a time, decided by the route.
   ========================================================================== */

export function ListColumn({
  children,
  hideOnMobile,
  className,
  width = 'var(--list-w)',
}: {
  children: ReactNode
  hideOnMobile?: boolean
  className?: string
  width?: string
}) {
  return (
    <aside
      className={cx(
        'flex min-h-0 shrink-0 flex-col border-r border-[var(--line-soft)] bg-ink-1',
        hideOnMobile ? 'hidden md:flex' : 'flex w-full md:w-[var(--col-w)]',
        className,
      )}
      style={{ ['--col-w' as string]: width, width: undefined }}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col md:w-[var(--col-w)]">{children}</div>
    </aside>
  )
}

export function MainColumn({
  children,
  className,
  centered,
  hideOnMobile,
}: {
  children: ReactNode
  className?: string
  centered?: boolean
  hideOnMobile?: boolean
}) {
  return (
    <main
      className={cx(
        'relative min-h-0 min-w-0 flex-1 flex-col bg-ink-0',
        hideOnMobile ? 'hidden md:flex' : 'flex',
        className,
      )}
    >
      {centered ? (
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col md:max-w-[var(--atm-column-max)]">
          {children}
        </div>
      ) : (
        children
      )}
    </main>
  )
}

export function PanelColumn({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <aside
      className={cx(
        'hidden min-h-0 w-[var(--panel-w)] shrink-0 flex-col border-l border-[var(--line-soft)] bg-ink-1 lg:flex',
        className,
      )}
    >
      {children}
    </aside>
  )
}

/** The 1px accent line under every conversation header. Presence, as furniture. */
export function PresenceThread({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('h-px w-full shrink-0', className)}
      style={{
        /* Half strength: felt, not read. */
        background:
          'linear-gradient(90deg, var(--accent-line), var(--accent) 22%, var(--accent-line) 60%, transparent)',
        opacity: 0.5,
        transition: 'background var(--dur-mask) var(--ease)',
      }}
    />
  )
}
