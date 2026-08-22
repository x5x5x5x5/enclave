# ENCLAVE — Design System

## 1. Thesis

Discord is an arcade. Signal is a utility. Telegram is a bazaar. **Enclave is a private club** —
calm, precise, sovereign. Privacy is presented as quality of life, not paranoia: nothing in the UI
should feel like a hacker terminal or a fear campaign. The interface is quiet and disciplined so
that one idea can carry it:

**Signature — one idea on two axes: the interface takes the shape of your context.**

1. **The mask tint (who you are).** The active identity's hue flows through the entire UI —
   accent color, avatar ring, focus rings, send button, selection states, story rings, and a 1px
   "presence thread" running across the top of the conversation pane. Switch masks and the whole
   product visibly changes allegiance in 250ms; the fog mask drains it grey.
2. **Atmospheres (where you are).** Spaces are not all the same room, so they do not share one
   layout. Each space declares an atmosphere that reshapes the shell itself — see §4. A dense
   gaming hall and a sealed anonymous salon should not look like the same product wearing
   different wallpaper. Structure is the privacy signal.

These two moves carry the design. Everything else stays quiet so they read clearly.

### Anti-goals (reject on sight)
- Discord clone energy: blurple, rounded blob mascots, playful chaos.
- The stock AI looks: cream + serif + terracotta; near-black + acid green; broadsheet hairlines with zero radius. None of these.
- Crypto-bro aesthetics: neon gradients, glassmorphism cards floating in a void.
- Fear UI: skulls, warnings everywhere, red locks. Protection is the calm default here.

## 2. Color tokens

Dark-first (the audience lives at night). One theme for the prototype. All tokens are CSS variables in `src/styles/tokens.css`.

### Neutrals — "Ink"
| Token | Hex | Use |
|---|---|---|
| `--ink-0` | `#0B0E13` | App canvas |
| `--ink-1` | `#11151D` | Surfaces (columns, cards) |
| `--ink-2` | `#171D27` | Raised (hover, active row, modals) |
| `--line`  | `#232B38` | Hairlines, 1px, often at 60% |
| `--text-hi` | `#E9EDF3` | Primary text |
| `--text-mid` | `#97A1B0` | Secondary |
| `--text-low` | `#5E6877` | Tertiary, timestamps |

### Mask hues (the identity system)
Each mask owns one hue. Three stops each: `base`, `soft` (12% tint for fills), `glow` (40% for focus rings).

| Hue | Base | Personality |
|---|---|---|
| `cove` | `#33C6B5` | default / gaming |
| `iris` | `#8B7CF6` | creative |
| `saffron` | `#E0AC4F` | warm |
| `rose` | `#E27A97` | social |
| `moss` | `#8CBE6D` | grounded |
| `sky` | `#58A6E8` | professional |
| `clay` | `#D08A63` | earthy |
| `fog` | `#8FA0B3` | anonymous (deliberately muted) |

Mechanism: `--accent`, `--accent-soft`, `--accent-glow` are **aliases to the active mask's hue**,
set on `<html data-mask-hue="cove">`. Components only ever reference `--accent-*`. Switching masks
crossfades these variables (250ms). The `fog` mask proves the point: go anonymous and the interface
itself turns grey and unremarkable.

### Semantic
| Token | Hex | Use |
|---|---|---|
| `--ember` | `#E8A13D` | Everything ephemeral: timers, retention chips, dissolve glow |
| `--breach` | `#E25563` | The ONLY alarm color: unsealed rooms, failed transfers, duress warnings |

**Rule: encryption is silent.** Sealed rooms get a small neutral seal glyph, no green. An *unsealed*
room gets a `--breach` banner: "This room isn't sealed. The host can read messages." Absence
screams; presence whispers.

### Colour discipline (P5)

The palette was never the problem; usage was. Two objective tests define compliance, both
automated in `scripts/audit-color.mjs` (`npm run audit:color`):

1. **The grayscale test** — convert any screenshot to grayscale and the UI stays fully navigable.
   Colour may add meaning; it may never carry it alone.
2. **The two-hue rule** — any single viewport shows at most **two** non-neutral hues: the accent
   plus at most one semantic. The only sanctioned rainbow moments in the product are the mask
   switcher and the onboarding hue picker, which use `--hue-*-vivid`.

**`--accent` may appear on exactly:** the single primary action of the current screen; focus rings
and the caret; the active nav indicator and checked/selected states; links; the presence thread at
50% opacity.

**`--ember` may appear on exactly:** an `EmberRing` actively depleting in view; the dissolve
animation and expired tombstone; the Horizon edge at ~15% fading to transparent; a message in the
final ~10% of its life. **Retention chips at rest are neutral** — hairline, glyph, `--text-mid`.

