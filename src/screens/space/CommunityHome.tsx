import { useNavigate } from 'react-router-dom'
import { CalendarClock, ShieldCheck, Volume2 } from 'lucide-react'
import { cx } from '../../lib/cx'
import { clock } from '../../lib/time'
import { maskById } from '../../mock/masks'
import type { Community } from '../../mock/types'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button } from '../../components/primitives/Button'
import { Card, SectionLabel } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { IdentityChip } from '../../components/identity/IdentityChip'
import { MainColumn } from '../../components/shell/Columns'
import { Countdown, RetentionChip } from '../../components/time'
import { FuzzedCount } from '../../components/trust'
import { GhostGlyph, SealGlyph, ZkGlyph } from '../../components/trust/Glyphs'
import { Waveform } from '../../components/voice/Waveform'

const ATMOSPHERE_NOTE: Record<Community['atmosphere'], string> = {
  hall: 'A hall. Dense, loud, everything within reach.',
  studio: 'A studio. Fewer people, more room to work.',
  salon: 'A salon. The shell goes quiet so the reading does not have to.',
}

export function CommunityHome({ community }: { community: Community }) {
  const navigate = useNavigate()
  const openOverlay = useUi((s) => s.openOverlay)
  const messages = useWorld((s) => s.messages)
  const voice = useWorld((s) => s.voice)

  const scheduled = community.channels
    .filter((c) => c.scheduledPost)
    .map((c) => ({ channel: c, post: c.scheduledPost! }))

  const voiceChannels = community.channels.filter((c) => c.kind === 'voice')
  const textChannels = community.channels.filter((c) => c.kind !== 'voice')

  return (
    <MainColumn centered>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8">
          <header>
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-modal border font-display text-17"
              style={{
                borderColor: `rgb(var(--hue-${community.hue}-rgb) / .4)`,
                background: `rgb(var(--hue-${community.hue}-rgb) / .12)`,
                color: `var(--hue-${community.hue})`,
              }}
            >
              {community.icon}
            </div>
            <h1 className="font-display text-30 leading-tight text-hi">{community.name}</h1>
            <p className="mt-1.5 max-w-xl text-15 leading-relaxed text-mid">{community.blurb}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FuzzedCount value={`${community.memberEstimate} members`} />
              {community.gate ? (
                <Chip tone="neutral" icon={<ZkGlyph size={11} />}>
                  {community.gate.label}
                </Chip>
              ) : null}
              {community.sealed ? (
                <Chip tone="neutral" icon={<SealGlyph size={11} />}>
                  Sealed by default
                </Chip>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <IdentityChip
                maskId={community.usingMaskId}
                prefix="you are here as"
                onClick={() => openOverlay('mask-switcher')}
              />
              <span className="text-12 leading-relaxed text-mid">
                Changing your mask here starts a fresh, unlinked profile.
              </span>
            </div>

            <p className="mt-4 text-12 text-low">{ATMOSPHERE_NOTE[community.atmosphere]}</p>

            {community.staff ? (
              <Button
                variant="quiet"
                size="sm"
                className="mt-4"
                icon={<ShieldCheck size={15} strokeWidth={1.5} />}
                onClick={() => navigate('/mod')}
              >
                Open the mod queue
              </Button>
            ) : null}
          </header>

          {scheduled.length > 0 ? (
            <section className="mt-8">
              <SectionLabel className="mb-2">Scheduled</SectionLabel>
              {scheduled.map(({ channel, post }) => (
                <Card key={channel.id} className="border-dashed p-3">
                  <div className="flex items-start gap-3">
                    <MaskAvatar maskId={post.by} size={28} presence={false} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-13 font-medium text-hi">
                          {maskById(post.by).displayName}
                        </span>
                        <span className="text-12 text-low">to #{channel.name}</span>
                        <Chip tone="accent" icon={<CalendarClock size={11} strokeWidth={1.5} />}>
                          <span className="mono-num">{clock(post.at)}</span>
                        </Chip>
                      </div>
                      <p className="mt-1 text-13 leading-relaxed text-mid">{post.preview}</p>
                      <p className="mt-1 text-12 text-low">
                        Visible to staff until it sends.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          ) : null}

          <section className="mt-8">
            <SectionLabel className="mb-2">Voice</SectionLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {voiceChannels.map((c) => {
                const room = voice.find((r) => r.channelId === c.id)
                const occupants = room?.occupants ?? []
                const speaking = occupants.some((o) => o.speaking)
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/voice/${community.id}/${c.id}`)}
                    className={cx(
                      'rounded-card border border-[var(--line)] bg-ink-1 p-3 text-left transition-colors hover:border-[color:var(--accent-line)] hover:bg-ink-2',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 size={15} strokeWidth={1.5} className="text-low" />
                      <span className="min-w-0 flex-1 truncate text-14 text-hi">{c.name}</span>
                      {speaking ? <Waveform bars={3} size={12} /> : null}
                    </div>
                    {c.temporary ? (
                      <div className="mt-1.5">
                        <Countdown until={c.temporary.expiresAt} prefix="closes in" />
                      </div>
                    ) : null}
                    <div className="mt-2 flex min-h-6 flex-wrap items-center gap-1">
                      {occupants.length === 0 ? (
                        <span className="text-12 text-low">Empty — be the first in</span>
                      ) : (
                        occupants.map((o) => (
                          <span key={o.maskId} className={cx(o.muted && 'opacity-50')}>
                            <MaskAvatar
                              maskId={o.maskId}
                              size={22}
                              presence={false}
                              speaking={o.speaking}
                            />
                          </span>
                        ))
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-8 pb-8">
            <SectionLabel className="mb-2">Rooms</SectionLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {textChannels.map((c) => {
                const last = messages
                  .filter((m) => m.channelId === c.id && m.state === 'sent')
                  .slice(-1)[0]
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/space/${community.id}/${c.id}`)}
                    className="rounded-card border border-[var(--line)] bg-ink-1 p-3 text-left transition-colors hover:border-[color:var(--accent-line)] hover:bg-ink-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-14 text-hi">#{c.name}</span>
                      {c.history === 'none' ? (
                        <span className="text-low" title="No history before you joined">
                          <GhostGlyph size={12} />
                        </span>
                      ) : null}
                      {c.sealed ? (
                        <span className="text-low opacity-70">
                          <SealGlyph size={12} />
                        </span>
                      ) : (
                        <Chip tone="breach">not sealed</Chip>
                      )}
                      {c.retention ? <RetentionChip retention={c.retention} withGlyph={false} /> : null}
                    </div>
                    {c.topic ? <p className="mt-1 text-12 text-low">{c.topic}</p> : null}
                    {last?.body ? (
                      <p className="mt-1.5 truncate text-12 text-mid">
                        {maskById(last.authorMaskId).displayName}: {last.body}
                      </p>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </MainColumn>
  )
}
