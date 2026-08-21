import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Send, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { humanDuration, shortStamp } from '../../lib/time'
import { useNow } from '../../lib/useNow'
import { maskById } from '../../mock/masks'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Chip } from '../primitives/Chip'
import { IconButton } from '../primitives/Button'
import { MaskAvatar } from '../identity/MaskAvatar'
import { MediaArt } from '../messaging/MediaArt'
import { Waveform } from '../voice/Waveform'

const SEGMENT_MS = 6000

export function StoryViewer() {
  const overlay = useUi((s) => s.overlay)
  const payload = useUi((s) => s.overlayPayload)
  const closeOverlay = useUi((s) => s.closeOverlay)
  const toast = useUi((s) => s.toast)
  const stories = useWorld((s) => s.stories)
  const markStorySeen = useWorld((s) => s.markStorySeen)
  const consumeStoryViewOnce = useWorld((s) => s.consumeStoryViewOnce)
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const now = useNow(1000)

  const open = overlay === 'story-viewer'
  const authorId = typeof payload === 'string' ? payload : ''
  const items = useMemo(
    () => stories.filter((s) => s.authorMaskId === authorId),
    [stories, authorId],
  )

  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reply, setReply] = useState('')

  useEffect(() => {
    if (open) {
      setIndex(0)
      setProgress(0)
      setReply('')
    }
  }, [open, authorId])

  const current = items[index]

  useEffect(() => {
    if (!open || !current || paused) return
    setProgress(0)
    const start = Date.now()
    const id = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / SEGMENT_MS)
      setProgress(p)
      if (p >= 1) {
        window.clearInterval(id)
        markStorySeen(current.id)
        if (current.viewOnce) consumeStoryViewOnce(current.id)
        if (index + 1 < items.length) setIndex(index + 1)
        else closeOverlay()
      }
    }, 60)
    return () => window.clearInterval(id)
  }, [open, current, index, items.length, paused, markStorySeen, consumeStoryViewOnce, closeOverlay])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(items.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'Escape') closeOverlay()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, items.length, closeOverlay])

  if (!open || !current) return null
  const author = maskById(current.authorMaskId)
  const expiresIn = humanDuration(new Date(current.expiresAt).getTime() - now)
  const tombstoned = current.viewOnce && current.seen && !current.body

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgb(4_6_10/.92)] p-0 sm:p-6">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
          className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-[var(--line)] bg-ink-1 sm:h-[min(760px,92dvh)] sm:rounded-modal sm:border"
        >
          {/* progress segments */}
          <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
            {items.map((s, i) => (
              <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-[rgb(255_255_255/.22)]">
                <span
                  className="block h-full rounded-full bg-hi"
                  style={{
                    width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
                    transition: i === index ? 'width 60ms linear' : undefined,
                  }}
                />
              </span>
            ))}
          </div>

          <div className="absolute inset-x-0 top-6 z-20 flex items-center gap-2.5 px-3 pt-2">
            <MaskAvatar maskId={author.id} size={30} presence={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-13 text-hi">{author.displayName}</p>
              <p className="mono-num truncate text-12 text-[rgb(255_255_255/.6)]">
                {shortStamp(current.postedAt)} · expires in {expiresIn}
              </p>
            </div>
            <IconButton label="Close" size="sm" onClick={closeOverlay}>
              <X size={16} strokeWidth={1.5} />
            </IconButton>
          </div>

          {/* content */}
          <div className="relative min-h-0 flex-1">
            {current.art ? (
              <div className="absolute inset-0">
                <MediaArt seed={current.art} rounded={false} />
              </div>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(120% 80% at 30% 20%, rgb(var(--hue-${author.hue}-rgb) / .35), var(--ink-0))`,
                }}
              />
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              {tombstoned ? (
                <p className="text-15 italic text-[rgb(255_255_255/.55)]">
                  Story expired · it was view-once
                </p>
              ) : (
                <>
                  {current.kind === 'voice' ? <Waveform bars={5} size={26} /> : null}
                  {current.body ? (
                    <p className="font-display text-20 leading-snug text-hi drop-shadow-[0_2px_12px_rgb(0_0_0/.6)]">
                      {current.body}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            {/* tap zones */}
            <button
              aria-label="Previous"
              className="absolute inset-y-0 left-0 w-1/3"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              onPointerDown={() => setPaused(true)}
              onPointerUp={() => setPaused(false)}
            />
            <button
              aria-label="Next"
              className="absolute inset-y-0 right-0 w-2/3"
              onClick={() => {
                markStorySeen(current.id)
                if (current.viewOnce) consumeStoryViewOnce(current.id)
                if (index + 1 < items.length) setIndex(index + 1)
                else closeOverlay()
              }}
              onPointerDown={() => setPaused(true)}
              onPointerUp={() => setPaused(false)}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-[rgb(11_14_19/.85)] to-transparent px-3 pb-3 pt-10">
              <Chip tone="accent">{current.audience.label}</Chip>
              {current.viewOnce ? <Chip tone="ember">view-once</Chip> : null}
              {current.seenBy ? (
                <span className="mono-num ml-auto text-12 text-[rgb(255_255_255/.65)]">
                  Seen by {current.seenBy}
                </span>
              ) : null}
            </div>
          </div>

          {/* reply */}
          <div className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] bg-ink-1 px-3 py-2.5">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              placeholder={`Reply to ${author.displayName}`}
              aria-label="Reply"
              className="h-9 min-w-0 flex-1 rounded-chip border border-[var(--line)] bg-ink-2 px-3 text-13 text-hi outline-none placeholder:text-low focus:border-[color:var(--accent-line)]"
            />
            <IconButton
              label="Send reply"
              variant={reply.trim() ? 'solid' : 'ghost'}
              disabled={!reply.trim()}
              onClick={() => {
                closeOverlay()
                toast({
                  kind: 'accent',
                  title: 'Reply sent as a direct message',
                  body: 'Story replies never appear in the story.',
                })
                navigate('/chats/th-mira')
              }}
            >
              <Send size={15} strokeWidth={1.8} />
            </IconButton>
          </div>

          <button
            aria-label="Previous story"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={cx(
              'absolute left-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[rgb(11_14_19/.6)] text-hi sm:flex',
              index === 0 && 'opacity-30',
            )}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Next story"
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            className={cx(
              'absolute right-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[rgb(11_14_19/.6)] text-hi sm:flex',
              index === items.length - 1 && 'opacity-30',
            )}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
