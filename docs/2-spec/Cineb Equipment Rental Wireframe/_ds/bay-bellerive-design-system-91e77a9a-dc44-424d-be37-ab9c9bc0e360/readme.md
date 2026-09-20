# bay — Bellerive design system

**bay** is a bar and kitchen on the Bellerive waterfront, Tasmania (Hobart's eastern shore, across the Derwent from the city, five minutes from the ferry terminal). Small room, short menu cooked mostly over coals, Tasmanian-leaning drinks list, a handful of ticketed nights each month.

This system exists so anything made for bay — the website, a booking flow, a printed menu, a poster in the window — comes out looking like the same place.

## Sources given

| Source | What it was |
| --- | --- |
| `uploads/bay.png` | The only supplied brand asset: the lowercase **bay** wordmark, black on a `#fdf5e6` cream field, 320×320 PNG. |
| Brief | "Bay Bellerive: a bar & restaurant in Bellerive, Tasmania, Australia" + a request for a cream (`#fdf5e6`) wordmark on transparent background. |
| Brand colours | `#3e2723` cocoa brown as the primary background colour, `#fdf5e6` cream as the secondary/text colour. |

No codebase, Figma file, photography, deck or existing website was provided. **Everything beyond the wordmark and the supplied `#3e2723` / `#fdf5e6` pair is an inference from that one artwork plus the venue's location and category, and should be treated as a proposal to confirm — not as documented brand truth.**

### Derived assets

| File | Notes |
| --- | --- |
| `assets/logo-bay-cream-trimmed.png` | The requested deliverable: wordmark in `#fdf5e6`, background removed, tightly cropped (204×114). Alpha was derived from the original's luminance, so the letter edges keep their original anti-aliasing. |
| `assets/logo-bay-cream.png` | Same, uncropped 320×320 — use when you need the original padding. |
| `assets/logo-bay-ink.png` | Ink (`#16130f`) version on transparent, for cream and white surfaces. |

No secondary mark, monogram, icon or lockup was supplied and **none has been drawn**. Where a logo variant would go (favicon, stacked lockup, social avatar), the wordmark is used as-is or the venue name is set in plain type. See "Gaps to fill" at the bottom.

---

## CONTENT FUNDAMENTALS

The voice comes straight out of the wordmark: lowercase, geometric, unfussy, no ornament. bay writes the way a good local publican talks — tells you what it has, tells you what it doesn't, and doesn't sell.

**Casing.** Display headlines and section titles are **always lowercase**: `eat by the water`, `from the coals`, `september at the bay`. Body copy is normal sentence case. Micro-labels (eyebrows, buttons, nav, badges) are **uppercase with 0.22em tracking**: `KITCHEN`, `BOOK A TABLE`, `OPEN NOW`. Nothing is ever Title Case — no "Book Your Table Today".

**Person.** "We" for the venue, "you" for the guest, and mostly implied rather than stated: *"We hold every booking for ten minutes."* / *"Tell us what you can't eat and we'll work around it."* Never third person ("Bay Bellerive is pleased to announce…").

**Sentence shape.** Short declaratives, often two clauses joined by "and" or a comma, frequently ending on a plain fact rather than a flourish: *"One sitting, one menu, forty seats down the middle of the room."* *"Gin or vodka. Olive or twist. That's the whole conversation."* Fragments are fine. Em-dashes are rare; commas and full stops do the work.

**Numerals.** Digits, always, and bare: prices are `28`, `6 ea`, `68 a head` — **no dollar signs anywhere**, on menus or online. Times are `7pm`, `11am – late`, `til 4pm` (lowercase am/pm, no periods). Counts in prose are words when small ("ten minutes", "fifteen or so dishes") but digits in UI.

**Punctuation quirks.** The interpunct `·` separates equal fragments in labels and metadata: `Open now · kitchen til 9`, `bar & kitchen · bellerive`. `&` is used in lockups and pairs; "and" in sentences. "til" not "'til". No exclamation marks. Ever.

**No emoji.** Not on the site, not in the newsletter, not in the booking confirmation. Status is carried by a 6px coloured dot, not 🟢.

**Say / don't say.**

| Say | Don't say |
| --- | --- |
| eat by the water | Elevate Your Dining Experience! |
| a short menu that changes when the boats do | seasonally-driven, locally-sourced produce |
| we hold tables for ten minutes | Please note that reservations are subject to a 10-minute grace period |
| the list leans Tasmanian | award-winning culinary journey |
| booked out | Fully Committed |
| bar seats are walk-in only | Walk-Ins Welcome! 🍸 |

**Length discipline.** A section intro is one or two sentences. A dish description is one clause, max eleven words or so, and describes the plate rather than the philosophy. Legal/practical fine print (surcharges, split bills, dietary codes) is grouped in one small caption at the bottom, never sprinkled through.

**Acknowledgement.** The footer carries a plain acknowledgement of the muwinina people, set at caption size without decoration. Keep it unadorned; don't move it into a hero.

---

## VISUAL FOUNDATIONS

The governing metaphor is **printed paper on a cream stock, next to dark water.** Everything follows from that: warm neutrals, ink text, hairline rules, near-square corners, almost no shadow, no gloss.

### Colour

- **Paper** (`--cream-050 → --sand-500`). `#fdf5e6` (`--cream-100`) is *the* brand colour — it's the wordmark's colour and the default page background. `cream-050` is the card/field surface, `cream-200` the alternating section band, `cream-300`/`sand-400` for image wells and print desks.
- **Ink** (`--ink-900 → --ink-300`). Warm, never neutral grey — all inks carry a little brown so they sit on cream without going blue. `ink-800` for body, `ink-900` for headings and primary buttons, `ink-500` for muted copy, `ink-400`/`300` for captions and disabled.
- **Brand pair** (`--brand-primary` `#3e2723` / `--brand-secondary` `#fdf5e6`). Supplied by the venue. The dark cocoa brown is *the* background for every dark surface — hero, footer, inverse cards, primary buttons on hover — and cream `#fdf5e6` is always the text on it. `--cocoa-900` (`#2c1b18`) is the deeper footer variant; `700`/`600` are for hairlines and hover washes on brown.
- **Water** (`--kelp-900 → --tide-100`). The Derwent. Now a secondary accent rather than the dark-section colour: tide carries the "info" status and cool contrast where brown-on-brown would flatten.
- **Ember** (`--ember-600 → --ember-100`). Sunset over kunanyi. Accent only: focus rings, one eyebrow per page, the closed/error state, a single tinted callout panel. **Never a large fill, never a gradient, never a button background.**
- Ratio in practice: roughly 65% cream, 20% ink text, 13% cocoa brown, 2% ember. Maximum **two** background colours per page (cream + one of cream-200 / `--brand-primary` / `--cocoa-900`).
- **No gradients as decoration.** The only gradient in the system is `--scrim-image`, a bottom-up ink scrim for text over photography. No purple, no colour-to-colour blends, no glow.

### Type

- **Jost** (Google Fonts) for display, headings and all UI — a geometric sans in the Futura/Avenir lineage, chosen to match the supplied wordmark. Display and headings at **300**, UI labels at **500**.
- **EB Garamond** for prose, menu descriptions, pull quotes and captions of any length. It is the warmth in the system; without it the design reads as cold Swiss.
- Display: `clamp(3.5rem, 9vw, 7.5rem)`, line-height `0.94`, tracking `-0.022em`, lowercase.
- Body: 16–18px, line-height 1.5–1.65, measure capped at `62ch` (`--measure-prose`).
- Eyebrow: 11px / 500 / `0.22em` / uppercase. This one style, used consistently, does more brand work than any other single decision.
- Prices and times use `font-variant-numeric: tabular-nums` so columns line up.

### Layout

- Content column `1180px` (`--width-content`), prose column `720px`. Page gutter 24px mobile / 56px desktop.
- Sections are separated by `96px` of vertical space, or by a background change — **not** by rules. A `1px` hairline is a *within*-component device (hours rows, footer split, menu footnote).
- Asymmetric two-column splits are the house layout: `0.8fr / 1.2fr` or `1.25fr / 0.75fr`. Avoid perfect 50/50.
- Only one fixed element: the sticky top bar. It starts transparent over the hero and fades in a translucent cream background plus a hairline bottom border after 24px of scroll. The menu screen adds a second sticky tab bar directly beneath it. Nothing else pins, no sticky CTAs, no floating buttons.

### Backgrounds & imagery

- Full-bleed photography is used **once per page, in the hero**, always with `--scrim-image` under the text. Everything else is flat colour.
- No repeating patterns, no textures, no grain overlays, no hand-drawn illustration. The brand has no illustration language and shouldn't fake one.
- Intended photographic direction (unconfirmed, no images supplied): warm daylight and dusk, natural light only, wide-enough-to-see-the-water framing, food shot from a low angle on the table rather than flat-lay. Cool blue-hour shots are acceptable for the hero only. **No black & white, no heavy grade, no fake film grain.**
- Until real photography arrives, every image slot renders as a flat `cream-300` (or `kelp-600` on dark) block with a tracked-out "photography TBD" caption. That placeholder is deliberate and visible — do not substitute stock imagery.

### Surfaces, corners, borders, shadow

- **Radii: 0, 2, 4, pill.** Cards, buttons and fields are `2px`. `4px` is for nothing much. Pill is only for badges and dietary tags. There is no 8px, 12px or 16px radius in this system, and no `border-radius` on images beyond 2px.
- **Cards** = `cream-050` background, `2px` radius, `--shadow-card` (a 1px hairline shadow plus a wide, warm, very soft drop). Variants: `outline` (hairline border, no shadow), `sunken` (`cream-200`, no shadow), `inverse` (kelp).
- **Shadows are warm and low**, built from `color-mix` on ink rather than black: `--shadow-card`, `--shadow-raised` (hover), `--shadow-overlay` (modals only). No inner shadows except `--shadow-inset-hairline`, which fakes a border. No coloured shadows.
- **Borders:** `1px` hairline (14% ink) for structure, `1.5px` solid ink under menu course titles and the active tab. Never a coloured left-border accent bar.
- Dotted `1px` leaders connect menu item names to prices — the one piece of print vernacular carried into the UI.

### Transparency & blur

Used in exactly two places: the scrolled top bar and the menu tab bar (`cream-100` at 88–92% with `blur(10px) saturate(120%)`), and `--scrim-image` over hero photography. No frosted cards, no glassmorphism, no translucent panels over flat colour.

### Motion

- One easing curve: `--ease-out` `cubic-bezier(.2,.7,.2,1)`. `--ease-in-out` exists for the rare two-way move.
- Durations: 90ms (press), 160ms (colour/border), 240ms (lift, shadow, sticky bar), 420ms (route change), 700ms (one-time reveal: fade + 12px rise).
- **Hover:** interactive cards lift `translateY(-2px)` and deepen to `--shadow-raised`; buttons change fill (ink → kelp) or gain a 6% ink wash; text links go ink → ember. Never scale up, never brighten.
- **Press:** `scale(0.985)`. No colour flash, no ripple.
- **Focus:** 2px ember ring at 34% plus an ink border. Always visible — never `outline: none` without a replacement.
- No parallax, no scroll-jacking, no spring/bounce easing, no marquees, no autoplaying carousels.

---

## ICONOGRAPHY

**There is no bay icon set, and none has been invented.** The supplied source contained a single wordmark PNG — no icon font, no SVG sprite, no glyph library — so the system deliberately runs almost icon-free, which suits a small venue's printed-paper aesthetic.

What is used instead:

- **Text labels.** Nav, actions and metadata are words in tracked uppercase. `BOOK A TABLE`, not a calendar glyph.
- **A 6px round dot** (plain CSS, no asset) as the only status indicator, coloured by `--status-open` / `--status-closed` / `--status-info`.
- **Two unicode characters**, used sparingly and only where a glyph is structurally necessary: `▾` for the select caret and `·` as a separator. No other unicode is used decoratively.
- **Dotted CSS leaders** in place of any list bullet or arrow.
- **No emoji**, anywhere, in any surface.

If a future surface genuinely needs icons (a map pin, a phone, an Instagram mark in the footer), the recommendation is **Lucide** from CDN at `stroke-width: 1.5` and `currentColor`, sized 16/20/24 — its geometric, thin-stroke construction is the closest match to Jost and the wordmark. This would be a **substitution, not brand truth**: it is not in the supplied material and must be signed off. Do not mix two icon libraries, and do not hand-draw one-off SVG glyphs.

---

## Index

**Root**
- `styles.css` — the single entry point consumers link. `@import` list only.
- `readme.md` — this file.
- `SKILL.md` — Agent Skills wrapper so this system can be used from Claude Code.
- `thumbnail.html` — homepage tile.

**`tokens/`** — `fonts.css` (Google Fonts import + substitution note), `colors.css`, `typography.css`, `spacing.css` (incl. radii and layout widths), `elevation.css` (shadows, scrims, blur), `motion.css`.

**`assets/`** — `logo-bay-cream-trimmed.png`, `logo-bay-cream.png`, `logo-bay-ink.png`.

**`components/`** — 14 primitives, each with `.jsx`, `.d.ts`, `.prompt.md`, plus one card HTML per directory.

| Group | Components |
| --- | --- |
| `core/` | `Button`, `Wordmark`, `Eyebrow`, `Badge`, `Card`, `SectionHeader`, `Rule` |
| `menu/` | `MenuSection`, `MenuItem` |
| `forms/` | `Input`, `Select`, `Checkbox` |
| `venue/` | `HoursList`, `EventCard` |

**`ui_kits/`**
- `website/` — four-route recreation of baybellerive.com.au (home, menu, what's on, three-step booking). Start at `index.html`.
- `print-menu/` — the A4 daily menu sheet printed in-venue.

**`guidelines/`** — 17 specimen cards: colour ramps (paper, ink, water, ember, semantic pairings, status), type (display, headings, editorial body, UI, eyebrow), spacing scale and section rhythm, corners, elevation, lines, motion, wordmark, voice.

### Intentional additions

- **`Wordmark`** — a wrapper around the supplied PNGs so no one hand-places or recolours the mark.
- **`Eyebrow`** and **`Rule`** — extracted because the tracked label and the hairline are used on nearly every surface; leaving them inline guaranteed drift.
- **`PhotoWell`** (inside the website kit, not a system component) — the visible "photography TBD" placeholder.

### Gaps to fill / flagged substitutions

1. **Fonts are substitutions.** No font files were supplied. **Jost** stands in for the wordmark's geometric sans; **EB Garamond** is a proposed editorial partner with no basis in supplied material. If the venue licenses Futura PT, Avenir Next or similar, send the files and `tokens/fonts.css` is a one-file change.
2. **No photography.** Every image slot is an intentional labelled placeholder.
3. **No icon set** — see ICONOGRAPHY. Lucide is a proposal only.
4. **Colour beyond the supplied `#3e2723` / `#fdf5e6` pair is inferred** from the venue's location and category. Kelp, tide, ember and the ink ramp are proposals.
5. **Contact details, hours, prices, dish names and event copy in the UI kits are plausible placeholders**, written to demonstrate voice — not real venue information.
6. **No secondary mark, favicon or stacked lockup** exists, and none was drawn.
