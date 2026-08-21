# ENCLAVE — Screens Spec

Build in the phase order from PROMPT.md §6. Every "must show" state below has to exist in fixtures
and be visible without dev tools.

## §0 · The demo world (fixtures)

**You** are one user with three masks:
- **Aija** · `@aija` · hue `cove` · gaming mask · presence: online
- **Nova** · `@nova.works` · hue `iris` · creator/work mask · presence: away
- **Courier-7** · `@courier7` · hue `fog` · anonymous mask · presence: invisible

**Communities** (rail order):
1. **LostEra** — gaming community, ~2.4k members, joined as **Aija**. Channels: `#announcements` (announce, scheduled post visible), `#general` (full history), `#raids` (retention 24h), `#trade` (retention 3 views/message), `#staff` (sealed + no-history, ghost glyph), `Lounge` (voice, persistent, 4 occupants live), `Raid Night` (voice, temporary, countdown 2h 14m). Atmosphere: **Hall**.
2. **Atelier Nord** — creator studio, ~340 members, joined as **Nova**. Channels: `#brief` (announce), `#design-crit` (full), `#scratchpad` (clears daily 04:00), `Standup` (voice, persistent, empty). Gate: invite. Atmosphere: **Studio**.
3. **The Reading Room** — anonymous book & privacy club, ~1.2k, joined as **Courier-7**. Everything sealed; gate chip: "Requires: proof of 18+ · proven privately". Channels: `#foyer` (from-join history), `#annotations` (retention 7d), `Fireside` (voice, relay: community). Atmosphere: **Salon** — the whole shell goes quiet here (design system §4).

**People** (8 masks across communities, distinct hues/avatars): Mira (rose), Konstantin (sky), Pixel (moss), Vex (saffron), Anselme (clay), Lark (iris), Ghostwriter (fog), Rho (cove). Give each 2–3 lines of believable message history; Mira is also a close friend with an active story and a DM thread.

**DMs / groups**: DM with Mira (translated messages: she writes French, you see inline translations); group "friday five" (11 members — proves >10 without a server); group "ops sync" (sealed, expires-on-leave note in header); a **message request** from `@stranger` (fog) gated by "Accept request to allow messages".

**Demo mode**: a toggle in the user menu. When on, `mock/activity.ts` drips fake events every 6–12s — a new message in LostEra `#raids`, an occupant joining `Lounge`, a story from Mira, an ember expiring somewhere visible. Everything the demo does must be reversible on toggle-off (reset fixtures).

---

## §1 · Onboarding (3 steps, route `/welcome`)

Purpose: prove "no phone number, no email" in ten seconds.
1. **Claim a handle** — single input + "generate another" dice; live availability check (mocked). Microcopy: "No phone. No email. Just a name you choose."
2. **Create your first mask** — pick avatar (8 presets), hue swatch row, optional bio. Preview card updates live and tints the screen as they pick the hue (first taste of the signature).
3. **Recovery kit** — mock download card with a 12-word phrase in Geist Mono, checkbox "I saved it somewhere safe", then "Enter Enclave" → lands in LostEra `#general`.
Must show: step progress, back nav, skip-to-demo link ("Just exploring? Enter the demo world").

## §2 · App shell & rail

Rail top→bottom: active `MaskAvatar` (opens switcher) · home (DMs) · community icons carrying **Murmur** (activity shimmer, never counts) · divider · discovery compass · vault · settings. Right panel toggles: members / thread / profile peek. Presence thread (1px accent line) always under the conversation header. Mobile: bottom tabs, rail collapses into "Spaces" tab.

## §3 · Chats home (`/chats`)

Telegram-style `FolderTabs`: **All · DMs · Spaces · Requests(1)**. Rows: mask-ring avatar, name, snippet, time; ember ring on rows with disappearing timers; seal glyph on sealed threads; muted rows dimmed with a small slash-bell. Requests tab shows the gated request card with Accept / Decline. Must show: pinned thread, typing indicator (demo mode), the >10-member group.

## §4 · Conversation (the flagship screen)

