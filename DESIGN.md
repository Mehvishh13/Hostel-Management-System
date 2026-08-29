---
name: Hostel Board — The Notice Board
description: Corkboard / pinned-index-card visual world for the Hostel Management System, light and dark
colors:
  surface: "#a9754a"
  surface-raised: "#93643c"
  surface-line: "rgba(43, 27, 12, 0.28)"
  surface-line-strong: "rgba(43, 27, 12, 0.42)"
  surface-ink: "#f6efe1"
  surface-ink-dim: "rgba(246, 239, 225, 0.72)"
  surface-ink-faint: "rgba(246, 239, 225, 0.5)"
  paper: "#f6efe1"
  paper-raised: "#efe4cd"
  paper-line: "#e2d3ae"
  ink: "#2e2115"
  ink-dim: "#6f5c46"
  ink-faint: "rgba(46, 33, 21, 0.45)"
  page-bg: "#efe6d2"
  pin-red: "#c1392b"
  pin-red-deep: "#9c2c20"
  twine: "#b9862c"
  resolved-green: "#4c7a4f"
typography:
  display:
    fontFamily: "'Special Elite', 'Courier New', monospace"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "'JetBrains Mono', 'Courier New', monospace"
    fontWeight: 500
rounded:
  none: "0px"
spacing:
  sm: "8px"
  md: "20px"
  lg: "36px"
components:
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
  pin-btn:
    backgroundColor: "{colors.pin-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "11px 18px"
  stamp:
    rounded: "2px"
    padding: "3px 8px"
---

# Design System: The Notice Board

## Overview

**Creative North Star: "The Notice Board"**

A hostel corkboard with index cards pinned to it — not a SaaS dashboard, not a chat feed. Every unit of content (a complaint, a listing, a group, a stat) is a physical card pinned to the board with a single red pushpin. The world explicitly replaces its predecessor, "The Mess Board" (a dark chalkboard/chalk-tick system) — that identity is retired; nothing from it (chalk textures, tally marks, hand-chalk type, HUD corner-bracket tags) carries forward.

Confirmed rejection: no icon-plus-heading-plus-text same-size card grid used generically (cards here are pinned notices, not neutral containers), no gradient text, no full-bordered pill badges for metadata (see Components), no chalk/mess-board vocabulary.

**Key Characteristics:**
- Warm cork-brown chrome (nav, page ground on hero surfaces) against cream/aged-parchment paper cards
- Typewriter display type (Special Elite) for headings, stamps, and buttons only; a warm serif (Source Serif 4) carries all body copy; JetBrains Mono carries numbers, dates, and tabular data
- Every card gets exactly one red pushpin (a small radial-gradient circle) centered on its top edge, plus a subtle per-card rotation (±0.4–1.1deg) — the signature "pinned to a board" tell
- Status renders as a `.stamp`: typewriter uppercase text in a thin colored outline box, tilted -3deg — never a filled color chip
- Metadata (category, priority, room) renders as plain dim text joined by a `·` separator with one bold colored word for the value that matters (priority) — not boxed tags or pills; this was a direct fix for a real readability complaint, keep it everywhere
- Full light and dark themes via the same token names (`[data-theme="dark"]` in index.css) — night is "the corkboard after hours": darker walnut chrome, aged-parchment cards, brighter pin-red for contrast

## Colors

Two surface families sharing the same role split in both themes. `--surface`/`--surface-raised` is the cork chrome (Navbar, and the full-bleed textured ground on hero pages like Dashboard) with `--surface-ink` variants for text on it. `--paper`/`--paper-raised`/`--paper-line` is the card material, with `--ink` variants for text on paper. `--page-bg` is the flat (non-textured) ground for dense/operate pages — list, form, and table pages sit on `--page-bg`, not the full cork-dot texture; the cork texture is a hero-page device, not a whole-app background. Three accents carry meaning: `--pin-red` (primary actions, high priority, rejected/urgent status), `--twine` (medium priority, in-progress, secondary emphasis), `--resolved-green` (resolved/done). Never introduce a fourth accent hue.

## Typography

