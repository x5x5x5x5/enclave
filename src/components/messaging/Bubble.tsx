import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bookmark, Clock, CornerUpLeft, Flag, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { cx } from '../../lib/cx'
import { clock, humanDuration } from '../../lib/time'
import { useNow } from '../../lib/useNow'
import { maskById } from '../../mock/masks'
import type { Message } from '../../mock/types'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { ageFraction, useWorld } from '../../state/world'
import { MaskAvatar } from '../identity/MaskAvatar'
import { Chip } from '../primitives/Chip'
import { Popover, Tooltip } from '../primitives/Overlay'
import { EmberRing, UndoSendBar } from '../time'
import { FrankingHash } from '../trust'
import { MediaBlock } from './Media'

/* -- Translated stack ------------------------------------------------------ */

function TranslateStack({ message }: { message: Message }) {
  const shown = useWorld((s) => s.shownOriginal.includes(message.id))
  const toggleOriginal = useWorld((s) => s.toggleOriginal)
  const t = message.translated
  if (!t) return null

  return (
    <div className="mt-1">
      <button
        onClick={() => toggleOriginal(message.id)}
        className="text-12 text-low transition-colors hover:text-mid"
      >
        Translated from {t.fromLang} — {shown ? 'hide original' : 'show original'}
      </button>
      <AnimatePresence initial={false}>
        {shown ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden border-l border-[var(--line)] pl-2.5 pt-1 text-13 italic leading-relaxed text-mid"
          >
            {t.body}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* -- Reply quote ----------------------------------------------------------- */

function ReplyQuote({ replyToId }: { replyToId: string }) {
  const messages = useWorld((s) => s.messages)
  const target = useMemo(() => messages.find((m) => m.id === replyToId), [messages, replyToId])
  if (!target) return null
  const author = maskById(target.authorMaskId)
  return (
    <div className="mb-1 flex items-center gap-2 border-l-2 pl-2" style={{ borderColor: `var(--hue-${author.hue})` }}>
      <span className="text-12 font-medium" style={{ color: `var(--hue-${author.hue})` }}>
        {author.displayName}
      </span>
      <span className="min-w-0 truncate text-12 text-low">
        {target.body ?? (target.state === 'expired' ? 'expired message' : 'attachment')}
      </span>
    </div>
  )
}

/* -- Tombstone ------------------------------------------------------------- */

function Tombstone({ message }: { message: Message }) {
  return (
    <p className="flex items-center gap-2 py-0.5 text-13 italic text-low">
      <span className="h-px w-4 bg-[var(--line)]" />
      {message.systemNote ?? 'Message expired · sealed by key rotation'}
    </p>
  )
}

/* -- Actions --------------------------------------------------------------- */

function MessageActions({ message }: { message: Message }) {
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const saveToVault = useWorld((s) => s.saveToVault)
  const startReport = useUi((s) => s.startReport)

  const item =
    'flex w-full items-center gap-2 rounded-chip px-2 py-1.5 text-13 text-mid transition-colors hover:bg-ink-3 hover:text-hi'

  return (
    <Popover
      side="bottom"
      align="end"
      className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
      trigger={({ toggle }) => (
        <button
          aria-label="Message actions"
          onClick={toggle}
          className="flex h-6 w-6 items-center justify-center rounded-chip border border-[var(--line)] bg-ink-1 text-low hover:text-hi"
        >
          <MoreHorizontal size={14} strokeWidth={1.5} />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          <button className={item} onClick={() => { close(); later('Replying') }}>
            <CornerUpLeft size={14} strokeWidth={1.5} /> Reply
          </button>
          <button
            className={item}
            onClick={() => {
              close()
              saveToVault(message.id)
              toast({ kind: 'accent', title: 'Saved to your vault', body: 'Only you can open it.' })
            }}
          >
            <Bookmark size={14} strokeWidth={1.5} /> Save to vault
          </button>
          <button
            className={item}
            onClick={() => {
              close()
              navigator.clipboard?.writeText(message.frankingTag).catch(() => {})
              toast({ kind: 'neutral', title: 'Proof copied', body: message.frankingTag })
            }}
          >
            <ShieldCheck size={14} strokeWidth={1.5} /> Copy proof
          </button>
          <button
            className={item}
            onClick={() => {
              close()
              startReport(message.channelId, message.id)
            }}
          >
            <Flag size={14} strokeWidth={1.5} /> Report
          </button>
          <div className="mt-1 border-t border-[var(--line-soft)] px-2 pt-1.5">
            <FrankingHash tag={message.frankingTag} full label="proof " />
          </div>
        </div>
      )}
    </Popover>
  )
}

/* -- Shared message body --------------------------------------------------- */

function MessageBody({ message, aged }: { message: Message; aged: boolean }) {
  const consumeView = useWorld((s) => s.consumeView)
  const undoSend = useWorld((s) => s.undoSend)
  const finishUndo = useWorld((s) => s.finishUndo)
  const [viewConsumed, setViewConsumed] = useState(false)

  const viewsLeft = message.ephemeral?.viewsLeft

  return (
    <div className={cx(aged && 'opacity-70 transition-opacity duration-[var(--dur-std)]')}>
      {message.replyToId ? <ReplyQuote replyToId={message.replyToId} /> : null}

      {message.body ? (
        <p
          className="whitespace-pre-wrap break-words text-hi"
          style={{ fontSize: 'var(--atm-chat-size)', lineHeight: 'var(--atm-chat-leading)' }}
        >
          {message.body}
        </p>
      ) : null}

      <TranslateStack message={message} />
      <MediaBlock message={message} />

      {viewsLeft !== undefined && viewsLeft > 0 ? (
        <button
          onClick={() => {
            if (viewConsumed) return
            setViewConsumed(true)
            consumeView(message.id)
          }}
          className="mt-1.5 inline-flex"
        >
          <Chip tone="ember">
            <span className="mono-num">{viewsLeft}</span>
            {viewsLeft === 1 ? ' view left' : ' views left'}
            {!viewConsumed ? <span className="text-low"> · tap to spend one</span> : null}
          </Chip>
        </button>
      ) : null}

      {message.reactions?.length ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {message.reactions.map((r) => (
            <span
              key={r.glyph}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-ink-2 px-2 py-0.5 text-12 text-mid"
            >
              {r.glyph === 'seal' ? '◉' : '▲'} <span className="mono-num">{r.count}</span>
            </span>
          ))}
        </div>
      ) : null}

      {message.undoUntil ? (
        <UndoSendBar
          until={message.undoUntil}
          onUndo={() => undoSend(message.id)}
          onDone={() => finishUndo(message.id)}
        />
      ) : null}
    </div>
  )
}

/* -- Meta chips ------------------------------------------------------------ */

function MessageMeta({ message }: { message: Message }) {
  const now = useNow(1000)
  const expiresAt = message.ephemeral?.expiresAt
  const totalMs = message.ephemeral?.totalMs
  const remaining = expiresAt ? new Date(expiresAt).getTime() - now : undefined

  return (
    <span className="flex items-center gap-1.5">
      {expiresAt && totalMs ? (
        <Tooltip side="top" label={`Expires in ${humanDuration(Math.max(0, remaining ?? 0))}`}>
          <EmberRing expiresAt={expiresAt} totalMs={totalMs} size={12} />
        </Tooltip>
      ) : null}
      <span className="mono-num text-12 text-low">{clock(message.ts)}</span>
    </span>
  )
}

/* -- Stream row (channels and groups) -------------------------------------- */

export function StreamRow({
  message,
  grouped,
  selectable,
  selected,
  onSelect,
}: {
  message: Message
  grouped?: boolean
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  const now = useNow(1000)
  const reduce = useReducedMotion()
  const author = maskById(message.authorMaskId)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const own = message.authorMaskId === activeMaskId
  const fraction = ageFraction(message, now)
  const aged = fraction !== undefined && fraction > 0.9
  const dissolving = message.state === 'dissolving'

  if (message.state === 'expired') {
    return (
      <div className="px-[var(--atm-stream-pad)] py-0.5">
        <Tombstone message={message} />
      </div>
    )
  }

  return (
    <motion.div
      layout={!reduce}
      className={cx(
        'group relative flex gap-3 px-[var(--atm-stream-pad)] transition-colors',
        grouped ? 'py-[var(--atm-row-pad)]' : 'pb-[var(--atm-row-pad)] pt-3',
        selected ? 'bg-accent-soft' : 'hover:bg-[rgb(var(--ink-1-rgb)/.6)]',
        dissolving && 'animate-[ember-dissolve_320ms_var(--ease)_forwards]',
      )}
      style={
        dissolving
          ? { boxShadow: 'inset 2px 0 0 0 var(--ember)' }
          : aged
            ? { boxShadow: 'inset 2px 0 0 0 rgb(var(--ember-rgb) / .35)' }
            : undefined
      }
      onClick={selectable ? () => onSelect?.(message.id) : undefined}
    >
      <div className="w-8 shrink-0 pt-0.5">
        {!grouped ? (
          <MaskAvatar maskId={author.id} size={32} presence={false} />
        ) : (
          <span className="mono-num invisible block pt-1 text-12 text-low group-hover:visible">
            {clock(message.ts)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!grouped ? (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span
              className="text-13 font-semibold"
              style={{ color: own ? 'var(--accent)' : `var(--hue-${author.hue})` }}
            >
              {author.displayName}
            </span>
            <MessageMeta message={message} />
          </div>
        ) : null}
        <MessageBody message={message} aged={aged} />
      </div>

      <div className="absolute right-3 top-1.5">
        {!selectable ? <MessageActions message={message} /> : null}
      </div>
    </motion.div>
  )
}

/* -- Bubble row (direct messages) ------------------------------------------ */

export function BubbleRow({ message, grouped }: { message: Message; grouped?: boolean }) {
  const now = useNow(1000)
  const reduce = useReducedMotion()
  const activeMaskId = useApp((s) => s.activeMaskId)
  const author = maskById(message.authorMaskId)
  const own = message.authorMaskId === activeMaskId
  const fraction = ageFraction(message, now)
  const aged = fraction !== undefined && fraction > 0.9
  const dissolving = message.state === 'dissolving'

  if (message.state === 'expired') {
    return (
      <div className={cx('flex px-[var(--atm-stream-pad)] py-0.5', own && 'justify-end')}>
        <Tombstone message={message} />
      </div>
    )
  }

  return (
    <motion.div
      layout={!reduce}
      className={cx(
        'group flex gap-2 px-[var(--atm-stream-pad)]',
        grouped ? 'py-[var(--atm-row-pad)]' : 'pb-[var(--atm-row-pad)] pt-2.5',
        own ? 'flex-row-reverse' : 'flex-row',
        dissolving && 'animate-[ember-dissolve_320ms_var(--ease)_forwards]',
      )}
    >
      <div className="w-7 shrink-0 self-end">
        {!grouped && !own ? <MaskAvatar maskId={author.id} size={28} presence={false} /> : null}
      </div>

      <div className={cx('flex min-w-0 max-w-[min(560px,78%)] flex-col', own && 'items-end')}>
        <div
          className={cx(
            'rounded-card border px-3 py-2',
            own
              ? 'border-[color:var(--accent-line)] bg-accent-soft'
              : 'border-[var(--line)] bg-ink-1',
            aged && 'opacity-75',
          )}
          style={dissolving ? { boxShadow: '0 0 0 1px var(--ember)' } : undefined}
        >
          <MessageBody message={message} aged={false} />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 px-1">
          <MessageMeta message={message} />
          <MessageActions message={message} />
        </div>
      </div>
    </motion.div>
  )
}

/* -- Scheduled ------------------------------------------------------------- */

export function ScheduledRow({ message }: { message: Message }) {
  const author = maskById(message.authorMaskId)
  const removeMessage = useWorld((s) => s.removeMessage)
  const toast = useUi((s) => s.toast)
  const when = message.scheduledFor ?? message.ts

  return (
    <div className="px-[var(--atm-stream-pad)] py-2">
      <div className="flex items-start gap-3 rounded-card border border-dashed border-[color:var(--accent-line)] bg-[rgb(var(--ink-1-rgb)/.6)] p-3">
        <MaskAvatar maskId={author.id} size={28} presence={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-13 font-semibold text-accent">{author.displayName}</span>
            <Chip tone="accent" icon={<Clock size={11} strokeWidth={1.5} />}>
              Sends {new Date(when).toLocaleDateString(undefined, { weekday: 'short' })}{' '}
              <span className="mono-num">{clock(when)}</span>
            </Chip>
          </div>
          <p className="mt-1 text-14 leading-relaxed text-mid">{message.body}</p>
        </div>
        <button
          onClick={() => {
            removeMessage(message.id)
            toast({ kind: 'neutral', title: 'Scheduled message cancelled' })
          }}
          className="shrink-0 rounded-chip px-2 py-1 text-12 text-low hover:bg-ink-2 hover:text-hi"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
