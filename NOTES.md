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

---

## P3 — Sovereignty

**Reporting starts in the stream, not in a modal.** The whole point of the flow is that you choose
exactly what a moderator sees, so step 1 puts the conversation into selection mode with a bar under
it; steps 2 and 3 are a modal. `ReportDraft` lives in the UI store so the stream and the modal stay
in sync without prop drilling through the shell.

**The mod queue leads with "0 reports opened without proof."** It is a policy stated as a number,
which is the most Enclave way to say it. Every card shows a per-message franking hash and a
"proof verified" chip, and the copy says out loud that the excerpts are all the mods can see.

**Settings has no section-less state on desktop and a real one on mobile.** `/settings` shows the
nav on a phone and Masks in the pane on a desktop, rather than redirecting and stranding phone
users in a section with no way back to the list.

**Sweep confirms with the true sentence, not a comfortable one.** "Deletes your messages everywhere
it is allowed. Others' copies of sealed rooms expire by key rotation." The modal does not promise
reach it does not have.

**Duress mode cannot be armed until the two passwords differ**, and the confirm modal says there is
no recovery path from inside the decoy. Presenting that as the feature rather than a caveat is the
honest framing.

**Onboarding's hue picker calls `crossfadeAccent` directly.** It runs outside the app shell, so
there is no `useChrome` to drive the tint; picking a hue there is the first taste of the signature
and it should animate exactly the way the real switch does.

**Two real defects found by auditing the running app rather than by reading it:**

1. *Invalid DOM nesting.* `MaskAvatar` rendered a `<div>`, and avatars sit inside `<p>` labels,
   tooltips and chips. React was warning on `/settings/notifications`. The wrapper is now a `<span>`
   with `display: block`, which is identical visually and valid everywhere. Verified 0 hits for
   `p div`, `span div`, `button button` across every route.
