import { create } from 'zustand'
import { frank } from '../lib/hash'
import { DAY, HOUR, MINUTE, SECOND } from '../lib/time'
import { MESSAGES } from '../mock/messages'
import { STORIES } from '../mock/stories'
import { VOICE_ROOMS } from '../mock/voice'
import { MOD_REPORTS } from '../mock/moderation'
import { ACTIVITY_SCRIPT, DEMO_STORY_BODY, delayForIndex } from '../mock/activity'
import type { Message, ModReport, Story, VoiceRoomLive } from '../mock/types'

export type EmberChoice =
  | { mode: 'off' }
  | { mode: 'timer'; ms: number }
  | { mode: 'views'; count: number }

interface WorldState {
  messages: Message[]
  voice: VoiceRoomLive[]
  stories: Story[]
  reports: ModReport[]

  /* per-message viewer state the fixtures cannot hold */
  openedViewOnce: string[]
  burnedVoice: string[]
  revealedBlur: string[]
  shownOriginal: string[]
  watched: Record<string, number>
  savedToVault: string[]

  /* demo mode */
  demoMode: boolean
  demoTick: number
  typingIn: string | null

  /* composer */
  ember: EmberChoice
  blurAttachments: boolean

  setEmber: (e: EmberChoice) => void
  toggleBlurAttachments: () => void

  send: (channelId: string, authorMaskId: string, body: string, scheduledFor?: string) => string
  undoSend: (id: string) => void
  finishUndo: (id: string) => void
  dissolve: (id: string) => void
  removeMessage: (id: string) => void

  openViewOnce: (id: string) => void
  expireViewOnce: (id: string) => void
  burnVoice: (id: string) => void
  revealBlur: (id: string) => void
  toggleOriginal: (id: string) => void
  watch: (id: string, seconds: number) => void
  consumeView: (id: string) => void
  saveToVault: (id: string) => void

  setTransferState: (messageId: string, state: 'sending' | 'paused' | 'done' | 'failed') => void
  advanceTransfers: () => void

  joinVoice: (channelId: string, maskId: string) => void
  leaveVoice: (channelId: string, maskId: string) => void
  setSpeaking: (channelId: string, maskId: string, speaking: boolean) => void
  toggleMute: (channelId: string, maskId: string) => void

  markStorySeen: (id: string) => void
  addStory: (story: Story) => void
  consumeStoryViewOnce: (id: string) => void

  submitReport: (report: ModReport) => void
  resolveReport: (id: string) => void

