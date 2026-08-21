import { ahead } from '../lib/time'
import { DAY, HOUR, MINUTE } from '../lib/time'
import type { Community } from './types'

/* ============================================================================
   Three spaces, three atmospheres. The shell reshapes itself per space, so
   these fixtures carry layout intent, not just content.
   ========================================================================== */

export const COMMUNITIES: Community[] = [
  {
    id: 'c-lostera',
    name: 'LostEra',
    icon: 'LE',
    blurb: 'Late-night raids, patch arguments, and one very loud lounge.',
    sealed: true,
    usingMaskId: 'm-aija',
    memberEstimate: '~2.4k',
    atmosphere: 'hall',
    hue: 'cove',
    murmur: 0.9,
    staff: true,
    public: true,
    roles: [
      { id: 'r-staff', name: 'Staff', maskIds: ['p-konstantin', 'm-aija'] },
      { id: 'r-raiders', name: 'Raiders', maskIds: ['p-rho', 'p-vex', 'p-pixel'] },
      { id: 'r-members', name: 'Members', maskIds: ['p-lark'] },
    ],
    channels: [
      {
        id: 'ch-announcements',
        communityId: 'c-lostera',
        name: 'announcements',
        topic: 'Read-only. Staff post here.',
        kind: 'announce',
        sealed: true,
        history: 'full',
        scheduledPost: {
          by: 'p-konstantin',
          at: ahead(14 * HOUR),
          preview: 'Season 4 maintenance window — servers down 03:00–05:00.',
        },
      },
      {
        id: 'ch-general',
        communityId: 'c-lostera',
        name: 'general',
        topic: 'Bridged from the old forum. Not sealed.',
        kind: 'text',
        sealed: false,
        legacyBridge: true,
        history: 'full',
      },
      {
        id: 'ch-raids',
        communityId: 'c-lostera',
        name: 'raids',
        topic: 'Planning, callouts, post-mortems.',
        kind: 'text',
        sealed: true,
        history: 'full',
        retention: { mode: 'timer', seconds: DAY / 1000 },
      },
      {
        id: 'ch-trade',
        communityId: 'c-lostera',
        name: 'trade',
        topic: 'Offers clear after three people have seen them.',
        kind: 'text',
        sealed: true,
        history: 'full',
        retention: { mode: 'views', count: 3 },
      },
      {
        id: 'ch-staff',
        communityId: 'c-lostera',
        name: 'staff',
        topic: 'You only see what was said after you joined.',
        kind: 'text',
        sealed: true,
        history: 'none',
      },
      {
        id: 'ch-lounge',
        communityId: 'c-lostera',
        name: 'Lounge',
        kind: 'voice',
        sealed: true,
        history: 'none',
      },
      {
        id: 'ch-raidnight',
        communityId: 'c-lostera',
        name: 'Raid Night',
        kind: 'voice',
        sealed: true,
        history: 'none',
        temporary: { expiresAt: ahead(2 * HOUR + 14 * MINUTE) },
      },
    ],
  },
  {
    id: 'c-atelier',
    name: 'Atelier Nord',
    icon: 'AN',
    blurb: 'A small studio. Briefs in, crits out.',
    sealed: true,
    gate: { kind: 'invite', label: 'Invite only' },
    usingMaskId: 'm-nova',
    memberEstimate: '~340',
    atmosphere: 'studio',
    hue: 'iris',
    murmur: 0.45,
    public: false,
    roles: [
      { id: 'r-leads', name: 'Leads', maskIds: ['p-lark'] },
      { id: 'r-studio', name: 'Studio', maskIds: ['m-nova', 'p-anselme'] },
    ],
    channels: [
      {
        id: 'ch-brief',
        communityId: 'c-atelier',
        name: 'brief',
        topic: 'This week, and only this week.',
        kind: 'announce',
        sealed: true,
        history: 'full',
      },
      {
        id: 'ch-designcrit',
        communityId: 'c-atelier',
        name: 'design-crit',
        topic: 'Say the useful thing.',
        kind: 'text',
        sealed: true,
        history: 'full',
      },
      {
        id: 'ch-scratchpad',
        communityId: 'c-atelier',
        name: 'scratchpad',
        topic: 'Wiped every morning. Write freely.',
        kind: 'text',
        sealed: true,
        history: 'full',
        retention: { mode: 'daily', at: '04:00' },
      },
      {
        id: 'ch-standup',
        communityId: 'c-atelier',
        name: 'Standup',
        kind: 'voice',
        sealed: true,
        history: 'none',
      },
    ],
  },
  {
    id: 'c-reading',
    name: 'The Reading Room',
    icon: 'RR',
    blurb: 'Books, margins, and an allergy to metadata.',
    sealed: true,
    gate: { kind: 'zk-age', label: 'Requires: proof of 18+ · proven privately' },
    usingMaskId: 'm-courier7',
    memberEstimate: '~1.2k',
    atmosphere: 'salon',
    hue: 'fog',
    murmur: 0.2,
    public: true,
    roles: [
      { id: 'r-keepers', name: 'Keepers', maskIds: ['p-anselme'] },
      { id: 'r-readers', name: 'Readers', maskIds: ['m-courier7', 'p-ghostwriter', 'p-mira'] },
    ],
    channels: [
      {
        id: 'ch-foyer',
        communityId: 'c-reading',
        name: 'foyer',
        topic: 'History starts the day you arrived.',
        kind: 'text',
        sealed: true,
        history: 'from-join',
      },
      {
        id: 'ch-annotations',
        communityId: 'c-reading',
        name: 'annotations',
        topic: 'Margins, for a week at a time.',
        kind: 'text',
        sealed: true,
        history: 'from-join',
        retention: { mode: 'timer', seconds: (7 * DAY) / 1000 },
      },
      {
        id: 'ch-fireside',
        communityId: 'c-reading',
        name: 'Fireside',
        kind: 'voice',
        sealed: true,
        history: 'none',
      },
    ],
  },
]

export const CHANNELS = COMMUNITIES.flatMap((c) => c.channels)

export function communityById(id: string) {
  return COMMUNITIES.find((c) => c.id === id)
}

export function channelById(id: string) {
  return CHANNELS.find((ch) => ch.id === id)
}

export function communityOfChannel(channelId: string) {
  return COMMUNITIES.find((c) => c.channels.some((ch) => ch.id === channelId))
}
