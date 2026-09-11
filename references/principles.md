# Comfy Proportions: the method in depth

A page that "looks wrong when I resize" almost always has two problems. Its sizes were set one by one in px, so they drift apart as the window changes. And its layout has more breakpoints than it has decisions. This method fixes both. One root, everything in em, two breakpoints, and a fixed order for what gives way first.

The method was extracted from the stylesheet of leftclick.ai (see `leftclick-teardown.md`). It rests on three older ideas:

- Responsive Web Design (Ethan Marcotte, A List Apart, 2010): fluid grids, flexible media, media queries.
- Priority+ navigation (Michael Scharnagl, written up by Brad Frost): show what fits, tuck the rest behind a control.
- Progressive disclosure (Jakob Nielsen, Nielsen Norman Group): show the primary things first, reveal the rest on demand.

## 1. One proportion

Set `font-size` once, on a wrapper element. Size everything else in `em`: type, padding, gaps, radii, widths of logos and icons, the max-width of headings. The page becomes one drawing. When the root changes, every part changes by the same factor and nothing drifts.

This is the fluid grid from Marcotte's article, applied to more than columns. Column widths are fractions (`1fr`), media is `max-width: 100%`, and the rest of the spacing is in em of the root.

Two things stay outside the proportion on purpose. Hairlines (`1px` borders and dividers) and hit targets (`48px` buttons) are set in px because they should not scale.

## 2. The root

### The raw form

The studied site uses `font-size: 1.25vw` on the body above 991px. At 1280px wide that is 16px. Every size on the page is a multiple of it.

| viewport | 1.25vw |
|---|---|
| 992px | 12.4px |
| 1280px | 16px |
| 1440px | 18px |
| 1920px | 24px |
| 2560px | 32px |

The raw form has three faults.

1. It ignores the user's font-size setting. `vw` is not `rem`.
2. It ignores browser zoom. Zooming in shrinks the viewport in CSS px, so the root shrinks by the same factor the zoom enlarges it. The page does not get bigger.
3. It grows without limit. At 2560px the body text is 32px.

And at the seam it pops: 12.4px at 992px, then a fixed 16px at 991px. That is a visible jump of 29 percent in every size on the page.

### The guarded form

Wrap the fluid value in `clamp()` with a floor and a cap, and put a fixed root below the collapse width so the seam is flat.

```css
.comfy { font-size: clamp(16px, 11.6px + 0.446vw, 22px); }
@media (max-width: 991px) { .comfy { font-size: 16px; } }
```

| viewport | root |
|---|---|
| 991px and below | 16px (fixed) |
| 992px | 16.0px |
| 1280px | 17.3px |
| 1440px | 18.0px |
| 1920px | 20.2px |
| 2332px and above | 22px (cap) |

The seam is 16 to 16. The floor makes zoom work again (a zoomed-in viewport hits the 16px floor, which zooms with the page). The cap stops the runaway on wide screens.

### Re-deriving the line

The middle term of the clamp is a straight line through two points: the root you want at the collapse width, and the root you want at your design width.

Let the points be (w1, r1) and (w2, r2), in px.

```
slope     m = (r2 - r1) / (w2 - w1)          px of root per px of viewport
intercept b = r1 - m * w1                     px
vw term     = m * 100                         because 1vw = w / 100
```

The result is `clamp(r1, b + (m * 100)vw, cap)`.

Worked example, the numbers in the template. Points (992, 16) and (1440, 18).

```
m = (18 - 16) / (1440 - 992) = 2 / 448 = 0.004464
b = 16 - 0.004464 * 992     = 16 - 4.43   = 11.57  (round to 11.6)
vw term = 0.4464vw           (round to 0.446vw)
```

So `clamp(16px, 11.6px + 0.446vw, 22px)`. Check: at 1920, 11.6 + 0.446 * 19.2 = 20.2px. The cap of 22px is reached at (22 - 11.6) / 0.00446 = 2332px.

Second example, a denser site: 16px at the collapse, 17px at a 1280 design width, cap 20px.

```
m = (17 - 16) / (1280 - 992) = 1 / 288 = 0.003472
b = 16 - 0.003472 * 992      = 12.56
clamp(16px, 12.56px + 0.347vw, 20px)
```

Pick the cap as the largest body size you are willing to read at a desk. 20px to 22px is the usual range.

### Honouring the user's font-size setting

The px form matches the studied site. If you want the user's browser setting to count, put the floor and the intercept in rem:

```css
.comfy { font-size: clamp(1rem, 0.725rem + 0.446vw, 1.375rem); }
```

At the default 16px setting this is the same line. At a 20px setting the whole page grows by a quarter.

## 3. The type scale

All in em of the root. These are the studied site's ratios.

