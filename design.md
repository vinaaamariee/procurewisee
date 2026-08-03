# Design — ProcureWise

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- **Marketing pages**: Bento Grid / Marquee Hero
- **App pages**:       Workbench (Sidebar + Top Navigation + main content container)

## Theme
Existing color palette preserved exactly.

- Primary Maroon: `#7B1E1E` (`var(--accent)` in code, DaisyUI `primary`)
- Gold Secondary: `#A6761D` (`var(--secondary)` in code, DaisyUI `secondary`)
- Accent Navy:    `#0B2D5C` (`var(--accent-navy)` in code, DaisyUI `accent`)
- Paper Canvas:   `#F2F3EF` (`var(--bg-deep)` in code, DaisyUI `base-100` / `base-200`)
- Paper Darker:   `#E7E8E2` (`var(--bg-dark)` in code)
- Surface White:  `#ffffff` (`var(--surface)` in code)
- Neutral Border: `#D4D7DE` (`var(--border)` in code)

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
- Radius: `rounded-2xl` (16px)
- Border: `1px solid var(--border)`
- Shadow: `0 10px 30px -10px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.02)` (soft layered shadow)

### Tables
- Border: thin header-separator rules.
- Selection states & Hovers: Subtle background highlight `rgba(11, 45, 92, 0.04)`.
- Zebra-striping: ultra-light alternating rows on `#f8f9fa` (or base-200).

### Buttons
- Rounded corners: `rounded-xl` (12px) to match DaisyUI selection themes.
- Active Press: Scale down to `0.97`.

### Top Navigation Header
- Spacing: high baseline vertical alignment, balanced 8px padding increments.
- Glass effect: `backdrop-blur-md bg-white/80` or dark equivalent.

### Sidebar Navigation
- Kept as institutional dark maroon gradient: `linear-gradient(180deg, #74171B 0%, #4B0B0E 100%)`.
- Enhanced spacing: 8px grid alignment.
- Selection indicator: `#D4A017` left border line.
- Hover state: Shift items smoothly by translating `translateX(4px)` with alpha background.
