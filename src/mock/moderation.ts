import { frank } from '../lib/hash'
import { DAY, HOUR, ago } from '../lib/time'
import type { ModReport } from './types'

/* Reports carry proof or they do not exist. That is the whole queue policy. */

export const MOD_REPORTS: ModReport[] = [
  {
    id: 'mr-01',
    reporterLabel: 'A member of LostEra',
    reasonLabel: 'Selling account access',
    channelName: '#trade',
    status: 'open',
    openedAt: ago(5 * HOUR),
    excerpts: [
      {
        maskId: 'p-stranger',
        body: 'Can sell you a stacked account, cheap, message me off-platform.',
        frankingTag: frank('mr-01-a'),
        ts: ago(6 * HOUR),
      },
      {
        maskId: 'p-stranger',
        body: 'Serious buyers only. I have three ready.',
        frankingTag: frank('mr-01-b'),
        ts: ago(6 * HOUR),
      },
    ],
  },
  {
    id: 'mr-02',
    reporterLabel: 'A member of LostEra',
    reasonLabel: 'Harassment',
    channelName: '#general',
    status: 'open',
    openedAt: ago(28 * HOUR),
    excerpts: [
      {
        maskId: 'p-stranger',
        body: 'Told you to stay out of the ramp. Do not bother showing up tonight.',
        frankingTag: frank('mr-02-a'),
        ts: ago(29 * HOUR),
      },
    ],
  },
  {
    id: 'mr-03',
    reporterLabel: 'A member of LostEra',
    reasonLabel: 'Spam',
    channelName: '#trade',
    status: 'resolved',
    openedAt: ago(3 * DAY),
    excerpts: [
      {
        maskId: 'p-stranger',
        body: 'shards shards shards shards shards',
        frankingTag: frank('mr-03-a'),
        ts: ago(3 * DAY),
      },
    ],
  },
]

export const REPORT_REASONS = [
  'Harassment',
  'Selling account access',
  'Spam',
  'Impersonating a mask',
  'Something else',
] as const