2. *Contrast.* `--text-low` (#5E6877) measures 3.4:1 on the app canvas — under the design system's
   own 4.5:1 floor for body text. The token is specified in §2 and the floor is specified in §9, so
   they only agree if `--text-low` is never body text. Rather than change a token that is law, every
   explanatory paragraph (24 of them, all marked `leading-relaxed`) moved to `--text-mid`, which
   measures 7.4:1 on the canvas and 6.5:1 on raised surfaces. `--text-low` now carries only
   timestamps, hashes, counts and micro-labels — genuinely tertiary material.

**Route sweep:** all 37 routes render with no runtime errors and no blank screens; the two thin
pages are the deliberately empty `Standup` voice room and the 404.

**Demo mode verified reversible in the running app:** toggling on drips events into `#raids`
(confirmed a new message appearing); toggling off restores the world to its exact prior state
(confirmed the message gone and the DOM back to its original size).

**P3 gate:** typecheck, lint and build clean; five-minute click-through with zero dead ends — every
out-of-scope control raises the "comes in a later phase" toast rather than doing nothing.

---

## Final pass — the screenshot manifest, and what shooting it exposed

**The manifest is captured by a script, not by hand.** `scripts/shoot.mjs` drives the system
browser through `puppeteer-core` (a dev dependency; nothing is downloaded and nothing reaches the
app bundle) and produces all 36 images — 18 screens × 1440 and 390 — into `docs/screenshots`. Six of
them need interaction first (advancing onboarding, opening the switcher, the palette, the social
card, a story, and the report flow through to step 2), so the script performs those steps rather
than capturing a static route.

*Windows footnote:* `msedge.exe` is a GUI-subsystem binary and never writes its
`DevTools listening on ws://…` line to an inherited stderr pipe, so `puppeteer.launch()` waits
forever and then reports an exit it never observed. The script opens a fixed debugging port and
`puppeteer.connect()`s to it instead, which works with Chrome too.

**Four things only visible once the screens were real:**

1. *The tint was following the wrong identity.* The accent tracked the globally active mask, so
   The Reading Room — an anonymous space you are in as Courier-7 — still rendered cove green. The
   thesis says the interface takes the shape of *your context*, and inside a space your context is
   that space's mask. Rooms now declare a context mask (`useContextMask`) and the tint follows
   `contextMaskId ?? activeMaskId`. LostEra → cove/hall, Atelier Nord → iris/studio, The Reading
   Room → fog/salon, everywhere else → whoever you are wearing. The mask switcher gained the scoped
   warning the spec asks for, naming the actual room: "Mira knows you as Aija and will keep doing
   so."
2. *Responsive display classes were silently losing.* `hidden lg:inline-flex` passed as a
   `className` to a component whose own base class is `inline-flex` puts two utilities from the same
   group in the cascade, and the component's own class won — so a desktop-only panel toggle, the
   member count and a header chip all rendered at 390, squeezing the room title to nothing. Fixed by
   wrapping in a span that owns the responsive display, in all five places.
3. *The mobile composer could not fit its own placeholder.* Five 44px hit targets plus a field in
   358px left about 140px for text, and "Message #raids" wrapped and clipped. The field now takes
   its own row below the controls on phones and sits inline from `md` up — hit targets and legibility
   both intact.
4. *`/chats` opened onto a void on desktop.* The list is the screen on a phone, but on a wide
   display an empty right pane is not an empty state, it is an unfinished one. Desktop now opens the
   top conversation; the genuine "no conversations yet" empty state still exists underneath.

Also from looking rather than reading: `MediaArt` strokes now use `non-scaling-stroke` (a story-sized
crop was turning hairlines into enormous rings), the voice grid centres vertically, the stories rail
fades at its scroll edge, and group member counts moved to the snippet line so "friday five" stopped
truncating to "fri…".

**Final gate:** `tsc -b`, `eslint .` and `vite build` clean. 37 routes render with no runtime errors.
Reduced motion verified to clamp transitions in the running app, both from the system preference and
from the in-app override. Every out-of-scope control raises the "comes in a later phase" toast.

---

## P4 — Mobile excellence pass

Ran as its own phase against `docs/MOBILE_PASS.md`: audit, then foundation, then screens, then
proof. Desktop was the constraint, not the target — the 1440 screenshot set is unchanged apart from
the composer, which improved for both.

### The audit found more than the eye did

`scripts/audit-mobile.mjs` walks 27 routes across 360×800, 390×844, 430×932 and 390×460 and
measures four things a person cannot reliably eyeball: horizontal overflow, computed input
font-size, touch-target geometry, and elements escaping the viewport. First run:

- **0** routes with horizontal page scroll — the one thing that was already right.
- **16** inputs under 16px, which is the iOS zoom-on-focus tell.
- **103** distinct interactive elements under 44×44.
- **1** genuine layout break: `/space/:id` rendered the channel column *and* the community home
  side by side at phone widths, pushing the home off-screen into a 26px-wide sliver. That one was
  invisible in the desktop screenshots and would have been easy to miss by eye at 390 too.

Final run: **0, 0, 0**. `npm run audit:mobile` reproduces it and exits non-zero on the two
non-negotiable rules (overflow, sub-16px inputs), so §8's automated check lives in the repo.

### The foundation, built before any screen was touched

- `--safe-top` / `--safe-bottom` / `--gutter` tokens. One gutter value for the whole app (16px on
  phones, 24px from `md`), so spacing cannot drift screen by screen again.
- `useKeyboardInset()` reads `window.visualViewport` — the only honest source, because on iOS the
  layout viewport does not move when the keyboard opens. It also publishes `--keyboard-inset`, so
  docked surfaces ride above the keyboard in pure CSS.
- `<Screen>` owns gutter, safe areas and a contained scroll container. Adopted by the six full-page
  screens; the column screens get the same guarantee through `ListColumn` / `MainColumn`.
- `<Sheet>` is now a real bottom sheet: drag handle, drag-to-dismiss, two snap points, focus trap,
  and a footer that clears both the safe area and the keyboard. **`Modal` delegates to it on
  mobile**, which is the single highest-leverage line in this phase — the mask switcher, social
  card, report flow, palette, sweep confirm and duress confirm all became sheets from one change,
  with no `Mobile*` forks anywhere.
- Global touch defaults: `touch-action: manipulation`, real `:active` states to replace the removed
  tap highlight, `text-size-adjust`, `overflow-wrap: anywhere` on message bodies, and a media query
  that puts every input at 16px below `md`.

### The composer, rebuilt

Five 44px targets and a readable field do not fit in 360px, so on a phone attach / expiry /
schedule collapse behind one `＋` that opens a sheet. Active retention moved *inside* the pill's
right edge instead of occupying a row above it. The pill is radius-full at one line and eases to
the card radius as it grows to five lines, then scrolls internally. Send swaps to mic when the
field is empty. The bottom tab bar is now hidden inside any room, which is what freed the vertical
space to make this work.

### Two things the brief asked for that turned into real features

**Reply is no longer a toast.** Swipe-to-reply needed somewhere to put the quote, so `replyTo` went
into the UI store, the composer grew a quote strip, and `send()` learned `replyToId`. The ⋯ menu
item and the swipe now do the same real thing, and a `later()` stub disappeared.

**Profile reorder drags by the grip, not the card.** framer's `Reorder` with `dragListener={false}`
plus `useDragControls` started from the handle. Dragging the card itself would have fought the
scroll container on a phone; dragging a handle does not, and the ↑ ↓ controls stay as the
accessible path.

### Corrections to my own audit

One line in `MOBILE_AUDIT.md` was wrong when I wrote it: Discovery cards were never 2-up at 430
(`sm:` starts at 640). It is struck through in place rather than deleted, because a checklist that
quietly loses its mistakes is not a checklist.

### P4 gate

`tsc -b`, `eslint .` and `vite build` clean. `npm run audit:mobile` passes all three checks across
27 routes × 4 viewports. Screenshot set covers the manifest at 360, 390, 430 and 1440, plus five
mobile-only states: composer with the keyboard open, members sheet, profile edit with the lens
active, mobile search, and the composer options sheet.
