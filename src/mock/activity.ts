import type { ActivityEvent } from './types'

/* ============================================================================
   Demo mode. A drip of plausible events every 6-12s. Everything the demo adds
   is tracked so toggling it off puts the world back exactly as it was.
   ========================================================================== */

export const ACTIVITY_SCRIPT: ActivityEvent[] = [
  { kind: 'typing', threadId: 'th-mira' },
  { kind: 'message', channelId: 'ch-raids', authorMaskId: 'p-vex', body: 'Snacks acquired. Two kinds.' },
  { kind: 'join-voice', channelId: 'ch-lounge', maskId: 'p-lark' },
  { kind: 'speaking', channelId: 'ch-lounge', maskId: 'p-vex' },
  { kind: 'message', channelId: 'ch-raids', authorMaskId: 'p-rho', body: 'Zoning in. Do not start without me.' },
  { kind: 'story', authorMaskId: 'p-mira' },
  { kind: 'expire', channelId: 'ch-raids' },
  { kind: 'message', channelId: 'ch-general', authorMaskId: 'p-pixel', body: 'Bridge is still bridging, then.' },
  { kind: 'leave-voice', channelId: 'ch-lounge', maskId: 'p-konstantin' },
  { kind: 'speaking', channelId: 'ch-lounge', maskId: 'p-rho' },
  {
    kind: 'message',
    channelId: 'ch-raids',
    authorMaskId: 'p-konstantin',
    body: 'Callout order is the same as last week.',
  },
  { kind: 'join-voice', channelId: 'ch-lounge', maskId: 'p-mira' },
  { kind: 'typing', threadId: 'th-friday' },
  {
    kind: 'message',
    channelId: 'ch-designcrit',
    authorMaskId: 'p-anselme',
    body: 'The fold reads much better now.',
  },
  { kind: 'speaking', channelId: 'ch-lounge', maskId: 'p-pixel' },
  {
    kind: 'message',
    channelId: 'ch-foyer',
    authorMaskId: 'p-ghostwriter',
    body: 'Sunday works. I will be the one who says nothing.',
  },
]

/** 6-12s, deterministic per index so the demo paces itself the same way twice. */
export function delayForIndex(i: number): number {
  const spread = [6, 9, 7, 12, 8, 10, 6, 11, 9, 7]
  return spread[i % spread.length] * 1000
}

export const DEMO_STORY_BODY = 'Kiln is cooling. Photos when it is safe to open.'
