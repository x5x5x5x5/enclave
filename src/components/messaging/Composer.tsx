import { useRef, useState } from 'react'
import { CalendarClock, Droplet, Mic, Paperclip, Send } from 'lucide-react'
import { cx } from '../../lib/cx'
import { HOUR, ahead, clock } from '../../lib/time'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { EMBER_OPTIONS, useWorld } from '../../state/world'
import type { EmberChoice } from '../../state/world'
import { IconButton } from '../primitives/Button'
import { Chip } from '../primitives/Chip'
import { Popover, Tooltip } from '../primitives/Overlay'
import { IdentityChip } from '../identity/IdentityChip'

function emberLabel(e: EmberChoice): string | null {
  if (e.mode === 'off') return null
  if (e.mode === 'views') return `${e.count} views`
  const opt = EMBER_OPTIONS.find((o) => o.value.mode === 'timer' && o.value.ms === e.ms)
  return opt?.label ?? 'custom'
}

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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const send = useWorld((s) => s.send)
  const ember = useWorld((s) => s.ember)
  const setEmber = useWorld((s) => s.setEmber)
  const blurAttachments = useWorld((s) => s.blurAttachments)
  const toggleBlur = useWorld((s) => s.toggleBlurAttachments)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)

  const label = emberLabel(ember)

  const submit = (scheduledFor?: string) => {
    const body = value.trim()
    if (!body) return
    send(roomId, usingMaskId || activeMaskId, body, scheduledFor)
    setValue('')
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
      <div className="shrink-0 px-4 py-3 hairline-t">
        <p className="rounded-card border border-[var(--line)] bg-ink-1 px-3 py-2.5 text-13 text-mid">
          {disabledNote ?? 'You cannot post here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 md:px-[var(--atm-stream-pad)]">
      {label || blurAttachments ? (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {label ? (
            <Chip tone="ember">
              ◔ <span className="mono-num">{label}</span>
              <button
                className="ml-1 text-low hover:text-hi"
                onClick={() => setEmber({ mode: 'off' })}
                aria-label="Turn the ember off"
              >
                ×
              </button>
            </Chip>
          ) : null}
          {blurAttachments ? (
            <Chip tone="accent">
              <Droplet size={11} strokeWidth={1.5} /> attachments blurred
            </Chip>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-1.5 rounded-card border border-[var(--line)] bg-ink-1 p-1.5 transition-colors focus-within:border-[color:var(--accent-line)]">
        {/* attach — the picker knows whether a file can go device to device */}
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
              <p className="px-2 py-1 text-12 uppercase tracking-[0.08em] text-low">Attach</p>
              {[
                { label: 'From this device', note: 'Travels device to device' },
                { label: 'From your vault', note: 'Already sealed with your keys' },
                { label: 'Record a voice note', note: 'Can burn after one listen' },
              ].map((o) => (
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

        {/* ember picker */}
        <Popover
          side="top"
          align="start"
          trigger={({ toggle }) => (
            <Tooltip side="top" label="How long this message lives">
              <IconButton label="Ember" onClick={toggle} active={ember.mode !== 'off'}>
                <span className={cx('text-17 leading-none', ember.mode !== 'off' && 'text-ember')}>
                  ◔
                </span>
              </IconButton>
            </Tooltip>
          )}
        >
          {(close) => (
            <div className="w-56 p-1">
              <p className="px-2 py-1 text-12 uppercase tracking-[0.08em] text-low">Expires</p>
              <div className="grid grid-cols-3 gap-1 p-1">
                {EMBER_OPTIONS.map((o) => {
                  const active =
                    o.value.mode === ember.mode &&
                    (o.value.mode !== 'timer' || o.value.ms === (ember as { ms?: number }).ms)
                  return (
                    <button
                      key={o.id}
                      onClick={() => {
                        setEmber(o.value)
                        close()
                      }}
                      className={cx(
                        'rounded-chip border px-2 py-1.5 text-12 transition-colors',
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
              <p className="px-2 pb-1 pt-1 text-12 leading-relaxed text-mid">
                Everyone in the room sees the same countdown. Nobody gets a quiet copy.
              </p>
            </div>
          )}
        </Popover>

        {/* schedule */}
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
            <div className="w-56 p-1">
              <p className="px-2 py-1 text-12 uppercase tracking-[0.08em] text-low">Send later</p>
              {[
                { label: 'Tonight, 20:00', at: ahead(8 * HOUR) },
                { label: 'Tomorrow, 09:00', at: ahead(21 * HOUR) },
                { label: 'Monday, 09:00', at: ahead(72 * HOUR) },
              ].map((o) => (
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

        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            const el = e.target
            el.style.height = 'auto'
            el.style.height = `${Math.min(160, el.scrollHeight)}px`
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={`Message ${roomTitle}`}
          aria-label={`Message ${roomTitle}`}
          className="order-first min-h-9 w-full resize-none self-center bg-transparent px-1 py-2 text-15 leading-relaxed text-hi outline-none placeholder:text-low md:order-none md:w-auto md:flex-1"
        />

        <IconButton label="Voice note" onClick={() => later('Recording voice notes')}>
          <Mic size={17} strokeWidth={1.5} />
        </IconButton>

        <IconButton
          label="Send"
          variant={value.trim() ? 'solid' : 'ghost'}
          onClick={() => submit()}
          disabled={!value.trim()}
        >
          <Send size={16} strokeWidth={1.8} />
        </IconButton>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <IdentityChip maskId={usingMaskId || activeMaskId} size="sm" prefix="posting as" />
        <span className="hidden text-12 text-low sm:block">
          Enter to send · Shift Enter for a new line
        </span>
      </div>
    </div>
  )
}
