# P5 — Colour audit

Measured with `scripts/audit-color.mjs`, which walks the rendered DOM at 1440 and 390 across 16
routes, converts every effective colour (background, text, border, SVG fill/stroke, shadow,
gradient stop) to absolute chroma weighted by the area it covers, and clusters the result into
30° hue buckets.

Absolute chroma, not HSL saturation: the ink ramp is deliberately blue (`#11151D`), which HSL calls
26% saturated and the eye calls grey. Its chroma is 0.05; cove was 0.58. A 0.15 floor separates ink
from colour the way looking at the screen does.

**Before:** 7 viewports break the two-hue rule. Mean coloured area 0.89%.

---

## The work order

| # | Element | Where | Measured | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Story ring conic gradients | Chats home | 4 hues on one rail (330°, 240°, 30°, 180°) | **neutralize** — 1.5px solid muted ring; seen = neutral hairline |
| 2 | Avatar hue rings | Chat rows, member panel, message gutters, voice tiles | 210°/240° across every dense list | **neutralize** below 32px; keep a 2px ring at 70% only on large avatars |
| 3 | Coloured usernames | Message stream, reply quotes, mod queue, report flow | one hue per speaker | **neutralize** — names are `--text-hi`, always |
| 4 | Retention chips at rest | `#raids` header, channel rows, chat rows, community home | 30° amber pills scattered through chrome | **soften** — neutral outline + glyph; amber only while a ring is depleting |
| 5 | Community icon tiles | Rail, Spaces, Discovery, community home | 3 hues visible in the rail alone | **neutralize** — ink tile + hairline; accent only for the active one |
| 6 | MediaArt gradients | Every image and video in the stream | two random mask hues per attachment | **neutralize** — ink tones with a single faint accent wash |
| 7 | Social Card hue gradient | Profile → Social card | full-bleed hue gradient | **soften** — ink ground, one muted hue hairline |
| 8 | Badge tiles | Profile → Badges | ember / accent / neutral by kind | **soften** — neutral tiles; kind is carried by the label |
| 9 | Toast tint | Global | accent and breach bars | **soften** — neutral surface, small accent tick |
| 10 | `--accent-soft` at 12% | Selected rows, chips, active tabs | fills read as paint | **soften** to 8% |
| 11 | Speaking ring | Voice room, channel rows | accent-coloured pulse | **neutralize** — `--text-hi` pulse |
| 12 | Murmur shimmer | Rail, chat rows, Spaces | per-community hue | **neutralize** — `--text-low` |
| 13 | Presence thread | Every conversation | full-strength accent line | **soften** — 50% opacity |
| 14 | ZK / seal / gate chips | Profile, community home, discovery | accent-tinted | **soften** — neutral outline, text-mid |
| 15 | Aura / Reputation | Profile | accent arc + accent sparkline + accent trend text | **keep** the arc; trends drop to text-mid unless positive |
| 16 | "not seen in a while" chip | Settings → Security | ember, competing with the breach Revoke button | **neutralize** — that room already has one semantic colour |
| 17 | Horizon gradient | Retention rooms | ember at 10%/45% | **keep** — the single sanctioned gradient, dropped to ~15% |
| 18 | Focus ring | Global | `--accent-glow` | **keep** — the only surviving glow |
| 19 | Unsealed banner + breach controls | `#general`, duress, failed transfer | breach | **keep** — sanctioned |
| 20 | Mask switcher + onboarding hue picker | — | full-chroma hues | **keep** — the two sanctioned rainbow moments, now on `--hue-*-vivid` |

---

## Token softening

The eight hues are redefined in OKLCH at **L 0.70–0.74, C 0.020–0.065** — every one under the
brief's 0.10 chroma cap. The originals survive as `--hue-*-vivid` and appear in exactly two places.

| Hue | Was | Now | Chroma |
| --- | --- | --- | --- |
| cove | `#33C6B5` | `oklch(0.72 0.055 185)` → `#7db0a9` | 0.58 → 0.20 |
| iris | `#8B7CF6` | `oklch(0.70 0.065 285)` → `#9a99c6` | 0.48 → 0.18 |
| saffron | `#E0AC4F` | `oklch(0.74 0.065 82)` → `#bfa77c` | 0.57 → 0.26 |
| rose | `#E27A97` | `oklch(0.71 0.060 8)` → `#c3929a` | 0.42 → 0.19 |
| moss | `#8CBE6D` | `oklch(0.73 0.060 140)` → `#94b18e` | 0.32 → 0.14 |
| sky | `#58A6E8` | `oklch(0.71 0.060 245)` → `#82a6c5` | 0.56 → 0.26 |
| clay | `#D08A63` | `oklch(0.72 0.055 55)` → `#c09c84` | 0.43 → 0.24 |
| fog | `#8FA0B3` | `oklch(0.70 0.020 250)` → `#95a0ab` | 0.14 → 0.09 |
| ember | `#E8A13D` | `oklch(0.74 0.085 70)` → `#cea26f` | 0.67 → 0.37 |
| breach | `#E25563` | `oklch(0.65 0.115 20)` → `#cc7172` | 0.55 → 0.36 |

Contrast on the app canvas after softening: cove 7.98:1, ember 8.33:1, breach 5.70:1 — all still
clear of the 4.5:1 floor.

---

## Result

**After:** 0 viewports break the two-hue rule. Mean coloured area 0.55%, and every viewport that
still shows two is showing exactly what the law allows — the accent plus one semantic
(`#raids`: accent + ember; `/settings/security`: accent + breach; `/mod`: accent + breach).

Re-run with `npm run audit:color`; it exits non-zero if any unsanctioned viewport shows more than
two hues.

### A measurement that lied, twice

The first run reported the ink ramp as colour: `#11151D` is 26% saturated in HSL and grey to the
eye. Switching to absolute chroma (max − min channel, floor 0.15) fixed it — ink measures 0.05,
cove measured 0.58.

The second run, taken straight after the token rewrite, reported a triumphant **0.04% coloured and
zero hues everywhere**. That was not restraint, it was blindness: the palette had just moved to
`oklch()` and the parser only understood `rgb()`. A pass produced by a broken instrument is worth
less than an honest fail, so the parser learned OKLCH and the real number — 0.55% — is what is
recorded above.

### Grayscale proof

`docs/screenshots/grayscale-*.png` are five screens captured with the page desaturated. Every state
that matters survives: "Not sealed" is a chip with words, the active room is a raised row, own
messages are labelled "you", retention is written as `1d` and `3 views`, and selection is a
checkbox rather than a tint.
