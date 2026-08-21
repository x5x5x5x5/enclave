import { frank } from '../lib/hash'
import { DAY, HOUR, MINUTE, SECOND, ago, ahead } from '../lib/time'
import type { Message } from './types'

/* ============================================================================
   Message fixtures. Every state named in docs/SCREENS_SPEC.md section 4 exists
   here and is reachable without dev tools. #raids is the reference room.
   ========================================================================== */

type Draft = Omit<Message, 'frankingTag' | 'state'> & {
  state?: Message['state']
  frankingTag?: string
}

const m = (d: Draft): Message => ({
  state: 'sent',
  frankingTag: frank(d.id),
  ...d,
})

/** A message that lives `total` and was sent `agoMs` ago. */
const life = (agoMs: number, total = DAY) => ({
  ts: ago(agoMs),
  ephemeral: { expiresAt: ahead(total - agoMs), totalMs: total },
})

/* -- LostEra · #raids — retention 24h, the aging + Horizon reference -------- */

const raids: Message[] = [
  m({
    id: 'r-01',
    channelId: 'ch-raids',
    authorMaskId: 'p-rho',
    ...life(23 * HOUR),
    body: 'Post-mortem for last night: we lost the third add pull twice. Same spot.',
  }),
  m({
    id: 'r-02',
    channelId: 'ch-raids',
    authorMaskId: 'p-vex',
    ...life(22 * HOUR + 50 * MINUTE),
    body: 'It is the ramp. Everyone drifts left and the healer loses line of sight.',
    reactions: [{ glyph: 'up', count: 4 }],
  }),
  m({
    id: 'r-03',
    channelId: 'ch-raids',
    authorMaskId: 'm-aija',
    ...life(6 * HOUR),
    body: 'New plan for tonight. Stack right of the ramp, hold until the second cast, then rotate.',
  }),
  m({
    id: 'r-04',
    channelId: 'ch-raids',
    authorMaskId: 'p-konstantin',
    ...life(5 * HOUR + 30 * MINUTE),
    replyToId: 'r-03',
    body: 'Works for me. I will call the rotate so nobody moves early.',
  }),
  m({
    id: 'r-05',
    channelId: 'ch-raids',
    authorMaskId: 'p-pixel',
    ...life(4 * HOUR),
    body: 'Marked the safe tiles.',
    media: [
      { kind: 'image', name: 'ramp-01.png', size: '1.2 MB', art: 'ramp-01' },
      { kind: 'image', name: 'ramp-02.png', size: '980 KB', art: 'ramp-02' },
      { kind: 'image', name: 'ramp-03.png', size: '1.4 MB', art: 'ramp-03' },
    ],
  }),
  m({
    id: 'r-06',
    channelId: 'ch-raids',
    authorMaskId: 'p-vex',
    ...life(3 * HOUR + 20 * MINUTE),
    body: 'Loot table, do not spoil it for the others.',
    media: [
      { kind: 'image', name: 'loot-table.png', size: '2.1 MB', art: 'loot', blurredPreview: true },
    ],
  }),
  m({
    id: 'r-07',
    channelId: 'ch-raids',
    authorMaskId: 'p-rho',
    ...life(2 * HOUR + 40 * MINUTE),
    viewOnce: true,
    media: [{ kind: 'image', name: 'boss-timer.png', size: '640 KB', art: 'timer' }],
  }),
  m({
    id: 'r-08',
    channelId: 'ch-raids',
    authorMaskId: 'p-lark',
    ts: ago(2 * HOUR + 30 * MINUTE),
    state: 'expired',
    systemNote: 'Message expired · sealed by key rotation',
  }),
  m({
    id: 'r-09',
    channelId: 'ch-raids',
    authorMaskId: 'p-lark',
    ...life(2 * HOUR),
    body: 'Hold to look. I am not leaving this one lying around.',
    holdToView: true,
    media: [{ kind: 'image', name: 'route-draft.png', size: '820 KB', art: 'route' }],
  }),
  m({
    id: 'r-10',
    channelId: 'ch-raids',
    authorMaskId: 'p-pixel',
    ...life(90 * MINUTE),
    body: 'Clip of the wipe.',
    watchBudgetSec: 30,
    watchedSec: 8,
    media: [{ kind: 'video', name: 'wipe-clip.mp4', size: '18 MB', art: 'wipe', durationSec: 30 }],
  }),
  m({
    id: 'r-11',
    channelId: 'ch-raids',
    authorMaskId: 'p-vex',
    ...life(60 * MINUTE),
    media: [
      { kind: 'voice', name: 'callout.ogg', size: '210 KB', durationSec: 14, burnAfterListen: true },
    ],
  }),
  m({
    id: 'r-12',
    channelId: 'ch-raids',
    authorMaskId: 'p-konstantin',
    ...life(40 * MINUTE),
    body: 'Roster for tonight.',
    media: [{ kind: 'file', name: 'roster-s4.pdf', size: '96 KB', noDownload: true }],
  }),
  m({
    id: 'r-13',
    channelId: 'ch-raids',
    authorMaskId: 'p-rho',
    ...life(25 * MINUTE),
    body: 'Full VOD, straight from my machine.',
    media: [
      {
        kind: 'file',
        name: 'raid-vod-s4e11.mkv',
        size: '2.4 GB',
        p2p: {
          route: 'direct',
          progress: 0.62,
          resumable: true,
          state: 'sending',
          throughput: '84 MB/s',
          peerDevice: 'Rho · ThinkPad',
        },
      },
    ],
  }),
  m({
    id: 'r-14',
    channelId: 'ch-raids',
    authorMaskId: 'p-vex',
    ts: ago(12 * MINUTE),
    ephemeral: { expiresAt: ahead(45 * SECOND), totalMs: 10 * MINUTE },
    body: 'Invite code for the private lobby is in the pinned note. This line goes shortly.',
  }),
  m({
    id: 'r-15',
    channelId: 'ch-raids',
    authorMaskId: 'm-aija',
    ts: ago(2 * MINUTE),
    ephemeral: { expiresAt: ahead(DAY - 2 * MINUTE), totalMs: DAY },
    body: 'Queue opens at 21:00. Bring your own snacks, Vex.',
    undoUntil: ahead(5 * SECOND),
  }),
  m({
    id: 'r-16',
    channelId: 'ch-raids',
    authorMaskId: 'm-aija',
    ts: ahead(14 * HOUR),
    state: 'scheduled',
    scheduledFor: ahead(14 * HOUR),
    body: 'Reminder: sign-ups close at noon.',
  }),
]

