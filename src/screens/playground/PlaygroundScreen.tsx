import { useState } from 'react'
import { Screen } from '../../components/shell/Screen'
import { Bell, Mic, Paperclip, Search, Send } from 'lucide-react'
import { ahead } from '../../lib/time'
import { AVATAR_PRESETS, OWN_MASKS, PEOPLE } from '../../mock/masks'
import { HUES, HUE_LABEL } from '../../mock/world'
import type { Hue } from '../../mock/types'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import {
  Button,
  Card,
  Chip,
  ChipButton,
  Divider,
  EmptyState,
  Field,
  IconButton,
  Input,
  Kbd,
  Modal,
  Popover,
  SectionLabel,
  Segmented,
  Slider,
  Tabs,
  Textarea,
  Toggle,
  Tooltip,
} from '../../components/primitives'
import { MaskAvatar, MaskStack } from '../../components/identity/MaskAvatar'
import { IdentityChip } from '../../components/identity/IdentityChip'
import {
  BreachBanner,
  FrankingHash,
  FuzzedCount,
  GhostGlyph,
  HourglassGlyph,
  RelayGlyph,
  SealBadge,
  SealGlyph,
  ZkBadge,
  ZkGlyph,
} from '../../components/trust'
import { Countdown, EmberRing, Horizon, RetentionChip, UndoSendBar } from '../../components/time'
import { Murmur } from '../../components/nav/Murmur'
import { LatencyDot, OccupantPill, RelayChip, RelayDiagram, Waveform } from '../../components/voice'
import { StoryRing } from '../../components/social/StoriesRail'
import { AuraMeter, BadgeTile, QrMark, ReputationLaurel } from '../../components/social/Stats'
import { TransferCard } from '../../components/files/TransferCard'
import { SOCIAL } from '../../mock/social'

function Row({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="py-6 hairline-b last:border-b-0">
      <div className="mb-3">
        <h2 className="font-display text-17 text-hi">{title}</h2>
        {note ? <p className="mt-0.5 text-13 text-mid">{note}</p> : null}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  )
}

