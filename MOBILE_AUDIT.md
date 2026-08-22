# P4 — Mobile audit

Walked every route at **360×800**, **390×844**, **430×932**, and **390×460** (keyboard open) with
`scripts/audit-mobile.mjs`, plus a visual pass over the captured screenshots. A box stays unchecked
until a screenshot or an automated check shows it fixed.

Baseline that already held: **zero horizontal page overflow on any route at any width.** That is
the one thing that was not broken, and §8 now has an automated check so it stays that way.

---

> **Status: complete.** Re-run `npm run audit:mobile` to reproduce — it walks 27 routes across
> 360×800, 390×844, 430×932 and 390×460 and now reports **0 horizontal overflows, 0 inputs under
> 16px, and 0 touch targets under 44×44** (down from 103 distinct undersized targets).

## Foundation

- [x] `--safe-top` / `--safe-bottom` tokens exist and every fixed edge uses them
- [x] `useKeyboardInset()` reads `window.visualViewport`; composer and sheets ride above the keyboard
- [x] `<Screen>` wrapper owns the 16px gutter, safe-area padding and the scroll container
      — adopted by the six full-page screens (Vault, Discovery, Spaces, Mod queue, Profile,
      Playground). The column screens (Chats, Space, Conversation, Settings) get the same
      guarantee from `ListColumn` / `MainColumn`, which read the same `--gutter` token.
- [x] `<Sheet>` gains a drag handle, drag-to-dismiss, snap points, safe-area footer, focus trap
- [x] Global touch polish: `:active` states, `touch-action: manipulation`, `-webkit-text-size-adjust`,
      `overflow-wrap: anywhere` on message bodies
- [x] Mono hashes truncate middle (`ab3f…9c1`), never wrap
- [x] `overscroll-behavior: contain` on every scroll container
- [x] No `100vh` anywhere — the shell was already on `h-dvh`

### Inputs that zoom on focus (all measured < 16px)

- [x] Onboarding handle field — 14px
- [x] Chats search — 14px
- [x] Vault search — 14px
- [x] Discovery search — 14px
- [x] Composer textarea — 15px (every room)
- [x] Security: real password, duress password — 14px
- [x] Notifications: quiet-hours and digest sliders — 14px

---

## §4 Composer

- [x] Icons crowd the input row on a phone — attach / ember / schedule belong behind one `＋`
- [x] Field, `＋` and send are not on a shared baseline
- [x] Textarea is 15px (zooms) and does not auto-grow with a ceiling
- [x] Active retention is a chip *above* the row instead of inside the pill
- [x] Send does not swap to mic when the field is empty
- [x] Composer does not track the keyboard; at 390×460 it is pushed out of reach
- [x] Bottom tab bar is visible inside a conversation — it should never be
- [x] Send / mic / attach measure under 44px

---

## §5 Conversation

- [x] Header does not compact: topic line still shows ≤390
- [x] `Message actions` is 24×24 — less than half the minimum target
- [x] Voice note play button 36×36; scrubber `Pause` 65×22
- [x] "Translated — show original" is a 210×36 tap target on a 36px line
- [x] `Undo` 42×22 and scheduled `Cancel` 54×26
- [x] "N views left · tap to spend one" is a 24px-tall target
- [x] No stick-to-bottom anchoring when the keyboard opens
- [x] No "jump to latest" affordance after scrolling up
- [x] Bubbles are capped at 78% and timestamps are always on
- [x] Hold-to-view fires the iOS callout / context menu on long press
- [x] No reply-swipe

---

## §6 Profile

- [x] Bento is a 2-column grid that stacks in *column order*, so the mobile reading order is wrong
- [x] Aura and Reputation are not paired at equal heights
- [x] Badges are a 2-up list rather than a 3-up square grid
- [x] Audience lens scrolls away instead of sticking under the header
- [x] Lens segmented control is not full-width and is under 44px tall
- [x] Edit-mode reorder is arrow-only; no long-press drag on touch
- [x] Social Card is a centred modal, not a full-screen sheet, and templates do not snap-scroll

---

## §7 Everything-else sweep

### Chats home
- [x] Folder tabs: `All` measures 40×44 and the row has no edge fade
- [x] Rows are ~64px, not 72px
- [x] No swipe-left actions (mute / pin)

### Community home
- [x] **At mobile widths the channel list and the community home render side by side**, pushing the
      home off-screen — the audit found `LostEra`, its blurb and the identity chip all sitting past
      the right edge inside a squashed 26px-wide column
- [x] Channel rows are 30–36px tall against a 48px target, and glyphs are not in a fixed column
- [x] Identity chip sits inline with the title and truncates it

### Voice
- [x] Occupant grid is 2-up at 360 and does not auto-fit 3-up
- [x] Controls are a wrapped button row, not a docked safe-area footer with 56px targets
- [x] Room details is a side sheet rather than a bottom sheet

### Mask switcher
- [x] Centre modal on mobile; should be a bottom sheet with full-width cards
- [x] Presence segmented control segments are under 44px

### Stories
- [x] Viewer is `h-full` inside a fixed inset rather than true `dvh`
- [x] Reply field does not obey the keyboard inset
- [x] Progress bars sit at a fixed 12px from the top, not below `--safe-top`

### Vault
- [x] Tabs are an underline row, not a scrollable chip row
- [x] Clipboard rows wrap the device chip onto a second line instead of truncating the preview

### Settings
- [x] Privacy matrix segmented controls overflow their row at 360
- [x] Slider thumbs are 14px
- [x] Duress confirm is a centre modal
- [x] `Require a request before direct messages` toggle is 40×24

### Moderation
- [x] In-stream multi-select has no visible checkboxes
- [x] The 3-step flow is a centre modal rather than full-screen sheets

### Discovery
- [x] ~~Cards are 2-up at 430~~ — **audit error on my part**: `sm:grid-cols-2` starts at 640, so
      cards were already single column at every phone width. Nothing to fix; recorded rather than
      quietly deleted.
- [x] Preview peek is a side sheet

### Search
- [x] There is no Cmd+K on a phone and no search entry point — the magnifier in the Chats header is
      a filter input, not the palette

### Onboarding
- [x] Handle input 14px; `Generate another` 148×34
- [x] `Just exploring?` link is a 222×20 target
- [x] CTA is inline, not pinned in a safe-area footer
- [x] Hue swatches are 32px

---

## §8 Ergonomics

- [x] 103 distinct interactive elements measure under 44×44 at phone widths
- [x] No automated horizontal-overflow check in the repo
- [x] Truncation policy not applied to hashes (they wrap rather than truncating middle)
- [x] Zero horizontal page scroll on all 27 routes × 4 viewports (verified, keep it that way)


---

## Result

| Check | Before | After |
| --- | --- | --- |
| Routes with horizontal page scroll | 0 | 0 |
| Inputs that zoom on focus (<16px) | 16 | 0 |
| Distinct touch targets under 44×44 | 103 | 0 |
| Routes rendering two columns side by side on a phone | 1 | 0 |

Proof set: `docs/screenshots` — the full manifest at 360, 390, 430 and 1440, plus five mobile-only
states (`19`–`23`): composer with the keyboard open, the members sheet, profile edit with the lens
active, mobile search, and the composer options sheet.
