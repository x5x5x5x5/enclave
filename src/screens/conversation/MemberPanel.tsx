import { communityOfChannel } from '../../mock/communities'
import { maskById } from '../../mock/masks'
import { resolveRoom } from '../../mock/world'
import { useUi } from '../../state/ui'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { SectionLabel } from '../../components/primitives/EmptyState'
import { FuzzedCount } from '../../components/trust'

function MemberRow({ maskId }: { maskId: string }) {
  const mask = maskById(maskId)
  const openOverlay = useUi((s) => s.openOverlay)
  return (
    <button
      onClick={() => openOverlay('space-preview', { maskId })}
      className="flex min-h-12 w-full items-center gap-2.5 rounded-chip px-2 py-1.5 text-left transition-colors hover:bg-ink-2 md:min-h-0"
      style={{ fontSize: 'var(--atm-list-size)', lineHeight: 'var(--atm-list-leading)' }}
    >
      <MaskAvatar maskId={maskId} size={26} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-hi">{mask.displayName}</span>
        {mask.bio ? <span className="block truncate text-12 text-low">{mask.bio}</span> : null}
      </span>
    </button>
  )
}

/**
 * The member list shows *this* community's mask for each person and nothing
 * else. Two rooms never leak that they share a member.
 */
export function MemberPanel({ roomId }: { roomId: string }) {
  const room = resolveRoom(roomId)
  const community = communityOfChannel(roomId)

  if (community) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 hairline-b">
          <p className="font-display text-13 text-hi">Members</p>
          <FuzzedCount value={community.memberEstimate} />
        </header>
        <div className="scroll-area min-h-0 flex-1 px-1.5 py-2">
          {community.roles.map((role) => (
            <div key={role.id} className="mb-3">
              <SectionLabel className="mb-1 px-2">
                {role.name} · {role.maskIds.length}
              </SectionLabel>
              {role.maskIds.map((id) => (
                <MemberRow key={id} maskId={id} />
              ))}
            </div>
          ))}
        </div>
        <footer className="shrink-0 px-3 py-2.5 text-12 leading-relaxed text-mid hairline-t">
          Everyone here is shown as the mask this space knows. Nothing links back to another space.
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 hairline-b">
        <p className="font-display text-13 text-hi">In this room</p>
        {room?.subtitle ? <span className="text-12 text-low">{room.subtitle}</span> : null}
      </header>
      <div className="scroll-area min-h-0 flex-1 px-1.5 py-2">
        {(room?.memberMaskIds ?? []).map((id) => (
          <MemberRow key={id} maskId={id} />
        ))}
      </div>
      {room?.headerNote ? (
        <footer className="shrink-0 px-3 py-2.5 text-12 leading-relaxed text-mid hairline-t">
          {room.headerNote}.
        </footer>
      ) : null}
    </div>
  )
}
