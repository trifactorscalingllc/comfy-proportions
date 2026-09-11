# LeftClick teardown

The studied reference is the stylesheet of leftclick.ai, fetched 2026-09-11. It is one minified file of 347 rules. Every fact below is cited to a selector in that file. Facts about behaviour (the menu toggle, the theme choice) are cited to the site's `interactions.js` and the inline script in its home page. The numbers in the last section were measured with `scripts/audit.mjs` on the same day.

## The root

```css
.leftclick-body { font-size: 1.25vw; line-height: 130%; font-family: Dmsans, Arial, sans-serif; }
```

One value on the body. Every other size on the page is a multiple of it. `1.25vw` is 12.4px at 992, 16px at 1280, 18px at 1440, 24px at 1920.

This is the only `vw` value in the whole file. There is one `svh` value (the hero, below). There are no `clamp()` calls, no `min-width` queries and no `@container` queries.

## The type scale (em of the root)

| role | rule |
|---|---|
| h1 | `.h1{font-size:3.75em;font-weight:500;letter-spacing:-2px}` with `.h1,.h2{line-height:105%}` |
| h2 | `.h2{font-size:2.5em;font-weight:500;letter-spacing:-2px;width:auto;max-width:20em}` |
| h3 | `.h3{font-size:1.75em;font-weight:500;letter-spacing:-.02em;line-height:110%}` |
| h5 | `.h5{font-size:1.5em}` |
| lead | `.lead-text{font-size:1.1em;line-height:155%;color:rgba(0,0,0,.55)}` and `.lead-text.max-800{max-width:71.4286%}` |
| hero sub | `.hero-sub{font-size:1.05em;max-width:30em;margin:0 auto 1.5em;line-height:155%}` |
| body | `.p{font-size:1em;line-height:155%}` |
| stat | `.hero-stat-num{font-size:1.5em;font-weight:500;letter-spacing:-1px}` |
| stat label | `.hero-stat-label{font-size:.7em}` |
| eyebrow | `.super-headline{font-size:.7em;font-weight:500;letter-spacing:.12em;text-transform:uppercase}` |
| nav link | `.nav-link{font-size:.7em}` |
| header button | `.header-btn{font-size:.8em}` |
| hero button | `.hero-btn{font-size:1.1em}` |
| card title | `.process-step-title{font-size:1.25em}` and `.why-card-title{font-size:1.25em}` |
| footer link | `.footer-link{font-size:.9375em}` |

Line length is held on the text, in em: `.h2` at 20em, `.hero-sub` at 30em, `.hero-title` at `max-width:48em`, `.cta-sub` at 32em, `.legal-inner` at 42em.

## Spacing

| thing | rule |
|---|---|
| gutter | `.common-wrap{max-width:100%;padding-left:5em;padding-right:5em;width:100%}` (no max-width cap) |
| section | `.leftclick-section.about-section{padding-bottom:6em;padding-top:6em}`, same on `.case-studies-section`, `.about-us-section`, `.reviews-section`; `.why-section{padding:6em 0}`, `.training-section{padding:6em 0}`, `.cta-section{padding:6em 0}` |
| footer | `.leftclick-section.footer-section{padding-bottom:5em;padding-top:5em}` |
| header | `.leftclick-section.header-wrap{padding-bottom:.85em;padding-top:.85em}` |
| hero | `.leftclick-section.hero-wrap{min-height:calc(80svh - 5em);padding-bottom:4em;padding-top:6em}` |
| grid gap | `.process-steps{gap:1.5em}`, `.why-grid{gap:1.5em}`, `.case-studies-wrap{gap:1.5em;row-gap:2.5em}`, `.team-wrap{gap:2em}`, `.about-content-wrap{gap:3em}` |
| radius | `1em` on cards, thumbs and steps (`.process-step`, `.why-card`, `.case-studies-card-thumb`, `.about-thumb-img`) |
| footer divider | `.footer-divider{background-color:hsla(0,0%,100%,.1);height:1px;margin-top:5em;width:100%}` |
| logo | `.main-logo{width:5.5em}` |
| button | `.btn{border-radius:2em;font-size:1em;gap:1em;padding:.2em .25em .2em 1em}` with `.btn-icon-box{height:2.25em;width:2.25em}` |
| menu control | `.menu-btn{height:48px;width:48px;padding:8px;gap:6px}` (px on purpose: a hit target) |

