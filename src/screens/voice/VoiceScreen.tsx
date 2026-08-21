import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Headphones, HeadphoneOff, Info, Mic, MicOff, MonitorUp, PhoneOff } from 'lucide-react'
import { cx } from '../../lib/cx'
import { channelById, communityById } from '../../mock/communities'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button, IconButton } from '../../components/primitives/Button'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Sheet } from '../../components/primitives/Overlay'
import { PresenceThread } from '../../components/shell/Columns'
import { useAtmosphere } from '../../components/shell/useChrome'
import { Countdown } from '../../components/time'
import { SealBadge } from '../../components/trust'
import { LatencyDot, OccupantPill, RelayChip, RelayDiagram } from '../../components/voice'

export function VoiceScreen() {
  const { communityId, channelId } = useParams()
  const navigate = useNavigate()
  const community = communityId ? communityById(communityId) : undefined
  const channel = channelId ? channelById(channelId) : undefined
  const voice = useWorld((s) => s.voice)
  const joinVoice = useWorld((s) => s.joinVoice)
  const leaveVoice = useWorld((s) => s.leaveVoice)
  const toggleMute = useWorld((s) => s.toggleMute)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const [details, setDetails] = useState(false)
  const [deafened, setDeafened] = useState(false)

  useAtmosphere(community?.atmosphere)

  const room = voice.find((r) => r.channelId === channelId)
  const youMask = community?.usingMaskId ?? activeMaskId
  const you = room?.occupants.find((o) => o.maskId === youMask)

  /* Joining is the point of opening the room. Leaving is a button, not a route. */
  useEffect(() => {
    if (!channelId || !youMask) return
    joinVoice(channelId, youMask)
  }, [channelId, youMask, joinVoice])

  if (!community || !channel || channel.kind !== 'voice') return <Navigate to="/chats" replace />

  const occupants = room?.occupants ?? []

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink-0">
      <header className="atm-chrome flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 md:px-5">
        <IconButton
          label="Back"
          onClick={() => navigate(`/space/${community.id}`)}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </IconButton>
        <h1 className="font-display text-15 text-hi">{channel.name}</h1>
        <span className="text-13 text-low">· {community.name}</span>
        <SealBadge label="sealed" />
        {room ? <RelayChip relay={room.relay} /> : null}
        {room ? <LatencyDot ms={room.latencyMs} /> : null}
        {channel.temporary ? (
          <Countdown until={channel.temporary.expiresAt} prefix="closes in" />
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Room details" onClick={() => setDetails(true)}>
            <Info size={17} strokeWidth={1.5} />
          </IconButton>
        </div>
      </header>

      <PresenceThread />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-4xl">
          {channel.temporary ? (
            <p className="mb-5 rounded-card border border-[color:var(--ember-glow)] bg-ember-soft px-3 py-2 text-13 text-ember">
              Room closes when everyone leaves. Nothing here is kept.
            </p>
          ) : null}

          {occupants.length === 0 ? (
            <EmptyState
              title="Nobody is here yet"
              body="Sealed and waiting. The room stays open as long as this space does."
              actionLabel="Invite from the palette"
              onAction={() => useUi.getState().openOverlay('command-palette')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {occupants.map((o) => (
                <OccupantPill
                  key={o.maskId}
                  maskId={o.maskId}
                  speaking={o.speaking}
                  muted={o.muted}
                  you={o.maskId === youMask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="shrink-0 px-4 py-3 hairline-t">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
          <Button
            variant={you?.muted ? 'danger' : 'quiet'}
            size="md"
            icon={
              you?.muted ? (
                <MicOff size={16} strokeWidth={1.5} />
              ) : (
                <Mic size={16} strokeWidth={1.5} />
              )
            }
            onClick={() => channelId && toggleMute(channelId, youMask)}
          >
            {you?.muted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant={deafened ? 'danger' : 'quiet'}
            size="md"
            icon={
              deafened ? (
                <HeadphoneOff size={16} strokeWidth={1.5} />
              ) : (
                <Headphones size={16} strokeWidth={1.5} />
              )
            }
            onClick={() => setDeafened((d) => !d)}
          >
            {deafened ? 'Undeafen' : 'Deafen'}
          </Button>
          <Button
            variant="quiet"
            size="md"
            icon={<MonitorUp size={16} strokeWidth={1.5} />}
            onClick={() => later('Screen sharing')}
          >
            Screen
          </Button>
          <Button
            variant="danger"
            size="md"
            icon={<PhoneOff size={16} strokeWidth={1.5} />}
            onClick={() => {
              if (channelId) leaveVoice(channelId, youMask)
              toast({ kind: 'neutral', title: `Left ${channel.name}` })
              navigate(`/space/${community.id}`)
            }}
          >
            Leave
          </Button>
        </div>
        <p className={cx('mt-2 text-center text-12 text-low')}>
          Sealed end to end. Nobody outside this room can hear it, including the relay.
        </p>
      </footer>

      <Sheet open={details} onClose={() => setDetails(false)} title="Room details">
        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="text-12 uppercase tracking-[0.08em] text-low">Sealed</p>
            <p className="mt-1 text-13 leading-relaxed text-mid">
              Audio is sealed end to end for everyone in the room. Keys rotate when people join or
              leave, so nobody carries a copy out with them.
            </p>
          </div>
          {room ? <RelayDiagram relay={room.relay} /> : null}
          <div>
            <p className="text-12 uppercase tracking-[0.08em] text-low">Connection</p>
            <div className="mt-1.5 flex items-center gap-3">
              {room ? <LatencyDot ms={room.latencyMs} /> : null}
              {room ? <RelayChip relay={room.relay} /> : null}
            </div>
          </div>
          <p className="text-12 leading-relaxed text-low">
            IPs are not shared between participants.
          </p>
        </div>
      </Sheet>
    </div>
  )
}
