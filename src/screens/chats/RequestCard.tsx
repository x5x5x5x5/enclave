import { useState } from 'react'
import { maskById } from '../../mock/masks'
import type { ChatRow } from '../../mock/types'
import { useUi } from '../../state/ui'
import { Button } from '../../components/primitives/Button'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { SealGlyph } from '../../components/trust/Glyphs'

/** A gated request. They learn nothing about you until you say yes. */
export function RequestCard({ row }: { row: ChatRow }) {
  const mask = maskById(row.avatarMaskId)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)
  const [state, setState] = useState<'open' | 'accepted' | 'declined'>('open')

  if (state !== 'open') {
    return (
      <div className="rounded-card border border-[var(--line)] bg-ink-1 p-3 text-13 text-mid">
        {state === 'accepted'
          ? 'Request accepted. This mask can message you now.'
          : 'Request declined. They are not told.'}
      </div>
    )
  }

  return (
    <div className="rounded-card border border-[var(--line)] bg-ink-1 p-3">
      <div className="flex items-start gap-3">
        <MaskAvatar maskId={mask.id} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-14 font-medium text-hi">{mask.displayName}</span>
            <span className="mono-num truncate text-12 text-low">{mask.handle}</span>
            <span className="text-low">
              <SealGlyph size={12} />
            </span>
          </div>
          <p className="mt-1 text-13 leading-relaxed text-mid">{row.snippet}</p>
          <p className="mt-1.5 text-12 leading-relaxed text-low">
            Accept request to allow messages. Until then they cannot see your presence, your spaces,
            or whether you read this.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="solid"
          size="sm"
          onClick={() => {
            setState('accepted')
            toast({ kind: 'accent', title: 'Request accepted' })
          }}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setState('declined')
            toast({ kind: 'neutral', title: 'Request declined', body: 'They are not told.' })
          }}
        >
          Decline
        </Button>
        <Button variant="ghost" size="sm" onClick={() => later('Blocking')}>
          Block
        </Button>
      </div>
    </div>
  )
}