/* -- LostEra · #general — the legacy bridge, deliberately unsealed ---------- */

const general: Message[] = [
  m({
    id: 'g-01',
    channelId: 'ch-general',
    authorMaskId: 'p-konstantin',
    ts: ago(30 * HOUR),
    body: 'Heads up: this room is still bridged from the old forum while we migrate.',
  }),
  m({
    id: 'g-02',
    channelId: 'ch-general',
    authorMaskId: 'p-lark',
    ts: ago(28 * HOUR),
    body: 'So the bridge host can read this?',
  }),
  m({
    id: 'g-03',
    channelId: 'ch-general',
    authorMaskId: 'p-konstantin',
    ts: ago(27 * HOUR),
    replyToId: 'g-02',
    body: 'Yes. Anything sensitive goes in #raids or a sealed group.',
  }),
  m({
    id: 'g-04',
    channelId: 'ch-general',
    authorMaskId: 'p-rho',
    ts: ago(5 * HOUR),
    body: 'Patch notes look fine apart from the ramp collision. Again.',
  }),
  m({
    id: 'g-05',
    channelId: 'ch-general',
    authorMaskId: 'm-aija',
    ts: ago(90 * MINUTE),
    body: 'Migration finishes Friday and this room gets sealed with the rest.',
    reactions: [{ glyph: 'seal', count: 7 }],
  }),
]

/* -- LostEra · #announcements ---------------------------------------------- */

const announcements: Message[] = [
  m({
    id: 'a-01',
    channelId: 'ch-announcements',
    authorMaskId: 'p-konstantin',
    ts: ago(3 * DAY),
    body: 'Season 4 starts Monday. Raid sign-ups open in #raids on Sunday evening.',
    pinned: true,
  }),
  m({
    id: 'a-02',
    channelId: 'ch-announcements',
    authorMaskId: 'm-aija',
    ts: ago(20 * HOUR),
    body: 'Lounge stays open all week. Raid Night closes itself when the last person leaves.',
  }),
  m({
    id: 'a-03',
    channelId: 'ch-announcements',
    authorMaskId: 'p-konstantin',
    ts: ahead(14 * HOUR),
    state: 'scheduled',
    scheduledFor: ahead(14 * HOUR),
    body: 'Season 4 maintenance window — servers down 03:00–05:00.',
  }),
]

/* -- LostEra · #trade — three views and it is gone -------------------------- */

