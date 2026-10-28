# [PRODUCT NAME] — Prototype

> A React Native prototype built by the product team. It is **not** production code, but it
> is intended to **seed** the production app — the visual layer, screen structure, and
> component library should carry over with minor changes. The rules below exist to keep
> that gap small. Follow them exactly; they are cheap now and very expensive to retrofit.

## The one principle behind everything

**Anything a prototype hardcodes, production has to rip out.** Copy, colors, and data are
the three things that always change between prototype and launch — so none of them may be
baked into a component. If you internalize only one section of this file, make it
"Hard rules" below.

## Stack

<!-- Fill these in for your product; keep the structure. -->

| Layer | Choice |
|---|---|
| Language | TypeScript, **strict mode** — no `any` without a justification comment |
| Framework | **Expo** (managed workflow) + **Expo Router** for file-based navigation |
| Styling | **NativeWind** (Tailwind for RN), driven by semantic tokens (see Hard rule 2) |
| i18n | `react-i18next` + `expo-localization` — all copy externalised from day one |
| Icons | `lucide-react-native` — one icon library, no emoji as icons |
| Data | Mock fixtures behind **typed API contracts** (see Hard rule 3) |
| Storage | `expo-secure-store` / `AsyncStorage`, always behind an adapter (see Hard rule 4) |

Target both iOS and Android from the start. Never assume one platform's behavior —
if something is platform-specific, branch on `Platform.OS` explicitly rather than
letting the other platform break silently.

## Hard rules — these are what make the prototype reusable

Violating one of these is a bug, not a style preference. Claude: enforce these even when
a request would be faster to satisfy by breaking them — flag the conflict instead.

1. **No hardcoded user-facing strings.** Every string a user sees — labels, buttons,
   headings, error messages, empty states — lives in the translation file
   (`src/i18n/en.json`) and is referenced by key. No bare text inside `<Text>`: it
   renders `t('checkout.submitButton')`, never `"Submit"`. Keys are named by **role**,
   never by their English text. Before adding a key, search the file and reuse an
   existing one rather than creating a near-duplicate. This holds even though the
   prototype is English-only: it means launch copy, legal review edits, and future
   languages are a one-file change.

2. **No hardcoded colors or style values.** No raw hex or `rgb()` anywhere except the
   token file. React Native has no CSS custom properties, so the chain is:
   **`src/theme/tokens.ts` → NativeWind config reads that file → semantic class names in
   components** (`bg-surface`, `text-fg-muted`, `border-brand`). Tokens are named by
   **role** (`brand`, `surface`, `fg-muted`, `positive`, `warning`), **never by value**
   (`blue`, `gold`). One consequence to protect: the entire app can be re-themed for a
   stakeholder review — or restyled to the final brand — by editing `tokens.ts` alone,
   with zero component edits. A literal color in a `StyleSheet.create` block or an
   inline `style={{ }}` prop breaks that, so treat it as a blocker.

3. **No hardcoded backend data — write the contract instead.** Anything that will
   eventually come from an API gets a **typed contract** (request + response interfaces
   in `src/contracts/`) and a data-access hook or service module that components call.
   For now the implementation returns fixtures from `src/mocks/`, shaped exactly like
   the contract. When the real backend exists, engineers swap the implementation behind
   the contract and **no component changes**. Never inline sample data into a screen —
   that's how prototype screens become unshippable.

4. **Keep logic out of components, and platform APIs out of logic.** Domain types,
   validation, formatting, calculations, and state rules live in plain TypeScript
   modules (`src/lib/`) that import **nothing** from `react-native`, `expo-*`, or the
   router. Components render; they don't compute. Device concerns — storage, camera,
   notifications, network state — are reached through thin adapters, never called
   directly from logic. Two payoffs: that logic is testable in plain Node without a
   simulator, and it survives intact if the UI layer is rebuilt or a web surface is
   added later.

