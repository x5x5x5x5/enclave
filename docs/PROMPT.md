# ENCLAVE — UI Prototype Build Brief

> Paste this file as the opening instruction to Claude Code. The repo must also contain
> `docs/DESIGN_SYSTEM.md` and `docs/SCREENS_SPEC.md` — read both **fully** before writing any code.
> "Enclave" is a working codename. Keep it in a single constant (`src/config/brand.ts`) so it can be renamed in one edit.

---

## 1. Mission

Build a **front-end-only, clickable product prototype** of Enclave: a community platform that merges
Discord's communities and persistent voice, Signal's privacy posture, Telegram's flexibility, and a
social/profile layer inspired by GitHub, Instagram and Habbo.

There is **no backend**. Everything renders from local mock fixtures. The prototype must be good
enough that a screenshot of any screen could ship on a landing page, and an investor could click
through it for five minutes without hitting a dead end.

The product's core thesis, which the UI must communicate on every screen:

1. **Contextual identity** — one account, many "masks." You are a different person in each community, unlinkably.
2. **Sealed by default** — end-to-end encryption is the quiet norm; its *absence* is what gets loud UI.
3. **Data with a lifespan** — messages, rooms, and media expire by design, and the UI makes expiry legible and calm.
4. **Reputation without surveillance** — visibility (Aura) and trust (Reputation) are opt-in, and proofs are zero-knowledge.

## 2. Non-negotiables

- UI only. No network calls, no real crypto, no auth. Simulate everything with fixtures, timers, and state.
- `docs/DESIGN_SYSTEM.md` is law. Where a detail is missing, decide *in its spirit* and log the decision in `NOTES.md`.
- `docs/SCREENS_SPEC.md` defines scope. Build phases in order. Do not skip ahead.
- Every interactive element works or visibly explains itself. No dead buttons — if something is out of scope, it opens a small "Coming in a later phase" toast, styled per the design system.
- Desktop-first (1440), fully usable at 390 wide. Both are acceptance criteria, not afterthoughts.
- Keep a `NOTES.md` design journal: decisions made, deviations, things to revisit. Append as you go.

## 3. Stack

```
Vite + React 18 + TypeScript (strict)
Tailwind CSS v4 (@tailwindcss/vite, CSS-first @theme tokens)
framer-motion            # motion
zustand                  # app state (active mask, nav, demo mode)
react-router-dom         # routes
lucide-react             # icons
@fontsource-variable/bricolage-grotesque
@fontsource-variable/instrument-sans
@fontsource/geist-mono
html-to-image            # Social Card PNG export
```

If a package is unavailable, choose the closest equivalent and record it in `NOTES.md`.
localStorage is allowed (persist active mask + theme density via zustand middleware).

## 4. Repo structure

```
src/
  config/brand.ts          # codename, tagline
  styles/tokens.css        # ALL design tokens as CSS variables (see design system)
  mock/                    # world.ts, masks.ts, communities.ts, messages.ts, stories.ts, vault.ts, activity.ts
  state/                   # zustand stores
  components/
    primitives/            # Button, Input, Chip, Modal, Toast, Tabs, Kbd...
    identity/              # MaskAvatar, MaskSwitcher, IdentityChip
    trust/                 # SealBadge, ZkBadge, FrankingHash
    time/                  # EmberRing, RetentionChip, UndoSendBar, Countdown
    messaging/             # Bubble + all variants, Composer, TranslateStack
    voice/                 # RoomTile, OccupantPill, Waveform, RelayChip
    social/                # StoryRing, StoryViewer, ProfileBlocks, AuraMeter, ReputationLaurel, SocialCard
    files/                 # TransferCard
    nav/                   # Rail, FolderTabs, ChannelRow, CommandPalette, MobileTabs
  screens/                 # one folder per screen from SCREENS_SPEC
  App.tsx / router
NOTES.md
```

## 5. Mock data contracts

Implement these in `src/mock/types.ts` (extend freely, never simplify away a state the spec needs):

