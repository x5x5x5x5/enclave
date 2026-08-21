# Enclave

A front-end-only, clickable prototype of a community platform built on four ideas:

1. **Contextual identity** — one account, many masks. You are a different person in each community,
   unlinkably, and the interface takes the shape of whoever you are right now.
2. **Sealed by default** — end-to-end encryption is the quiet norm. Its *absence* is the only thing
   that gets loud UI.
3. **Data with a lifespan** — messages, rooms and media expire by design, and expiry is furniture
   rather than a footnote.
4. **Reputation without surveillance** — visibility and trust are opt-in, proofs are zero-knowledge,
   and counts are fuzzed on purpose.

There is no backend, no network, no real crypto. Everything renders from fixtures in `src/mock`,
driven by timers and local state.

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run typecheck` | Types only |
| `npm run lint` | ESLint |
| `npm run shoot` | Re-captures `docs/screenshots` at 1440 and 390 (needs `npm run dev` running) |

## Where to look first

- `/playground` — every primitive in every state, with a mask switcher at the top. Switch masks and
  watch the whole page change allegiance; that is the signature.
- `/space/c-lostera/ch-raids` — the reference room: aging messages, the Horizon, and every message
  state the spec names.
- `/space/c-reading/ch-foyer` — the same product wearing a different atmosphere. No channel column,
  quieter chrome, a wider measure, and a grey accent because you are anonymous here.
- **Cmd/Ctrl K** anywhere for the command palette, **Cmd/Ctrl I** for the mask switcher.
- The **user menu** on Chats (⋯) turns on **demo mode**, which drips live activity every few
  seconds and puts everything back when you turn it off.

## Layout

```
docs/                DESIGN_SYSTEM.md, SCREENS_SPEC.md, PROMPT.md, screenshots/
scripts/shoot.mjs    screenshot capture
src/
  config/brand.ts    the codename lives here and nowhere else
  styles/tokens.css  every design token
  lib/               time, hashing, the mask crossfade
  mock/              the demo world
  state/             zustand stores (app, ui, world)
  components/        primitives · identity · trust · time · messaging · voice · social · files · nav · shell
  screens/           one folder per screen
NOTES.md             design journal: decisions, deviations, things found
```

`NOTES.md` is the honest record of what was decided and why, including the two defects found by
auditing the running app rather than reading the source.
