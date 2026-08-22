import { NavLink } from 'react-router-dom'
import { Hash, Megaphone, Volume2 } from 'lucide-react'
import { cx } from '../../lib/cx'
import type { Channel } from '../../mock/types'
import { voiceRoom } from '../../mock/voice'
import { useWorld } from '../../state/world'
import { MaskAvatar } from '../identity/MaskAvatar'
import { Countdown, RetentionChip } from '../time'
import { GhostGlyph, HourglassGlyph, SealGlyph } from '../trust/Glyphs'
import { Waveform } from '../voice/Waveform'

/**
 * One row, every glyph the channel needs: seal, ghost (no history), hourglass
 * (temporary room), retention chip. Voice rooms spill their occupants out.
 */
export function ChannelRow({
  channel,
  to,
  active,
}: {
  channel: Channel
  to: string
  active?: boolean
}) {
  const voice = useWorld((s) => s.voice)
  const live = channel.kind === 'voice' ? voice.find((r) => r.channelId === channel.id) : undefined
  const fallback = channel.kind === 'voice' ? voiceRoom(channel.id) : undefined
  const room = live ?? fallback
  const occupants = room?.occupants ?? []
  const speaking = occupants.some((o) => o.speaking)

  const Icon =
    channel.kind === 'voice' ? Volume2 : channel.kind === 'announce' ? Megaphone : Hash

  return (
    <div className="px-1.5">
      <NavLink
        to={to}
        className={cx(
          'group flex min-h-12 items-center gap-2 rounded-chip px-2 py-[var(--atm-row-pad)] transition-colors md:min-h-0',
          active ? 'bg-accent-soft text-accent' : 'text-mid hover:bg-ink-2 hover:text-hi',
          channel.muted && 'opacity-55',
        )}
        style={{ fontSize: 'var(--atm-list-size)', lineHeight: 'var(--atm-list-leading)' }}
      >
        <span className="flex w-6 shrink-0 justify-center">
          <Icon size={15} strokeWidth={1.5} className="opacity-70" />
        </span>
        <span className="min-w-0 flex-1 truncate">{channel.name}</span>

        <span className="flex shrink-0 items-center gap-1">
          {speaking ? <Waveform bars={3} size={10} /> : null}
          {channel.temporary ? (
            <span className="text-low" title="Temporary room">
              <HourglassGlyph size={12} />
            </span>
          ) : null}
          {channel.history === 'none' ? (
            <span className="text-low" title="No history before you joined">
              <GhostGlyph size={12} />
            </span>
          ) : null}
          {channel.sealed ? (
            <span className="text-low opacity-70" title="Sealed">
              <SealGlyph size={12} />
            </span>
          ) : (
            <span className="text-12 text-breach" title="Not sealed">
              ○
            </span>
          )}
          {channel.retention ? (
            <RetentionChip retention={channel.retention} withGlyph={false} />
          ) : null}
        </span>
      </NavLink>

      {channel.temporary ? (
        <div className="px-8 pb-1">
          <Countdown until={channel.temporary.expiresAt} prefix="closes in" tone="mid" />
        </div>
      ) : null}

      {occupants.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 px-8 pb-1.5 pt-0.5">
          {occupants.map((o) => (
            <span key={o.maskId} className={cx(o.muted && 'opacity-50')}>
              <MaskAvatar maskId={o.maskId} size={20} presence={false} speaking={o.speaking} />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
