import type { SocialStats } from './types'

/* ============================================================================
   Visibility (Aura) and trust (Reputation). Both are opt-in and both can be
   switched off from the profile without breaking the page.
   ========================================================================== */

export const SOCIAL: SocialStats = {
  optedIn: true,
  aura: {
    score: 742,
    trend7: 4.2,
    trend30: -1.8,
    trend90: 12.6,
    peakDay: 'Sunday',
    series: [
      38, 41, 39, 44, 52, 49, 47, 55, 58, 54, 61, 66, 63, 59, 64, 71, 68, 74, 72, 69, 77, 81, 78,
      84, 88, 83, 91, 96, 92, 100,
    ],
  },
  reputation: {
    tier: 'Respected',
    points: 3180,
    badges: [
      {
        id: 'bd-season1',
        name: 'First season',
        kind: 'seasonal',
        glyph: 'S1',
        note: 'Here before the first patch. Awarded once, never again.',
      },
      {
        id: 'bd-raidlead',
        name: 'Raid lead',
        kind: 'community',
        glyph: 'RL',
        note: 'Given by LostEra staff. Visible only inside LostEra.',
      },
      {
        id: 'bd-quiet',
        name: 'Quiet hours',
        kind: 'secret',
        glyph: '··',
        note: 'How you earned this is between you and the room.',
      },
      {
        id: 'bd-margins',
        name: 'Margins',
        kind: 'community',
        glyph: 'MG',
        note: 'The Reading Room gives this for annotations people keep.',
      },
      {
        id: 'bd-winter',
        name: 'Long winter',
        kind: 'seasonal',
        glyph: 'LW',
        note: 'Season 3. Expired, kept for the record.',
      },
      {
        id: 'bd-relay',
        name: 'Ran a relay',
        kind: 'community',
        glyph: 'RY',
        note: 'You carried other people traffic for a month.',
      },
    ],
  },
}

export const PROFILE_BLOCKS = {
  about:
    'Raid lead in LostEra, occasional poster in Atelier Nord. I keep unsociable hours and answer eventually.',
  nowPlaying: { title: 'Low Roar — Give Me An Answer', context: 'On repeat since Tuesday' },
  projects: [
    { name: 'Season 4 route notes', note: 'Living document · shared with Raiders' },
    { name: 'Kiln photos', note: 'Slow archive · shared with Mira' },
    { name: 'Relay in the north rack', note: 'Runs itself now' },
  ],
  publicSpaces: [
    { id: 'c-lostera', name: 'LostEra', note: '~2.4k · as Aija' },
    { id: 'c-reading', name: 'The Reading Room', note: '~1.2k · as someone else' },
  ],
  links: [
    { label: 'aija.route-notes', host: 'notes.lostera.game' },
    { label: 'north rack status', host: 'northrack.net' },
  ],
  proofs: [
    { label: '18+', note: 'proven privately' },
    { label: 'LostEra veteran', note: 'proven privately' },
  ],
}

export const AUDIENCES = [
  {
    id: 'self',
    label: 'You',
    note: 'Everything, including the blocks you keep hidden.',
  },
  {
    id: 'stranger',
    label: 'Stranger',
    note: 'Someone with no shared space and no contact.',
  },
  {
    id: 'contact',
    label: 'Contact',
    note: 'Someone you have accepted a request from.',
  },
  {
    id: 'lostera',
    label: 'LostEra member',
    note: 'Someone who only knows the mask you wear there.',
  },
] as const

export type AudienceId = (typeof AUDIENCES)[number]['id']

/** Which blocks each audience is allowed to see. */
export const AUDIENCE_VISIBILITY: Record<AudienceId, string[]> = {
  self: ['about', 'badges', 'nowPlaying', 'projects', 'spaces', 'links', 'aura', 'reputation'],
  stranger: ['about', 'reputation'],
  contact: ['about', 'badges', 'nowPlaying', 'spaces', 'links', 'aura', 'reputation'],
  lostera: ['about', 'badges', 'projects', 'spaces', 'aura', 'reputation'],
}

/**
 * What each audience actually knows. `maskId: 'active'` means "the mask you are
 * currently wearing"; a real id means that context only ever knew that one.
 */
export const AUDIENCE_KNOWS: Record<
  AudienceId,
  { maskId: string; showHandle: boolean; note: string }
> = {
  self: { maskId: 'active', showHandle: true, note: 'Everything, including hidden blocks.' },
  stranger: {
    maskId: 'active',
    showHandle: false,
    note: 'No handle, no spaces, no links. They can send a request and nothing else.',
  },
  contact: {
    maskId: 'active',
    showHandle: true,
    note: 'A handle and the blocks you share with people you have accepted.',
  },
  lostera: {
    maskId: 'm-aija',
    showHandle: true,
    note: 'LostEra only ever met Aija. Your other masks do not exist here.',
  },
}

export const SOCIAL_CARD_TEMPLATES = [
  {
    id: 'gaming',
    name: 'Gaming',
    maskId: 'm-aija',
    status: 'Raid lead · LostEra',
    hue: 'cove' as const,
  },
  {
    id: 'professional',
    name: 'Professional',
    maskId: 'm-nova',
    status: 'Type and systems · Atelier Nord',
    hue: 'sky' as const,
  },
  {
    id: 'creator',
    name: 'Creator',
    maskId: 'm-nova',
    status: 'Poster series, three sizes',
    hue: 'iris' as const,
  },
  {
    id: 'anonymous',
    name: 'Anonymous',
    maskId: 'm-courier7',
    status: 'Scan to connect',
    hue: 'fog' as const,
  },
] as const

export type SocialCardTemplateId = (typeof SOCIAL_CARD_TEMPLATES)[number]['id']
