import { Plus } from 'lucide-react'
import { BRAND } from '../../../config/brand'
import { OWN_MASKS } from '../../../mock/masks'
import { HUE_LABEL, spacesUsingMask } from '../../../mock/world'
import type { Presence } from '../../../mock/types'
import { useApp } from '../../../state/app'
import { useUi } from '../../../state/ui'
import { Button } from '../../../components/primitives/Button'
import { Segmented, Toggle } from '../../../components/primitives/Controls'
import { MaskAvatar } from '../../../components/identity/MaskAvatar'
import { Group, Panel, Rowed } from './Shared'

const PRESENCES: { id: Presence; label: string }[] = [
  { id: 'online', label: 'Online' },
  { id: 'away', label: 'Away' },
  { id: 'invisible', label: 'Invisible' },
]

export function MasksSection() {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const setActiveMask = useApp((s) => s.setActiveMask)
  const presence = useApp((s) => s.presence)
  const setPresence = useApp((s) => s.setPresence)
  const requireRequest = useApp((s) => s.requireRequest)
  const setRequireRequest = useApp((s) => s.setRequireRequest)
  const later = useUi((s) => s.later)

  return (
    <>
      <Group
        title="Your masks"
        note="Each mask is a separate person as far as every space is concerned. Presence is set per mask, not per account."
      >
        {OWN_MASKS.map((mask) => {
          const spaces = spacesUsingMask(mask.id)
          const current = presence[mask.id] ?? mask.presence
          return (
            <Panel key={mask.id}>
              <div className="flex flex-wrap items-start gap-3">
                <MaskAvatar mask={{ ...mask, presence: current }} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-15 text-hi">{mask.displayName}</span>
                    <span className="mono-num text-12 text-low">{mask.handle}</span>
                    <span
                      className="inline-flex items-center gap-1 text-12 text-low"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: `var(--hue-${mask.hue})` }}
                      />
                      {HUE_LABEL[mask.hue]}
                    </span>
                  </div>
                  {mask.bio ? <p className="mt-1 text-13 text-mid">{mask.bio}</p> : null}
                  <p className="mt-1 text-12 text-low">
                    {spaces.length ? spaces.join(' · ') : 'Not used in any space yet'}
                  </p>
                </div>
                {mask.id === activeMaskId ? (
                  <span className="rounded-chip border border-[color:var(--accent-line)] px-2 py-0.5 text-12 text-accent">
                    Wearing
                  </span>
                ) : (
                  <Button variant="quiet" size="sm" onClick={() => setActiveMask(mask.id)}>
                    Wear
                  </Button>
                )}
              </div>
              <div className="mt-3 border-t border-[var(--line-soft)] pt-3">
                <Rowed
                  label="Presence"
                  note="Other masks of yours are unaffected."
                  control={
                    <Segmented
                      size="sm"
                      ariaLabel={`Presence for ${mask.displayName}`}
                      options={PRESENCES}
                      value={current}
                      onChange={(p) => setPresence(mask.id, p)}
                    />
                  }
                />
              </div>
            </Panel>
          )
        })}
        <Button
          variant="outline"
          size="md"
          icon={<Plus size={15} strokeWidth={1.5} />}
          onClick={() => later('Making a new mask')}
        >
          New mask
        </Button>
        <p className="text-12 leading-relaxed text-mid">{BRAND.maskNote}</p>
      </Group>

      <Group title="Reaching you">
        <Panel>
          <Toggle
            checked={requireRequest}
            onChange={setRequireRequest}
            label="Require a request before direct messages"
            description="Strangers ask first. Until you accept, they cannot see presence, read receipts, or whether the message arrived."
          />
        </Panel>
      </Group>
    </>
  )
}
