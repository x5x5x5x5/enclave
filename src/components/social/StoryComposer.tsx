import { useState } from 'react'
import { Image, Mic, Type } from 'lucide-react'
import { DAY, ahead } from '../../lib/time'
import { maskById } from '../../mock/masks'
import { COMMUNITIES } from '../../mock/communities'
import { OWN_MASKS } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button } from '../primitives/Button'
import { ChipButton } from '../primitives/Chip'
import { Modal, Popover } from '../primitives/Overlay'
import { Textarea } from '../primitives/Input'
import { SectionLabel } from '../primitives/EmptyState'
import { MaskAvatar } from '../identity/MaskAvatar'

type Kind = 'text' | 'image' | 'voice'
type Expiry = '24h' | '3v' | 'once'

export function StoryComposer() {
  const open = useUi((s) => s.overlay) === 'story-composer'
  const closeOverlay = useUi((s) => s.closeOverlay)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)
  const addStory = useWorld((s) => s.addStory)
  const activeMaskId = useApp((s) => s.activeMaskId)

  const [kind, setKind] = useState<Kind>('text')
  const [body, setBody] = useState('')
  const [maskId, setMaskId] = useState(activeMaskId)
  const [scope, setScope] = useState('Close friends')
  const [expiry, setExpiry] = useState<Expiry>('24h')

  const mask = maskById(maskId)
  const audienceLabel = `${scope} · as ${mask.displayName}`

  const scopes = [
    'Close friends',
    'Contacts',
    ...COMMUNITIES.map((c) => c.name),
    'LostEra · Raiders',
  ]

  return (
    <Modal
      open={open}
      onClose={closeOverlay}
      title="New story"
      subtitle="Stories are scoped to one mask and one audience. Both are visible before you post."
      footer={
        <>
          <Button variant="ghost" onClick={closeOverlay}>
            Cancel
          </Button>
          <Button
            variant="solid"
            disabled={!body.trim() && kind === 'text'}
            onClick={() => {
              addStory({
                id: `own-${Date.now()}`,
                authorMaskId: maskId,
                kind,
                postedAt: new Date().toISOString(),
                expiresAt: ahead(DAY),
                audience: { label: audienceLabel },
                viewOnce: expiry === 'once',
                body: body.trim() || 'Posted without words.',
                seenBy: '~0',
              })
              setBody('')
              closeOverlay()
              toast({
                kind: 'accent',
                title: 'Story posted',
                body: `${audienceLabel} · ${
                  expiry === '24h' ? 'expires in 24h' : expiry === '3v' ? 'clears after 3 views' : 'view-once'
                }`,
              })
            }}
          >
            Post story
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(
            [
              { id: 'text', label: 'Text', icon: <Type size={14} strokeWidth={1.5} /> },
              { id: 'image', label: 'Photo', icon: <Image size={14} strokeWidth={1.5} /> },
              { id: 'voice', label: 'Voice', icon: <Mic size={14} strokeWidth={1.5} /> },
            ] as const
          ).map((o) => (
            <ChipButton
              key={o.id}
              icon={o.icon}
              selected={kind === o.id}
              onClick={() => {
                setKind(o.id)
                if (o.id !== 'text') later(`Adding ${o.label.toLowerCase()} to a story`)
              }}
            >
              {o.label}
            </ChipButton>
          ))}
        </div>

        <Textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Say something that is allowed to disappear."
        />

        <div>
          <SectionLabel className="mb-1.5">Audience</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Popover
              side="bottom"
              align="start"
              trigger={({ toggle }) => (
                <ChipButton
                  onClick={toggle}
                  icon={<MaskAvatar maskId={maskId} size={16} presence={false} ring={false} />}
                  selected
                >
                  {audienceLabel}
                </ChipButton>
              )}
            >
              {(close) => (
                <div className="w-64 p-1">
                  <SectionLabel className="px-2 py-1">Post as</SectionLabel>
                  {OWN_MASKS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaskId(m.id)}
                      className="flex w-full items-center gap-2 rounded-chip px-2 py-1.5 text-13 text-mid transition-colors hover:bg-ink-3 hover:text-hi"
                    >
                      <MaskAvatar maskId={m.id} size={20} presence={false} />
                      {m.displayName}
                      {m.id === maskId ? <span className="ml-auto text-accent">·</span> : null}
                    </button>
                  ))}
                  <SectionLabel className="px-2 pb-1 pt-2">Who sees it</SectionLabel>
                  {scopes.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setScope(s)
                        close()
                      }}
                      className="flex w-full items-center gap-2 rounded-chip px-2 py-1.5 text-13 text-mid transition-colors hover:bg-ink-3 hover:text-hi"
                    >
                      {s}
                      {s === scope ? <span className="ml-auto text-accent">·</span> : null}
                    </button>
                  ))}
                </div>
              )}
            </Popover>
          </div>
          <p className="mt-1.5 text-12 leading-relaxed text-low">
            Only this mask is shown. Nobody outside this audience can tell the story exists.
          </p>
        </div>

        <div>
          <SectionLabel className="mb-1.5">Expires</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: '24h', label: '24 hours' },
                { id: '3v', label: '3 views' },
                { id: 'once', label: 'View once' },
              ] as const
            ).map((o) => (
              <ChipButton key={o.id} selected={expiry === o.id} onClick={() => setExpiry(o.id)}>
                {o.label}
              </ChipButton>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
