import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useUi } from '../../state/ui'
import type { ToastKind } from '../../state/ui'

const tones: Record<ToastKind, string> = {
  neutral: 'border-[var(--line)] bg-ink-2',
  accent: 'border-[color:var(--accent-line)] bg-ink-2',
  breach: 'border-[color:var(--breach-glow)] bg-ink-2',
}

const bars: Record<ToastKind, string> = {
  neutral: 'bg-[var(--text-low)]',
  accent: 'bg-accent',
  breach: 'bg-breach',
}

export function ToastHost() {
  const toasts = useUi((s) => s.toasts)
  const dismiss = useUi((s) => s.dismissToast)
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 max-md:bottom-20">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
            className={cx(
              'pointer-events-auto flex w-full max-w-md items-start gap-3 overflow-hidden rounded-card border pl-0 pr-2 shadow-modal',
              tones[t.kind],
            )}
          >
            <span className={cx('w-0.5 self-stretch', bars[t.kind])} />
            <div className="min-w-0 flex-1 py-2.5">
              <p
                className={cx(
                  'text-13 font-medium',
                  t.kind === 'breach' ? 'text-breach' : 'text-hi',
                )}
              >
                {t.title}
              </p>
              {t.body ? <p className="mt-0.5 text-12 leading-relaxed text-mid">{t.body}</p> : null}
            </div>
            {t.actionLabel ? (
              <button
                onClick={() => {
                  t.onAction?.()
                  dismiss(t.id)
                }}
                className="my-2 shrink-0 rounded-chip px-2 py-1 text-12 text-accent hover:bg-accent-soft"
              >
                {t.actionLabel}
              </button>
            ) : null}
            <button
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="my-2.5 shrink-0 text-low transition-colors hover:text-mid"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
