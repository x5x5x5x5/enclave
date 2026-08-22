import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, FileText, Hand, Pause, Play } from 'lucide-react'
import { cx } from '../../lib/cx'
import { mmss } from '../../lib/time'
import type { Media, Message } from '../../mock/types'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Chip } from '../primitives/Chip'
import { Tooltip } from '../primitives/Overlay'
import { MediaArt } from './MediaArt'
import { TransferCard } from '../files/TransferCard'

/* -- Image ----------------------------------------------------------------- */

function ImageTile({ media, message, tall }: { media: Media; message: Message; tall?: boolean }) {
  const revealed = useWorld((s) => s.revealedBlur.includes(message.id))
  const revealBlur = useWorld((s) => s.revealBlur)
  const openedViewOnce = useWorld((s) => s.openedViewOnce.includes(message.id))
  const openViewOnce = useWorld((s) => s.openViewOnce)
  const expireViewOnce = useWorld((s) => s.expireViewOnce)
  const [held, setHeld] = useState(false)

  const blurred = media.blurredPreview && !revealed
  const viewOnce = message.viewOnce && !openedViewOnce
  const hold = message.holdToView && !held

  const covered = blurred || viewOnce || hold

  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-[8px] border border-[var(--line)] bg-ink-2',
        tall ? 'aspect-[4/5]' : 'aspect-[4/3]',
      )}
    >
      <div
        className="h-full w-full transition-[filter,opacity] duration-[var(--dur-std)]"
        style={{ filter: covered ? 'blur(18px) saturate(.5)' : 'none' }}
      >
        <MediaArt seed={media.art ?? media.name} rounded={false} />
      </div>

      {blurred ? (
        <button
          onClick={() => revealBlur(message.id)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgb(11_14_19/.35)] text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-ink-1 text-mid">
            <Eye size={16} strokeWidth={1.5} />
          </span>
          <span className="text-12 text-hi">Blurred until you open it</span>
        </button>
      ) : null}

      {!blurred && viewOnce ? (
        <button
          onClick={() => openViewOnce(message.id)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgb(11_14_19/.42)] text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--ember-glow)] bg-ember-soft text-ember">
            <Eye size={16} strokeWidth={1.5} />
          </span>
          <span className="text-12 text-hi">Tap to view — once</span>
          <span className="text-12 text-low">It will not come back.</span>
        </button>
      ) : null}

      {!blurred && !viewOnce && message.viewOnce && openedViewOnce ? (
        <button
          onClick={() => expireViewOnce(message.id)}
          className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[rgb(11_14_19/.72)] px-2.5 py-1.5"
        >
          <span className="text-12 text-ember">Open — closing removes it</span>
          <span className="text-12 text-low">Close</span>
        </button>
      ) : null}

      {message.holdToView ? (
        <button
          onPointerDown={() => setHeld(true)}
          onPointerUp={() => setHeld(false)}
          onPointerLeave={() => setHeld(false)}
          onKeyDown={(e) => e.key === ' ' && setHeld(true)}
          onKeyUp={() => setHeld(false)}
          onContextMenu={(e) => e.preventDefault()}
          className={cx(
            'no-callout absolute inset-0 flex flex-col items-center justify-center gap-2 text-center transition-colors',
            held ? 'bg-transparent' : 'bg-[rgb(11_14_19/.42)]',
          )}
        >
          {!held ? (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-ink-1 text-mid">
                <Hand size={16} strokeWidth={1.5} />
              </span>
              <span className="text-12 text-hi">Hold to view</span>
            </>
          ) : null}
        </button>
      ) : null}

      {media.noDownload ? (
        <Chip tone="neutral" className="absolute right-2 top-2 bg-[rgb(11_14_19/.7)]">
          <EyeOff size={11} strokeWidth={1.5} /> View in app only
        </Chip>
      ) : null}
    </div>
  )
}

/* -- Video with a watch budget --------------------------------------------- */

function VideoTile({ media, message }: { media: Media; message: Message }) {
  const watched = useWorld((s) => s.watched[message.id] ?? message.watchedSec ?? 0)
  const watch = useWorld((s) => s.watch)
  const later = useUi((s) => s.later)
  const [playing, setPlaying] = useState(false)
  const budget = message.watchBudgetSec ?? media.durationSec ?? 30
  const left = Math.max(0, budget - watched)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const next = (useWorld.getState().watched[message.id] ?? message.watchedSec ?? 0) + 1
      watch(message.id, Math.min(budget, next))
      if (next >= budget) setPlaying(false)
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, budget, message.id, message.watchedSec, watch])

  return (
    <div className="relative aspect-video overflow-hidden rounded-[8px] border border-[var(--line)] bg-ink-2">
      <MediaArt seed={media.art ?? media.name} rounded={false} />
      <button
        onClick={() => (left > 0 ? setPlaying((p) => !p) : later('Asking for more watch time'))}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <span
          className={cx(
            'flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-colors',
            left > 0
              ? 'border-[var(--line)] bg-[rgb(11_14_19/.6)] text-hi'
              : 'border-[color:var(--ember-glow)] bg-[rgb(11_14_19/.75)] text-ember',
          )}
        >
          {playing ? <Pause size={17} strokeWidth={1.5} /> : <Play size={17} strokeWidth={1.5} />}
        </span>
      </button>
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
        <Chip tone="ember">
          <span className="mono-num">
            {mmss(left)} of {mmss(budget)} left
          </span>
        </Chip>
        <span className="mono-num text-12 text-hi/80">{media.size}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--line)]">
        <div
          className="h-full bg-ember"
          style={{ width: `${(watched / budget) * 100}%`, transition: 'width 1s linear' }}
        />
      </div>
    </div>
  )
}

