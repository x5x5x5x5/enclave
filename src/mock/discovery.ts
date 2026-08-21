import type { DiscoverySpace } from './types'

/* Member counts are fuzzed on purpose. Gates say what they prove, not how. */

export const DISCOVERY_CATEGORIES = [
  'All',
  'Gaming',
  'Making',
  'Reading',
  'Local',
  'Sealed only',
] as const

export const DISCOVERY: DiscoverySpace[] = [
  {
    id: 'ds-lostera',
    name: 'LostEra',
    icon: 'LE',
    hue: 'cove',
    oneLiner: 'Late-night raids and patch arguments.',
    memberEstimate: '~2.4k',
    category: 'Gaming',
    gates: [],
    preview: {
      channel: '#general',
      lines: [
        { who: 'Rho', hue: 'cove', text: 'Patch notes look fine apart from the ramp collision.' },
        { who: 'Konstantin', hue: 'sky', text: 'Migration finishes Friday.' },
      ],
    },
  },
  {
    id: 'ds-reading',
    name: 'The Reading Room',
    icon: 'RR',
    hue: 'fog',
    oneLiner: 'Books, margins, and an allergy to metadata.',
    memberEstimate: '~1.2k',
    category: 'Reading',
    gates: ['Requires: proof of 18+ · proven privately'],
    sealedEverything: true,
    preview: {
      channel: '#foyer',
      lines: [
        { who: 'Anselme', hue: 'clay', text: 'Nobody here knows who anybody is.' },
        { who: 'Ghostwriter', hue: 'fog', text: 'That is the point.' },
      ],
    },
  },
  {
    id: 'ds-kiln',
    name: 'Kiln & Co',
    icon: 'KC',
    hue: 'clay',
    oneLiner: 'Ceramics, firing schedules, and honest failure photos.',
    memberEstimate: '~880',
    category: 'Making',
    gates: [],
    preview: {
      channel: '#firings',
      lines: [
        { who: 'Mira', hue: 'rose', text: 'Second firing Thursday.' },
        { who: 'Anselme', hue: 'clay', text: 'Bring nothing, break nothing.' },
      ],
    },
  },
  {
    id: 'ds-northrack',
    name: 'North Rack',
    icon: 'NR',
    hue: 'sky',
    oneLiner: 'People who run relays for other people.',
    memberEstimate: '~460',
    category: 'Local',
    gates: ['Requires: proof you run a relay · proven privately'],
    preview: {
      channel: '#status',
      lines: [
        { who: 'Konstantin', hue: 'sky', text: 'North rack is back, under 20ms.' },
        { who: 'Rho', hue: 'cove', text: 'Confirmed from here.' },
      ],
    },
  },
  {
    id: 'ds-atelier',
    name: 'Atelier Nord',
    icon: 'AN',
    hue: 'iris',
    oneLiner: 'A small studio. Briefs in, crits out.',
    memberEstimate: '~340',
    category: 'Making',
    gates: ['Invite only'],
    preview: {
      channel: '#brief',
      lines: [
        { who: 'Lark', hue: 'iris', text: 'Three sizes, one grid, no gradients.' },
        { who: 'Nova', hue: 'iris', text: 'Crit is Thursday.' },
      ],
    },
  },
  {
    id: 'ds-nightshift',
    name: 'Night Shift',
    icon: 'NS',
    hue: 'moss',
    oneLiner: 'For people whose day starts at 22:00.',
    memberEstimate: '~5.1k',
    category: 'Local',
    gates: [],
    preview: {
      channel: '#awake',
      lines: [
        { who: 'Pixel', hue: 'moss', text: 'Anyone else still up.' },
        { who: 'Vex', hue: 'saffron', text: 'Define still.' },
      ],
    },
  },
  {
    id: 'ds-quires',
    name: 'Quires',
    icon: 'QU',
    hue: 'saffron',
    oneLiner: 'Bookbinding, paper stock, and arguments about grain direction.',
    memberEstimate: '~1.9k',
    category: 'Making',
    gates: [],
    preview: {
      channel: '#paper',
      lines: [
        { who: 'Anselme', hue: 'clay', text: 'Grain runs parallel to the spine. Always.' },
        { who: 'Lark', hue: 'iris', text: 'Almost always.' },
      ],
    },
  },
  {
    id: 'ds-thirdcircle',
    name: 'Third Circle',
    icon: 'TC',
    hue: 'rose',
    oneLiner: 'Everything sealed. No history. No search.',
    memberEstimate: '~210',
    category: 'Sealed only',
    gates: ['Requires: proof of 18+ · proven privately', 'Invite only'],
    sealedEverything: true,
    preview: {
      channel: '#foyer',
      lines: [{ who: 'Unknown', hue: 'fog', text: 'Previews are off in this space.' }],
    },
  },
]
