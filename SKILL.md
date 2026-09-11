---
name: comfy-proportions
description: Make a page keep its proportions at every width. One guarded fluid root, everything in em, two breakpoints, 4/2/1 grids, Priority+ navigation, progressive disclosure, and a Playwright audit that measures the result. Use for anything "responsive", when a layout "looks wrong when I resize", or when the ask mentions breakpoints, fluid type, proportions, a hamburger, a nav collapse, or Priority+.
argument-hint: "<url-or-path> [what looks wrong]"
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
homepage: https://github.com/trifactorscalingllc/comfy-proportions
repository: https://github.com/trifactorscalingllc/comfy-proportions
author: trifactorscalingllc
license: MIT
user-invocable: true
---

# Comfy Proportions

A responsive-design method. Set one font-size on a wrapper and size everything else in em, so the page is one drawing that scales. Guard that root with `clamp()` so zoom and wide screens behave. Use two breakpoints, both `max-width`. Split grids 4/2/1. Collapse the nav with Priority+ at the width where the items stop fitting, never by shrinking them. Hide small print first and the call to action never. Measure before and after with the audit script.

The method was extracted from leftclick.ai's stylesheet (verified 2026-09-11) and rests on Marcotte's Responsive Web Design, the Priority+ navigation pattern, and Nielsen's progressive disclosure. Details and citations are in `references/`.

## When to use

- The user says a page is "responsive" work, or "looks wrong when I resize".
- The ask mentions breakpoints, fluid type, proportions, a hamburger, a nav collapse, or Priority+.
- A call to action wraps onto two lines, or a nav bar gets crowded at tablet widths.
- Headings and spacing drift apart across widths because they were set in px one by one.
- A new page needs a responsive foundation and there is no design system to inherit.

Do not use it to add a third breakpoint. If a layout needs one, the grid split or the disclosure order is wrong; fix that instead.

## The ten rules

1. **One root.** Set `font-size` once on a wrapper; size everything else in em.
2. **Guard the root.** `clamp(16px, 11.6px + 0.446vw, 22px)`: a floor for zoom, a cap for wide screens.
3. **Fixed root below the collapse.** 16px at 991px and below, so the seam is 16 to 16.
4. **Two breakpoints, desktop-first, both max-width.** 991px (collapse) and 768px (narrow). Nothing else.
5. **Grids split 4/2/1 and 3/2/1; two goes straight to one.** Use `minmax(0, 1fr)`.
6. **Priority+ nav.** Show what fits; tuck the rest behind a control at the width where the primary items stop fitting. Never shrink them to fit.
7. **The call to action never wraps and never hides.** `white-space: nowrap`, and it stays in the bar at every width.
8. **Hero in svh.** `min-height: calc(80svh - var(--nav-h))` above the collapse, `auto` below.
9. **Spacing in em, held by rhythm.** Gutter 5em, section 6em, gap 1.5em; line length by `max-width` in em on the text, not on the page.
10. **Disclose in order, then re-measure.** Small print and secondary links give way first, the primary action never. Run the audit after every change.

Two things stay in px on purpose: hairlines (1px dividers) and hit targets (48px controls).

## Procedure

Work through these in order. Each step ends with a number you can check.