/* -- Voice note ------------------------------------------------------------ */

function VoiceNote({ media, message }: { media: Media; message: Message }) {
  const burned = useWorld((s) => s.burnedVoice.includes(message.id))
  const burnVoice = useWorld((s) => s.burnVoice)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const duration = media.durationSec ?? 12
  const bars = useRef(
    Array.from({ length: 34 }, (_, i) => 0.25 + Math.abs(Math.sin((i + 1) * 1.7)) * 0.75),
  )

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setPos((p) => {
        const next = p + 1
        if (next >= duration) {
          setPlaying(false)
          if (media.burnAfterListen) burnVoice(message.id)
          return duration
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, duration, media.burnAfterListen, burnVoice, message.id])

  const progress = pos / duration

  return (
    <div
      className={cx(
        'flex items-center gap-3 rounded-[8px] border px-3 py-2.5',
        media.burnAfterListen
          ? 'border-[color:var(--ember-glow)] bg-ember-soft'
          : 'border-[var(--line)] bg-ink-2',
      )}
    >
      <button
        onClick={() => !burned && setPlaying((p) => !p)}
        disabled={burned}
        aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        className={cx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors md:h-9 md:w-9',
          burned
            ? 'bg-ink-3 text-low'
            : media.burnAfterListen
              ? 'bg-ember text-[var(--ink-0)]'
              : 'bg-accent text-[var(--ink-0)]',
        )}
      >
        {playing ? <Pause size={15} strokeWidth={2} /> : <Play size={15} strokeWidth={2} />}
      </button>

      <div className="flex h-8 min-w-0 flex-1 items-center gap-[2px]">
        {bars.current.map((h, i) => {
          const active = i / bars.current.length <= progress
          return (
            <span
              key={i}
              className="w-full rounded-full transition-colors"
              style={{
                height: `${h * 100}%`,
                background: burned
                  ? 'var(--line)'
                  : active
                    ? media.burnAfterListen
                      ? 'var(--ember)'
                      : 'var(--accent)'
                    : 'var(--line)',
              }}
            />
          )
        })}
      </div>

      <div className="shrink-0 text-right">
        <p className="mono-num text-12 text-mid">{mmss(duration - pos)}</p>
        {media.burnAfterListen ? (
          <p className="text-12 text-ember">{burned ? 'burnt' : 'burns after one listen'}</p>
        ) : null}
      </div>
    </div>
  )
}

/* -- File ------------------------------------------------------------------ */

function FileRow({ media, message }: { media: Media; message: Message }) {
  const later = useUi((s) => s.later)
  if (media.p2p) return <TransferCard media={media} messageId={message.id} />

  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[var(--line)] bg-ink-2 px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--line)] bg-ink-1 text-mid">
        <FileText size={16} strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-13 text-hi">{media.name}</p>
        <p className="mono-num text-12 text-low">{media.size}</p>
      </div>
      {media.noDownload ? (
        <Tooltip
          side="top"
          label="This file never leaves the app. There is no copy to hand on."
        >
          <Chip tone="neutral">
            <EyeOff size={11} strokeWidth={1.5} /> View in app only
          </Chip>
        </Tooltip>
      ) : (
        <button
          onClick={() => later('Downloading files')}
          className="rounded-chip px-2 py-1 text-12 text-accent hover:bg-accent-soft"
        >
          Save
        </button>
      )}
    </div>
  )
}

/* -- Grid ------------------------------------------------------------------ */

export function MediaBlock({ message }: { message: Message }) {
  const media = message.media
  if (!media || media.length === 0) return null

  const images = media.filter((m) => m.kind === 'image')
  const rest = media.filter((m) => m.kind !== 'image')

  return (
    <div className="mt-1.5 flex max-w-md flex-col gap-2">
      {images.length > 0 ? (
        <div
          className={cx(
            'grid gap-1.5',
            images.length === 1 && 'grid-cols-1',
            images.length === 2 && 'grid-cols-2',
            images.length >= 3 && 'grid-cols-3',
          )}
        >
          {images.map((m, i) => (
            <ImageTile key={m.name + i} media={m} message={message} tall={images.length >= 3} />
          ))}
        </div>
      ) : null}

      {rest.map((m, i) => {
        if (m.kind === 'video') return <VideoTile key={m.name + i} media={m} message={message} />
        if (m.kind === 'voice') return <VoiceNote key={m.name + i} media={m} message={message} />
        return <FileRow key={m.name + i} media={m} message={message} />
      })}
    </div>
  )
}