export function PlaygroundScreen() {
  const [toggleA, setToggleA] = useState(true)
  const [toggleB, setToggleB] = useState(false)
  const [seg, setSeg] = useState<'cozy' | 'compact'>('cozy')
  const [slider, setSlider] = useState(42)
  const [tab, setTab] = useState('all')
  const [modal, setModal] = useState(false)
  const [undo, setUndo] = useState(true)
  const toast = useUi((s) => s.toast)
  const setActiveMask = useApp((s) => s.setActiveMask)
  const activeMaskId = useApp((s) => s.activeMaskId)

  return (
    <Screen gutter={false} contentClassName="px-[var(--gutter)]">
      <div className="mx-auto w-full max-w-5xl py-8">
        <header className="pb-6 hairline-b">
          <p className="text-12 uppercase tracking-[0.08em] text-low">Visual regression</p>
          <h1 className="mt-1 font-display text-30 text-hi">Playground</h1>
          <p className="mt-1 max-w-xl text-14 leading-relaxed text-mid">
            Every primitive in every state. Switch the mask below and the whole page changes
            allegiance — that is the signature, and this page is where it gets checked.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {OWN_MASKS.map((m) => (
              <ChipButton
                key={m.id}
                selected={m.id === activeMaskId}
                onClick={() => setActiveMask(m.id)}
                icon={<MaskAvatar maskId={m.id} size={16} presence={false} ring={false} />}
              >
                {m.displayName}
              </ChipButton>
            ))}
          </div>
        </header>

        <Row title="Colour" note="Ink steps, mask hues, and the two semantic colours.">
          <div className="flex flex-wrap gap-2">
            {[
              ['--ink-0', 'ink-0'],
              ['--ink-1', 'ink-1'],
              ['--ink-2', 'ink-2'],
              ['--ink-3', 'ink-3'],
              ['--line', 'line'],
            ].map(([token, label]) => (
              <div key={token} className="w-24">
                <div
                  className="h-12 rounded-card border border-[var(--line)]"
                  style={{ background: `var(${token})` }}
                />
                <p className="mt-1 font-mono text-12 text-low">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex w-full flex-wrap gap-2">
            {HUES.map((h: Hue) => (
              <div key={h} className="w-24">
                <div className="h-12 rounded-card" style={{ background: `var(--hue-${h})` }} />
                <p className="mt-1 font-mono text-12 text-low">{HUE_LABEL[h]}</p>
              </div>
            ))}
            {[
              ['--ember', 'ember'],
              ['--breach', 'breach'],
            ].map(([token, label]) => (
              <div key={token} className="w-24">
                <div className="h-12 rounded-card" style={{ background: `var(${token})` }} />
                <p className="mt-1 font-mono text-12 text-low">{label}</p>
              </div>
            ))}
          </div>
        </Row>

        <Row title="Type" note="Bricolage for letterhead, Instrument Sans for everything, Geist Mono for cryptographic material.">
          <div className="w-full space-y-1.5">
            <p className="font-display text-38 leading-tight text-hi">Sealed by default</p>
            <p className="font-display text-24 text-hi">One account, many masks</p>
            <p className="text-17 text-hi">Data with a lifespan</p>
            <p className="text-15 leading-[1.6] text-hi">
              Chat body sits at 15/1.6 — Telegram airiness, on purpose.
            </p>
            <p className="text-13 leading-[1.4] text-mid">
              Channel and member lists sit at 13/1.4 — Discord density, also on purpose.
            </p>
            <p className="font-mono text-13 text-low">9f2c a41d · 14ms · 04:00</p>
          </div>
        </Row>

        <Row title="Buttons">
          {(['solid', 'quiet', 'outline', 'ghost', 'danger'] as const).map((v) => (
            <div key={v} className="flex flex-col items-start gap-2">
              <Button variant={v} size="sm">
                {v} sm
              </Button>
              <Button variant={v} size="md" icon={<Send size={15} strokeWidth={1.5} />}>
                {v} md
              </Button>
              <Button variant={v} size="lg">
                {v} lg
              </Button>
              <Button variant={v} size="md" disabled>
                disabled
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <IconButton label="Attach">
              <Paperclip size={17} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Mic" variant="quiet">
              <Mic size={17} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Notify" variant="ghost" active>
              <Bell size={17} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Send" variant="solid">
              <Send size={17} strokeWidth={1.5} />
            </IconButton>
          </div>
        </Row>

        <Row title="Inputs">
          <div className="w-full max-w-sm space-y-3">
            <Input placeholder="Search" leading={<Search size={15} strokeWidth={1.5} />} />
            <Input defaultValue="@aija" mono />
            <Input defaultValue="taken" invalid trailing={<span className="text-12 text-breach">taken</span>} />
            <Field label="Bio" hint="Shown to whoever this mask lets see it.">
              <Textarea rows={3} defaultValue="Raid lead. Sleeps eventually." />
            </Field>
          </div>
        </Row>

        <Row title="Chips">
          <Chip>neutral</Chip>
          <Chip tone="accent">accent</Chip>
          <Chip tone="ember">◔ 24h</Chip>
          <Chip tone="breach">not sealed</Chip>
          <Chip tone="mono">9f2c a41d</Chip>
          <ChipButton>selectable</ChipButton>
          <ChipButton selected>selected</ChipButton>
        </Row>

        <Row title="Controls">
          <div className="w-full max-w-sm space-y-4">
            <Toggle
              checked={toggleA}
              onChange={setToggleA}
              label="Require a request before direct messages"
              description="Strangers ask first. You decide."
            />
            <Toggle
              checked={toggleB}
              onChange={setToggleB}
              tone="breach"
              label="Duress mode"
              description="A second password that opens a clean decoy account."
            />
            <Segmented
              options={[
                { id: 'cozy', label: 'Cozy' },
                { id: 'compact', label: 'Compact' },
              ]}
              value={seg}
              onChange={setSeg}
            />
            <Slider value={slider} onChange={setSlider} label="Quiet hours start" valueLabel={`${slider}%`} />
            <div className="flex items-center gap-2 text-13 text-mid">
              Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> for the palette, <Kbd>⌘</Kbd> <Kbd>I</Kbd> for masks.
            </div>
          </div>
        </Row>

        <Row title="Tabs">
          <div className="w-full max-w-md space-y-4">
            <Tabs
              items={[
                { id: 'all', label: 'All' },
                { id: 'dms', label: 'DMs' },
                { id: 'spaces', label: 'Spaces' },
                { id: 'requests', label: 'Requests', count: 1 },
              ]}
              value={tab}
              onChange={setTab}
            />
            <Tabs
              variant="pill"
              items={[
                { id: 'all', label: 'Notes' },
                { id: 'dms', label: 'Saved' },
                { id: 'spaces', label: 'Files' },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
        </Row>

        <Row title="Overlays">
          <Button variant="quiet" onClick={() => setModal(true)}>
            Open modal
          </Button>
          <Button
            variant="quiet"
            onClick={() => toast({ kind: 'neutral', title: 'Neutral toast', body: 'Says a thing.' })}
          >
            Neutral toast
          </Button>
          <Button
            variant="quiet"
            onClick={() =>
              toast({ kind: 'accent', title: 'Now wearing Nova', body: 'Iris · @nova.works' })
            }
          >
            Accent toast
          </Button>
          <Button
            variant="quiet"
            onClick={() =>
              toast({
                kind: 'breach',
                title: 'Transfer failed',
                body: 'The peer went offline mid-file.',
                actionLabel: 'Retry',
              })
            }
          >
            Breach toast
          </Button>
          <Tooltip label="Counts are fuzzed on purpose.">
            <Button variant="quiet">Hover me</Button>
          </Tooltip>
          <Popover
            side="bottom"
            trigger={({ toggle }) => (
              <Button variant="quiet" onClick={toggle}>
                Popover
              </Button>
            )}
          >
            <p className="p-2 text-13 text-mid">
              Elevation is a background step plus a hairline. Only modals get a shadow.
            </p>
          </Popover>
        </Row>

        <Row title="Identity" note="Eight marks, eight hues, three presence states.">
          <div className="flex w-full flex-wrap gap-3">
            {AVATAR_PRESETS.map((preset, i) => (
              <div key={preset} className="flex w-20 flex-col items-center gap-1">
                <MaskAvatar
                  mask={{
                    id: preset,
                    handle: `@${preset}`,
                    displayName: preset,
                    avatar: preset,
                    hue: HUES[i % HUES.length],
                    presence: (['online', 'away', 'invisible'] as const)[i % 3],
                  }}
                  size={40}
                />
                <span className="text-12 text-low">{preset}</span>
              </div>
            ))}
          </div>
          <div className="flex w-full items-center gap-4">
            <MaskStack maskIds={PEOPLE.slice(0, 6).map((p) => p.id)} />
            <IdentityChip maskId="m-aija" />
            <IdentityChip maskId="m-courier7" onClick={() => {}} />
          </div>
        </Row>

        <Row title="Trust" note="Presence whispers, absence screams.">
          <SealBadge label="sealed" />
          <SealBadge state="relay-only" label="relay only" />
          <SealBadge state="unsealed" />
          <ZkBadge label="18+" />
          <ZkBadge label="LostEra veteran" />
          <FrankingHash tag="9f2c a41d" label="proof" />
          <FuzzedCount value="~2.4k members" />
          <div className="flex items-center gap-4 text-mid">
            <SealGlyph size={20} />
            <GhostGlyph size={20} />
            <HourglassGlyph size={20} />
            <ZkGlyph size={20} />
            <RelayGlyph size={20} />
          </div>
          <div className="w-full">
            <Card className="overflow-hidden">
              <BreachBanner body="Anything sensitive belongs in a sealed room." />
            </Card>
          </div>
        </Row>

        <Row title="Time" note="Expiry is furniture, not a footnote.">
          <div className="flex items-center gap-4">
            <EmberRing expiresAt={ahead(90_000)} totalMs={100_000} size={18} showLabel />
            <EmberRing expiresAt={ahead(40_000)} totalMs={100_000} size={18} showLabel />
            <EmberRing expiresAt={ahead(6_000)} totalMs={100_000} size={18} showLabel />
          </div>
          <RetentionChip retention={{ mode: 'timer', seconds: 86400 }} />
          <RetentionChip retention={{ mode: 'views', count: 3 }} />
          <RetentionChip retention={{ mode: 'daily', at: '04:00' }} />
          <Countdown until={ahead(8_040_000)} prefix="closes in" />
          <div className="w-full max-w-sm">
            {undo ? (
              <UndoSendBar until={ahead(5000)} onUndo={() => setUndo(false)} onDone={() => setUndo(false)} />
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setUndo(true)}>
                Replay undo window
              </Button>
            )}
          </div>
          <div className="w-full max-w-lg">
            <Horizon />
          </div>
        </Row>

        <Row title="Murmur" note="Activity as a shimmer, never a number.">
          <div className="flex items-end gap-6">
            {[0.15, 0.45, 0.9].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-card border border-[var(--line)] bg-ink-1 font-display text-13 text-mid">
                  LE
                </div>
                <Murmur intensity={i} />
                <span className="mono-num text-12 text-low">{i}</span>
              </div>
            ))}
          </div>
        </Row>

        <Row title="Voice" note="Speaking is a ring pulse and three bars. Nothing bounces.">
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            <OccupantPill maskId="p-rho" speaking muted={false} />
            <OccupantPill maskId="p-vex" speaking={false} muted={false} you />
            <OccupantPill maskId="p-pixel" speaking={false} muted />
            <OccupantPill maskId="p-konstantin" speaking={false} muted={false} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RelayChip relay="community" />
            <RelayChip relay="self-hosted" />
            <LatencyDot ms={14} />
            <LatencyDot ms={44} />
            <LatencyDot ms={128} />
            <Waveform bars={3} size={14} />
            <Waveform bars={5} size={18} active={false} />
          </div>
          <div className="w-full max-w-md">
            <RelayDiagram relay="community" />
          </div>
        </Row>

        <Row title="Transfers" note="Direct is the happy path. A relay carries bytes it cannot read.">
          <div className="w-full max-w-md space-y-2">
            <TransferCard
              messageId="pg-1"
              media={{
                kind: 'file',
                name: 'raid-vod-s4e11.mkv',
                size: '2.4 GB',
                p2p: {
                  route: 'direct',
                  progress: 0.62,
                  resumable: true,
                  state: 'sending',
                  throughput: '84 MB/s',
                  peerDevice: 'Rho · ThinkPad',
                },
              }}
            />
            <TransferCard
              messageId="pg-2"
              media={{
                kind: 'file',
                name: 'kiln-raw-set.zip',
                size: '4.8 GB',
                p2p: {
                  route: 'relay',
                  progress: 0.34,
                  resumable: true,
                  state: 'paused',
                  throughput: '0 MB/s',
                  peerDevice: 'Mira · Pixel 10 Pro',
                },
              }}
            />
            <TransferCard
              messageId="pg-3"
              media={{
                kind: 'file',
                name: 'poster-series.afdesign',
                size: '212 MB',
                p2p: {
                  route: 'direct',
                  progress: 0.18,
                  resumable: true,
                  state: 'failed',
                  throughput: '—',
                  peerDevice: 'Lark · Desktop',
                },
              }}
            />
          </div>
        </Row>

        <Row title="Social" note="Visibility and trust, both opt-in.">
          <div className="flex items-center gap-4">
            {OWN_MASKS.map((m, i) => (
              <div key={m.id} className="flex flex-col items-center gap-1.5">
                <StoryRing hue={m.hue} seen={i === 2}>
                  <MaskAvatar maskId={m.id} size={44} presence={false} ring={false} />
                </StoryRing>
                <span className="text-12 text-low">{i === 2 ? 'seen' : 'new'}</span>
              </div>
            ))}
          </div>
          <div className="w-full max-w-md rounded-card border border-[var(--line)] bg-ink-1 p-4">
            <AuraMeter aura={SOCIAL.aura} />
          </div>
          <div className="w-full max-w-md rounded-card border border-[var(--line)] bg-ink-1 p-4">
            <ReputationLaurel reputation={SOCIAL.reputation} />
          </div>
          <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
            {SOCIAL.reputation.badges.slice(0, 4).map((b) => (
              <BadgeTile key={b.id} badge={b} />
            ))}
          </div>
          <div className="rounded-card bg-[var(--text-hi)] p-2">
            <QrMark seed="playground" size={96} />
          </div>
        </Row>

        <Row title="Empty states">
          <div className="w-full max-w-md rounded-card border border-[var(--line)] bg-ink-1">
            <EmptyState
              title="No conversations yet"
              body="Start one from the palette, or accept a request."
              actionLabel="Open the palette"
              onAction={() => {}}
            />
          </div>
          <div className="w-full max-w-md">
            <SectionLabel className="mb-2">Section label</SectionLabel>
            <Divider label="or" />
          </div>
        </Row>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Modal"
        subtitle="14px radius, one soft shadow, hairline header."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setModal(false)}>
              Understood
            </Button>
          </>
        }
      >
        <p className="text-14 leading-relaxed text-mid">
          Modals trap focus, close on Escape, and animate at 320ms. Under reduced motion they simply
          appear.
        </p>
      </Modal>
    </Screen>
  )
}