  setDemoMode: (on: boolean) => void
  applyEvent: (index: number) => void
  setTyping: (threadId: string | null) => void
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

interface Snapshot {
  messages: Message[]
  voice: VoiceRoomLive[]
  stories: Story[]
}

let snapshot: Snapshot | null = null
let demoTimer: number | undefined
let demoIndex = 0

let sendSeq = 0

export const useWorld = create<WorldState>((set, get) => ({
  messages: clone(MESSAGES),
  voice: clone(VOICE_ROOMS),
  stories: clone(STORIES),
  reports: clone(MOD_REPORTS),

  openedViewOnce: [],
  burnedVoice: [],
  revealedBlur: [],
  shownOriginal: [],
  watched: {},
  savedToVault: [],

  demoMode: false,
  demoTick: 0,
  typingIn: null,

  ember: { mode: 'off' },
  blurAttachments: false,

  setEmber: (ember) => set({ ember }),
  toggleBlurAttachments: () => set((s) => ({ blurAttachments: !s.blurAttachments })),

  send: (channelId, authorMaskId, body, scheduledFor) => {
    const id = `sent-${++sendSeq}`
    const now = Date.now()
    const ember = get().ember
    const message: Message = {
      id,
      channelId,
      authorMaskId,
      ts: scheduledFor ?? new Date(now).toISOString(),
      body,
      state: scheduledFor ? 'scheduled' : 'sent',
      frankingTag: frank(id + body),
      undoUntil: scheduledFor ? undefined : new Date(now + 5 * SECOND).toISOString(),
      scheduledFor,
      ephemeral:
        ember.mode === 'timer'
          ? { expiresAt: new Date(now + ember.ms).toISOString(), totalMs: ember.ms }
          : ember.mode === 'views'
            ? { viewsLeft: ember.count }
            : undefined,
      media: get().blurAttachments ? undefined : undefined,
    }
    set((s) => ({ messages: [...s.messages, message] }))
    return id
  },

  undoSend: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  finishUndo: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, undoUntil: undefined } : m)),
    })),

  dissolve: (id) => {
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, state: 'dissolving' } : m)),
    }))
    window.setTimeout(() => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === id
            ? {
                ...m,
                state: 'expired',
                body: undefined,
                media: undefined,
                systemNote: 'Message expired · sealed by key rotation',
              }
            : m,
        ),
      }))
    }, 320)
  },

  removeMessage: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  openViewOnce: (id) => set((s) => ({ openedViewOnce: [...new Set([...s.openedViewOnce, id])] })),
  expireViewOnce: (id) => {
    get().dissolve(id)
  },
  burnVoice: (id) => {
    set((s) => ({ burnedVoice: [...new Set([...s.burnedVoice, id])] }))
    window.setTimeout(() => get().dissolve(id), 400)
  },
  revealBlur: (id) => set((s) => ({ revealedBlur: [...new Set([...s.revealedBlur, id])] })),
  toggleOriginal: (id) =>
    set((s) => ({
      shownOriginal: s.shownOriginal.includes(id)
        ? s.shownOriginal.filter((x) => x !== id)
        : [...s.shownOriginal, id],
    })),
  watch: (id, seconds) => set((s) => ({ watched: { ...s.watched, [id]: seconds } })),

  consumeView: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== id || !m.ephemeral?.viewsLeft) return m
        const viewsLeft = m.ephemeral.viewsLeft - 1
        if (viewsLeft <= 0) {
          return {
            ...m,
            state: 'expired',
            body: undefined,
            media: undefined,
            ephemeral: { viewsLeft: 0 },
            systemNote: 'Message expired · no views left',
          }
        }
        return { ...m, ephemeral: { ...m.ephemeral, viewsLeft } }
      }),
    })),

  saveToVault: (id) => set((s) => ({ savedToVault: [...new Set([...s.savedToVault, id])] })),

  setTransferState: (messageId, state) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.media
          ? {
              ...m,
              media: m.media.map((md) =>
                md.p2p ? { ...md, p2p: { ...md.p2p, state } } : md,
              ),
            }
          : m,
      ),
    })),

  advanceTransfers: () =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (!m.media?.some((md) => md.p2p?.state === 'sending')) return m
        return {
          ...m,
          media: m.media.map((md) => {
            if (!md.p2p || md.p2p.state !== 'sending') return md
            const progress = Math.min(1, md.p2p.progress + (md.p2p.route === 'direct' ? 0.012 : 0.005))
            return {
              ...md,
              p2p: { ...md.p2p, progress, state: progress >= 1 ? 'done' : 'sending' },
            }
          }),
        }
      }),
    })),

  joinVoice: (channelId, maskId) =>
    set((s) => ({
      voice: s.voice.map((r) =>
        r.channelId === channelId && !r.occupants.some((o) => o.maskId === maskId)
          ? { ...r, occupants: [...r.occupants, { maskId, speaking: false, muted: false }] }
          : r,
      ),
    })),

  leaveVoice: (channelId, maskId) =>
    set((s) => ({
      voice: s.voice.map((r) =>
        r.channelId === channelId
          ? { ...r, occupants: r.occupants.filter((o) => o.maskId !== maskId) }
          : r,
      ),
    })),

  setSpeaking: (channelId, maskId, speaking) =>
    set((s) => ({
      voice: s.voice.map((r) =>
        r.channelId === channelId
          ? {
              ...r,
              occupants: r.occupants.map((o) => (o.maskId === maskId ? { ...o, speaking } : o)),
            }
          : r,
      ),
    })),

  toggleMute: (channelId, maskId) =>
    set((s) => ({
      voice: s.voice.map((r) =>
        r.channelId === channelId
          ? {
              ...r,
              occupants: r.occupants.map((o) =>
                o.maskId === maskId ? { ...o, muted: !o.muted, speaking: false } : o,
              ),
            }
          : r,
      ),
    })),

  markStorySeen: (id) =>
    set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, seen: true } : st)) })),

  addStory: (story) => set((s) => ({ stories: [...s.stories, story] })),

  consumeStoryViewOnce: (id) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id === id ? { ...st, seen: true, body: undefined, art: undefined, kind: 'text' } : st,
      ),
    })),

  submitReport: (report) => set((s) => ({ reports: [report, ...s.reports] })),
  resolveReport: (id) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)),
    })),

  setTyping: (typingIn) => set({ typingIn }),

  applyEvent: (index) => {
    const ev = ACTIVITY_SCRIPT[index % ACTIVITY_SCRIPT.length]
    const s = get()
    switch (ev.kind) {
      case 'message': {
        const id = `demo-${index}`
        if (s.messages.some((m) => m.id === id)) break
        set((st) => ({
          messages: [
            ...st.messages,
            {
              id,
              channelId: ev.channelId,
              authorMaskId: ev.authorMaskId,
              ts: new Date().toISOString(),
              body: ev.body,
              state: 'sent',
              frankingTag: frank(id),
              ephemeral:
                ev.channelId === 'ch-raids'
                  ? { expiresAt: new Date(Date.now() + DAY).toISOString(), totalMs: DAY }
                  : undefined,
            },
          ],
        }))
        break
      }
      case 'join-voice':
        s.joinVoice(ev.channelId, ev.maskId)
        break
      case 'leave-voice':
        s.leaveVoice(ev.channelId, ev.maskId)
        break
      case 'speaking': {
        s.voice
          .find((r) => r.channelId === ev.channelId)
          ?.occupants.forEach((o) => s.setSpeaking(ev.channelId, o.maskId, false))
        s.setSpeaking(ev.channelId, ev.maskId, true)
        break
      }
      case 'story': {
        const id = `demo-story-${index}`
        if (s.stories.some((st) => st.id === id)) break
        s.addStory({
          id,
          authorMaskId: ev.authorMaskId,
          kind: 'text',
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + DAY).toISOString(),
          audience: { label: 'Close friends' },
          body: DEMO_STORY_BODY,
          seenBy: '~2',
        })
        break
      }
      case 'expire': {
        const victim = s.messages.find(
          (m) =>
            m.channelId === ev.channelId &&
            m.state === 'sent' &&
            m.ephemeral?.expiresAt &&
            new Date(m.ephemeral.expiresAt).getTime() - Date.now() < 12 * HOUR,
        )
        if (victim) s.dissolve(victim.id)
        break
      }
      case 'typing': {
        s.setTyping(ev.threadId)
        window.setTimeout(() => {
          if (get().typingIn === ev.threadId) get().setTyping(null)
        }, 4 * SECOND)
        break
      }
    }
    set({ demoTick: index + 1 })
  },

  setDemoMode: (on) => {
    if (on === get().demoMode) return
    if (on) {
      snapshot = {
        messages: clone(get().messages),
        voice: clone(get().voice),
        stories: clone(get().stories),
      }
      demoIndex = 0
      set({ demoMode: true })
      const schedule = () => {
        demoTimer = window.setTimeout(() => {
          get().applyEvent(demoIndex)
          demoIndex += 1
          if (get().demoMode) schedule()
        }, delayForIndex(demoIndex))
      }
      schedule()
    } else {
      if (demoTimer !== undefined) window.clearTimeout(demoTimer)
      demoTimer = undefined
      const restore = snapshot
      snapshot = null
      set({
        demoMode: false,
        typingIn: null,
        demoTick: 0,
        ...(restore
          ? { messages: restore.messages, voice: restore.voice, stories: restore.stories }
          : {}),
      })
    }
  },
}))

