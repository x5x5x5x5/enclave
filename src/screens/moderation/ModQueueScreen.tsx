import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { cx } from '../../lib/cx'
import { clock, shortStamp } from '../../lib/time'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button, IconButton } from '../../components/primitives/Button'
import { Card, EmptyState } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { Tabs } from '../../components/primitives/Tabs'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { FrankingHash } from '../../components/trust'
import { ZkGlyph } from '../../components/trust/Glyphs'

export function ModQueueScreen() {
  const navigate = useNavigate()
  const reports = useWorld((s) => s.reports)
  const resolveReport = useWorld((s) => s.resolveReport)
  const actingAsStaff = useApp((s) => s.actingAsStaff)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)
  const [tab, setTab] = useState<'open' | 'resolved'>('open')

  const shown = reports.filter((r) => r.status === tab)
  const openCount = reports.filter((r) => r.status === 'open').length

  if (!actingAsStaff) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-ink-0">
        <EmptyState
          title="You are not staff here"
          body="The queue only exists for the mask a space gave the role to."
          actionLabel="Go home"
          onAction={() => navigate('/chats')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-ink-0">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8">
        <header className="flex items-start gap-3">
          <IconButton label="Back" onClick={() => navigate('/space/c-lostera')}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-24 text-hi">Mod queue</h1>
            <p className="mt-1 text-13 text-mid">LostEra · staff only</p>
          </div>
        </header>

        <Card raised className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
          <div>
            <p className="mono-num text-24 leading-none text-hi">{openCount}</p>
            <p className="mt-1 text-12 text-low">open</p>
          </div>
          <div>
            <p className="mono-num text-24 leading-none text-hi">0</p>
            <p className="mt-1 text-12 text-low">reports opened without proof</p>
          </div>
          <p className="ml-auto max-w-xs text-12 leading-relaxed text-mid">
            A report without a verified hash cannot be opened here. There is no path for one to
            exist.
          </p>
        </Card>

        <Tabs
          className="mt-4"
          ariaLabel="Queue"
          items={[
            { id: 'open', label: 'Open', count: openCount },
            { id: 'resolved', label: 'Resolved' },
          ]}
          value={tab}
          onChange={(t) => setTab(t as 'open' | 'resolved')}
        />

        <div className="mt-4 flex flex-col gap-3">
          {shown.length === 0 ? (
            <EmptyState
              title={tab === 'open' ? 'Nothing waiting' : 'Nothing resolved yet'}
              body={
                tab === 'open'
                  ? 'An empty queue is the goal, not a bug.'
                  : 'Handled reports land here with their proofs intact.'
              }
            />
          ) : (
            shown.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-15 text-hi">{r.reasonLabel}</span>
                  <Chip>{r.channelName.startsWith('ch-') ? r.channelName : r.channelName}</Chip>
                  <Chip tone="accent" icon={<ZkGlyph size={11} />}>
                    proof verified
                  </Chip>
                  <span className="mono-num ml-auto text-12 text-low">
                    {shortStamp(r.openedAt)}
                  </span>
                </div>
                <p className="mt-1 text-12 text-low">Reported by {r.reporterLabel}</p>

                <div className="mt-3 flex flex-col gap-2">
                  {r.excerpts.map((e, i) => {
                    const author = maskById(e.maskId)
                    return (
                      <div
                        key={`${r.id}-${i}`}
                        className="rounded-card border border-[var(--line)] bg-ink-2 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <MaskAvatar maskId={author.id} size={20} presence={false} />
                          <span className="text-12 text-mid">{author.displayName}</span>
                          <span className="mono-num text-12 text-low">{clock(e.ts)}</span>
                          <FrankingHash tag={e.frankingTag} full className="ml-auto" />
                        </div>
                        <p className="mt-1.5 text-14 leading-relaxed text-hi">{e.body}</p>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-2 text-12 leading-relaxed text-mid">
                  You are seeing exactly what the reporter selected, and nothing else from that
                  room.
                </p>

                {r.status === 'open' ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--line-soft)] pt-3">
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        resolveReport(r.id)
                        toast({ kind: 'neutral', title: 'Report dismissed' })
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        resolveReport(r.id)
                        toast({
                          kind: 'accent',
                          title: 'Warning sent',
                          body: 'They see the excerpt and the reason, nothing about who reported.',
                        })
                      }}
                    >
                      Warn
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        resolveReport(r.id)
                        toast({
                          kind: 'breach',
                          title: 'Removed from LostEra',
                          body: 'The mask loses this space. Their other masks are untouched.',
                        })
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => later('Opening the full thread from a report')}
                    >
                      Open in context
                    </Button>
                  </div>
                ) : (
                  <p
                    className={cx(
                      'mt-3 flex items-center gap-1.5 border-t border-[var(--line-soft)] pt-3 text-12 text-low',
                    )}
                  >
                    <Check size={12} strokeWidth={2} className="text-accent" /> Resolved
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