**`--breach` may appear on exactly:** the unsealed banner, destructive confirmations, failed
transfers. Nothing else.

**Other people's hues** appear only as a 2px ring at 70% on avatars **32px and larger**. In dense
lists — chats home, member panel, message gutters — avatars get a neutral hairline and no hue.
Usernames are always `--text-hi`; colour-coded names are Discord's noise and we do not inherit it.

**Everything else is ink.** Borders, resting icons, headers, cards, toasts.

**Imagery is exempt, and only imagery.** Avatars, space emblems, album sleeves, badge crests and
message attachments are *pictures*: they carry their own colour the way a photograph does in a dark
room, and a product where every profile picture is grey is not calm, it is dead. Imagery is marked
`data-imagery` so the audit can tell it apart from chrome, and it is held to a different standard —
rich and varied, but never neon, and never used to carry interface state. The two-hue rule governs
everything around the picture, which is what keeps the picture legible.

Rest-state hues are defined in OKLCH with chroma capped at **0.10** (L 0.70–0.74). `--accent-soft`
is an 8% tint. `--accent-glow` survives only as the focus ring: no other glow, coloured shadow or
gradient exists in the product, and the Horizon is the single permitted gradient. No raw hex lives
outside `tokens.css`.

## 3. Typography

Three roles, three faces. Type carries the personality — do not substitute defaults.

| Role | Face | Where |
|---|---|---|
| Display | **Bricolage Grotesque** (variable) | Community names, screen titles, onboarding headline, Social Card, empty states. Weight 600–700, tracking −1%. Used with restraint — it's the club's letterhead, not body text. |
| UI / Body | **Instrument Sans** (variable) | Everything else. |
| Data | **Geist Mono** | Franking hashes, safety numbers, invite codes, timers, latency. Mono = "this is cryptographic material." |

Scale (px): 12, 13, 14, 15, 17, 20, 24, 30, 38.
Chat body: 15/1.6 — Telegram's airiness. Channel & member lists: 13/1.4 — Discord's density. Both, deliberately.

## 4. Space, shape, elevation

- 4px grid. Component padding steps: 8 / 12 / 16 / 24.
- Radius: 6 (chips, inputs), 10 (cards, bubbles), 14 (modals), full (avatars, pills).
- Elevation by background step + hairline, **not** drop shadows. Modals get one soft shadow max (`0 16px 48px rgb(0 0 0 / .5)`).
- Desktop shell:

```
┌──┬───────────┬────────────────────────────────┬──────────┐
│  │ folders ▾ │ #ops · sealed · expires 24h    │ members/ │
│R │ ───────── │ ── presence thread (1px accent)│ thread/  │
│a │ chats or  │  message stream                │ profile  │
│i │ channels  │                                │ peek     │
│l │           │  [◔ ember][🕓][attach]  [send] │ (toggle) │
└──┴───────────┴────────────────────────────────┴──────────┘
 72px   264px              flex                    288px
```

- Mobile: bottom tabs `Chats · Spaces · ＋ · Vault · You`; conversations push full-screen; right panel becomes sheets.

### Atmospheres — per-space layout presets

| | **Hall** | **Studio** | **Salon** |
|---|---|---|---|
| Feels like | packed gaming hall | working studio | quiet reading room |
| Columns | rail + list + chat + right | rail + list + chat, right on demand | rail + chat only, centered 680px column |
| Channel nav | full sidebar, 13/1.4 | sidebar, 14/1.5 | compact dropdown in the header |
| Chat body | 15/1.6 | 15/1.6 | 16/1.7 |
| Chrome | full | standard | headers and controls fade to 40% until hover |

Set per space in fixtures. Entering a Salon space plays a "hush": chrome fades out, content fades
in (320ms; instant under reduced motion). Mobile keeps the same nav but inherits density and type.
Atmosphere expresses *what kind of room this is* — it never changes what features exist.

## 5. Iconography

`lucide-react`, 1.5px stroke, 16/20px. Custom micro-glyphs (inline SVG, build once in `components/trust` and `components/time`):
- **Seal** — sealed room (a small stamped-circle mark, neutral).
- **Ghost** — no-history channel (you only see messages from when you joined).
- **Hourglass** — temporary room with countdown.
- **Ember ring** — radial timer that depletes; the ephemerality mark used everywhere.
- **ZK check** — checkmark inside brackets `[✓]` for zero-knowledge proofs.

## 6. Motion

Durations: 120ms micro, 200ms standard, 320ms dissolve/overlay. Ease: `cubic-bezier(.2, 0, 0, 1)`.