```ts
type Hue = 'cove'|'iris'|'saffron'|'rose'|'moss'|'sky'|'clay'|'fog';

interface Mask {
  id: string; handle: string; displayName: string; avatar: string;
  hue: Hue; bio?: string; presence: 'online'|'away'|'invisible';
}
interface User { id: string; masks: Mask[]; activeMaskId: string; }

interface Community {
  id: string; name: string; icon: string; sealed: boolean;
  gate?: { kind: 'zk-age'|'zk-owner'|'invite'; label: string };   // e.g. "Requires: proof of 18+ (zero-knowledge)"
  usingMaskId: string;                                            // which mask this community sees
  memberEstimate: string;                                         // fuzzed on purpose: "~1.2k"
  channels: Channel[];
}

type Retention =
  | { mode: 'timer'; seconds: number }
  | { mode: 'views'; count: number }
  | { mode: 'daily'; at: string };          // "04:00"

interface Channel {
  id: string; communityId: string; name: string; topic?: string;
  kind: 'text'|'voice'|'announce';
  sealed: boolean;
  history: 'full'|'from-join'|'none';
  retention?: Retention;
  temporary?: { expiresAt: string };        // room self-destructs
}

interface Message {
  id: string; channelId: string; authorMaskId: string; ts: string;
  body?: string; media?: Media[];
  state: 'scheduled'|'sending'|'sent'|'dissolving'|'expired';
  undoUntil?: string;                       // undo-send window
  ephemeral?: { expiresAt?: string; viewsLeft?: number };
  viewOnce?: boolean; holdToView?: boolean; watchBudgetSec?: number;
  translated?: { fromLang: string; body: string };
  scheduledFor?: string;
  frankingTag: string;                      // short mono hash, always present
  replyToId?: string;
}

interface Media {
  kind: 'image'|'video'|'voice'|'file';
  name: string; size: string;
  blurredPreview?: boolean; noDownload?: boolean; burnAfterListen?: boolean;
  p2p?: { route: 'direct'|'relay'; progress: number; resumable: boolean; state: 'sending'|'paused'|'done'|'failed' };
}

interface VoiceRoomLive {
  channelId: string; e2ee: true;
  relay: 'self-hosted'|'community'; latencyMs: number;
  occupants: { maskId: string; speaking: boolean; muted: boolean }[];
}

interface Story {
  id: string; authorMaskId: string; kind: 'text'|'image'|'video'|'voice';
  postedAt: string; expiresAt: string;
  audience: { label: string };              // "Close friends · Cove mask"
  viewOnce?: boolean;
}

interface VaultItem { id: string; kind: 'note'|'saved'|'file'|'link'|'clip'; title: string; preview: string; ts: string; device?: string; }

interface SocialStats {
  optedIn: boolean;
  aura: { score: number; trend7: number; trend30: number; trend90: number; peakDay: string };
  reputation: { tier: 'Local'|'Known'|'Respected'|'Renowned'|'Legend'; points: number; badges: { id: string; name: string; kind: 'seasonal'|'secret'|'community' }[] };
}

interface NotifRule {
  scopeLabel: string; mentionsOnly: boolean; muteEveryone: boolean;
  quietHours?: { from: string; to: string }; digestAt?: string; priority: boolean;
}
```

The demo world (people, communities, message history) is defined in `docs/SCREENS_SPEC.md §0`. Build it exactly — coherent fixtures are what make the prototype feel real.

## 6. Build order (phase gates)

Work phase by phase. **A phase is done when its checklist passes; commit with the phase name, then continue.**

**P0 — Foundation**
- Scaffold, fonts, `tokens.css` with every token from the design system.
- Mask-tinting mechanism working: switching active mask swaps `--accent` and re-tints the whole UI.
- App shell (rail / list / main / right panel) responsive; mobile bottom tabs.
- `/playground` route rendering every primitive in every state (your visual regression page).
- ✔ Gate: typecheck + lint + build clean; playground screenshot at 1440 and 390.

**P1 — Conversation core**
- Chat list with Telegram-style folder tabs; channel list with all glyph states.
- Conversation screen rendering **every** message state in the spec from fixtures.
- Composer: ember picker, schedule, undo-send bar, blurred-attach toggle.
- Horizon + message aging in retention rooms (`#raids` is the reference).
- Mask switcher (Cmd+I) + command palette (Cmd+K).
- ✔ Gate: all Message fixture states visibly distinct; keyboard nav through palette.

**P2 — Presence & social**
- Community home, voice room UI (occupants, waveform, relay chip, ephemeral room countdown).
- **Atmospheres**: Hall / Studio / Salon shell presets applied per space, with the Salon hush transition.
- Profile bento + edit mode illusion + **audience lens** (View as) + Social Card modal with PNG export (4 templates).
- Stories rail + viewer.
- ✔ Gate: voice room believable in a screenshot; Social Card exports a real PNG; switching LostEra → Reading Room visibly reshapes the shell.

**P3 — Sovereignty**
- Vault (5 tabs). Settings suite: privacy matrix, notification rules, retention defaults, **duress mode** setup, sessions.
- Moderation: report flow with franking proof step + mod queue view.
- P2P TransferCard all states. Discovery. Onboarding (3 steps). Demo mode (fake live activity from `mock/activity.ts`).
- ✔ Gate: five-minute click-through with zero dead ends; final screenshot set of every screen, both widths.

## 7. Self-verification loop

After each phase: `npm run typecheck && npm run lint && npm run build`. Then review your own output
against the design system's anti-goals — if any screen would pass for a Discord clone or a generic
AI-generated dashboard, fix it before moving on. Check reduced-motion (emulate
`prefers-reduced-motion`) and keyboard focus visibility. Log every notable decision in `NOTES.md`.

## 8. Copy voice

Sentence case. Active verbs. Name things by what the user controls ("masks", "sealed rooms",
"expires"), never by mechanism ("MLS group state", "key rotation") except inside deliberate detail
tooltips. Encryption is stated as fact, not marketing. Absence of protection is the only thing that
gets alarm styling. Full lexicon in the design system §8.

## 9. Do not

- Do not add a backend, service worker, or real crypto.
- Do not use Discord blurple, Telegram blue, or Signal blue as the accent.
- Do not leave any route unreachable from the UI.
- Do not simplify fixture states because they're hard to render — the hard states *are* the product.
