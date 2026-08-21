import { COMMUNITIES, channelById, communityById, communityOfChannel } from './communities'
import { ALL_MASKS, OWN_MASKS, USER, maskById } from './masks'
import { THREADS, threadById } from './threads'
import type { Atmosphere, Channel, Hue, Mask, Retention, ThreadKind } from './types'

export * from './types'
export { COMMUNITIES, CHANNELS, channelById, communityById, communityOfChannel } from './communities'
export { ALL_MASKS, AVATAR_PRESETS, OWN_MASKS, PEOPLE, USER, isOwnMask, maskById } from './masks'
export { MESSAGES, messageById, messagesFor } from './messages'
export { CHAT_ROWS, THREADS, threadById } from './threads'
export { STORIES, storiesByAuthor } from './stories'
export { VAULT, VAULT_TABS } from './vault'
export { VOICE_ROOMS, voiceRoom } from './voice'
export { DISCOVERY, DISCOVERY_CATEGORIES } from './discovery'
export { MOD_REPORTS, REPORT_REASONS } from './moderation'
export {
  SOCIAL,
  PROFILE_BLOCKS,
  AUDIENCES,
  AUDIENCE_VISIBILITY,
  AUDIENCE_KNOWS,
  SOCIAL_CARD_TEMPLATES,
} from './social'
export { ACTIVITY_SCRIPT, delayForIndex } from './activity'

export const HUES: Hue[] = ['cove', 'iris', 'saffron', 'rose', 'moss', 'sky', 'clay', 'fog']

export const HUE_LABEL: Record<Hue, string> = {
  cove: 'Cove',
  iris: 'Iris',
  saffron: 'Saffron',
  rose: 'Rose',
  moss: 'Moss',
  sky: 'Sky',
  clay: 'Clay',
  fog: 'Fog',
}

/** A room can be a community channel or a serverless thread. Resolve either. */
export interface RoomRef {
  id: string
  title: string
  subtitle?: string
  sealed: boolean
  retention?: Retention
  history: Channel['history']
  kind: ThreadKind | Channel['kind']
  communityId?: string
  atmosphere: Atmosphere
  usingMaskId: string
  memberEstimate?: string
  memberMaskIds?: string[]
  topic?: string
  legacyBridge?: boolean
  temporaryUntil?: string
  headerNote?: string
  requestFromMaskId?: string
}

export function resolveRoom(id: string): RoomRef | undefined {
  const channel = channelById(id)
  if (channel) {
    const community = communityOfChannel(channel.id)
    return {
      id: channel.id,
      title: `#${channel.name}`,
      subtitle: community?.name,
      sealed: channel.sealed,
      retention: channel.retention,
      history: channel.history,
      kind: channel.kind,
      communityId: community?.id,
      atmosphere: community?.atmosphere ?? 'hall',
      usingMaskId: community?.usingMaskId ?? USER.activeMaskId,
      memberEstimate: community?.memberEstimate,
      memberMaskIds: community?.roles.flatMap((r) => r.maskIds),
      topic: channel.topic,
      legacyBridge: channel.legacyBridge,
      temporaryUntil: channel.temporary?.expiresAt,
    }
  }
  const thread = threadById(id)
  if (thread) {
    return {
      id: thread.id,
      title: thread.title,
      subtitle: thread.memberNote,
      sealed: thread.sealed,
      retention: thread.retention,
      history: 'full',
      kind: thread.kind,
      atmosphere: 'studio',
      usingMaskId: thread.usingMaskId,
      memberMaskIds: thread.memberMaskIds,
      headerNote: thread.headerNote,
      requestFromMaskId: thread.requestFromMaskId,
    }
  }
  return undefined
}

/** Voice rooms show as tiles, not conversations. */
export function isVoiceRoom(id: string): boolean {
  return channelById(id)?.kind === 'voice'
}

export function maskForCommunity(communityId: string): Mask {
  const community = communityById(communityId)
  return maskById(community?.usingMaskId ?? USER.activeMaskId)
}

/** Which of your masks a given space knows you as, for the identity chip. */
export function spacesUsingMask(maskId: string): string[] {
  return COMMUNITIES.filter((c) => c.usingMaskId === maskId).map((c) => c.name)
}

export const PEOPLE_BY_HUE = Object.fromEntries(
  ALL_MASKS.map((m) => [m.id, m.hue]),
) as Record<string, Hue>

export const OWN_MASK_IDS = OWN_MASKS.map((m) => m.id)

export const ALL_ROOM_IDS = [
  ...COMMUNITIES.flatMap((c) => c.channels.map((ch) => ch.id)),
  ...THREADS.map((t) => t.id),
]
