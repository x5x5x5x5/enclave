import { BellOff, Pin } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import type { ChatRow as ChatRowData } from '../../mock/types'
import { MaskAvatar, MaskStack } from '../identity/MaskAvatar'
import { EmberRing } from '../time'
import { SealGlyph } from '../trust/Glyphs'
import { Murmur } from './Murmur'

export function ChatRow({ row, to, active }: { row: ChatRowData; to: string; active?: boolean }) {
  const dimmed = row.muted

  return (
    <NavLink
      to={to}
      className={cx(
        'group flex items-center gap-2.5 rounded-card px-2 py-2 transition-colors',
        active ? 'bg-accent-soft' : 'hover:bg-ink-2',
        dimmed && 'opacity-55',
      )}
    >
      <div className="relative shrink-0">
        {row.groupMaskIds?.length ? (
          <MaskStack maskIds={row.groupMaskIds} size={22} max={3} />
        ) : (
          <MaskAvatar maskId={row.avatarMaskId} size={36} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {row.pinned ? <Pin size={11} strokeWidth={1.5} className="shrink-0 text-low" /> : null}
          <span
            className="min-w-0 flex-1 truncate font-medium text-hi"
            style={{ fontSize: 'var(--atm-list-size)', lineHeight: 'var(--atm-list-leading)' }}
          >
            {row.title}
          </span>
          {row.memberNote ? (
            <span className="mono-num shrink-0 text-12 text-low">{row.memberNote}</span>
          ) : null}
          {row.sealed ? (
            <span className="shrink-0 text-low" title="Sealed">
              <SealGlyph size={12} />
            </span>
          ) : (
            <span className="shrink-0 text-12 text-breach" title="Not sealed">
              ○
            </span>
          )}
          <span className="mono-num shrink-0 text-12 text-low">{row.time}</span>
        </div>

        <div className="mt-0.5 flex items-center gap-1.5">
          {row.typing ? (
            <span className="flex shrink-0 items-center gap-1 text-12 text-accent">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full bg-accent"
                    style={{ animation: `typing-dot 1.2s ${i * 0.15}s infinite` }}
                  />
                ))}
              </span>
              typing
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-12 text-mid">{row.snippet}</span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {row.muted ? <BellOff size={11} strokeWidth={1.5} className="text-low" /> : null}
            {row.ember ? (
              <EmberRing
                expiresAt={new Date(Date.now() + row.ember.remainingMs).toISOString()}
                totalMs={row.ember.totalMs}
                size={12}
              />
            ) : null}
          </span>
        </div>

        {row.murmur ? (
          <Murmur
            intensity={row.murmur}
            hue={maskById(row.avatarMaskId).hue}
            width={28}
            className="mt-1"
          />
        ) : null}
      </div>
    </NavLink>
  )
}