1. **Measure.** Run the audit on the page as it is. Save the report; it is the "before".
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/audit.mjs" <url> --out ./comfy-audit
   ```
2. **Set the root.** Put the guarded `clamp()` on the wrapper (`.comfy`, or the page's own root class). Add the fixed 16px at `max-width: 991px`. If the design width is not 1440, re-derive the line (`references/principles.md`, section 2).
3. **Convert to em.** Type, padding, gaps, radii, logo and icon widths, heading `max-width`. The scale: h1 3.75em, h2 2.5em, h3 1.75em, lead 1.1em, body 1em, small 0.7em. Below the collapse: h1 and h2 2.25em, h3 2em, lead 1.25em.
4. **Pick the two breakpoints.** Keep 991 and 768 unless the nav's own collapse width (step 6) is wider; then the nav collapses at its width and the page keeps 991.
5. **Split the grids.** `.grid-4` 4/2/1, `.grid-3` 3/2/1, `.grid-2` 2/1. Footer columns wrap two-up at the collapse.
6. **Priority+ nav.** Measure the width at which logo, links, CTA and control stop fitting at intended size. Collapse there. One state (`aria-expanded`) owns the panel, the icon and the scroll lock. Escape closes. Hover only under `(hover: hover) and (pointer: fine)`. See `references/priority-plus-nav.md`.
7. **Hero in svh.** `min-height: calc(80svh - var(--nav-h))`; set `--nav-h` to the real header height. `auto` below the collapse.
8. **Spacing rhythm.** Gutter 5em, section 6em, gap 1.5em, radius 1em, divider margin 5em; at the collapse, 20px, 48px, 24px, and 40px (as em of 16px).
9. **Disclosure order.** Decide what gives way first: small print, secondary footer links, secondary nav items, decorative media, supporting columns, repeated CTAs. Never the primary CTA, the logo, the menu control, or the h1. See `references/progressive-disclosure.md`.
10. **Re-measure.** Run the audit again. Pass condition: constant h1/root ratio above the collapse, zero CTA wraps outside the footer, zero horizontal overflow, grids 4/2/1, hamburger `yes` at 991 and below and `no` above.

## The audit

```bash
node "${CLAUDE_SKILL_DIR}/scripts/audit.mjs" <url> [--widths 360,480,768,991,992,1024,1280,1440,1920] [--out dir] [--height N] [--no-shots]
```

For each width it takes a full-page screenshot and reports: the `html` font-size; the font-size of the first `[data-comfy-root], .comfy, .v2, body`; the h1 size and h1/root ratio; the hero's height as a share of the viewport (`[data-hero]`, else `header + section`, else the first `section`); every `a` or `button` whose text wraps to two lines, tagged `nav:`, `hero:`, `main:` or `footer:`; horizontal overflow; the column count of every grid with more than one child, grouped by class; and whether a hamburger (`button[aria-label*="menu" i], .menu-btn, .v2-menu-button`) is visible.

It prints a markdown table, writes it to `<out>/report.md`, and exits 1 if a call to action wraps outside the footer or any width overflows. Footer wraps are listed but do not fail the run; footer links are secondary and may wrap first. `file://` URLs work, so you can audit a local page.

Playwright is resolved from a local install first, then `COMFY_PLAYWRIGHT`, then `/Users/tfs/tom/node_modules/playwright`. If none is found the script says how to install it (`npm i playwright && npx playwright install chromium`).

Read the table like this:

| column | good | bad |
|---|---|---|
| root | rises smoothly above 991, flat 16px below | jumps at the seam, or fixed px everywhere |
| h1/root | one constant above the collapse | changes from width to width |
| hero | 60 to 85 percent above the collapse | 0 percent (empty first section) or over 100 |
| CTA wraps | 0, or footer only | any `nav:` or `hero:` entry |
| overflow | none | any px |
| grids | 4, 2, 1 across the widths | a 4 that stays 4 at 360 |
| hamburger | no above 991, yes at and below | yes at 1280, or no at 768 |

## Files

- `templates/comfy.css`: drop-in stylesheet. Put `.comfy` on the wrapper. Tokens at the top, the two queries written out in full, a theme-toggle and menu scaffold in the closing comment.
- `templates/example.html`: a page that uses the template; also the fixture the audit was proven on.
- `references/principles.md`: the method in depth, with the root math and a worked re-derivation.
- `references/leftclick-teardown.md`: the studied reference, each fact cited to a selector.
- `references/priority-plus-nav.md`: the pattern, the collapse-width rule, markup and state.
- `references/progressive-disclosure.md`: what hides first, what never hides, dropdown and dialog notes.
- `examples/trifactorscaling-before.md`: an audit of a fixed-px site, saved as the "before".

## Notes

- A pure `vw` root (the studied site's raw form) ignores user font-size settings and browser zoom, and grows without limit. The guarded form fixes all three. Say so if a user asks why not just `1.25vw`.
- To honour the user's font-size setting, put the floor and intercept in rem: `clamp(1rem, 0.725rem + 0.446vw, 1.375rem)`.
- With one proportion above the collapse, a wrap at 992px is a wrap at 1920px. Fix the em value, not the width.