## The two breakpoints

| query | blocks | rules | what |
|---|---|---|---|
| `@media screen and (max-width:991px)` | 3 | 52 (2 + 3 + 47) | the collapse: root, nav, type, spacing, every grid |
| `@media (max-width:768px)` | 1 | 5 | process steps to one column, case-study page stacks |

Both are `max-width`. The desktop rules are the base and the two queries are the exceptions.

## What changes at 991px

| thing | above | at 991 and below |
|---|---|---|
| root | `1.25vw` | `.leftclick-body{font-size:16px}` |
| gutter | `5em` | `.common-wrap{padding-left:20px;padding-right:20px}` |
| header | `.85em` | `.leftclick-section.header-wrap{padding-bottom:20px;padding-top:20px}` |
| h1, h2 | `3.75em`, `2.5em` | `.h1,.h2{font-size:36px;letter-spacing:-1px}`, `.h2{width:70%}` |
| h3 | `1.75em` | `.h3{font-size:32px}` |
| h5 | `1.5em` | `.h5{font-size:24px}` |
| lead | `1.1em` | `.lead-text{font-size:20px}`, `.lead-text.max-800{max-width:100%}` |
| eyebrow | `.7em` | `.super-headline{font-size:13px}` |
| hero | `min-height:calc(80svh - 5em)` | `.leftclick-section.hero-wrap{min-height:auto;padding-bottom:32px;padding-top:48px}` |
| hero button | `1.1em` | `.hero-btn{font-size:16px}` |
| sections | `6em` | `padding-bottom:48px;padding-top:48px` on about-us, case-studies, footer, reviews; `.why-section{padding:48px 0}`; `.cta-section{padding:48px 0}` |
| footer divider | `margin-top:5em` | `.footer-divider{margin-top:40px}` |
| nav | links and button in the bar | `.header-btn,.nav-wrap{display:none}` and `.menu-btn{display:flex}` |
| logo | `5.5em` | `.main-logo{width:9em}` |
| hero background | image | `.dark-mode .hero-bg-img{display:none}` is dark-only; `.absolute-full.img-cover{display:none}` at 991 |

Note the seam. At 992px the root is 12.4px. At 991px it is 16px. Every size on the page jumps by 29 percent across one pixel of width.

## Navigation

Above the collapse the bar is `.header-inner{display:flex;justify-content:space-between}` holding `.main-logo`, `.nav-wrap{display:flex;gap:1.5em}` of `.nav-link`, and `.header-btn`. The control `.menu-btn` is `display:none`.

At 991 and below: `.header-btn,.nav-wrap{display:none}` and `.menu-btn{display:flex}`. The links and the button move into a panel:

```css
.mobile-menu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s ease;z-index:999}
.mobile-menu.open{opacity:1;pointer-events:auto}
.mobile-menu-link{font-size:28px;font-weight:500}
```

The control animates to a cross with `.menu-btn.active .menu-bar:first-child{transform:translateY(8px) rotate(45deg)}`, `:nth-child(2){opacity:0}`, `:nth-child(3){transform:translateY(-8px) rotate(-45deg)}`.

`interactions.js` toggles `.active` on the button and `.open` on the panel on click, and sets `document.body.style.overflow` to `hidden` while the panel is open and back to empty when it closes. A click on any `.mobile-menu-link` closes it. The button has `aria-label="Menu"`. It does not set `aria-expanded`, and there is no Escape handler; the skill adds both.

The header button is hidden at 991 and reappears only inside the panel. The skill keeps the call to action in the bar at every width (see `progressive-disclosure.md`).

## Grids

| grid | base | at 991 | at 768 |
|---|---|---|---|
| process steps | `.process-steps{grid-template-columns:repeat(4,1fr)}` | `1fr 1fr` | `1fr` |
| why cards | `.why-grid{grid-template-columns:repeat(4,1fr)}` | `1fr` | |
| team | `.team-wrap{grid-template-columns:repeat(3,1fr)}` | `1fr` (and `.team-item{flex-direction:row}` with `.team-thumb{width:8em}`) | |
| case studies | `.case-studies-wrap{grid-template-columns:repeat(3,1fr)}` | `1fr` | |
| services | `.service-card-wrap{grid-template-columns:1fr 1fr 1fr}` | `1fr` | |
| about | `.about-content-wrap{grid-template-columns:1fr 1fr}` | `1fr` | |
| training | `.training-inner{grid-template-columns:1fr 1fr}` | `1fr`, `.training-video{order:-1}` | |
| footer columns | `.footer-columns{display:flex;gap:4em}` | `flex-wrap:wrap;gap:32px` with `.footer-col{min-width:calc(50% - 16px)}` | |
| footer top | `.footer-top{display:flex;gap:4em}` | `flex-flow:column;gap:40px` | |

