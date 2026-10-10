# Zapier-Inspired Design System

> **Purpose:** A practical design-language reference for building a separate website using visual patterns observed on [zapier.com](https://zapier.com/).
>
> **Status:** Independent, public-site analysis. This is not Zapier's official internal design specification. Values described as estimates should be checked against the live site and the target viewport before implementation.
>
> **Reference checked:** October 2026.

---

## 1. Design direction

### Core character
- **Warm, confident, approachable:** cream-toned surfaces and deep, warm text replace the sterile white-and-cool-gray look common to SaaS sites.
- **Action-oriented:** saturated orange is the strongest visual accent and should make important actions immediately obvious.
- **Editorial marketing layout:** oversized display headlines, short supporting copy, clear section hierarchy, and generous whitespace.
- **Product-led storytelling:** explain outcomes first, then show how automation or product features make those outcomes possible.
- **Complexity made approachable:** use diagrams, app marks, workflow previews, and structured feature groups to make technical ideas easier to scan.

### Principles
1. **Lead with the outcome.** Headlines communicate a clear user benefit rather than a list of features.
2. **Use contrast intentionally.** Orange should be distinctive, not sprinkled across every element.
3. **Keep the canvas warm.** Prefer soft cream and warm neutral surfaces to cold gray panels.
4. **Make scanning easy.** Use short paragraphs, clear headings, lists, and repeatable section patterns.
5. **Use visuals to explain.** Product previews and workflow diagrams should clarify the message, not act as decoration.
6. **Keep the interface calm.** Avoid unnecessary borders, shadows, gradients, and competing accents.

---

## 2. Color system

The following palette is a practical approximation based on public-page observations and secondary design analyses. Verify colors against the current live page before treating them as exact brand values.

| Token | Value | Intended use |
|---|---|---|
| `--color-primary` | `#FF4F00` | Primary CTA, key action, small emphasis |
| `--color-primary-hover` | `#E64600` | Hover state for orange action surfaces; validate contrast |
| `--color-ink` | `#201515` | Main headings and high-emphasis text |
| `--color-ink-soft` | `#2F2A26` | Secondary dark text |
| `--color-ink-muted` | `#605D52` | Body copy and muted content |
| `--color-ink-subtle` | `#939084` | Captions, helper text, subdued labels |
| `--color-canvas` | `#FFFEFB` | Main page background |
| `--color-canvas-soft` | `#F8F4F0` | Alternate section background |
| `--color-surface` | `#FFFFFF` | Cards, menus, and elevated content when contrast is needed |
| `--color-border` | `#E8E5DE` | Subtle borders and dividers |
| `--color-border-strong` | `#C5C0B1` | Stronger separators or input borders |
| `--color-primary-tint` | `#FFE8D9` | Soft orange callouts and selected states |
| `--color-success` | `#237A57` | Success feedback |
| `--color-warning` | `#946200` | Warning feedback |
| `--color-danger` | `#B42318` | Error feedback |

### Color usage rules
- Use the warm canvas for most marketing pages.
- Alternate canvas and soft-canvas sections to separate content without creating visual clutter.
- Use orange for the primary action and a small number of important emphasis points.
- Keep body text dark enough for comfortable reading.
- Use semantic colors for meaning, not decoration.
- Do not rely on color alone to communicate status.
- Test foreground/background combinations for WCAG contrast. The sample palette is not a substitute for contrast testing.

---

## 3. Typography

### Typeface roles
- **Display/headlines:** `Degular Display` where a licensed or approved font file is available.
- **Body/UI:** `Inter`.
- **Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Degular is a distinctive brand typeface; do not assume it is available by default. If the project cannot legally or technically load it, use a close, readable display alternative and document the substitution. Do not fake the font by stretching or distorting text.

### Type scale

| Token | Size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| `display-xl` | `clamp(2.75rem, 5vw, 4.5rem)` | 500–600 | 0.98–1.08 | Hero headline |
| `display-lg` | `clamp(2.5rem, 4vw, 3.5rem)` | 500–600 | 1.05–1.12 | Major section headline |
| `heading-xl` | `2.5rem` / 40px | 600 | 1.1 | Page-level heading |
| `heading-lg` | `2rem` / 32px | 600 | 1.15 | Section heading |
| `heading-md` | `1.5rem` / 24px | 600 | 1.25 | Card and subsection heading |
| `heading-sm` | `1.25rem` / 20px | 600 | 1.3 | Compact heading |
| `body-lg` | `1.125rem` / 18px | 400 | 1.55 | Hero support and lead paragraphs |
| `body-md` | `1rem` / 16px | 400 | 1.6 | Default body |
| `body-sm` | `0.875rem` / 14px | 400 | 1.5 | Supporting UI text |
| `caption` | `0.75rem` / 12px | 400–500 | 1.4 | Metadata only |

These are implementation starting points, not verified CSS values from every page.

### Typography rules
- Keep hero headlines short enough to create deliberate line breaks.
- Use a strong size contrast between display headings and body copy.
- Prefer readable line lengths; target roughly 45–75 characters for long-form body text.
- Use medium or semibold weights for headings rather than making every heading extra-bold.
- Avoid long blocks of centered body copy.
- Use uppercase eyebrow labels sparingly and with readable letter spacing.

---

## 4. Spacing and layout

Use a 4px base unit so spacing remains systematic.

| Token | Value | Typical use |
|---|---:|---|
| `space-1` | `4px` | Icon/text micro-gap |
| `space-2` | `8px` | Compact control spacing |
| `space-3` | `12px` | Tight component spacing |
| `space-4` | `16px` | Standard component gap |
| `space-5` | `20px` | Form and card spacing |
| `space-6` | `24px` | Card padding on compact layouts |
| `space-8` | `32px` | Related content groups |
| `space-10` | `40px` | Larger component separation |
| `space-12` | `48px` | Tablet section spacing |
| `space-16` | `64px` | Desktop section spacing |
| `space-20` | `80px` | Major marketing section spacing |
| `space-24` | `96px` | Large hero/section breathing room |

### Grid and containers
- Use a centered content container with responsive side padding.
- Suggested maximum content width: `1200px–1280px`, depending on the page.
- Suggested desktop grid: 12 columns with consistent gutters.
- Use a single-column reading layout for long-form text.
- For hero layouts, use a two-column composition when a product illustration or demo supports the message.
- Keep the headline and CTA group visually connected.
- Avoid forcing all sections into the same grid; use a consistent grid system with purposeful variations.

### Responsive behavior
- **Mobile:** one-column layouts, stacked CTAs when necessary, reduced heading scale, compact navigation, and `20px–24px` side padding.
- **Tablet:** allow two-column layouts only where text and visuals remain readable.
- **Desktop:** use generous section spacing and multi-column feature layouts.
- Collapse navigation into a menu on small screens when required.
- Prevent oversized headlines from overflowing or creating awkward one-word lines.
- Validate at widths around `375px`, `768px`, `1024px`, and `1440px`; adjust to the actual project rather than treating these as mandatory breakpoints.

---

## 5. Shape, borders, and elevation

| Token | Value | Use |
|---|---:|---|
| `radius-sm` | `4px` | Small controls and compact tags |
| `radius-md` | `8px` | Inputs and buttons |
| `radius-lg` | `12px` | Cards and dialogs |
| `radius-xl` | `16px` | Large visual panels |
| `radius-pill` | `999px` | Pill controls, only when appropriate |

### Surface treatment
- Prefer a clean surface with a subtle warm border.
- Use shadows sparingly; reserve them for menus, dialogs, or content that must appear elevated.
- Separate sections with background shifts and whitespace before adding decorative dividers.
- Avoid excessive glassmorphism, heavy drop shadows, and nested bordered cards.
- Product preview frames may have more visual detail than surrounding marketing content, but should remain legible.

Suggested shadow tokens:
- `shadow-sm`: `0 1px 3px rgb(32 21 21 / 8%)`
- `shadow-md`: `0 8px 24px rgb(32 21 21 / 10%)`
- `shadow-lg`: `0 16px 40px rgb(32 21 21 / 12%)`

These shadows are suggested approximations, not confirmed site-wide values.

---

## 6. Components

### Navigation
- Clean horizontal desktop navigation with clear grouping.
- Keep the brand mark distinct from navigation links.
- Use concise labels and a clear primary CTA.
- Dropdowns should have obvious focus/hover states and generous hit areas.
- Mobile navigation must be keyboard accessible and provide a clear open/close state.

### Buttons
**Primary**
- Orange background with a high-contrast label.
- Medium-to-large hit area.
- Rounded corners rather than a sharp rectangle.
- Strong visual hierarchy; use for the main action in a section.

**Secondary**
- Neutral or outlined treatment.
- Use for alternate actions that should not compete with the primary CTA.

**Text/link action**
- Use for low-emphasis navigation and inline actions.
- Provide visible hover and keyboard focus states.

Suggested baseline:
- Height: `44px–52px`
- Horizontal padding: `20px–24px`
- Radius: `8px`
- Label: `14px–16px`, weight `600`

Do not use the orange primary style for every button on the page.

### Cards
- White or warm-neutral surface.
- Subtle border, approximately `1px`.
- Radius around `12px`.
- Padding around `24px–32px` on desktop and `16px–24px` on mobile.
- Heading, short description, and optional icon or visual.
- Keep card heights aligned within a row when it improves scanability, but do not force equal heights if content becomes awkward.

### Forms and inputs
- Clear visible labels, not placeholder-only labels.
- Neutral background and legible border.
- Focus ring that is clearly visible and not indicated by color alone.
- Inline validation text and error states.
- Helpful, concise error messages.
- Adequate spacing between fields and between labels and controls.

### Feature sections
- A clear section headline and concise supporting paragraph.
- Feature groups of two to four items when appropriate.
- Icons or illustrations should support meaning.
- Alternate text-and-visual alignment to create rhythm without arbitrary variation.

### Product/workflow previews
- Use simplified app interfaces, flow diagrams, integration tiles, and connected steps to make automation concepts concrete.
- Keep previews visually subordinate to the headline and CTA.
- Ensure mock UI text is readable enough to communicate structure.
- Use real product imagery only when permitted; otherwise create original illustrative assets.

### Testimonials and customer proof
- Keep quotations short and readable.
- Attribute quotes clearly and accurately.
- Pair logos, customer stories, or metrics with context.
- Never invent testimonials, company logos, customer counts, or performance claims.

### Pricing and comparison tables
- Make plan differences easy to scan.
- Emphasize a recommended option only when there is a genuine product reason.
- Keep feature labels consistent across columns.
- Make mobile comparison usable without requiring horizontal scrolling wherever possible.

### Footer
- Organize links into clear groups.
- Keep legal, company, product, and resource navigation distinct.
- Use a clear final CTA only when it fits the page's goal.
- Maintain sufficient contrast on any dark footer surface.

---

## 7. Motion and interaction

- Motion should communicate state or guide attention, not delay users.
- Prefer short transitions, approximately `150ms–250ms`, for hover and focus changes.
- Use restrained movement for dropdowns, accordions, and modal entry.
- Keep layout shifts to a minimum.
- Provide `prefers-reduced-motion` support.
- Do not animate every card or paragraph into view by default.
- Avoid scroll-jacking and long, blocking entrance animations.

Suggested easing:
- Standard: `cubic-bezier(0.2, 0, 0, 1)`
- Enter: `cubic-bezier(0, 0, 0.2, 1)`
- Exit: `cubic-bezier(0.4, 0, 1, 1)`

---

## 8. Accessibility and content

- Aim for WCAG 2.2 AA.
- Check color contrast for text, controls, and focus indicators.
- Support keyboard navigation and visible focus.
- Use semantic headings in a logical order.
- Add accessible names to icon-only buttons.
- Ensure menus, dialogs, and accordions work with assistive technology.
- Do not communicate information through color alone.
- Use descriptive link text rather than repeated “Learn more” labels without context.
- Keep marketing copy specific, concise, and benefit-oriented.
- Respect reduced-motion settings and avoid flashing effects.

---

## 9. Implementation tokens

Example CSS custom properties. Adapt names and values to the target application's existing conventions rather than introducing a second competing token system.

```css
:root {
  /* Brand and surfaces */
  --color-primary: #ff4f00;
  --color-primary-hover: #e64600;
  --color-ink: #201515;
  --color-ink-soft: #2f2a26;
  --color-text: #605d52;
  --color-text-muted: #939084;
  --color-canvas: #fffefb;
  --color-canvas-soft: #f8f4f0;
  --color-surface: #ffffff;
  --color-border: #e8e5de;
  --color-border-strong: #c5c0b1;
  --color-primary-tint: #ffe8d9;

  /* Typography */
  --font-display: "Degular Display", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

  /* Spacing: 4px base */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Shape and layout */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --container-max: 1280px;
  --page-gutter: clamp(20px, 4vw, 64px);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 220ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

### Example base styles

```css
html {
  color-scheme: light;
  background: var(--color-canvas);
}

body {
  margin: 0;
  color: var(--color-ink);
  background: var(--color-canvas);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
}

.container {
  width: min(
    calc(100% - 2 * var(--page-gutter)),
    var(--container-max)
  );
  margin-inline: auto;
}

.section {
  padding-block: clamp(64px, 8vw, 112px);
}

:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Guidance for AI coding agents

When using this document with Cursor, Claude Code, Codex, or another coding agent:

1. Inspect the target repository before changing code. Identify its framework, styling system, tokens, components, and routes.
2. Treat this document as a **visual reference**, not permission to replace the existing architecture.
3. Reuse existing tokens and components when they already satisfy the specification. Avoid duplicate systems.
4. Implement global foundations first, then shared components, then individual pages.
5. Preserve application behavior, content, routing, integrations, and accessibility.
6. Do not copy Zapier's proprietary logo, illustrations, copy, or other protected assets into another brand's site unless authorized. Create original assets with a similar high-level visual direction.
7. Do not claim exact visual matching without comparing screenshots.
8. Capture reference and target screenshots at matching viewport sizes; fix layout and type hierarchy before micro-details.
9. Test mobile layouts, keyboard interactions, focus states, and reduced-motion behavior.
10. Record any intentional deviations and any values that still need verification.

### Visual QA checklist

- [ ] Warm neutral canvas and readable dark text
- [ ] Orange used sparingly for high-priority actions
- [ ] Headline scale and line breaks are intentional
- [ ] Body text has comfortable line length and line height
- [ ] Section spacing is consistent
- [ ] Container widths and grid alignment are coherent
- [ ] Buttons, cards, and inputs share consistent shape rules
- [ ] Hover, focus, active, disabled, and error states exist
- [ ] Mobile navigation and content stacking work
- [ ] Contrast and keyboard accessibility checked
- [ ] Reduced-motion preferences respected
- [ ] Screenshots compared at matching viewport dimensions
- [ ] Existing app behavior remains intact

---

## 11. References and confidence

This document is an interpretation of the public marketing website, not a reproduction of Zapier's private design files.

- [Zapier homepage](https://zapier.com/) — primary visual reference.
- [Zapier's new look](https://zapier.com/blog/zapiers-new-look/) — official explanation of the brand system, orange palette, and Degular typeface.
- [Zapier press kit](https://zapier.com/press) — official source for approved brand assets and company information.
- [UI Discovery: Zapier](https://uidiscovery.com/sites/zapier) — secondary analysis of captured public-page colors, fonts, and page sections.
- [Zapier-inspired design analysis](https://www.shadcn.io/design/zapier) — secondary implementation-oriented interpretation of tokens and components.

### Confidence notes
- **High confidence:** warm-neutral visual direction, orange accent, deep warm text, Degular display typeface, Inter body/UI typeface.
- **Medium confidence:** suggested palette roles, component radii, typography scale, and section spacing.
- **Needs live verification:** exact current CSS values, responsive breakpoints, hover states, page-specific layouts, and any changes deployed after this analysis.

Use this as a reusable starting point, then validate it against the specific Zapier pages and viewport sizes that matter to your project.