Header: `#raids · LostEra` + seal glyph + `RetentionChip 24h` + occupant/member count (fuzzed) + call button.
Stream must render, from fixtures, all of: plain · reply-with-quote · media grid · **blurred preview** ("Blurred until you open it") · **view-once** cover → opened → **expired tombstone** · **hold-to-view** image (press-and-hold interaction, releases → re-covers) · video with **watch-budget chip** ("0:22 of 0:30 left") · voice note with scrubber + **burn-after-listen** (plays once, then ember-dissolves) · **translated** message (Mira's French, "Translated — show original" expands) · **scheduled** message (dashed, clock, "Sends tomorrow 09:00") · a message currently in its **undo window** (UndoSendBar, 5s) · a live **ember dissolve** (demo mode triggers one) · attachment marked "View in app only".
Composer: attach (opens P2P-aware picker), ember picker (off / 30s / 1h / 24h / 7d / 3 views / custom), schedule, blur-toggle for media, mic. Send button is accent (wears the mask).
Unsealed variant: open `#general` in a mock "legacy bridge" state once via fixtures to show the `--breach` banner. Right panel: member list grouped by role, each row shows *that community's* mask only.
Retention rooms must also render **aging + the Horizon**: in `#raids`, messages near the end of their 24h life appear aged (reduced contrast, ember ring visible), and scrolling up ends at the Horizon edge — "Messages before this point have expired" — never infinite history.

## §5 · Community home & channel list

Community name in Bricolage + gate chip if any + "You're here as **Aija**" identity chip (tap → mask switcher scoped warning: "Changing your mask here starts a fresh, unlinked profile"). Channel rows with all glyphs (seal, ghost, hourglass, retention chips). Voice rooms show spilled occupant avatars + waveform when live. Temporary room shows countdown. `#announcements` shows a scheduled-post row visible to staff. Moving between spaces applies their atmosphere: entering The Reading Room flips the shell into **Salon** — the layout itself signals a different kind of room.

## §6 · Voice room (`Lounge` live)

Grid of `OccupantPill`s (speaking ring pulse, muted slash). Top bar: room name · `SealBadge` · `RelayChip "via community relay"` · `LatencyDot 14ms` (mono). Bottom controls: mute, deafen, screen (toast: later phase), leave. Side sheet: "Room details" — E2EE state, relay route diagram (three nodes: you → relay → peers, one line), "IPs are not shared between participants." Ephemeral variant (`Raid Night`): countdown in header + "Room closes when everyone leaves."

## §7 · Mask switcher (Cmd+I / avatar tap)

Stacked cards, one per mask: avatar, handle, hue, presence selector *per mask* (online / away / invisible), "3 spaces use this mask". Switching triggers the 250ms UI re-tint. Footer: "New mask" + note: "Masks are unlinkable. Spaces can't tell they share an owner."

## §8 · Profile (`/you`, and peek panel for others)

Bento grid blocks: About · Badges (seasonal/secret/community) · Now playing (mock) · Projects · Public spaces (only ones marked public) · Links · **Aura** arc with 7/30/90 trend + peak day · **Reputation** laurel (tier: Respected) + points. Header: display name in Bricolage, handle, `ZkBadge` row ("18+ · proven privately", "LostEra veteran · proven privately"). **Edit mode**: blocks get drag handles + visibility toggles per block (illusion is fine: reorder within a column). The edit header carries the **Audience lens** — "View as: Stranger / Contact / LostEra member" — and the page live-reforms into exactly what that audience sees: blocks vanish, the handle swaps to the mask that context knows, stats respect opt-in. **Opt-out state**: a visible master toggle "Social stats: on" — when off, Aura/Reputation blocks collapse to "Stats are off. Only you can turn them on."
**Social Card modal**: 4 templates (Gaming / Professional / Creator / Anonymous), live preview with avatar, handle, status, top badges, QR (any QR lib or mock SVG), tier — "Export PNG" via html-to-image. Anonymous template uses fog hue and hides the handle behind "Scan to connect".

## §9 · Stories

Ring row atop Chats home (mask-hue conic rings). Composer: text/photo/voice + **audience chip** ("Close friends · as Aija" — options scoped to masks, communities, roles) + expiry (24h / 3 views / view-once). Viewer: tap-through, progress segments, reply → DM, "Seen by ~12" (fuzzed). Must show one view-once story that tombstones after viewing.

## §10 · Vault (`/vault`)

Tabs: **Notes · Saved · Files · Links · Clipboard**. Notes: simple editor card. Saved: messages saved from chats with jump-back link. Files: grid with size + "encrypted at rest" footer hairline. Links: read-later rows with favicon. Clipboard: last 5 clips with device chips ("Pixel 10 Pro", "ThinkPad", "Desktop") + "synced 2m ago". Header: "Only you can open this. Sealed with your keys."

## §11 · Settings suite (`/settings/*`)

Left nav: Masks · Privacy · Notifications · Data & expiry · Security · Appearance · Language.
- **Privacy**: visibility matrix — rows (Spaces list, Mutual friends, Join date, Friend list, Last seen) × columns (Everyone / Contacts / Nobody) as segmented controls. "Require request before DMs" toggle.
- **Notifications**: per-space rule cards (LostEra: mentions only ✓, mute @everyone ✓, quiet hours 23:00–08:00 slider, daily digest 09:00) + per-contact priority ("Mira can always reach you") + global quiet hours.
- **Data & expiry**: default ember per context (DMs: off, Groups: 7d, New spaces: follow space rule) + "Sweep my history" card — pick scope + age → confirm modal: "Deletes your messages everywhere it's allowed. Others' copies of sealed rooms expire by key rotation." (mock progress).
- **Security**: sessions list (device, mono fingerprint, revoke) · **Duress mode** setup: explainer card ("Entering your duress password opens a clean decoy account. Your real masks stay hidden."), two password fields (mock), test button, `--breach`-bordered confirm. · "Panic hide" gesture toggle.
- **Appearance**: density (Cozy/Compact), mask-hue preview, reduced motion override.
- **Language**: auto-translate rules ("Translate French → English automatically in DMs", per-space overrides).

## §12 · Moderation

**Report flow** (from message ⋯ menu): Step 1 pick messages (multi-select in-stream) → Step 2 "What mods will see": exact selected messages + `FrankingHash` per message + copy "Each message carries a cryptographic proof it's authentic and unaltered. Mods see only what you selected." → Step 3 reason + submit → toast "Report sent with proof".
**Mod queue** (visible when acting as staff in LostEra): cards with reported excerpt, proof-verified chip (mono hash), actions (dismiss / warn / remove). Header stat: "0 reports opened without proof."

## §13 · P2P transfer

In any conversation, a large attachment renders `TransferCard`: state A **direct** ("Device → device · encrypted · 84 MB/s") · state B **relay fallback** ("Peer offline — handing to relay, resumes automatically") · paused/resume · failed (breach, "Retry"). Progress bar + mono throughput. Tooltip: "Large files travel directly between devices when possible. Relays never see contents."

## §14 · Discovery (`/discover`)

Search + category chips. Space cards: icon, name (Bricolage), one-liner, fuzzed size, gate chips ("Requires: proof of 18+ · proven privately", "Invite only"), preview button → read-only peek sheet ("You're previewing as no one — join to pick a mask"). Must show at least 6 cards including one sealed-everything space.

## §15 · Command palette (Cmd+K)

Sections: Jump to (threads/spaces/channels) · Actions ("Switch mask →", "New ephemeral room", "Start sealed group", "Open vault", "Toggle demo mode") · recent. Full keyboard nav, results honor current mask context.

## §16 · System states

- Global empty states (no DMs yet, empty vault tab, empty mod queue) — one Bricolage line + one action each.
- Toast styles: neutral, accent (success inherits mask hue), breach.
- "Coming later" toast for out-of-scope buttons (screen share, marketplace).
- 404 route: "This room doesn't exist — or you're wearing the wrong mask." + Go home.

---

### Screenshot manifest (final deliverable, both 1440 & 390)
Onboarding step 2 · Chats home (All) · Conversation `#raids` with the Horizon visible · Unsealed banner state ·
Reading Room `#foyer` in Salon atmosphere · Community home LostEra · Voice `Lounge` · Mask switcher open · Profile with audience lens + Social Card modal ·
Stories viewer · Vault Clipboard · Settings Duress · Report step 2 · TransferCard relay state ·
Discovery · Palette open.
