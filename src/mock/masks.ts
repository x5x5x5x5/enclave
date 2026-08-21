import type { Mask, User } from './types'

/** The eight avatar marks a new mask can wear. Drawn, never downloaded. */
export const AVATAR_PRESETS = [
  'arc',
  'ring',
  'notch',
  'grid',
  'wave',
  'prism',
  'stack',
  'orbit',
] as const
export type AvatarPreset = (typeof AVATAR_PRESETS)[number]

/* -- Your masks ------------------------------------------------------------ */

export const OWN_MASKS: Mask[] = [
  {
    id: 'm-aija',
    handle: '@aija',
    displayName: 'Aija',
    avatar: 'arc',
    hue: 'cove',
    bio: 'Raid lead. Sleeps eventually.',
    presence: 'online',
    spacesUsing: 3,
    own: true,
  },
  {
    id: 'm-nova',
    handle: '@nova.works',
    displayName: 'Nova',
    avatar: 'prism',
    hue: 'iris',
    bio: 'Type, systems, and one very slow poster series.',
    presence: 'away',
    spacesUsing: 2,
    own: true,
  },
  {
    id: 'm-courier7',
    handle: '@courier7',
    displayName: 'Courier-7',
    avatar: 'notch',
    hue: 'fog',
    bio: 'Reads. Rarely writes.',
    presence: 'invisible',
    spacesUsing: 1,
    own: true,
  },
]

/* -- Everyone else --------------------------------------------------------- */

export const PEOPLE: Mask[] = [
  {
    id: 'p-mira',
    handle: '@mira',
    displayName: 'Mira',
    avatar: 'orbit',
    hue: 'rose',
    bio: 'Ceramics, cycling, and terrible puns in two languages.',
    presence: 'online',
  },
  {
    id: 'p-konstantin',
    handle: '@konstantin',
    displayName: 'Konstantin',
    avatar: 'grid',
    hue: 'sky',
    bio: 'Ops. Keeps the lights on.',
    presence: 'online',
  },
  {
    id: 'p-pixel',
    handle: '@pixel',
    displayName: 'Pixel',
    avatar: 'stack',
    hue: 'moss',
    bio: 'Sprite pusher.',
    presence: 'away',
  },
  {
    id: 'p-vex',
    handle: '@vex',
    displayName: 'Vex',
    avatar: 'notch',
    hue: 'saffron',
    bio: 'Will bring snacks to the raid.',
    presence: 'online',
  },
  {
    id: 'p-anselme',
    handle: '@anselme',
    displayName: 'Anselme',
    avatar: 'wave',
    hue: 'clay',
    bio: 'Binds books. Distrusts scanners.',
    presence: 'away',
  },
  {
    id: 'p-lark',
    handle: '@lark',
    displayName: 'Lark',
    avatar: 'ring',
    hue: 'iris',
    bio: 'Motion, mostly.',
    presence: 'online',
  },
  {
    id: 'p-ghostwriter',
    handle: '@ghostwriter',
    displayName: 'Ghostwriter',
    avatar: 'grid',
    hue: 'fog',
    bio: 'No profile. On purpose.',
    presence: 'invisible',
  },
  {
    id: 'p-rho',
    handle: '@rho',
    displayName: 'Rho',
    avatar: 'arc',
    hue: 'cove',
    bio: 'Tank. Complains about tanking.',
    presence: 'online',
  },
  {
    id: 'p-stranger',
    handle: '@stranger',
    displayName: 'Unknown',
    avatar: 'notch',
    hue: 'fog',
    presence: 'invisible',
  },
]

export const ALL_MASKS: Mask[] = [...OWN_MASKS, ...PEOPLE]

export const USER: User = {
  id: 'u-you',
  masks: OWN_MASKS,
  activeMaskId: 'm-aija',
}

const index = new Map(ALL_MASKS.map((m) => [m.id, m]))

export function maskById(id: string): Mask {
  const m = index.get(id)
  if (m) return m
  // Fixtures should never miss, but a prototype must never crash on a lookup.
  return {
    id,
    handle: '@unknown',
    displayName: 'Unknown',
    avatar: 'notch',
    hue: 'fog',
    presence: 'invisible',
  }
}

export function isOwnMask(id: string): boolean {
  return OWN_MASKS.some((m) => m.id === id)
}
