# Design — ProcureWise

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
institutional-flat

## Macrostructure family
- **Marketing pages**: Government service portal / structured information page
- **App pages**:       Workbench (Sidebar + Top Navigation + main content container)

## Theme
Existing institutional palette preserved. Pages use flat fields, rules, and semantic contrast rather than decorative gradients, glass, or elevation.

- Primary Maroon: `#7B1E1E` (`var(--accent)` in code, DaisyUI `primary`)
- Gold Secondary: `#A6761D` (`var(--secondary)` in code, DaisyUI `secondary`)
- Accent:         Maroon (`var(--accent)` in code, DaisyUI `accent`)
- Paper Canvas:   `#F2F3EF` (`var(--bg-deep)` in code, DaisyUI `base-100` / `base-200`)
- Paper Darker:   `#E7E8E2` (`var(--bg-dark)` in code)
- Surface White:  `#ffffff` (`var(--surface)` in code; permitted as the document surface)
- Neutral Border: `#D4D7DE` (`var(--border)` in code)

Maroon and gold are the only chromatic colors. White, paper gray, borders, and dark text are neutral support colors only. Semantic information, success, warning, and error treatments must resolve to maroon or gold rather than introducing blue, green, or orange.

## Typography
- Display: 'Public Sans', var(--font-geist-sans), Arial, sans-serif
- Body:    'Public Sans', var(--font-geist-sans), Arial, sans-serif
- Mono:    var(--font-geist-mono), monospace
- Headings: Roman weight 700. Italic headings are strictly forbidden.

## Spacing
8-point spacing system:
- `--space-1`: 0.5rem (8px)
- `--space-2`: 0.75rem (12px)
- `--space-3`: 1rem (16px)
- `--space-4`: 1.5rem (24px)
- `--space-5`: 2rem (32px)
- `--space-6`: 3rem (48px)

## Motion & Easing
- Primary Easing Curve: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out for snaps)
- Active Scale-down: `transform: scale(0.97)` on `:active` with `transition: transform 160ms ease-out` (button tactile feedback)
- Speed ceiling: Under 250ms for standard transitions.
- Reduced Motion: `@media (prefers-reduced-motion: reduce)` removes movement transforms, leaving opacity only.

## Microinteractions Stance
- Hover effects: Gated behind fine pointer query `@media (hover: hover) and (pointer: fine)`.
- Input Focus: Crisp, visible, non-blurred keyboard focus utilizing outline-offset.

## Component Specifications

### Cards
- Radius: `rounded-box` / 4px
- Border: `1px solid var(--border)`
- Shadow: none. Use rules and background contrast for grouping.

### Tables
- Border: thin header-separator rules.
- Selection states & Hovers: Subtle background highlight `rgba(11, 45, 92, 0.04)`.
- Zebra-striping: ultra-light alternating rows on `#f8f9fa` (or base-200).

### Buttons
- Rounded corners: `rounded-field` / 4px.
- Active Press: Scale down to `0.97`.

### Top Navigation Header
- Government identifier strip above a flat white navigation bar.
- Solid surfaces and a primary-color rule; no blur, transparency, or drop shadow.

### Sidebar Navigation
- Institutional solid maroon field. Avoid gradients.
- Enhanced spacing: 8px grid alignment.
- Selection indicator: `#D4A017` left border line.
- Hover state: Background/color change only; no spatial shift.

## Flat government interface rules
- Content leads; decoration is limited to the college seal and functional icons.
- Section boundaries use 1px rules or base-200 bands.
- Cards do not float, glow, scale, or translate on hover.
- Use primary maroon for the single highest-priority action in a view; gold is a restrained secondary marker.
- Headings are sentence case except short official labels and table headers.
- Landing and content pages use a document-like maximum width and left-biased hierarchy.