Three families, strict roles. Special Elite (`--font-display`) is a real typewriter face — headings, section titles, stamps, buttons, the wordmark — never body copy or anything read at length (it's legible but effortful past a few words). Source Serif 4 (`--font-body`) carries every paragraph, label, and input value. JetBrains Mono (`--font-mono`) is reserved for things that are literally numbers or fixed-width data: stat counts, prices, dates, room numbers, IDs.

## Layout

Two layout modes, chosen by page role, not applied uniformly:
- **Hero/summary pages** (Dashboard, and any page's own summary/stat strip): full-bleed cork-dot-textured `--surface` background, pinned paper cards with rotation, grid of `auto-fill`/`auto-fit` cards separated by real gaps (never hairline dividers — these are physical objects, not rows in a ledger).
- **Dense/operate pages** (lists, tables, forms, comment threads): flat `--page-bg` ground, no cork texture. List items may still use the pinned-card pattern (Marketplace listings, Complaints list, Groups list) since each item is a real content unit; but tables (Admin), forms, and repeating dense rows (comments) use flat, unrotated paper panels with hairline `--paper-line` dividers — rotation and pins are reserved for content units a person scans one at a time, not rows they scan in bulk.

## Elevation & Depth

Every `.card` carries the same real shadow: `0 10px 18px -6px rgba(20,12,4,0.4), 0 2px 0 rgba(255,255,255,0.4) inset` — a paper-lifted-off-cork shadow, not an ambient UI shadow. Buttons (`.pin-btn`) use a hard offset shadow (`0 4px 0 var(--pin-red-deep)`) that intentionally reads as neobrutalist-adjacent because it represents a physical pinned tab, not a floating UI layer — this is an earned exception to the general "no hard offset shadow" rule because the world's material logic requires it. Flat/dense-page panels (tables, forms in Operate contexts) may drop the shadow entirely and use a hairline border instead — do not give every panel on every page a drop shadow, or the physical-object metaphor stops meaning anything.

## Shapes

Square corners everywhere (`rounded: 0`) — no border-radius on cards, buttons, or inputs; this is a paper-and-pin world, not a soft-UI one. The pushpin (`.card::before`) is the one circular element in the system and must stay singular — don't add second pins, corner pins, or decorative pin clusters. Inputs are bottom-hairline only (`border-bottom: 1.5px solid var(--paper-line)`), never a full box border or radius.

## Components

- **card**: paper panel, one pushpin, hard paper shadow, subtle rotation. The base unit of the whole system — see Layout for when to rotate vs. keep flat.
- **pin-btn**: primary action button — solid `--pin-red`, `--paper` text, typewriter font, hard `0 4px 0 var(--pin-red-deep)` offset shadow, slight rotation, lifts on hover.
- **stamp**: status indicator — typewriter uppercase text, `1.5px solid currentColor` outline box, `rotate(-3deg)`, color-coded (ink-dim/twine/resolved-green/pin-red for pending/in-progress/resolved/rejected). Never a filled badge.
- **metadata line**: category/priority/room-number rendered as plain text joined by `·` (`var(--ink-faint)`), with the single value that needs emphasis (priority) as a bold colored uppercase word. Direct replacement for boxed pill tags, which users found hard to scan.
- **theme-toggle**: circular icon button in the Navbar (moon/sun), persists to `localStorage('theme')`, applied via `data-theme` on `<html>`, initialized pre-hydration in `index.html` to avoid a flash of the wrong theme.

## Do's and Don'ts

- Do give every `.card` exactly one pushpin and a subtle rotation; don't add pins to dense table rows or form fields.
- Do render metadata as plain text + `·` separator + one bold colored word; don't reintroduce boxed pill badges or corner-bracket tags (that was the previous world's device, retired).
- Do reserve Special Elite for headings/stamps/buttons; don't set body copy or long text in it.
- Do scope every page's CSS under that page's root wrapper class (see the CSS-scoping note below); don't write a bare generic class name.
- Do use `--page-bg` flat ground for list/form/table pages; don't apply the full cork-dot texture background outside hero/summary pages.

**CSS scoping is load-bearing, not a style preference:** this app's page stylesheets are global CSS with no module scoping. A generic class name (`.card`, `.stat-number`, `.title`) reused across two page CSS files collides at runtime depending on import order — this broke Dashboard for real during the build (`Profile.css`'s unscoped `.stat-number { color: #667eea }` silently overrode Dashboard's token-based color). Every page's stylesheet must scope all of its selectors under that page's existing root wrapper class (`.notice-board`, `.auth-container`, `.complaints-container`, `.marketplace-container`, `.groups-container`, `.profile-container`, `.admin-dashboard-container`, etc.) — no bare top-level class or element selector outside that root and `@media`/`@keyframes` blocks.

**Retired:** the previous "Mess Board" world (dark chalkboard, Kalam hand-chalk type, chalk-tick status glyphs, tally-mark counters, corner-bracket HUD tags) is fully replaced, not layered underneath. Do not mix its vocabulary into new work.
