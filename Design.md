# Design System — Sprkclub

Structural spec: layout, components, and interaction patterns.
Color, typography, and voice live in [`brand.md`](./brand.md) — that file wins on
any color or wording question.

---

## 1. The one-surface principle

The hero's background video and the page below it are **one continuous parchment
surface**. This is the single most important rule in this document, and the thing
most likely to be broken by a careless edit.

- The page canvas (`--background`) is set to the video's own paper tone.
- The hero fades the video into that canvas with a top white-to-transparent
  gradient and a bottom parchment-to-transparent gradient.
- Sections below the hero alternate between `parchment` and `parchment-deep`.
  They never introduce a third ground color.

If a section boundary is visible as a hard line where two different whites meet,
that is a bug.

## 2. Global layout

- **One navigation bar**, rendered by `AppShell` → `Nav`, sticky at `top-0 z-40`.
  The homepage hero does **not** render its own nav. Two navs is a bug.
- Content width: `max-w-6xl` (1152px) with `px-4 sm:px-6`. The hero alone may use
  `max-w-[1360px]` since it is full-bleed.
- Vertical rhythm: sections are `py-16`; the space between a heading and its body
  is `mt-2`; between a heading block and its content grid, `mt-8`/`mt-10`.

```
┌────────────────────────────────────────────────────┐
│ Nav — sticky, transparent → blurred on scroll      │
├────────────────────────────────────────────────────┤
│ Hero — full-bleed video, gradient-faded top+bottom │
│   headline · subhead · glass prompt card           │
├────────────────────────────────────────────────────┤
│ Stats — 3-up, dashed top rule, mono numerals       │
├────────────────────────────────────────────────────┤
│ On the floor — proposal card grid                  │
├────────────────────────────────────────────────────┤
│ How it works — 4-stage dashed pipeline             │
├────────────────────────────────────────────────────┤
│ Footer                                             │
└────────────────────────────────────────────────────┘
```

## 3. Navigation

Single `<header>`, sticky, `border-b`:

- **At rest:** `border-line/60`, transparent background — the hero shows through.
- **Scrolled (`scrollY > 0`):** `border-line`, `bg-background/70 backdrop-blur-sm`.
- Transition `colors` at 200ms. The border is always visible; only its weight and
  the backdrop change.

Nav links are uppercase, `text-[15px]`, `tracking-[0.04em]`, `text-ink` at
`hover:opacity-55`. The wallet chip and the primary CTA sit together on the right.

## 4. The hero

Full-viewport (`min-h-svh`), three stacked layers:

| z | Layer | Purpose |
| :-- | :--- | :--- |
| 0 | `<video>` autoplay/muted/loop/playsInline, `object-cover` | Ambient motion |
| 1 | Top gradient `rgba(255,255,255,1) → transparent`, h-[687px] | Nav + headline legibility |
| 1 | Bottom gradient `transparent → parchment`, h-[240px] | Dissolves video into the page |
| 2 | Content | Headline, subhead, glass card |

**Glass prompt card** — the signature element, and the only place heavy blur is used:

- `w-[701px]`, `min-h-[208px]`, `rounded-[44px]`
- `border-[3px] border-white`, `bg-white/[0.06]`, `backdrop-blur-[20px]`
- `shadow-[0_0_4px_0_rgba(0,0,0,0.15)]`
- Contains: a `<textarea>` in clay, an upload button (44px circle, top-left of the
  lower band), and the primary CTA (`h-14 w-[156px]`, black pill, bottom-right).
- Submitting routes to `/launch?description=…`, prefilling the real proposal form.

Below `md`, the card becomes `w-[calc(100vw-48px)]` and its controls stack into
normal flow rather than absolute positioning.

## 5. Components

### Proposal card
Image (3:2, `object-cover`, subtle zoom on hover) over a body with status +
type chips, title, 2-line description clamp, then a footer row with the funded
percentage in mono and a progress bar. The whole card is one `<a>`.

### Status chips
Pill, `text-xs`, `font-medium`. Map proposal status → semantic token:
`voting` muted · `passed`/`active` success · `crowdfunding` outline ·
`rejected`/`failed`/`disputed` danger · `completed` solid ink.

### Location tags
`OFF-CHAIN` / `ON-CHAIN`, `text-[10px]` uppercase, `bg-clay-tint/15`,
`text-clay`. Used only where the distinction is factually true — the stage
pipeline and milestone panels.

### Stage pipeline ("How it works")
Four cells in a `border-all-dashed-medium` frame, divided by dashed rules, each
carrying a mono step number, a location tag, a title, and one sentence. A chevron
sits on each internal boundary at `lg`. The dashes encode that this is a
*sequence*, not four unrelated features.

### Stats row
Three columns above a dashed top rule. Label is uppercase `text-xs` in `ink-soft`;
value is `text-3xl tabular-nums`. Units are a smaller span, never the same size as
the number.

## 6. States (required on every data surface)

- **Loading** — skeletons matching the final layout's dimensions. Never a bare
  spinner where a list will appear.
- **Empty** — one line of plain copy plus the action that fixes it.
- **Error** — what failed and the recovery action.

## 7. Accessibility floor

- Real `<button>` / `<a>`; never `<div onClick>`.
- Visible focus ring on everything focusable: `focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2`.
- Hit targets ≥ 40×40px.
- Body text ≥ 4.5:1 against its ground; large text and meaningful icons ≥ 3:1.
  `ink-soft` (`#6e6a63`) is the lightest text permitted: 5.03:1 on `parchment`,
  4.69:1 on `parchment-deep`. The spec's original `#767676` was measured at
  3.96:1 on `parchment-deep` and rejected.
- Every animation sits behind `prefers-reduced-motion: no-preference`.
- Images carry `alt`; decorative icons carry `aria-hidden`.
