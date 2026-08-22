# ENCLAVE — P4: Mobile Excellence Pass

> Follow-up brief for the existing repo. Run as its own Claude Code session: read this file,
> re-read `docs/DESIGN_SYSTEM.md`, skim `docs/SCREENS_SPEC.md` and `NOTES.md`, enter plan mode,
> then execute. Desktop (≥1024px) is approved and must not regress — this phase makes the phone
> experience native-grade.

## 1. Mission

Review feedback: mobile currently reads as a shrunken desktop — the conversation composer is
untidy, profile blocks misalign, spacing drifts between screens. This pass has one goal:
**at 360–430px, Enclave should feel like a native app that happens to run in a browser.**
One-thumb usable, keyboard-aware, nothing overflowing, nothing jumping, every screen aligned to
the same grid.

Treat this as an audit-and-rebuild of the mobile layer, not spot fixes.

## 2. Method — audit → foundation → fix → prove

1. **Audit.** Walk every screen at 390×844, 360×800, 430×932. Log every defect in
   `MOBILE_AUDIT.md` as unchecked boxes grouped by screen (alignment, overflow, target size,
   keyboard, safe area, truncation). Simulate keyboard-open by shrinking viewport height to
   ~460px — composer and chat must survive it. Use browser tooling / Playwright if available for
   screenshots; otherwise `vite preview` + devtools device mode.
2. **Foundation.** Build the shared mobile layer (§3) *before* fixing screens, so fixes are
   systemic, not per-screen hacks.
3. **Fix** screens in the order §4 → §5 → §6 → §7, checking off audit boxes. Commit per screen cluster.
4. **Prove.** Re-screenshot per the gate in §9. A box stays unchecked until a screenshot shows it fixed.

## 3. The mobile foundation (build once, use everywhere)

- **Viewport & safe areas**: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
  Tokens `--safe-top` / `--safe-bottom` from `env(safe-area-inset-*)`. Full-height layout uses
  `100dvh` (`h-dvh`) — **`100vh` is banned** repo-wide.
- **Keyboard awareness**: a `useKeyboardInset()` hook reading `window.visualViewport` (height
  delta → bottom inset). Composer and sheets ride above the keyboard; the message list keeps its
  bottom anchor.
- **`<Screen>` wrapper**: enforces the 16px gutter, safe-area padding, header slot, and a scroll
  container with `overscroll-behavior: contain`. Every mobile route renders inside it — gutters
  can never drift between screens again.
- **`<Sheet>` primitive**: bottom sheet with drag handle, drag-to-dismiss, backdrop, snap points,
  safe-area footer, focus trap. On mobile it replaces every desktop right-panel and modal:
  members, thread, profile peek, mask switcher, room details, attach/ember picker, Social Card,
  report flow, discovery peek.
- **Touch polish defaults** (global CSS): `-webkit-tap-highlight-color: transparent` paired with
  real `:active` states (scale .97 or ink-2 fill); `touch-action: manipulation` on controls;
  `-webkit-text-size-adjust: 100%`; `overflow-wrap: anywhere` on message bodies; mono hashes
  truncate middle (`ab3f…9c1`), never wrap.
- **No-zoom rule**: every input and textarea is **≥16px** on mobile. Non-negotiable — iOS zoom on
  focus is the #1 "feels broken" tell.
- **Media stability**: all images/video sit in `aspect-ratio` boxes with an ink-2 placeholder.
  Zero layout shift while loading.

## 4. The composer — rebuild it mobile-first (main complaint)

```
┌──────────────────────────────────────────────┐
│ ┌───┐  ┌───────────────────────────┐  ┌────┐ │
│ │ ＋ │  │ Message #raids…      ◔24h │  │ ➤  │ │
│ └───┘  └───────────────────────────┘  └────┘ │
│              (safe-area-inset-bottom)        │
└──────────────────────────────────────────────┘
```

- One row, three zones, all vertically centered on the **same baseline** at every state.
- `＋` (44px): on mobile it opens attach / ember / schedule / blur-toggle as a Sheet — those icons
  never crowd the input row on a phone.
- Pill textarea: 16px type, radius-full at one line, auto-grows to 5 lines
  (`field-sizing: content` + JS fallback) then inner-scrolls; radius eases to 14 as it grows;
  placeholder and caret centered at every height.
- Active retention renders as a small ember chip **inside** the pill's right edge; tap to reopen
  the picker.
- Send: 44px accent circle (wears the mask), 40% opacity when empty. When the field is empty it
  swaps to mic; recording slides over the pill with slide-to-cancel.
- Pinned above the keyboard via `useKeyboardInset`; ink-1 background, top hairline; the bottom
  tab bar is **never** visible inside a conversation.