/** How long a retention room lets a message live, in ms. */
export function lifeOf(message: Message): number | undefined {
  return message.ephemeral?.totalMs
}

/** Age fraction 0..1. Past 0.9 the message is "aged" and shows its ember. */
export function ageFraction(message: Message, now: number): number | undefined {
  const { ephemeral } = message
  if (!ephemeral?.expiresAt || !ephemeral.totalMs) return undefined
  const remaining = new Date(ephemeral.expiresAt).getTime() - now
  return Math.min(1, Math.max(0, 1 - remaining / ephemeral.totalMs))
}

export const EMBER_OPTIONS: { id: string; label: string; value: EmberChoice }[] = [
  { id: 'off', label: 'Off', value: { mode: 'off' } },
  { id: '30s', label: '30s', value: { mode: 'timer', ms: 30 * SECOND } },
  { id: '1h', label: '1h', value: { mode: 'timer', ms: HOUR } },
  { id: '24h', label: '24h', value: { mode: 'timer', ms: DAY } },
  { id: '7d', label: '7d', value: { mode: 'timer', ms: 7 * DAY } },
  { id: '3v', label: '3 views', value: { mode: 'views', count: 3 } },
  { id: 'custom', label: 'Custom', value: { mode: 'timer', ms: 45 * MINUTE } },
]