- **Ember dissolve** (signature secondary motif): expiring message → blur 6px + fade + rise 4px + brief `--ember` edge glow (320ms), then height collapses (200ms). Used for expired messages, closed view-once media, burnt voice notes.
- **Mask switch**: accent variables crossfade 250ms; rail avatar does a small card flip.
- **Voice**: speaking = 2px accent ring pulse on avatar, subtle 3-bar waveform. No bouncing.
- **Message aging + the Horizon**: in rooms with retention, a message spends the last ~10% of its
  life "aged" — slightly reduced contrast, ember ring visible. Scrollback does not fade into
  infinite history: it ends at the **Horizon**, a soft ember-lit edge reading "Messages before
  this point have expired." Time is rendered as space; expiry is furniture, not a footnote.
- **Salon hush**: see Atmospheres in §4.
- `prefers-reduced-motion`: everything becomes opacity-only, instant height changes. Non-negotiable.

## 7. Component inventory (states that must exist)

**Primitives** — Button (solid accent / ghost / danger-breach), IconButton, Input, Chip, Toggle, Slider, Tabs, Tooltip, Popover, Modal, Toast, Kbd.

**Identity** — `MaskAvatar` (hue ring, presence dot honoring per-context invisibility), `MaskSwitcher` (stacked cards, Cmd+I), `IdentityChip` ("as **Aija** · cove").

**Trust** — `SealBadge` (sealed / relay-only / **unsealed→breach banner**), `ZkBadge` ("18+ · proven privately" with popover: "Verified cryptographically. No document, birthday, or identity was shared."), `FrankingHash` (mono, truncated, copy on click).

**Time** — `EmberRing` (depleting radial), `RetentionChip` ("24h" / "3 views" / "clears 04:00"), `UndoSendBar` (5s progress under a just-sent message, "Undo"), `Countdown` (temporary rooms), `Horizon` (the terminal edge of scrollback in retention rooms — soft ember gradient + one line of text-low copy).

**Messaging** — Bubble variants: plain · media · voice (scrub + burn-after-listen state) · view-once cover ("Tap to view — once") · hold-to-view (media only while pressed) · blurred preview ("Blurred until you open it") · translated (original collapses under "Translated from French — show original") · scheduled (dashed border + clock) · dissolving · expired tombstone ("Message expired · sealed by key rotation" in text-low). Watch-budget chip on video ("0:22 of 0:30 left"). No-download attachment ("View in app only").

**Voice** — `RoomTile` (occupant avatars spill out of the channel row), `OccupantPill`, `Waveform`, `RelayChip` ("via your relay" / "community relay"), `LatencyDot` (14ms, mono).

**Social** — `StoryRing` (conic gradient in author's mask hue), `StoryViewer`, profile bento blocks, `AuraMeter` (thin arc + 7/30/90 trend), `ReputationLaurel` (tier Local→Legend), `BadgeTile` (seasonal / secret / community), `SocialCard` (4 templates: Gaming, Professional, Creator, Anonymous — QR + PNG export).

**Files** — `TransferCard`: direct P2P (device→device icon, "encrypted, direct") · relay fallback ("via relay — peer offline") · paused/resumable · failed (breach). Progress in mono.

**Nav** — Rail (communities + home + vault + settings, active mask on top), `Murmur` (a faint 3px activity shimmer on space icons whose intensity maps to recent activity — replaces unread counts everywhere; aliveness without numbers, in line with fuzzed counts), `FolderTabs` (All · DMs · Spaces · Requests), `ChannelRow` (glyphs: seal, ghost, hourglass, retention chip), `CommandPalette` (Cmd+K: navigation + actions like "Switch mask", "New ephemeral room", "Open vault"), `MobileTabs`.

## 8. Voice & lexicon

Sentence case, active verbs, zero fear-mongering. The interface states facts.

| Say | Not |
|---|---|
| Sealed | Encrypted with MLS (except in detail tooltips) |
| Mask | Identity, persona, account |
| Expires 24h after sending | Self-destructs!! |
| Proven privately | Zero-knowledge proof (except tooltips) |
| Vault | Saved messages |
| This room isn't sealed. The host can read messages. | ⚠ DANGER: NO ENCRYPTION |
| ~1.2k members | 1,247 members (counts are fuzzed on purpose — say so in a tooltip) |

Errors explain and instruct, never apologize. Empty states are invitations with one action, set in Bricolage.

## 9. Accessibility floor

Contrast ≥ 4.5:1 body text. Focus visible everywhere (2px `--accent-glow` ring). Hit targets ≥ 44px
on mobile. Full keyboard path through palette, mask switcher, and composer. Reduced motion honored.
The `fog` mask must remain fully legible — muted, never broken.
