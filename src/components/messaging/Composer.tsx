import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { CalendarClock, CornerUpLeft, Droplet, Mic, Paperclip, Plus, Send, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { HOUR, ahead, clock } from '../../lib/time'
import { useIsMobile } from '../../lib/useMediaQuery'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { EMBER_OPTIONS, useWorld } from '../../state/world'
import type { EmberChoice } from '../../state/world'
import { IconButton } from '../primitives/Button'
import { Chip } from '../primitives/Chip'
import { SectionLabel } from '../primitives/EmptyState'
import { Popover, Tooltip } from '../primitives/Overlay'
import { Sheet } from '../primitives/Sheet'
import { IdentityChip } from '../identity/IdentityChip'

const MAX_LINES = 5
const LINE = 22
const PILL_MIN = 44

function emberLabel(e: EmberChoice): string | null {
  if (e.mode === 'off') return null
  if (e.mode === 'views') return `${e.count} views`
  const opt = EMBER_OPTIONS.find((o) => o.value.mode === 'timer' && o.value.ms === e.ms)
  return opt?.label ?? 'custom'
}

const scheduleSlots = () => [
  { label: 'Tonight, 20:00', at: ahead(8 * HOUR) },
  { label: 'Tomorrow, 09:00', at: ahead(21 * HOUR) },
  { label: 'Monday, 09:00', at: ahead(72 * HOUR) },
]

const ATTACH_SOURCES = [
  { label: 'From this device', note: 'Travels device to device' },
  { label: 'From your vault', note: 'Already sealed with your keys' },
  { label: 'Record a voice note', note: 'Can burn after one listen' },
]

/** The retention grid, shared by the desktop popover and the mobile sheet. */
function EmberGrid({ onPick }: { onPick?: () => void }) {
  const ember = useWorld((s) => s.ember)
  const setEmber = useWorld((s) => s.setEmber)
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {EMBER_OPTIONS.map((o) => {
        const active =
          o.value.mode === ember.mode &&
          (o.value.mode !== 'timer' || o.value.ms === (ember as { ms?: number }).ms)
        return (
          <button
            key={o.id}
            onClick={() => {
              setEmber(o.value)
              onPick?.()
            }}
            className={cx(
              'min-h-11 rounded-chip border px-2 text-13 transition-colors',
              active
                ? 'border-[color:var(--ember-glow)] bg-ember-soft text-ember'
                : 'border-[var(--line)] text-mid hover:bg-ink-3 hover:text-hi',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * One row, three zones, one baseline.
 *
 * On a phone the attach / expiry / schedule controls collapse behind a single
 * ＋ that opens a sheet, because five 44px targets and a readable field do not
 * fit in 360px. Active retention rides inside the pill rather than on a row of
 * its own, and send swaps to mic when there is nothing to send.
 */
export function Composer({
  roomId,
  roomTitle,
  usingMaskId,
  disabled,
  disabledNote,
}: {
  roomId: string
  roomTitle: string
  usingMaskId: string
  disabled?: boolean
  disabledNote?: string
}) {
  const [value, setValue] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [lines, setLines] = useState(1)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isMobile = useIsMobile()
  const send = useWorld((s) => s.send)
  const ember = useWorld((s) => s.ember)
  const setEmber = useWorld((s) => s.setEmber)
  const blurAttachments = useWorld((s) => s.blurAttachments)
  const toggleBlur = useWorld((s) => s.toggleBlurAttachments)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)
  const replyTo = useUi((s) => s.replyTo)
  const clearReplyTo = useUi((s) => s.clearReplyTo)
  const messages = useWorld((s) => s.messages)

  const quoting = replyTo?.roomId === roomId ? messages.find((m) => m.id === replyTo.messageId) : undefined

  const label = emberLabel(ember)
  const hasText = value.trim().length > 0

  /* Grow to five lines, then scroll inside the pill. */
  const resize = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const capped = Math.min(el.scrollHeight, PILL_MIN + (MAX_LINES - 1) * LINE)
    const height = Math.max(PILL_MIN, capped)
    el.style.height = `${height}px`
    setLines(Math.max(1, Math.round((height - PILL_MIN) / LINE) + 1))
  }, [])

  useLayoutEffect(() => {
    resize()
  }, [value, resize])

  const submit = (scheduledFor?: string) => {
    const body = value.trim()
    if (!body) return
    send(roomId, usingMaskId || activeMaskId, body, scheduledFor, quoting?.id)
    setValue('')
    clearReplyTo()
    if (scheduledFor) {
      toast({
        kind: 'accent',
        title: 'Scheduled',
        body: `Sends ${new Date(scheduledFor).toLocaleDateString(undefined, {
          weekday: 'long',
        })} at ${clock(scheduledFor)}.`,
      })
    }
  }

  if (disabled) {
    return (
      <div
        className="shrink-0 px-[var(--gutter)] pt-3 hairline-t"
        style={{ paddingBottom: 'calc(12px + var(--safe-bottom) + var(--keyboard-inset))' }}
      >
        <p className="rounded-card border border-[var(--line)] bg-ink-1 px-3 py-2.5 text-14 text-mid">
          {disabledNote ?? 'You cannot post here.'}
        </p>
      </div>
    )
  }

  return (
    <div
      className="shrink-0 px-[var(--gutter)] pt-2 hairline-t"
      style={{ paddingBottom: 'calc(8px + var(--safe-bottom) + var(--keyboard-inset))' }}
    >
      {/* Quoting is visible before you send, not after. */}
      {quoting ? (
        <div className="mb-2 flex items-start gap-2 rounded-card border border-[var(--line)] bg-ink-1 px-3 py-2">
          <CornerUpLeft size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-low" />
          <div className="min-w-0 flex-1">
            <p className="text-12 font-medium text-mid">
              {maskById(quoting.authorMaskId).displayName}
            </p>
            <p className="truncate text-13 text-mid">{quoting.body ?? 'Attachment'}</p>
          </div>
          <IconButton label="Stop replying" size="sm" onClick={clearReplyTo}>
            <X size={14} strokeWidth={1.5} />
          </IconButton>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        {isMobile ? (
          <IconButton
            label="Attach, expiry and scheduling"
            variant="quiet"
            className="h-11 w-11 shrink-0 rounded-full"
            onClick={() => setSheetOpen(true)}
          >
            <Plus size={19} strokeWidth={1.6} />
          </IconButton>
        ) : (
          <div className="flex shrink-0 items-center gap-1 pb-0.5">
            <Popover
              side="top"
              align="start"
              trigger={({ toggle }) => (
                <IconButton label="Attach" onClick={toggle}>
                  <Paperclip size={17} strokeWidth={1.5} />
                </IconButton>
              )}
            >
              {(close) => (
                <div className="w-64 p-1">
                  <SectionLabel className="px-2 py-1">Attach</SectionLabel>
                  {ATTACH_SOURCES.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => {
                        close()
                        later('Attaching files')
                      }}
                      className="flex w-full flex-col items-start rounded-chip px-2 py-1.5 text-left transition-colors hover:bg-ink-3"
                    >
                      <span className="text-13 text-hi">{o.label}</span>
                      <span className="text-12 text-low">{o.note}</span>
                    </button>
                  ))}
                  <div className="mt-1 border-t border-[var(--line-soft)] px-2 pt-2">
                    <button
                      onClick={toggleBlur}
                      className="flex w-full items-center justify-between text-13 text-mid hover:text-hi"
                    >
                      Blur attachments
                      <span
                        className={cx(
                          'rounded-chip border px-1.5 py-0.5 text-12',
                          blurAttachments
                            ? 'border-[color:var(--accent-line)] bg-accent-soft text-accent'
                            : 'border-[var(--line)] text-low',
                        )}
                      >
                        {blurAttachments ? 'on' : 'off'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </Popover>

            <Popover
              side="top"
              align="start"
              trigger={({ toggle }) => (
                <Tooltip side="top" label="How long this message lives">
                  <IconButton label="Expiry" onClick={toggle} active={ember.mode !== 'off'}>
                    <span
                      className={cx('text-17 leading-none', ember.mode !== 'off' && 'text-ember')}
                    >
                      ◔
                    </span>
                  </IconButton>
                </Tooltip>
              )}
            >
              {(close) => (
                <div className="w-60 p-2">
                  <SectionLabel className="px-0 pb-2">Expires</SectionLabel>
                  <EmberGrid onPick={close} />
                  <p className="pt-2 text-12 leading-relaxed text-mid">
                    Everyone in the room sees the same countdown. Nobody gets a quiet copy.
                  </p>
                </div>
              )}
            </Popover>

            <Popover
              side="top"
              align="start"
              trigger={({ toggle }) => (
                <Tooltip side="top" label="Send later">
                  <IconButton label="Schedule" onClick={toggle}>
                    <CalendarClock size={17} strokeWidth={1.5} />
                  </IconButton>
                </Tooltip>
              )}
            >
              {(close) => (
                <div className="w-60 p-1">
                  <SectionLabel className="px-2 py-1">Send later</SectionLabel>
                  {scheduleSlots().map((o) => (
                    <button
                      key={o.label}
                      onClick={() => {
                        close()
                        submit(o.at)
                      }}
                      className="flex w-full items-center justify-between rounded-chip px-2 py-1.5 text-13 text-mid transition-colors hover:bg-ink-3 hover:text-hi"
                    >
                      {o.label}
                      <span className="mono-num text-12 text-low">{clock(o.at)}</span>
                    </button>
                  ))}
                </div>
              )}
            </Popover>
          </div>
        )}

        <div
          className={cx(
            'relative flex min-w-0 flex-1 items-center border bg-ink-2 transition-[border-radius] duration-[var(--dur-std)]',
            'border-[var(--line)] focus-within:border-[color:var(--accent-line)]',
            lines > 1 ? 'rounded-card' : 'rounded-full',
          )}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={`Message ${roomTitle}`}
            aria-label={`Message ${roomTitle}`}
            className={cx(
              'prose-break w-full resize-none bg-transparent py-3 pl-4 text-16 leading-[22px] text-hi outline-none placeholder:text-low',
              label ? 'pr-[5.5rem]' : 'pr-4',
              lines >= MAX_LINES ? 'overflow-y-auto' : 'overflow-hidden',
            )}
            style={{ minHeight: PILL_MIN }}
          />

          {label ? (
            <button
              onClick={() => (isMobile ? setSheetOpen(true) : setEmber({ mode: 'off' }))}
              aria-label={`Expires ${label}. Change it.`}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Chip tone="ember">
                ◔ <span className="mono-num">{label}</span>
              </Chip>
            </button>
          ) : null}
        </div>

        {hasText ? (
          <IconButton
            label="Send"
            variant="solid"
            className="h-11 w-11 shrink-0 rounded-full"
            onClick={() => submit()}
          >
            <Send size={17} strokeWidth={1.9} />
          </IconButton>
        ) : (
          <IconButton
            label="Hold to record a voice note"
            variant="quiet"
            className={cx('h-11 w-11 shrink-0 rounded-full', recording && 'bg-ember-soft text-ember')}
            onPointerDown={() => setRecording(true)}
            onPointerUp={() => {
              setRecording(false)
              later('Recording voice notes')
            }}
            onPointerLeave={() => setRecording(false)}
          >
            <Mic size={17} strokeWidth={1.6} />
          </IconButton>
        )}
      </div>

      {recording ? (
        <p className="mt-1.5 text-center text-12 text-ember">Recording — slide left to cancel</p>
      ) : (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <IdentityChip maskId={usingMaskId || activeMaskId} size="sm" prefix="posting as" />
          {blurAttachments ? (
            <Chip tone="accent">
              <Droplet size={11} strokeWidth={1.5} /> blurred
            </Chip>
          ) : null}
          <span className="hidden text-12 text-low lg:block">
            Enter to send · Shift Enter for a new line
          </span>
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Message options"
        subtitle={`Applies to your next message in ${roomTitle}.`}
      >
        <div className="flex flex-col gap-6 px-[var(--gutter)] py-4">
          <section>
            <SectionLabel className="px-0 pb-2">Attach</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {ATTACH_SOURCES.map((o) => (
                <button
                  key={o.label}
                  onClick={() => {
                    setSheetOpen(false)
                    later('Attaching files')
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-card border border-[var(--line)] bg-ink-2 px-3 py-2.5 text-left"
                >
                  <Paperclip size={16} strokeWidth={1.5} className="shrink-0 text-low" />
                  <span className="min-w-0">
                    <span className="block truncate text-14 text-hi">{o.label}</span>
                    <span className="block truncate text-12 text-low">{o.note}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={toggleBlur}
              className="mt-2 flex min-h-11 w-full items-center justify-between rounded-card border border-[var(--line)] px-3 text-14 text-mid"
            >
              Blur attachments
              <span
                className={cx(
                  'rounded-chip border px-2 py-0.5 text-12',
                  blurAttachments
                    ? 'border-[color:var(--accent-line)] bg-accent-soft text-accent'
                    : 'border-[var(--line)] text-low',
                )}
              >
                {blurAttachments ? 'on' : 'off'}
              </span>
            </button>
          </section>

          <section>
            <SectionLabel className="px-0 pb-2">Expires</SectionLabel>
            <EmberGrid onPick={() => setSheetOpen(false)} />
            <p className="pt-2 text-12 leading-relaxed text-mid">
              Everyone in the room sees the same countdown. Nobody gets a quiet copy.
            </p>
          </section>

          <section>
            <SectionLabel className="px-0 pb-2">Send later</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {scheduleSlots().map((o) => (
                <button
                  key={o.label}
                  disabled={!hasText}
                  onClick={() => {
                    setSheetOpen(false)
                    submit(o.at)
                  }}
                  className="flex min-h-11 w-full items-center justify-between rounded-card border border-[var(--line)] px-3 text-14 text-mid disabled:opacity-40"
                >
                  {o.label}
                  <span className="mono-num text-12 text-low">{clock(o.at)}</span>
                </button>
              ))}
            </div>
            {!hasText ? (
              <p className="pt-2 text-12 text-low">Write something first, then pick a time.</p>
            ) : null}
          </section>
        </div>
      </Sheet>
    </div>
  )
}
