/* ============================================================================
   Fixture contracts. These mirror docs/PROMPT.md section 5 -- extended where a
   screen needs more state, never simplified. The hard states are the product.
   ========================================================================== */

export type Hue = 'cove' | 'iris' | 'saffron' | 'rose' | 'moss' | 'sky' | 'clay' | 'fog'

export type Presence = 'online' | 'away' | 'invisible'

export type Atmosphere = 'hall' | 'studio' | 'salon'

export interface Mask {
  id: string
  handle: string
  displayName: string
  avatar: string
  hue: Hue
  bio?: string
  presence: Presence
  /** Rendered inside the mask switcher: "3 spaces use this mask". */
  spacesUsing?: number
  /** Own masks are switchable; other masks are display-only. */
  own?: boolean
}

export interface User {
  id: string
  masks: Mask[]
  activeMaskId: string
}

export type GateKind = 'zk-age' | 'zk-owner' | 'invite'

export interface Gate {
  kind: GateKind
  label: string
}

export type Retention =
  | { mode: 'timer'; seconds: number }
  | { mode: 'views'; count: number }
  | { mode: 'daily'; at: string }

export interface Channel {
  id: string
  communityId: string
  name: string
  topic?: string
  kind: 'text' | 'voice' | 'announce'
  sealed: boolean
  history: 'full' | 'from-join' | 'none'
  retention?: Retention
  temporary?: { expiresAt: string }
  /** Legacy bridge rooms are the only unsealed thing in the product. */
  legacyBridge?: boolean
  scheduledPost?: { by: string; at: string; preview: string }
  muted?: boolean
}

export interface Community {
  id: string
  name: string
  icon: string
  blurb: string
  sealed: boolean
  gate?: Gate
  usingMaskId: string
  memberEstimate: string
  atmosphere: Atmosphere
  hue: Hue
  /** Murmur intensity 0-1: aliveness without unread counts. */
  murmur: number
  channels: Channel[]
  roles: { id: string; name: string; maskIds: string[] }[]
  staff?: boolean
  public?: boolean
}

export type MediaKind = 'image' | 'video' | 'voice' | 'file'

export interface Media {
  kind: MediaKind
  name: string
  size: string
  /** Deterministic art seed - the prototype paints its own media. */
  art?: string
  durationSec?: number
  blurredPreview?: boolean
  noDownload?: boolean
  burnAfterListen?: boolean
  p2p?: {
    route: 'direct' | 'relay'
    progress: number
    resumable: boolean
    state: 'sending' | 'paused' | 'done' | 'failed'
    throughput?: string
    peerDevice?: string
  }
}

export type MessageState = 'scheduled' | 'sending' | 'sent' | 'dissolving' | 'expired'

export interface Message {
  id: string
  channelId: string
  authorMaskId: string
  ts: string
  body?: string
  media?: Media[]
  state: MessageState
  undoUntil?: string
  ephemeral?: { expiresAt?: string; viewsLeft?: number; totalMs?: number }
  viewOnce?: boolean
  holdToView?: boolean
  watchBudgetSec?: number
  watchedSec?: number
  translated?: { fromLang: string; body: string }
  scheduledFor?: string
  frankingTag: string
  replyToId?: string
  systemNote?: string
  reactions?: { glyph: string; count: number }[]
  pinned?: boolean
}

export interface VoiceRoomLive {
  channelId: string
  e2ee: true
  relay: 'self-hosted' | 'community'
  latencyMs: number
  occupants: { maskId: string; speaking: boolean; muted: boolean; screen?: boolean }[]
}

export interface Story {
  id: string
  authorMaskId: string
  kind: 'text' | 'image' | 'video' | 'voice'
  postedAt: string
  expiresAt: string
  audience: { label: string }
  viewOnce?: boolean
  body?: string
  art?: string
  seenBy?: string
  seen?: boolean
}

export interface VaultItem {
  id: string
  kind: 'note' | 'saved' | 'file' | 'link' | 'clip'
  title: string
  preview: string
  ts: string
  device?: string
  size?: string
  fromChannelId?: string
  host?: string
}

export interface SocialStats {
  optedIn: boolean
  aura: {
    score: number
    trend7: number
    trend30: number
    trend90: number
    peakDay: string
    series: number[]
  }
  reputation: {
    tier: 'Local' | 'Known' | 'Respected' | 'Renowned' | 'Legend'
    points: number
    badges: {
      id: string
      name: string
      kind: 'seasonal' | 'secret' | 'community'
      glyph: string
      note: string
    }[]
  }
}

export interface NotifRule {
  scopeId: string
  scopeLabel: string
  mentionsOnly: boolean
  muteEveryone: boolean
  quietHours?: { from: string; to: string }
  digestAt?: string
  priority: boolean
}

export type ThreadKind = 'dm' | 'group' | 'request'

export interface Thread {
  id: string
  kind: ThreadKind
  title: string
  memberMaskIds: string[]
  sealed: boolean
  retention?: Retention
  pinned?: boolean
  muted?: boolean
  typing?: boolean
  memberNote?: string
  headerNote?: string
  channelId: string
  usingMaskId: string
  requestFromMaskId?: string
}

export interface ChatRow {
  id: string
  threadId: string
  title: string
  snippet: string
  time: string
  avatarMaskId: string
  sealed: boolean
  ember?: { remainingMs: number; totalMs: number }
  pinned?: boolean
  muted?: boolean
  folder: 'dms' | 'spaces' | 'requests'
  murmur?: number
  typing?: boolean
  groupMaskIds?: string[]
}

export interface DiscoverySpace {
  id: string
  name: string
  icon: string
  hue: Hue
  oneLiner: string
  memberEstimate: string
  category: string
  gates: string[]
  sealedEverything?: boolean
  preview: { channel: string; lines: { who: string; hue: Hue; text: string }[] }
}

export interface ModReport {
  id: string
  reporterLabel: string
  reasonLabel: string
  channelName: string
  excerpts: { maskId: string; body: string; frankingTag: string; ts: string }[]
  status: 'open' | 'resolved'
  openedAt: string
}

export interface SessionDevice {
  id: string
  device: string
  platform: string
  fingerprint: string
  lastSeen: string
  current?: boolean
}

export type ActivityEvent =
  | { kind: 'message'; channelId: string; authorMaskId: string; body: string }
  | { kind: 'join-voice'; channelId: string; maskId: string }
  | { kind: 'leave-voice'; channelId: string; maskId: string }
  | { kind: 'speaking'; channelId: string; maskId: string }
  | { kind: 'story'; authorMaskId: string }
  | { kind: 'expire'; channelId: string }
  | { kind: 'typing'; threadId: string }
