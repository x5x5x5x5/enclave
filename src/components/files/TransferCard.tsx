import { Laptop, Pause, Play, RotateCw, Smartphone } from 'lucide-react'
import { cx } from '../../lib/cx'
import type { Media } from '../../mock/types'
import { useWorld } from '../../state/world'
import { Chip } from '../primitives/Chip'
import { Tooltip } from '../primitives/Overlay'
import { RelayGlyph } from '../trust/Glyphs'

/**
 * Peer-to-peer transfer. Direct is the happy path; a relay is a fallback that
 * carries bytes it cannot read. Both say so plainly, and progress is mono.
 */
export function TransferCard({ media, messageId }: { media: Media; messageId: string }) {
  const setTransferState = useWorld((s) => s.setTransferState)
  const p2p = media.p2p
  if (!p2p) return null

  const pct = Math.round(p2p.progress * 100)
  const failed = p2p.state === 'failed'
  const done = p2p.state === 'done'
  const paused = p2p.state === 'paused'
  const relay = p2p.route === 'relay'

  return (
    <div
      className={cx(
        'rounded-[8px] border px-3 py-2.5',
        failed
          ? 'border-[color:var(--breach-glow)] bg-breach-soft'
          : 'border-[var(--line)] bg-ink-2',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border',
            failed
              ? 'border-[color:var(--breach-glow)] text-breach'
              : relay
                ? 'border-[var(--line)] text-mid'
                : 'border-[color:var(--accent-line)] text-accent',
          )}
        >
          {relay ? <RelayGlyph size={17} /> : <Laptop size={16} strokeWidth={1.5} />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-13 text-hi">{media.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-12 text-mid">
            {failed ? (
              <span className="text-breach">Transfer failed — the peer went offline.</span>
            ) : done ? (
              <span>Delivered · {media.size}</span>
            ) : relay ? (
              <>
                <span>Peer offline — handing to relay, resumes automatically</span>
              </>
            ) : (
              <>
                <Smartphone size={11} strokeWidth={1.5} className="text-low" />
                <span>Device to device · encrypted · direct</span>
              </>
            )}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className={cx(
                  'h-full rounded-full transition-[width] duration-500 ease-linear',
                  failed ? 'bg-breach' : paused ? 'bg-[var(--text-low)]' : relay ? 'bg-ember' : 'bg-accent',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="mono-num shrink-0 text-12 text-low">
              {pct}% · {p2p.throughput ?? '—'}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Tooltip
              side="top"
              label="Large files travel directly between devices when possible. Relays never see contents."
            >
              <Chip tone={relay ? 'ember' : 'accent'}>
                {relay ? 'via relay' : 'direct'}
              </Chip>
            </Tooltip>
            {p2p.peerDevice ? <Chip tone="mono">{p2p.peerDevice}</Chip> : null}
            {p2p.resumable && !done ? <Chip>resumable</Chip> : null}

            <div className="ml-auto flex items-center gap-1">
              {failed ? (
                <button
                  onClick={() => setTransferState(messageId, 'sending')}
                  className="inline-flex items-center gap-1 rounded-chip border border-[color:var(--breach-glow)] px-2 py-0.5 text-12 text-breach hover:bg-[color:var(--breach-glow)] hover:text-hi"
                >
                  <RotateCw size={11} strokeWidth={1.5} /> Retry
                </button>
              ) : done ? null : (
                <button
                  onClick={() => setTransferState(messageId, paused ? 'sending' : 'paused')}
                  className="inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-12 text-mid hover:bg-ink-3 hover:text-hi"
                >
                  {paused ? (
                    <>
                      <Play size={11} strokeWidth={1.5} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={11} strokeWidth={1.5} /> Pause
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