| role | size | line-height | notes |
|---|---|---|---|
| h1 | 3.75em | 1.05 | tight letter-spacing |
| h2 | 2.5em | 1.05 | `max-width: 20em` keeps line length |
| h3 | 1.75em | 1.1 | |
| lead | 1.1em | 1.55 | muted colour |
| body | 1em | 1.55 | |
| stat number | 1.5em | | |
| small, eyebrow | 0.7em | | eyebrow: uppercase, `letter-spacing: .12em` |

At an 18px root the h1 is 67.5px, the lead is 19.8px, the eyebrow is 12.6px. At 16px they are 60, 17.6 and 11.2. The ratios never change.

Below the collapse the scale is too big for a phone. Set the headings again, still in em of the now-fixed 16px root: h1 and h2 `2.25em` (36px), h3 `2em` (32px), lead `1.25em` (20px), eyebrow `0.8125em` (13px). The studied site sets these in px. Em of a 16px root gives the same pixels and still zooms.

## 4. Two breakpoints, desktop-first

Both are `max-width`. Both are decisions, not device sizes.

- **991px, the collapse.** The nav collapses, the root goes fixed, the gutter and section padding go fixed, the hero stops filling the viewport, and every grid takes its first split. 52 of the studied site's 57 media-query rules live here.
- **768px, the narrow.** The last grid split, from two columns to one. 5 rules.

Why max-width and not min-width: the design was drawn at a desktop width, so the desktop rules are the base and the two queries are exceptions. There is no mobile-first cascade to keep in your head.

Why only two: every extra breakpoint is a place where sizes can drift apart. With one proportion above the collapse, the page at 1024 and the page at 1920 are the same drawing. The audit shows this: the h1/root ratio is a constant across the whole range.

## 5. What changes at the collapse

| thing | above 991 | at 991 and below |
|---|---|---|
| root | `clamp(16px, 11.6px + 0.446vw, 22px)` | `16px` |
| gutter | `5em` | `1.25em` (20px) |
| section padding | `6em` | `3em` (48px) |
| hero | `min-height: calc(80svh - var(--nav-h))` | `min-height: auto` |
| nav | links in a row, CTA in the bar | links tucked behind the control, CTA stays |
| logo | `5.5em` | `6em` (the studied site uses `9em`, but it also hides its CTA) |
| footer columns | flex row, `gap: 4em` | wrap two-up, `min-width: calc(50% - 1em)` |
| divider margin | `5em` | `2.5em` (40px) |

## 6. Grids: 4/2/1, 3/2/1, 2/1

```css
.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (max-width: 991px) {
  .grid-4, .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-2 { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 768px) {
  .grid-4, .grid-3 { grid-template-columns: minmax(0, 1fr); }
}
```

Four goes to two, then one. Three goes to two, then one. Two goes straight to one. The studied site sends its three-column grids straight to one at 991; the template keeps a two-up stage because a tablet at 800px has room for it. Use `minmax(0, 1fr)` rather than `1fr` so a long word cannot widen a column and cause overflow.

## 7. Navigation

See `priority-plus-nav.md`. The short version: the primary items are shown at full size for as long as they fit. At the width where they stop fitting, they go behind a control. They are never shrunk to make them fit. The primary call to action stays in the bar with `white-space: nowrap`.

## 8. The hero in svh

```css
.hero { min-height: calc(80svh - var(--nav-h)); padding-top: 6em; padding-bottom: 4em; }
@media (max-width: 991px) { .hero { min-height: auto; padding-top: 3em; padding-bottom: 2em; } }
```

`svh` is the small viewport height: the height with the browser's bars showing. It does not jump when a phone's address bar hides, which `vh` does. Subtracting the nav height puts the fold at 80 percent of the window with the header on top. Below the collapse the hero is as tall as its content.

## 9. Spacing rhythm

Gutter `5em`, section `6em`, gap `1.5em`, radius `1em`, divider margin `5em`. There is no max-width on the content column. The gutter grows with the root, so at 1920 the content is 1920 minus two gutters of 101px. Line length is held by `max-width` on the text itself, in em: h2 `20em`, hero sub `30em`, lead `71%` of its column. That is what keeps a wide screen from producing long lines.

## 10. Disclosure order

See `progressive-disclosure.md`. In one line: small print and secondary links give way first, then secondary nav items, then the hero image, then supporting columns. The primary call to action, the logo, and the menu control never give way.

## 11. Measure, change, measure again

`scripts/audit.mjs` loads a page at a list of widths and prints the numbers that matter: the root size, the h1/root ratio, the hero's share of the viewport, whether any call to action wraps, whether anything overflows sideways, the column count of every grid, and whether the hamburger is showing. Run it before you touch anything, then after every change. A good result is a constant h1/root ratio above the collapse, zero wraps outside the footer, zero overflow, and grids that go 4/2/1.
