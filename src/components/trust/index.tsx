import { Check, Copy, Info } from 'lucide-react'
import { useState } from 'react'
import { cx } from '../../lib/cx'
import { truncateMiddle } from '../../lib/hash'
import { Chip } from '../primitives/Chip'
import { Popover, Tooltip } from '../primitives/Overlay'
import { GhostGlyph, HourglassGlyph, RelayGlyph, SealGlyph, ZkGlyph } from './Glyphs'

export { GhostGlyph, HourglassGlyph, RelayGlyph, SealGlyph, ZkGlyph }

/* -- SealBadge ------------------------------------------------------------- */

export type SealState = 'sealed' | 'relay-only' | 'unsealed'

export function SealBadge({
  state = 'sealed',
  label,
  className,
}: {
  state?: SealState
  label?: string
  className?: string
}) {
  if (state === 'unsealed') {
    return (
      <Chip tone="breach" className={className} title="This room is not sealed.">
        Not sealed
      </Chip>
    )
  }
  return (
    <Tooltip
      side="bottom"
      label={
        state === 'relay-only'
          ? 'Sealed end to end. A relay carries the traffic but cannot read it.'
          : 'Sealed end to end. Only the people in this room hold the keys.'
      }
    >
      <span
        className={cx(
          'inline-flex items-center gap-1 text-mid',
          className,
        )}
      >
        <SealGlyph size={14} />
        {label ? <span className="text-12">{label}</span> : null}
      </span>
    </Tooltip>
  )
}

/** Absence screams. This is the only alarm surface in the product. */
export function BreachBanner({
  title = 'This room is not sealed. The host can read messages.',
  body,
  action,
}: {
  title?: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[color:var(--breach-glow)] bg-breach-soft px-4 py-2.5">
      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-breach" />
      <div className="min-w-0 flex-1">
        <p className="text-13 font-medium text-breach">{title}</p>
        {body ? <p className="mt-0.5 text-12 leading-relaxed text-mid">{body}</p> : null}
      </div>
      {action}
    </div>
  )
}

/* -- ZkBadge --------------------------------------------------------------- */

export function ZkBadge({
  label,
  note = 'proven privately',
  className,
}: {
  label: string
  note?: string
  className?: string
}) {
  return (
    <Popover
      side="bottom"
      align="start"
      className={className}
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 rounded-chip border border-[var(--line)] bg-ink-2 px-2.5 py-1 text-12 text-mid transition-colors hover:border-[color:var(--accent-line)] hover:text-hi max-md:min-h-11"
        >
          <ZkGlyph size={13} />
          <span>{label}</span>
          <span className="text-low">· {note}</span>
        </button>
      )}
    >
      <div className="max-w-72 p-2">
        <p className="text-13 font-medium text-hi">Verified cryptographically.</p>
        <p className="mt-1 text-12 leading-relaxed text-mid">
          No document, birthday, or identity was shared. The space learned one fact and nothing
          else.
        </p>
      </div>
    </Popover>
  )
}

/* -- FrankingHash ---------------------------------------------------------- */

export function FrankingHash({
  tag,
  className,
  full,
  label,
}: {
  tag: string
  className?: string
  full?: boolean
  label?: string
}) {
  const [copied, setCopied] = useState(false)
  // Middle truncation keeps both ends, which is how a hash is checked.
  const shown = full ? tag : truncateMiddle(tag.replace(/\s+/g, ''))

  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(tag).catch(() => {})
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
      title="Copy proof"
      className={cx(
        'group inline-flex items-center gap-1 rounded-[4px] px-1.5 font-mono text-12 tracking-tight text-low transition-colors hover:bg-ink-2 hover:text-mid max-md:min-h-11',
        className,
      )}
    >
      {label ? <span className="font-ui">{label}</span> : null}
      <span className="whitespace-nowrap">{shown}</span>
      {copied ? (
        <Check size={11} strokeWidth={2} className="text-accent" />
      ) : (
        <Copy size={11} strokeWidth={1.5} className="opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

/* -- Fuzzed counts --------------------------------------------------------- */

export function FuzzedCount({ value, className }: { value: string; className?: string }) {
  return (
    <Tooltip
      side="bottom"
      label="Counts are fuzzed on purpose. Exact numbers make people easier to track."
    >
      <span className={cx('mono-num inline-flex items-center gap-1 text-12 text-low', className)}>
        {value}
        <Info size={11} strokeWidth={1.5} className="opacity-60" />
      </span>
    </Tooltip>
  )
}