- The undo-send bar renders above the composer and never overlaps the last message.

## 5. Conversation screen on mobile

- Full-screen push, back chevron. Header compacts to: back · name+seal · retention chip · ⋯
  (call, members → Sheet). Topic line hides ≤390.
- Stick-to-bottom scroll anchoring when the keyboard opens or media loads; a "jump to latest"
  pill appears after scrolling up 2+ screens.
- Bubbles max-width 85%; consecutive messages from one author tighten spacing (12 → 4);
  timestamps appear on tap, not always-on.
- Hold-to-view works with touch: pointer events, `-webkit-touch-callout: none`, context menu
  suppressed, release → re-covers.
- Horizon, aging, and ember dissolve verified at 390 — a dissolve must not shift scroll position.
- Add reply-swipe (swipe right on a bubble to quote). Small, native-feeling win.

## 6. Profile on mobile (second complaint)

- Bento collapses to **one column, fixed order**: header → ZK badges → Aura + Reputation (pair,
  equal heights) → About → Badges (3-up square grid) → Now playing → Projects → Spaces → Links.
  Uniform 16px gutters, 12px inter-block gaps — no ragged edges anywhere.
- Meters scale without clipping labels; trend chips wrap as a row, never overflow.
- Audience lens: sticky under the header, full-width 3-segment control, 44px tall.
- Edit mode on touch: long-press lifts a block (slight scale), drag to reorder within the column;
  ↑ ↓ controls in each block's overflow menu as the accessible fallback.
- Social Card: full-screen Sheet; templates as a horizontal snap carousel; "Export PNG" pinned in
  the safe-area footer.

## 7. Everything-else sweep (fix each to spec)

- **Chats home**: folder tabs scroll horizontally with edge fade; rows 72px; swipe-left on a row
  reveals mute / pin.
- **Community home**: identity chip wraps below the title — the space name never truncates for it;
  channel rows 48px, glyphs aligned in a fixed 24px column.
- **Voice room**: occupant grid auto-fits 3-up; controls dock in a safe-area footer, five 56px
  targets; room details = Sheet.
- **Mask switcher**: bottom Sheet, full-width mask cards; the 250ms re-tint must be visible as the
  sheet closes.
- **Stories**: true full-screen (dvh); tap zones 30/70; progress bars below safe-top; reply field
  obeys the keyboard inset.
- **Vault**: tabs as a scrollable chip row; clipboard rows keep device chip + time on one line,
  truncating the preview first.
- **Settings**: every matrix fits 360 — segmented controls may stack 2×N; slider thumbs 44px;
  duress confirm keeps its breach border as a Sheet.
- **Moderation**: in-stream multi-select with 28px checkboxes on the left edge; the 3-step flow
  becomes full-screen sheets.
- **Discovery**: single-column cards; gate chips wrap; preview peek = Sheet.
- **Palette → Search**: there is no Cmd+K on a phone. Magnifier in the Chats header opens
  full-screen search (recents + actions, keyboard auto-focused).
- **Onboarding**: inputs ≥16px; CTA pinned in safe-area footer; hue swatches 44px; step dots clear
  of the notch.

## 8. Ergonomic rules (apply everywhere)

- Every target ≥44×44 with ≥8px between adjacent targets.
- Each screen's primary action lives in the bottom half (thumb zone); destructive is never
  adjacent to primary.
- **Zero horizontal page scroll, ever.** Add an automated check: walk all routes and assert
  `document.scrollingElement.scrollWidth <= window.innerWidth`.
- Truncation policy: names truncate end · hashes truncate middle · previews and topics one line.
- Reduced motion honored by every new gesture and sheet.

## 9. Acceptance gate — P4 is done when

1. `MOBILE_AUDIT.md` is fully checked. Zero known defects.
2. Screenshot set at **360, 390, 430** covering the SCREENS_SPEC manifest **plus**: conversation
   with keyboard open (composer riding above it), members Sheet open, profile edit with lens
   active, mobile search open.
3. The automated horizontal-overflow check passes on every route.
4. No input zooms on focus (all ≥16px, verified on the onboarding and composer inputs).
5. Desktop screenshots unchanged — no regression ≥1024px.
6. `npm run typecheck && npm run lint && npm run build` clean; `NOTES.md` documents the mobile
   foundation layer and how future screens must use it.

## 10. Do not

- Do not fork components into `Mobile*` duplicates — one component, responsive variants.
- Do not add a UI framework to "solve" mobile.
- Do not hide features on mobile to dodge layout work — everything in the spec exists on the phone.
- Do not use `100vh`, fixed pixel heights on the app shell, or sub-16px fonts in inputs.
