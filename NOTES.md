# Enclave — design journal

Decisions, deviations, and things to revisit. Appended as the build goes.

---

## P0 — Foundation

**Stack landed exactly as briefed.** Every package in `docs/PROMPT.md` §3 resolved at its real
version — no substitutions were needed. Added `@types/node` (needed for `node:url` in
`vite.config.ts`) and `vite/client` types; neither is a product dependency.

**Docs moved into `docs/`.** The brief expects `docs/DESIGN_SYSTEM.md` and `docs/SCREENS_SPEC.md`;
the three markdown files were at the repo root, so all three now live in `docs/`.

**Mask tint is a CSS-variable crossfade, not a class swap.** `--accent`, `--accent-soft`,
`--accent-glow` and `--accent-line` are registered with `@property { syntax: '<color>' }` and
transitioned on `<html>` for 250ms. That makes the switch a real colour interpolation rather than a
hard cut, and it costs nothing at runtime because components only ever reference `--accent-*`.
Trade-off: `@property` needs a 2023+ browser. Acceptable for a prototype; noted here in case that
ever stops being true.

**Added `--accent-line` (24% alpha) beyond the three stops the design system names.** `base`,
`soft` (12%) and `glow` (40%) left a gap: hairline borders on accented surfaces looked either
invisible at 12% or shouty at 40%. `--accent-line` sits between them and is used only for 1px
borders. In the spirit of §2; logged as a deviation.

**Added `--ink-3`.** The system names three ink steps plus `--line`. Pressed states and inset wells
needed one step above `--ink-2` that was not the hairline colour.

**Atmospheres are token sets, not layout branches.** `[data-atmosphere="hall|studio|salon"]`
redefines `--atm-chat-size`, `--atm-chat-leading`, `--atm-list-size`, `--atm-chrome-opacity`,
`--atm-column-max` and `--atm-stream-pad`. Screens read those tokens, so a space changes the shell
without any component knowing which atmosphere it is in.

**Murmur is a 3px shimmer *under* the space icon, not a left-edge pill.** A vertical bar on the
left edge of a rail icon is the Discord unread indicator, and the anti-goals reject that on sight.
A horizontal shimmer beneath the tile reads as a pulse rather than a badge, and its animation
duration maps to intensity (busy rooms breathe faster).

**Avatars are drawn, not downloaded.** Eight geometric marks in `components/identity/AvatarMark`,
each inheriting the mask hue. A club has a house style, and this keeps identity legible at 20px
with no external assets.

**Presence "invisible" renders as a hollow dot, never as an absent dot.** Other people cannot see
it, but you always need to know which of your own masks is dark.

**Fixture times are anchored to app start** (`lib/time.ts` `BOOT`). Every `ago()` / `ahead()` is
relative to it, so ember rings, countdowns and the aging band in `#raids` genuinely run instead of
being frozen strings.

**Franking tags, fingerprints and safety numbers come from one deterministic FNV-1a hash**
(`lib/hash.ts`), so the same message always carries the same proof across reloads.

**One shared clock.** `lib/useNow` multiplexes a single `setInterval` across every timer in the
app, so the whole world ages together instead of drifting per component.

**`ThreadKind` lost its `'channel'` member.** It was in the extended contract but nothing ever
produces it — channels come from `Community.channels`. `RoomRef.kind` is
`ThreadKind | Channel['kind']`, which covers both without a phantom case.

**P0 gate:** `tsc -b`, `eslint .` and `vite build` all clean; playground verified at 1440 and 390;
mask switch confirmed to re-tint (`data-mask-hue="fog"` drains `--accent` to `rgb(143 160 179)`).

---

## P1 — Conversation core

**Two stream layouts, chosen by room kind.** Channels and groups render as a dense stream
(avatar gutter, author name, Discord-style scanning); direct messages render as bubbles with own
messages aligned right (Telegram-style intimacy). The design system asks for both densities
deliberately, and the room kind is the honest place to switch between them. The message *content*
block is shared, so every state renders identically in both.

**Media is drawn, not fetched.** `components/messaging/MediaArt` turns any seed into a
deterministic abstract composition (five layout variants, two mask hues, a dark scrim). Grey
placeholder rectangles would have made every media state — blurred, view-once, hold-to-view,
watch-budget — read as "unimplemented" in a screenshot.

**Hold-to-view is a real press.** `pointerdown` reveals, `pointerup` / `pointerleave` re-covers,
and space bar does the same for keyboard users. It is the one interaction in the product that
cannot be faked with a click.

**The Horizon is unconditional in retention rooms**, and the ghost-history note now renders
alongside it rather than instead of it. `#annotations` is both a 7-day retention room *and* a
from-join room, and hiding one fact behind the other lost information.

**Watch-budget copy counts down, not up.** It reads "0:22 of 0:30 left", matching the spec: the
number that matters is what you have left, not what you have spent.

**`TransferCard` landed in P1 rather than P3.** `#raids` and the Mira DM both carry large
attachments in the fixtures, and a stub would have been a dead surface at the P1 gate. All four
states (direct, relay fallback, paused/resumable, failed) exist; P3 adds the discovery of them from
the attach picker.

**Report from the ⋯ menu is a "later" toast in P1** and becomes the real flow in P3, when
in-stream multi-select exists. Every other action in that menu works now.

**Transfers advance on a shell-level interval**, not per-card, so a file keeps moving while you are
in another room — which is the entire point of a resumable transfer.

**P1 gate:** typecheck, lint and build clean. Every fixture state in `#raids` renders distinctly
(verified from the live DOM): Horizon, aged messages, reply quote, media grid, blurred preview,
view-once cover, expired tombstone, hold-to-view, watch budget, burn-after-listen voice note,
"View in app only" attachment, direct transfer, undo window, scheduled section. Palette is fully
keyboard navigable (arrows, enter, escape).