5. **Accessibility basics from the start.** Every tappable element is a `Pressable` (or
   `Button`) with an `accessibilityRole` and an `accessibilityLabel` when its purpose
   isn't obvious from its text. Touch targets ≥ 44×44pt — use `hitSlop` rather than
   padding when the visual needs to stay small. Respect OS font scaling (don't set
   `allowFontScaling={false}`, don't use fixed heights on text containers). Text
   contrast meets WCAG AA. All nearly free when built in, a full sweep when retrofitted.

6. **Mark every deliberate shortcut with `// PROTO:`.** Skipped error handling, faked
   auth, a stubbed permission check — fine in a prototype, but each one gets a
   `// PROTO: <what's fake and what real needs>` comment at the exact line. Production
   migration then starts with `grep -r "PROTO:"` instead of archaeology.

## Explicitly relaxed — this is still a prototype

Don't let the rules above make the team over-engineer. The following are **not**
required here, even where production would demand them:

- **No tests, no coverage gates.** (Exception: if a `src/lib/` module implements real
  business rules — pricing, eligibility, scoring — a few unit tests are worth it,
  because that module ships to production as-is and runs without a simulator.)
- **Happy-path only is fine.** Error states, loading states, offline behavior, and edge
  cases can be skipped or faked — with a `// PROTO:` marker.
- **No real auth, payments, push, or persistence.** Fake them behind the data layer
  (rule 3) or an adapter (rule 4), never inside components.
- **Expo Go is enough.** Don't spend time on native modules, custom dev clients, EAS
  builds, or app-store config unless a specific demo needs it.
- **Screens and navigation may churn freely.** Don't preserve anything for
  compatibility; nothing depends on this yet.
- **No branch/PR ceremony required** beyond whatever keeps the team unblocked.

## Project structure

```
src/
  app/          # Expo Router screens — thin: compose components, resolve i18n keys
  components/   # Presentation only: props in, JSX out. No fetching, no business logic.
  contracts/    # Typed API request/response interfaces (the future backend's spec)
  mocks/        # Fixtures implementing the contracts; the fake "backend"
  lib/          # Framework-free logic: types, validation, formatting, calculations
  adapters/     # Thin wrappers over device APIs (storage, camera, notifications)
  i18n/         # en.json — every user-facing string
  theme/        # tokens.ts — the semantic design tokens (the only place colors exist)
```

A component that needs data receives it via props or calls a hook from the data layer —
it never imports from `mocks/` directly and never calls `fetch` itself.

## How to work with Claude on this repo

- **Describe the screen or behavior you want; let Claude propose the approach before it
  writes code** for anything non-trivial. If your request is ambiguous, Claude should
  ask rather than guess.
- **One coherent change at a time.** "Build the pricing screen" is one change; "build
  the pricing screen and also restyle the tab bar and rename the product" is three.
- **Ask Claude to state what could break** after each change, and to confirm the screen
  renders on both iOS and Android rather than just claiming it works.
- If Claude reports that a request conflicts with a Hard rule (e.g. "just hardcode the
  text for now"), the rule wins — the compliant version costs minutes now and saves
  days later. If you believe a rule is genuinely wrong for this product, change this
  file, don't bypass it silently.
- **When you correct Claude and the correction should stick, add it to this file.**
  This document is the team's shared memory; it only works if it's kept current.

## Definition of "carries over"

Before calling a screen done, these checks should pass (Claude can run them):

```bash
grep -rEn "#[0-9a-fA-F]{3,8}|rgba?\(" src/app src/components   # raw colors outside theme/
grep -rn "fetch(" src/components                                # fetching in components
grep -rEn "from '(react-native|expo-)" src/lib                  # platform APIs in logic
grep -rn "PROTO:" src                                           # every shortcut marked
```

The first three returning nothing, and every deliberate shortcut appearing in the
fourth, is what "production-ready enough" means for this prototype.