const trade: Message[] = [
  m({
    id: 't-01',
    channelId: 'ch-trade',
    authorMaskId: 'p-vex',
    ts: ago(4 * HOUR),
    body: 'Selling two ember shards. Reasonable offers.',
    ephemeral: { viewsLeft: 1 },
  }),
  m({
    id: 't-02',
    channelId: 'ch-trade',
    authorMaskId: 'p-pixel',
    ts: ago(2 * HOUR),
    body: 'Trading a spare tank sigil for anything from the north set.',
    ephemeral: { viewsLeft: 2 },
    media: [{ kind: 'image', name: 'sigil.png', size: '410 KB', art: 'sigil' }],
  }),
  m({
    id: 't-03',
    channelId: 'ch-trade',
    authorMaskId: 'p-rho',
    ts: ago(35 * MINUTE),
    body: 'Looking for a second healer for tonight. Will pay in shards.',
    ephemeral: { viewsLeft: 3 },
  }),
]

/* -- LostEra · #staff — no history before you joined ------------------------ */

const staff: Message[] = [
  m({
    id: 's-01',
    channelId: 'ch-staff',
    authorMaskId: 'p-konstantin',
    ts: ago(7 * HOUR),
    body: 'Two reports in the queue. Both have proof attached.',
  }),
  m({
    id: 's-02',
    channelId: 'ch-staff',
    authorMaskId: 'm-aija',
    ts: ago(6 * HOUR),
    body: 'I will take the second one. The excerpt is enough to act on.',
  }),
  m({
    id: 's-03',
    channelId: 'ch-staff',
    authorMaskId: 'p-konstantin',
    ts: ago(50 * MINUTE),
    body: 'Reminder that we never act on a report without a verified hash.',
  }),
]

/* -- Atelier Nord ---------------------------------------------------------- */

const brief: Message[] = [
  m({
    id: 'b-01',
    channelId: 'ch-brief',
    authorMaskId: 'p-lark',
    ts: ago(2 * DAY),
    body: 'This week: the poster series. Three sizes, one grid, no gradients.',
    pinned: true,
  }),
  m({
    id: 'b-02',
    channelId: 'ch-brief',
    authorMaskId: 'p-lark',
    ts: ago(26 * HOUR),
    body: 'Crit is Thursday. Bring one thing you are unsure about.',
  }),
]

const designcrit: Message[] = [
  m({
    id: 'd-01',
    channelId: 'ch-designcrit',
    authorMaskId: 'p-anselme',
    ts: ago(9 * HOUR),
    body: 'The margin is doing all the work here and I mean that as a compliment.',
  }),
  m({
    id: 'd-02',
    channelId: 'ch-designcrit',
    authorMaskId: 'm-nova',
    ts: ago(8 * HOUR + 20 * MINUTE),
    body: 'Second pass. I pulled the display face back to titles only.',
    media: [
      { kind: 'image', name: 'poster-a2.png', size: '3.4 MB', art: 'poster-a' },
      { kind: 'image', name: 'poster-a3.png', size: '2.8 MB', art: 'poster-b' },
    ],
  }),
  m({
    id: 'd-03',
    channelId: 'ch-designcrit',
    authorMaskId: 'p-lark',
    ts: ago(7 * HOUR),
    replyToId: 'd-02',
    body: 'Much better. The second one still has two competing baselines at the fold.',
  }),
  m({
    id: 'd-04',
    channelId: 'ch-designcrit',
    authorMaskId: 'm-nova',
    ts: ago(40 * MINUTE),
    body: 'Fixing the fold tonight. Source file if anyone wants to poke at it.',
    media: [{ kind: 'file', name: 'poster-series.afdesign', size: '212 MB', noDownload: true }],
  }),
]

const scratchpad: Message[] = [
  m({
    id: 'sc-01',
    channelId: 'ch-scratchpad',
    authorMaskId: 'm-nova',
    ts: ago(3 * HOUR),
    body: 'thinking out loud: what if the grid is 7 columns and we never centre anything',
  }),
  m({
    id: 'sc-02',
    channelId: 'ch-scratchpad',
    authorMaskId: 'p-anselme',
    ts: ago(2 * HOUR + 10 * MINUTE),
    body: 'seven is a strange number and I like it',
  }),
  m({
    id: 'sc-03',
    channelId: 'ch-scratchpad',
    authorMaskId: 'm-nova',
    ts: ago(25 * MINUTE),
    body: 'noted, before 04:00 eats it',
  }),
]

/* -- The Reading Room ------------------------------------------------------ */

