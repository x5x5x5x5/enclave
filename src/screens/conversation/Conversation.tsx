import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Phone, PanelRight, Users } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import { communityById } from '../../mock/communities'
import { resolveRoom } from '../../mock/world'
import { useIsMobile } from '../../lib/useMediaQuery'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button, IconButton } from '../../components/primitives/Button'
import { Chip } from '../../components/primitives/Chip'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Popover } from '../../components/primitives/Overlay'
import { Sheet } from '../../components/primitives/Sheet'
import { PresenceThread } from '../../components/shell/Columns'
import { Composer } from '../../components/messaging/Composer'
import { MessageStream } from '../../components/messaging/MessageStream'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { IdentityChip } from '../../components/identity/IdentityChip'
import { Countdown, RetentionChip } from '../../components/time'
import { BreachBanner, FuzzedCount, SealBadge } from '../../components/trust'
import { GhostGlyph } from '../../components/trust/Glyphs'
import { useContextMask } from '../../components/shell/useChrome'
import { MemberPanel } from './MemberPanel'
import { ReportFlow, ReportSelectionBar } from '../moderation/ReportFlow'

export function Conversation({ roomId, backTo }: { roomId: string; backTo: string }) {
  const navigate = useNavigate()
  const room = resolveRoom(roomId)
  useContextMask(room?.usingMaskId, room?.subtitle ?? room?.title)
  const rightPanel = useUi((s) => s.rightPanel)
  const setRightPanel = useUi((s) => s.setRightPanel)
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const openOverlay = useUi((s) => s.openOverlay)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const typingIn = useWorld((s) => s.typingIn)
  const report = useUi((s) => s.report)
  const toggleReportSelection = useUi((s) => s.toggleReportSelection)
  const overlay = useUi((s) => s.overlay)
  const closeOverlay = useUi((s) => s.closeOverlay)
  const panelOpen = rightPanel !== null
  const isMobile = useIsMobile()

  if (!room) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <EmptyState
          title="This room doesn't exist — or you're wearing the wrong mask."
          actionLabel="Go home"
          onAction={() => navigate('/chats')}
        />
      </div>
    )
  }

  const community = room.communityId ? communityById(room.communityId) : undefined
  const isRequest = room.kind === 'request'
  const isAnnounce = room.kind === 'announce'
  const isDm = room.kind === 'dm'
  const isStaffChannel = room.history === 'none'
  const reporting = report?.roomId === roomId && report.step === 1

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink-0">
        <header className="atm-chrome flex shrink-0 items-center gap-2 px-[var(--gutter)] py-2.5">
          <span className="inline-flex md:hidden">
            <IconButton label="Back" onClick={() => navigate(backTo)}>
              <ArrowLeft size={18} strokeWidth={1.5} />
            </IconButton>
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isDm ? <MaskAvatar maskId={room.memberMaskIds?.[0] ?? ''} size={28} /> : null}
            <h1 className="min-w-0 truncate font-display text-17 text-hi md:text-15">
              {room.title}
            </h1>
            {room.subtitle ? (
              <span className="hidden shrink-0 text-13 text-low md:inline">· {room.subtitle}</span>
            ) : null}
            <SealBadge state={room.sealed ? 'sealed' : 'unsealed'} />
            {isStaffChannel ? (
              <span className="shrink-0 text-low" title="You only see messages from when you joined">
                <GhostGlyph size={14} />
              </span>
            ) : null}
            {room.retention ? <RetentionChip retention={room.retention} /> : null}
            {room.temporaryUntil ? (
              <span className="hidden sm:inline-flex">
                <Countdown until={room.temporaryUntil} prefix="closes in" />
              </span>
            ) : null}
            {room.headerNote ? (
              <span className="hidden lg:inline-flex">
                <Chip>{room.headerNote}</Chip>
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {room.memberEstimate ? (
              <span className="mr-1 hidden md:inline-flex">
                <FuzzedCount value={room.memberEstimate} />
              </span>
            ) : null}

            {/* One overflow control on a phone; the real controls on a pointer. */}
            {isMobile ? (
              <Popover
                side="bottom"
                align="end"
                trigger={({ toggle }) => (
                  <IconButton label="Room actions" onClick={toggle}>
                    <MoreVertical size={18} strokeWidth={1.5} />
                  </IconButton>
                )}
              >
                {(close) => (
                  <div className="w-52 p-1">
                    <button
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-chip px-2 text-14 text-mid"
                      onClick={() => {
                        close()
                        later('Calling from a text room')
                      }}
                    >
                      <Phone size={16} strokeWidth={1.5} /> Call
                    </button>
                    <button
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-chip px-2 text-14 text-mid"
                      onClick={() => {
                        close()
                        openOverlay('room-details', roomId)
                      }}
                    >
                      <Users size={16} strokeWidth={1.5} /> Members and details
                    </button>
                  </div>
                )}
              </Popover>
            ) : (
              <>
                <IconButton label="Call" onClick={() => later('Calling from a text room')}>
                  <Phone size={17} strokeWidth={1.5} />
                </IconButton>
                <span className="inline-flex lg:hidden">
                  <IconButton label="Members" onClick={() => openOverlay('room-details', roomId)}>
                    <Users size={17} strokeWidth={1.5} />
                  </IconButton>
                </span>
                <span className="hidden lg:inline-flex">
                  <IconButton
                    label="Right panel"
                    active={panelOpen}
                    onClick={() => setRightPanel(panelOpen ? null : 'members')}
                  >
                    <PanelRight size={17} strokeWidth={1.5} />
                  </IconButton>
                </span>
              </>
            )}
          </div>
        </header>

        <PresenceThread />

        {!room.sealed ? (
          <BreachBanner
            body={
              room.legacyBridge
                ? 'This channel is bridged from an old forum while LostEra migrates. Anything sensitive belongs in a sealed room.'
                : undefined
            }
            action={
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  toast({
                    kind: 'breach',
                    title: 'Still bridged',
                    body: 'Sealing happens when the migration finishes on Friday.',
                  })
                }
              >
                Why?
              </Button>
            }
          />
        ) : null}

        {room.topic ? (
          <p className="atm-chrome hidden shrink-0 truncate px-[var(--gutter)] py-1.5 text-12 text-low hairline-b sm:block">
            {room.topic}
          </p>
        ) : null}

        <MessageStream
          roomId={roomId}
          layout={isDm ? 'bubbles' : 'stream'}
          retention={room.retention}
          history={room.history}
          selectable={reporting}
          selectedIds={report?.selected}
          onSelect={toggleReportSelection}
          typingMaskId={
            typingIn === roomId ? room.memberMaskIds?.[0] : undefined
          }
        />

        <ReportSelectionBar />

        {reporting ? null : isRequest ? (
          <div
            className="shrink-0 px-[var(--gutter)] py-3 hairline-t"
            style={{ paddingBottom: 'calc(12px + var(--safe-bottom) + var(--keyboard-inset))' }}
          >
            <div className="rounded-card border border-[var(--line)] bg-ink-1 p-3">
              <p className="text-13 text-hi">
                Accept this request to allow messages from{' '}
                {maskById(room.requestFromMaskId ?? '').handle}.
              </p>
              <p className="mt-1 text-12 leading-relaxed text-mid">
                They see nothing about you until you do. Declining tells them nothing either.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="solid"
                  size="md"
                  onClick={() =>
                    toast({
                      kind: 'accent',
                      title: 'Request accepted',
                      body: 'They can message this mask now.',
                    })
                  }
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() =>
                    toast({ kind: 'neutral', title: 'Request declined', body: 'They are not told.' })
                  }
                >
                  Decline
                </Button>
                <Button variant="ghost" size="md" onClick={() => later('Blocking')}>
                  Block
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Composer
            roomId={roomId}
            roomTitle={room.title}
            usingMaskId={room.usingMaskId || activeMaskId}
            disabled={isAnnounce && !community?.staff}
            disabledNote="Only staff post in announcements. You will still see everything here."
          />
        )}
      </div>

      {panelOpen ? (
        <aside
          className={cx(
            'hidden min-h-0 w-[var(--panel-w)] shrink-0 flex-col border-l border-[var(--line-soft)] bg-ink-1 lg:flex',
          )}
        >
          <MemberPanel roomId={roomId} />
        </aside>
      ) : null}

      <ReportFlow />

      <Sheet
        open={overlay === 'room-details'}
        onClose={closeOverlay}
        title="Members"
        snap="full"
      >
        <MemberPanel roomId={roomId} />
      </Sheet>
    </div>
  )
}

export function ConversationIdentityBar({ maskId }: { maskId: string }) {
  const openOverlay = useUi((s) => s.openOverlay)
  return <IdentityChip maskId={maskId} onClick={() => openOverlay('mask-switcher')} />
}
