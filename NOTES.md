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

---

## P2 — Presence & social

**The mask crossfade had to be driven, not declared.** `tokens.css` originally transitioned the
registered `--accent*` properties directly (`html { transition: --accent 250ms ... }`). It reads
beautifully and it does not work: in this engine the computed value of a transitioning *registered*
custom property sticks at the start of the transition, so `data-mask-hue` would flip to `fog` while
`--accent` stayed cove — the whole signature, silently dead. Caught it in the live DOM, not by
eye. `src/lib/tint.ts` now interpolates the four accent aliases itself over 250ms on the product's
own easing curve, writes them inline for the duration, and clears the inline values so the declared
`[data-mask-hue]` tokens take over again. Reduced motion snaps. The declarations in `tokens.css`
remain the source of truth, so the tint is correct with JavaScript off the critical path.

**Salon does not get a channel sidebar.** The design system says structure is the privacy signal,
so the quiet room collapses its channel column into a header dropdown rather than shrinking the
same three-column layout. Entering The Reading Room genuinely reshapes the shell: 17/1.7 body,
680px column, chrome at 40% until hover, no list column.

**The audience lens swaps identity, not just visibility.** A stranger sees no handle at all (the
name reads "Someone"); a contact sees the handle; a LostEra member sees *Aija* even when you are
currently wearing Nova, because LostEra never met Nova. `AUDIENCE_KNOWS` replaced the original
`AUDIENCE_MASK`, which mapped every audience to the same mask and therefore demonstrated nothing.

**Edit-mode reordering is arrow buttons plus a grip affordance**, not real drag. The spec allows
the illusion; arrows are the honest version of it, they work on touch, and they are reachable from
the keyboard. Reordering is within a column, as specified.

**QR codes are drawn, not generated.** A deterministic 25×25 module grid with real finder patterns
— convincing at card size, no library, no encoded payload that could mislead anyone into scanning
it.

**Stories:** conic rings in the author's mask hue (flat hairline once seen), 6s auto-advancing
segments that pause on press or when the reply field has focus, keyboard arrows, view-once
tombstoning on advance, and a reply that says out loud it becomes a direct message. The composer
shows the audience as one chip — scope *and* mask — because that pair is the whole privacy story.

**Aura is a half-arc with a sparkline; Reputation is a laurel whose leaf count grows with tier.**
Both collapse to "Stats are off. Only you can turn them on." from a single master toggle.

**P2 gate:** typecheck, lint and build clean. Voice room reads as live in a screenshot (speaking
ring, waveform, relay chip, mono latency, occupant spill). Social Card exports a real PNG through
`html-to-image` across all four templates. Switching LostEra → The Reading Room visibly reshapes
the shell (verified: `data-atmosphere="salon"`, 17px/1.7 body, 680px column, chrome 0.4, no channel
column).