const foyer: Message[] = [
  m({
    id: 'f-01',
    channelId: 'ch-foyer',
    authorMaskId: 'p-anselme',
    ts: ago(11 * HOUR),
    body: 'Welcome. Nobody here knows who anybody is, and that is the point.',
    pinned: true,
  }),
  m({
    id: 'f-02',
    channelId: 'ch-foyer',
    authorMaskId: 'p-ghostwriter',
    ts: ago(6 * HOUR),
    body: 'Finished the Bachmann. The middle section is a different book from the ending.',
  }),
  m({
    id: 'f-03',
    channelId: 'ch-foyer',
    authorMaskId: 'p-mira',
    ts: ago(3 * HOUR),
    replyToId: 'f-02',
    body: 'The ending is the book. The middle is the excuse.',
  }),
  m({
    id: 'f-04',
    channelId: 'ch-foyer',
    authorMaskId: 'm-courier7',
    ts: ago(55 * MINUTE),
    body: 'Both, probably. I will bring it to Fireside on Sunday.',
  }),
]

const annotations: Message[] = [
  m({
    id: 'an-01',
    channelId: 'ch-annotations',
    authorMaskId: 'p-ghostwriter',
    ...life(6 * DAY + 3 * HOUR, 7 * DAY),
    body: 'p.214 — the narrator stops using names for eleven pages and nobody notices.',
  }),
  m({
    id: 'an-02',
    channelId: 'ch-annotations',
    authorMaskId: 'p-anselme',
    ...life(4 * DAY, 7 * DAY),
    body: 'My copy has a previous reader arguing in pencil. I am siding with them.',
  }),
  m({
    id: 'an-03',
    channelId: 'ch-annotations',
    authorMaskId: 'm-courier7',
    ...life(20 * HOUR, 7 * DAY),
    body: 'p.301 — the second letter is a forgery and the footnote knows it.',
  }),
  m({
    id: 'an-04',
    channelId: 'ch-annotations',
    authorMaskId: 'p-mira',
    ...life(2 * HOUR, 7 * DAY),
    body: 'Scanned the marginalia before the week runs out.',
    media: [
      { kind: 'image', name: 'margin-301.jpg', size: '1.9 MB', art: 'margin', blurredPreview: true },
    ],
  }),
]

/* -- DM with Mira — she writes French, you read English --------------------- */

const dmMira: Message[] = [
  m({
    id: 'mi-01',
    channelId: 'th-mira',
    authorMaskId: 'p-mira',
    ts: ago(2 * DAY),
    body: 'Are you coming to the studio thing on Saturday?',
    translated: { fromLang: 'French', body: 'Tu viens au truc de l’atelier samedi ?' },
  }),
  m({
    id: 'mi-02',
    channelId: 'th-mira',
    authorMaskId: 'm-aija',
    ts: ago(2 * DAY - 20 * MINUTE),
    body: 'Probably. Depends whether the raid runs long.',
  }),
  m({
    id: 'mi-03',
    channelId: 'th-mira',
    authorMaskId: 'p-mira',
    ts: ago(26 * HOUR),
    body: 'It always runs long. I will keep you a chair.',
    translated: { fromLang: 'French', body: 'Ça déborde toujours. Je te garde une chaise.' },
  }),
  m({
    id: 'mi-04',
    channelId: 'th-mira',
    authorMaskId: 'p-mira',
    ts: ago(5 * HOUR),
    media: [{ kind: 'voice', name: 'note.ogg', size: '340 KB', durationSec: 22 }],
  }),
  m({
    id: 'mi-05',
    channelId: 'th-mira',
    authorMaskId: 'p-mira',
    ts: ago(3 * HOUR),
    body: 'Photos from the kiln. The big one survived.',
    media: [{ kind: 'image', name: 'kiln.jpg', size: '4.2 MB', art: 'kiln' }],
  }),
  m({
    id: 'mi-06',
    channelId: 'th-mira',
    authorMaskId: 'm-aija',
    ts: ago(2 * HOUR + 30 * MINUTE),
    body: 'Sending you the raw set, it is huge.',
    media: [
      {
        kind: 'file',
        name: 'kiln-raw-set.zip',
        size: '4.8 GB',
        p2p: {
          route: 'relay',
          progress: 0.34,
          resumable: true,
          state: 'sending',
          throughput: '11 MB/s',
          peerDevice: 'Mira · Pixel 10 Pro',
        },
      },
    ],
  }),
  m({
    id: 'mi-07',
    channelId: 'th-mira',
    authorMaskId: 'p-mira',
    ts: ago(35 * MINUTE),
    body: 'Perfect. I will look tonight, after the shop closes.',
    translated: { fromLang: 'French', body: 'Parfait. Je regarde ce soir, après la fermeture.' },
  }),
]

