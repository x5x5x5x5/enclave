import type { VoiceRoomLive } from './types'

/* Live rooms. Occupancy is real state the demo mode mutates. */

export const VOICE_ROOMS: VoiceRoomLive[] = [
  {
    channelId: 'ch-lounge',
    e2ee: true,
    relay: 'community',
    latencyMs: 14,
    occupants: [
      { maskId: 'p-rho', speaking: true, muted: false },
      { maskId: 'p-vex', speaking: false, muted: false },
      { maskId: 'p-pixel', speaking: false, muted: true },
      { maskId: 'p-konstantin', speaking: false, muted: false },
    ],
  },
  {
    channelId: 'ch-raidnight',
    e2ee: true,
    relay: 'community',
    latencyMs: 21,
    occupants: [
      { maskId: 'p-lark', speaking: false, muted: false },
      { maskId: 'p-rho', speaking: false, muted: true },
    ],
  },
  {
    channelId: 'ch-standup',
    e2ee: true,
    relay: 'self-hosted',
    latencyMs: 9,
    occupants: [],
  },
  {
    channelId: 'ch-fireside',
    e2ee: true,
    relay: 'community',
    latencyMs: 31,
    occupants: [
      { maskId: 'p-anselme', speaking: true, muted: false },
      { maskId: 'p-ghostwriter', speaking: false, muted: false },
      { maskId: 'p-mira', speaking: false, muted: false },
    ],
  },
]

export function voiceRoom(channelId: string): VoiceRoomLive | undefined {
  return VOICE_ROOMS.find((r) => r.channelId === channelId)
}
