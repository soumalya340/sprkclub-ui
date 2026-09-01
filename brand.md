# Brand — Sprkclub

_Status: active_
_Established: 2026-09-01_

Sprkclub is a DAO + NFT club where people fund each other's work. The brand is
**warm monochrome** — parchment, clay, and ink — with a single terracotta accent.
It should feel like a printed field journal or a letterpress notice board, not a
crypto dashboard.

The palette is derived from the hero background video, so the page canvas and the
footage share one continuous surface with no visible seam.

---

## Palette

All values are the source of truth. Every color in the app resolves to one of these
via a CSS variable — no raw hex in components.

| Token | Hex | OKLCH | Role |
| :--- | :--- | :--- | :--- |
| `parchment` | `#faf7f0` | `oklch(0.9727 0.0095 85)` | Page canvas. Matches the hero video's paper ground. |
| `parchment-deep` | `#f4efe4` | `oklch(0.9513 0.0163 85)` | Recessed bands, alternating sections, glass card interior. |
| `card` | `#fffdf9` | `oklch(0.9908 0.0055 85)` | Raised surfaces — cards, popovers, dialogs. |
| `ink` | `#1a1a1a` | `oklch(0.2418 0 0)` | Primary text, primary buttons. |
| `ink-soft` | `#6e6a63` | `oklch(0.5257 0.0119 81.78)` | Secondary text, captions, muted labels. Warm grey, not neutral — measured to clear AA on both grounds. |
| `clay` | `#905831` | `oklch(0.5152 0.0929 55)` | **Accent.** Links, focus rings, active states, the prompt text. |
| `clay-tint` | `#bb9175` | `oklch(0.6802 0.0555 47)` | Hover washes, subtle accent fills, progress tracks. |
| `line` | `#e2dbcc` | `oklch(0.8905 0.0155 85)` | Hairlines, dividers, card borders. |

Semantic states keep their conventional hues but are pulled toward the warm ground:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `success` | `#5f7355` | Passed votes, cleared milestones, funded. |
| `warn` | `#96682f` | Pending, dispute window open. |
| `danger` | `#8c3a2e` | Rejected, failed, disputed. |

**Rule:** clay is the only saturated color that appears at rest. Success/warn/danger
appear only when reporting real state. If a screen has more than one clay element
competing for attention, one of them is decoration — cut it.

## Typography

| Role | Family | Usage |
| :--- | :--- | :--- |
| Wordmark | **Special Elite** | The `sprkclub` logotype only. Never body copy, never headings. |
| UI + headings | **Geist** | Everything. 400 body, 500 UI labels, 600 headings. |
| Numerals + hashes | **IBM Plex Mono** | Token amounts, addresses, tx hashes, step numbers, dates. Always `tabular-nums`. |

Headline scale is `clamp(40px, 6vw, 68px)` at `leading-[1.05]` / `tracking-[-0.04em]`.
Section headings are `text-3xl sm:text-4xl` at `tracking-tight`. Body is `text-base`
at `leading-relaxed`.

Uppercase + `tracking-[0.04em]` is reserved for nav links and small metadata labels
(`PROPOSALS`, `OFF-CHAIN`, `RAISED`). Never uppercase a sentence.

## Shape and depth

- Radius: `44px` for the hero glass card and pill buttons, `--radius: 0.625rem`
  (10px) for cards and inputs, `full` for chips and status dots.
- Elevation is carried by a hairline `line` border plus a near-invisible shadow,
  never by heavy drop shadows. The one exception is the hero glass card, which uses
  a 3px white border and `backdrop-blur-[20px]`.
- Dashed hairlines (`border-*-dashed-*` utilities) mark **structural** divisions —
  the stage pipeline, stat groups. Solid lines mark ordinary containment.

## Motion

- Micro-interactions: 150ms, `ease-out`. Buttons get `active:scale-95`, links get
  `hover:opacity-55`.
- Entrances: 500ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` (the `hero-entrance` spring).
- Everything non-essential is wrapped in `prefers-reduced-motion: no-preference`.
- Never animate `all`. Name the properties.

## Voice

Plain, declarative, slightly wry. The club is a group of people, not a protocol.

- Say **"the club votes"**, not "governance participants cast ballots."
- Say **"stake 20% to launch"**, not "collateralization requirement."
- Buttons name their outcome: `Create a proposal`, `Back this`, `Submit proof`.
  The toast that follows uses the same verb: "Proposal created."
- Empty states invite the next action: "No proposals on the floor yet. Start one."
- Errors say what happened and what to do: "Upload failed — the file must be under
  8MB. Try a smaller image."

Never: "seamless", "revolutionary", "empower", "leverage", em-dash-free marketing
filler, or exclamation marks.
