import { HOUR, MINUTE, ago, ahead } from '../lib/time'
import type { Story } from './types'

/* Stories are scoped to a mask and an audience, and they say so out loud. */

export const STORIES: Story[] = [
  {
    id: 'st-you',
    authorMaskId: 'm-aija',
    kind: 'text',
    postedAt: ago(4 * HOUR),
    expiresAt: ahead(20 * HOUR),
    audience: { label: 'Close friends · as Aija' },
    body: 'Season 4 tonight. If you see me in the ramp again, pull me out.',
    seenBy: '~12',
    seen: true,
  },
  {
    id: 'st-mira-1',
    authorMaskId: 'p-mira',
    kind: 'image',
    postedAt: ago(3 * HOUR),
    expiresAt: ahead(21 * HOUR),
    audience: { label: 'Close friends' },
    art: 'kiln',
    body: 'It survived.',
    seenBy: '~9',
  },
  {
    id: 'st-mira-2',
    authorMaskId: 'p-mira',
    kind: 'text',
    postedAt: ago(2 * HOUR + 20 * MINUTE),
    expiresAt: ahead(21 * HOUR),
    audience: { label: 'Close friends' },
    body: 'Second firing on Thursday. Bring nothing, break nothing.',
    seenBy: '~7',
  },
  {
    id: 'st-lark',
    authorMaskId: 'p-lark',
    kind: 'image',
    postedAt: ago(6 * HOUR),
    expiresAt: ahead(18 * HOUR),
    audience: { label: 'Atelier Nord' },
    art: 'poster-a',
    body: 'Third size, finally sitting still.',
    seenBy: '~24',
  },
  {
    id: 'st-vex',
    authorMaskId: 'p-vex',
    kind: 'voice',
    postedAt: ago(90 * MINUTE),
    expiresAt: ahead(22 * HOUR),
    audience: { label: 'LostEra · Raiders' },
    body: 'Voice note · 0:11',
    seenBy: '~31',
  },
  {
    id: 'st-rho',
    authorMaskId: 'p-rho',
    kind: 'text',
    postedAt: ago(50 * MINUTE),
    expiresAt: ahead(23 * HOUR),
    audience: { label: 'LostEra' },
    viewOnce: true,
    body: 'Private lobby code is in #raids for the next ten minutes. This one is view-once.',
    seenBy: '~3',
  },
  {
    id: 'st-ghost',
    authorMaskId: 'p-ghostwriter',
    kind: 'text',
    postedAt: ago(7 * HOUR),
    expiresAt: ahead(17 * HOUR),
    audience: { label: 'The Reading Room' },
    body: 'Reading a book that refuses to name anyone. Recommended.',
    seenBy: '~15',
  },
]

export function storiesByAuthor(): { maskId: string; stories: Story[] }[] {
  const order: string[] = []
  const byAuthor = new Map<string, Story[]>()
  for (const s of STORIES) {
    if (!byAuthor.has(s.authorMaskId)) {
      byAuthor.set(s.authorMaskId, [])
      order.push(s.authorMaskId)
    }
    byAuthor.get(s.authorMaskId)!.push(s)
  }
  return order.map((maskId) => ({ maskId, stories: byAuthor.get(maskId)! }))
}
