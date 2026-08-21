import { fingerprint } from '../lib/hash'
import { HOUR, MINUTE, ago } from '../lib/time'
import type { NotifRule, SessionDevice } from './types'

/* ---- Privacy matrix ------------------------------------------------------ */

export const PRIVACY_ROWS = [
  { id: 'spaces', label: 'Spaces list', note: 'Which spaces this mask appears in.' },
  { id: 'mutuals', label: 'Mutual friends', note: 'People you both know.' },
  { id: 'joined', label: 'Join date', note: 'When this mask first appeared.' },
  { id: 'friends', label: 'Friend list', note: 'Who this mask talks to.' },
  { id: 'lastseen', label: 'Last seen', note: 'Presence, per mask, not per account.' },
] as const

export const PRIVACY_COLUMNS = ['Everyone', 'Contacts', 'Nobody'] as const

export type PrivacyRowId = (typeof PRIVACY_ROWS)[number]['id']
export type PrivacyValue = (typeof PRIVACY_COLUMNS)[number]

export const PRIVACY_DEFAULTS: Record<PrivacyRowId, PrivacyValue> = {
  spaces: 'Contacts',
  mutuals: 'Contacts',
  joined: 'Everyone',
  friends: 'Nobody',
  lastseen: 'Contacts',
}

/* ---- Notification rules -------------------------------------------------- */

export const NOTIF_RULES: NotifRule[] = [
  {
    scopeId: 'c-lostera',
    scopeLabel: 'LostEra',
    mentionsOnly: true,
    muteEveryone: true,
    quietHours: { from: '23:00', to: '08:00' },
    digestAt: '09:00',
    priority: false,
  },
  {
    scopeId: 'c-atelier',
    scopeLabel: 'Atelier Nord',
    mentionsOnly: false,
    muteEveryone: true,
    digestAt: '18:00',
    priority: false,
  },
  {
    scopeId: 'c-reading',
    scopeLabel: 'The Reading Room',
    mentionsOnly: true,
    muteEveryone: true,
    priority: false,
  },
]

export const PRIORITY_CONTACTS = [
  { maskId: 'p-mira', label: 'Mira can always reach you', on: true },
  { maskId: 'p-konstantin', label: 'Konstantin can always reach you', on: false },
]

/* ---- Data & expiry ------------------------------------------------------- */

export const EMBER_PRESETS = [
  { id: 'off', label: 'Off' },
  { id: '30s', label: '30s' },
  { id: '1h', label: '1h' },
  { id: '24h', label: '24h' },
  { id: '7d', label: '7d' },
  { id: '3v', label: '3 views' },
  { id: 'custom', label: 'Custom' },
] as const

export type EmberPresetId = (typeof EMBER_PRESETS)[number]['id']

export const RETENTION_CONTEXTS = [
  { id: 'dms', label: 'Direct messages', value: 'off' as EmberPresetId },
  { id: 'groups', label: 'Groups', value: '7d' as EmberPresetId },
  { id: 'spaces', label: 'New spaces', value: 'follow' as EmberPresetId | 'follow' },
]

export const SWEEP_SCOPES = ['Everything', 'One space', 'Direct messages only'] as const
export const SWEEP_AGES = ['Older than 24h', 'Older than 7 days', 'Older than 30 days'] as const

/* ---- Security ------------------------------------------------------------ */

export const SESSIONS: SessionDevice[] = [
  {
    id: 'sess-1',
    device: 'ThinkPad',
    platform: 'Linux · this device',
    fingerprint: fingerprint('thinkpad'),
    lastSeen: ago(2 * MINUTE),
    current: true,
  },
  {
    id: 'sess-2',
    device: 'Pixel 10 Pro',
    platform: 'Android',
    fingerprint: fingerprint('pixel10'),
    lastSeen: ago(3 * HOUR),
  },
  {
    id: 'sess-3',
    device: 'Desktop',
    platform: 'Windows',
    fingerprint: fingerprint('desktop'),
    lastSeen: ago(31 * HOUR),
  },
  {
    id: 'sess-4',
    device: 'Old tablet',
    platform: 'Android · not seen in a while',
    fingerprint: fingerprint('tablet'),
    lastSeen: ago(41 * 24 * HOUR),
  },
]

/* ---- Language ------------------------------------------------------------ */

export const TRANSLATE_RULES = [
  { id: 'tr-1', label: 'Translate French → English automatically in direct messages', on: true },
  { id: 'tr-2', label: 'Translate everything in The Reading Room', on: false },
  { id: 'tr-3', label: 'Always show the original underneath', on: true },
]

export const LANGUAGES = ['English', 'Français', 'Deutsch', 'Latviešu', 'Português'] as const

/* ---- Recovery kit -------------------------------------------------------- */

export const RECOVERY_PHRASE = [
  'harbour',
  'candle',
  'ninth',
  'ledger',
  'quiet',
  'marrow',
  'tundra',
  'oblige',
  'pewter',
  'ravine',
  'suture',
  'wicker',
]