Only the process steps take the full 4/2/1 path. Every other grid goes straight to one column at 991. The skill's template gives three-column grids a two-up stage because a tablet has room for it.

## Theme

- The class is on the body: `.dark-mode.leftclick-body{background-color:#111113;color:#f0f0f2}`. Every dark rule is `.dark-mode <selector>`.
- The toggle is `button#darkToggle.dark-mode-toggle` (fixed, `bottom:1.5em;right:1.5em`, `2.75em` square) holding two SVGs, `.dark-mode-icon.sun` and `.dark-mode-icon.moon`. `.dark-mode .dark-mode-icon.sun,.dark-mode-icon.moon{display:none}` and `.dark-mode .dark-mode-icon.moon{display:block}` swap them.
- The inline script reads `localStorage.getItem('darkMode')`. It adds `.dark-mode` when the saved value is `'true'`, or when nothing is saved and `matchMedia('(prefers-color-scheme: dark)').matches`. The click handler toggles the class and saves `body.classList.contains('dark-mode')` under the key `darkMode`. The system preference is consulted only when nothing is saved.

## Measured (audit, 2026-09-11)

| width | root | h1 | h1/root | hamburger |
|---|---|---|---|---|
| 360 | 16px | 36px | 2.25x | yes |
| 768 | 16px | 36px | 2.25x | yes |
| 991 | 16px | 36px | 2.25x | yes |
| 992 | 12.4px | 46.5px | 3.75x | no |
| 1024 | 12.8px | 48px | 3.75x | no |
| 1280 | 16px | 60px | 3.75x | no |
| 1440 | 18px | 67.5px | 3.75x | no |
| 1920 | 24px | 90px | 3.75x | no |

Grids measured as 4/2/1 for `.process-steps` (4 at 992, 2 at 991, 1 at 768) and 4, 3, 3, 2, 2 to 1 at 991 for `.why-grid`, `.case-studies-wrap`, `.team-wrap`, `.about-content-wrap`, `.training-inner`. No horizontal overflow at any width. The hero is 71 to 74 percent of the viewport from 992 to 1440 and 99 percent at 1920, where the 24px root pushes the content past `80svh`.

Two footer links, "AI Lead Generation" and "CRM & Sales Automation", wrap to two lines at every width from 992 to 1920. `.footer-col{min-width:8em}` is too narrow for them at `.9375em`. Because the page is one proportion above the collapse, a wrap at 992 is the same wrap at 1920. The fix is an em value (the column's `min-width`), not a breakpoint.

## Limits of the raw approach

- A pure `vw` root ignores the user's font-size setting.
- It ignores browser zoom: zoom shrinks the viewport in CSS px, so the root shrinks by the factor the zoom enlarges it.
- It grows without limit: 24px at 1920, 32px at 2560.
- The seam pops: 12.4px at 992, 16px at 991.
- Two footer links wrap at every desktop width.
- The header call to action is hidden below 991 and lives only in the panel.

The skill's guarded root, `clamp(16px, 11.6px + 0.446vw, 22px)` with a fixed 16px below 991, keeps the site's proportions and fixes the first four. The template keeps the call to action in the bar. See `principles.md` for the derivation.

## What the skill keeps from LeftClick

One root on a wrapper. Everything in em. The type ratios (3.75, 2.5, 1.75, 1.1, 1, 1.5, .7). Two `max-width` breakpoints at 991 and 768. Gutter 5em with no max-width cap. Section 6em. Hero `80svh` minus the nav. Grids in `1fr` units that split at the collapse. Footer columns wrapping two-up. Hairline divider at 1px with a 5em margin. Px only for hit targets. A class-based theme with a saved choice and a system-preference fallback.