/* -- Two quieter DMs, so the chats list reads like a real week ------------- */

const dmKonstantin: Message[] = [
  m({
    id: 'kn-01',
    channelId: 'th-konstantin',
    authorMaskId: 'm-aija',
    ts: ago(4 * DAY),
    body: 'Is the sign-up queue going to hold up on Sunday?',
  }),
  m({
    id: 'kn-02',
    channelId: 'th-konstantin',
    authorMaskId: 'p-konstantin',
    ts: ago(4 * DAY - 40 * MINUTE),
    body: 'Queue is fine, I checked the relay twice.',
  }),
]

const dmRho: Message[] = [
  m({
    id: 'rh-01',
    channelId: 'th-rho',
    authorMaskId: 'p-rho',
    ...life(3 * HOUR),
    body: 'Do you still have the old ramp route from season 2?',
  }),
  m({
    id: 'rh-02',
    channelId: 'th-rho',
    authorMaskId: 'm-aija',
    ...life(2 * HOUR + 10 * MINUTE),
    body: 'Somewhere in the vault. Give me a minute.',
  }),
  m({
    id: 'rh-03',
    channelId: 'th-rho',
    authorMaskId: 'm-aija',
    ...life(60 * MINUTE),
    body: 'Sending the route file over now.',
    media: [
      {
        kind: 'file',
        name: 'ramp-route-s2.zip',
        size: '760 MB',
        p2p: {
          route: 'relay',
          progress: 0.41,
          resumable: true,
          state: 'paused',
          throughput: '0 MB/s',
          peerDevice: 'Rho · Desktop',
        },
      },
    ],
  }),
]

/* -- Group: friday five (11 members, no server involved) -------------------- */

const fridayFive: Message[] = [
  m({
    id: 'ff-01',
    channelId: 'th-friday',
    authorMaskId: 'p-vex',
    ts: ago(9 * HOUR),
    body: 'Friday, same place, five people minimum or it does not count.',
  }),
  m({
    id: 'ff-02',
    channelId: 'th-friday',
    authorMaskId: 'p-pixel',
    ts: ago(8 * HOUR),
    body: 'Eleven of us in here and we still cannot find five.',
  }),
  m({
    id: 'ff-03',
    channelId: 'th-friday',
    authorMaskId: 'p-lark',
    ts: ago(4 * HOUR),
    body: 'I am in. Bringing Anselme, which makes seven if you count optimistically.',
  }),
  m({
    id: 'ff-04',
    channelId: 'th-friday',
    authorMaskId: 'm-aija',
    ts: ago(45 * MINUTE),
    body: 'Counting optimistically is the only way this group has ever worked.',
  }),
]

/* -- Group: ops sync (sealed, leaving takes your history with you) ---------- */

const opsSync: Message[] = [
  m({
    id: 'op-01',
    channelId: 'th-ops',
    authorMaskId: 'p-konstantin',
    ...life(20 * HOUR, 7 * DAY),
    body: 'Relay in the north rack is back. Latency is under 20ms again.',
  }),
  m({
    id: 'op-02',
    channelId: 'th-ops',
    authorMaskId: 'm-aija',
    ...life(14 * HOUR, 7 * DAY),
    body: 'Good. Leaving the community relay as the fallback for Fireside.',
  }),
  m({
    id: 'op-03',
    channelId: 'th-ops',
    authorMaskId: 'p-konstantin',
    ...life(80 * MINUTE, 7 * DAY),
    body: 'Fingerprints rotated this morning. Nothing to do on your side.',
  }),
]

/* -- Message request from a stranger ---------------------------------------- */

const request: Message[] = [
  m({
    id: 'rq-01',
    channelId: 'th-stranger',
    authorMaskId: 'p-stranger',
    ts: ago(6 * HOUR),
    body: 'Saw your route notes in a public space. Would like to ask about the third pull.',
  }),
]

export const MESSAGES: Message[] = [
  ...announcements,
  ...general,
  ...raids,
  ...trade,
  ...staff,
  ...brief,
  ...designcrit,
  ...scratchpad,
  ...foyer,
  ...annotations,
  ...dmMira,
  ...dmKonstantin,
  ...dmRho,
  ...fridayFive,
  ...opsSync,
  ...request,
]

export function messagesFor(channelId: string): Message[] {
  return MESSAGES.filter((msg) => msg.channelId === channelId).sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
  )
}

export function messageById(id: string): Message | undefined {
  return MESSAGES.find((msg) => msg.id === id)
}
