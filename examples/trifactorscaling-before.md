# trifactorscaling.com, before

An audit of https://trifactorscaling.com taken with `scripts/audit.mjs` on 2026-09-11, before any of this method was applied. The site sizes its type in fixed px on a `.v2` wrapper. It is the "before" half of a before/after.

## What the table shows

- **The root is fixed.** `.v2` is 17px at every width. Nothing on the page scales with the window.
- **Two fixed heading sizes, one big jump.** The h1 is 40px at 360 and 480 (2.35x the root) and 68px from 768 up (4x). Between 480 and 768 every heading grows by 70 percent at one seam.
- **The nav collapses too late.** The hamburger shows at 768 and below. At 991, 992 and 1024 the bar still holds four links, "Apply" and "Book a call", and "Book a call" wraps onto two lines. That is the Priority+ rule in one row: the items stop fitting before the control takes over.
- **Footer links wrap at desktop widths.** `.v2-footer-grid` is five columns from 991 up, and three of its links wrap from 991 to 1440. One still wraps at 1920. Footer wraps do not fail the run, but they show the columns are too narrow for their labels.
- **Grids skip the two-up stage.** `.v2-four-grid` goes 4 to 1 and `.v2-deliverables-grid` goes 3 to 1 at the same seam, with no two-column step for tablets. `.head` and `.row` stay at four columns at every width, down to 360.
- **No horizontal overflow** at any width, and the hero holds 76 to 90 percent of the viewport.

The plan from here is the procedure in `SKILL.md`: guarded root on `.v2`, headings to em, collapse the nav at the width where "Book a call" stops fitting, split the four-grid 4/2/1, and widen or wrap the footer columns two-up at 991.

## The report

# Comfy audit: https://trifactorscaling.com

Run: 2026-09-11T18:18:35.840Z

| width | html | root | h1 | h1/root | hero | CTA wraps | overflow | hamburger |
|---|---|---|---|---|---|---|---|---|
| 360 | 16px | 17px (.v2) | 40px | 2.35x | 90% (section) | 1: footer: "Lead generation for consultants and coac" | none | yes |
| 480 | 16px | 17px (.v2) | 40px | 2.35x | 76% (section) | 0 | none | yes |
| 768 | 16px | 17px (.v2) | 68px | 4x | 89% (section) | 0 | none | yes |
| 991 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 4: nav: "Book a call", footer: "Lead generation for web agencies", footer: "Lead generation for PPC agencies", ... | none | no |
| 992 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 4: nav: "Book a call", footer: "Lead generation for web agencies", footer: "Lead generation for PPC agencies", ... | none | no |
| 1024 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 4: nav: "Book a call", footer: "Lead generation for web agencies", footer: "Lead generation for PPC agencies", ... | none | no |
| 1280 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 3: footer: "Lead generation for web agencies", footer: "Lead generation for PPC agencies", footer: "Lead generation for consultants and coac" | none | no |
| 1440 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 3: footer: "Lead generation for web agencies", footer: "Lead generation for PPC agencies", footer: "Lead generation for consultants and coac" | none | no |
| 1920 | 16px | 17px (.v2) | 68px | 4x | 88% (section) | 1: footer: "Lead generation for consultants and coac" | none | no |

Grid columns by width:

| grid | 360 | 480 | 768 | 991 | 992 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|---|
| `.v2-hero-stats` | 2 | 2 | . | . | . | . | . | . | . |
| `.v2-deliverables-grid` | 1 | 1 | 1 | 3 | 3 | 3 | 3 | 3 | 3 |
| `.head` | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| `.row` | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| `.v2-four-grid` | 1 | 1 | 1 | 4 | 4 | 4 | 4 | 4 | 4 |
| `.v2-section.v2-home-split` | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `.v2-math-stats` | 1 | 1 | . | . | . | . | . | . | . |
| `.v2-footer-grid` | 1 | 1 | 1 | 5 | 5 | 5 | 5 | 5 | 5 |
| `.v2-nav-inner` | . | . | . | 3 | 3 | 3 | 3 | 3 | 3 |

