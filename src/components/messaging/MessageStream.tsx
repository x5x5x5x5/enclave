import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useKeyboardInset } from '../../lib/useKeyboardInset'
import { MINUTE, dayLabel } from '../../lib/time'
import { maskById } from '../../mock/masks'
import type { Message, Retention } from '../../mock/types'
import { useWorld } from '../../state/world'
import { Horizon } from '../time'
import { GhostGlyph } from '../trust/Glyphs'
import { BubbleRow, ScheduledRow, StreamRow } from './Bubble'

function DayDivider({ iso }: { iso: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 px-[var(--atm-stream-pad)] py-3">
      <span className="h-px flex-1 bg-[var(--line-soft)]" />
      <span className="rounded-full border border-[var(--line)] bg-ink-1 px-2 py-0.5 text-12 text-low">
        {dayLabel(iso)}
      </span>
      <span className="h-px flex-1 bg-[var(--line-soft)]" />
    </div>
  )
}

function TypingRow({ maskId }: { maskId: string }) {
  const mask = maskById(maskId)
  return (
    <div className="flex items-center gap-2 px-[var(--atm-stream-pad)] py-2 text-12 text-low">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--text-low)]"
            style={{ animation: `typing-dot 1.2s ${i * 0.15}s infinite` }}
          />
        ))}
      </span>
      {mask.displayName} is typing
    </div>
  )
}

function HistoryNote({ history }: { history: 'full' | 'from-join' | 'none' }) {
  if (history === 'full') return null
  return (
    <div className="flex items-center gap-2 px-[var(--atm-stream-pad)] pb-2 pt-6 text-12 text-low">
      <GhostGlyph size={14} />
      {history === 'from-join'
        ? 'History starts here. You only see what was said after you arrived.'
        : 'This room keeps no history. You only see what was said after you joined.'}
    </div>
  )
}

export function MessageStream({
  roomId,
  layout = 'stream',
  retention,
  history = 'full',
  selectable,
  selectedIds,
  onSelect,
  typingMaskId,
}: {
  roomId: string
  layout?: 'stream' | 'bubbles'
  retention?: Retention
  history?: 'full' | 'from-join' | 'none'
  selectable?: boolean
  selectedIds?: string[]
  onSelect?: (id: string) => void
  typingMaskId?: string
}) {
  const messages = useWorld((s) => s.messages)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showJump, setShowJump] = useState(false)
  const keyboard = useKeyboardInset()

  const toBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const rows = useMemo(
    () =>
      messages
        .filter((m) => m.channelId === roomId)
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()),
    [messages, roomId],
  )

  const live = rows.filter((m) => m.state !== 'scheduled')
  const scheduled = rows.filter((m) => m.state === 'scheduled')

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [roomId])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 220
    if (nearBottom) el.scrollTop = el.scrollHeight
  }, [rows.length])

  /* The keyboard opening must not push the last message out of view. */
  useEffect(() => {
    if (!showJump) toBottom()
  }, [keyboard, showJump, toBottom])

  let lastDay = ''
  let lastAuthor = ''
  let lastTs = 0

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget
          const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
          setShowJump(fromBottom > el.clientHeight * 2)
        }}
        className={cx('scroll-area min-h-0 flex-1', layout === 'bubbles' && 'pb-2')}
      >
      <div className="mx-auto w-full md:max-w-[var(--atm-column-max)]">
        {retention ? <Horizon /> : null}
        <HistoryNote history={history} />

        {live.map((m: Message) => {
          const day = dayLabel(m.ts)
          const showDay = day !== lastDay
          if (showDay) {
            lastDay = day
            lastAuthor = ''
          }
          const ts = new Date(m.ts).getTime()
          const grouped =
            m.authorMaskId === lastAuthor && ts - lastTs < 6 * MINUTE && !m.replyToId
          lastAuthor = m.authorMaskId
          lastTs = ts

          return (
            <div key={m.id}>
              {showDay ? <DayDivider iso={m.ts} /> : null}
              {layout === 'bubbles' ? (
                <BubbleRow message={m} grouped={grouped} />
              ) : (
                <StreamRow
                  message={m}
                  grouped={grouped}
                  selectable={selectable}
                  selected={selectedIds?.includes(m.id)}
                  onSelect={onSelect}
                />
              )}
            </div>
          )
        })}

        {typingMaskId ? <TypingRow maskId={typingMaskId} /> : null}

        {scheduled.length > 0 ? (
          <div className="pt-2">
            <p className="px-[var(--atm-stream-pad)] pb-1 text-12 uppercase tracking-[0.08em] text-low">
              Scheduled
            </p>
            {scheduled.map((m) => (
              <ScheduledRow key={m.id} message={m} />
            ))}
          </div>
        ) : null}

        <div className="h-2" />
      </div>
      </div>

      {/* Scrolled well up: one tap back to the present. */}
      {showJump ? (
        <button
          onClick={() => toBottom('smooth')}
          className="absolute bottom-3 left-1/2 z-10 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full border border-[color:var(--accent-line)] bg-ink-2 px-4 text-13 text-accent shadow-modal"
        >
          <ArrowDown size={15} strokeWidth={1.8} />
          Jump to latest
        </button>
      ) : null}
    </div>
  )
}
