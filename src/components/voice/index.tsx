import { MicOff } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import { MaskAvatar } from '../identity/MaskAvatar'
import { Chip } from '../primitives/Chip'
import { Tooltip } from '../primitives/Overlay'
import { RelayGlyph } from '../trust/Glyphs'
import { Waveform } from './Waveform'

export { Waveform } from './Waveform'

/* -- OccupantPill ---------------------------------------------------------- */

export function OccupantPill({
  maskId,
  speaking,
  muted,
  you,
}: {
  maskId: string
  speaking: boolean
  muted: boolean
  you?: boolean
}) {
  const mask = maskById(maskId)
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-2 rounded-card border px-4 py-5 transition-colors duration-[var(--dur-std)]',
        speaking
          ? 'border-[color:var(--accent-line)] bg-accent-soft'
          : 'border-[var(--line)] bg-ink-1',
        muted && 'opacity-70',
      )}
    >
      <div className="relative">
        <MaskAvatar maskId={maskId} size={56} presence={false} speaking={speaking} />
        {muted ? (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--line)] bg-ink-2 text-low">
            <MicOff size={11} strokeWidth={1.8} />
          </span>
        ) : null}
      </div>
      <div className="text-center">
        <p className="text-13 text-hi">
          {mask.displayName}
          {you ? <span className="text-low"> · you</span> : null}
        </p>
        <div className="mt-1 flex h-3.5 items-center justify-center">
          {speaking ? (
            <Waveform bars={3} size={12} />
          ) : (
            <span className="text-12 text-low">{muted ? 'muted' : 'listening'}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* -- RelayChip ------------------------------------------------------------- */

export function RelayChip({ relay }: { relay: 'self-hosted' | 'community' }) {
  return (
    <Tooltip
      side="bottom"
      label={
        relay === 'self-hosted'
          ? 'Audio passes through a relay you run. It carries bytes it cannot read.'
          : 'Audio passes through a relay this community runs. It carries bytes it cannot read.'
      }
    >
      <Chip tone="neutral" icon={<RelayGlyph size={12} />}>
        {relay === 'self-hosted' ? 'via your relay' : 'via community relay'}
      </Chip>
    </Tooltip>
  )
}

/* -- LatencyDot ------------------------------------------------------------ */

export function LatencyDot({ ms }: { ms: number }) {
  const tone = ms < 25 ? 'var(--hue-moss)' : ms < 60 ? 'var(--ember)' : 'var(--breach)'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      <span className="mono-num text-12 text-mid">{ms}ms</span>
    </span>
  )
}

/* -- Relay route diagram --------------------------------------------------- */

export function RelayDiagram({ relay }: { relay: 'self-hosted' | 'community' }) {
  return (
    <div className="rounded-card border border-[var(--line)] bg-ink-1 p-4">
      <svg viewBox="0 0 260 56" className="w-full" role="img" aria-label="You, relay, peers">
        <line x1="34" y1="28" x2="130" y2="28" stroke="var(--line)" strokeWidth="1.5" />
        <line x1="130" y1="28" x2="226" y2="28" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="34" cy="28" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="34" cy="28" r="3" fill="var(--accent)" />
        <circle cx="130" cy="28" r="9" fill="none" stroke="var(--text-mid)" strokeWidth="1.5" />
        <circle cx="226" cy="28" r="9" fill="none" stroke="var(--text-mid)" strokeWidth="1.5" />
        <circle cx="226" cy="28" r="3" fill="var(--text-mid)" />
        <text x="34" y="52" textAnchor="middle" fill="var(--text-low)" fontSize="9" fontFamily="var(--font-ui)">
          you
        </text>
        <text x="130" y="52" textAnchor="middle" fill="var(--text-low)" fontSize="9" fontFamily="var(--font-ui)">
          {relay === 'self-hosted' ? 'your relay' : 'community relay'}
        </text>
        <text x="226" y="52" textAnchor="middle" fill="var(--text-low)" fontSize="9" fontFamily="var(--font-ui)">
          everyone else
        </text>
      </svg>
      <p className="mt-3 text-12 leading-relaxed text-mid">
        The relay moves audio between you and the room. It never holds a key, so it never hears
        anything. IPs are not shared between participants.
      </p>
    </div>
  )
}
