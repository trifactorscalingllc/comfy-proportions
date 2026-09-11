# Comfy Proportions

**A Claude Code skill for pages that keep their proportions at every width.**

Set one font-size on a wrapper and size everything else in em, so the page is one drawing that scales. Guard that root with `clamp()` so zoom and wide screens behave. Use two breakpoints, both `max-width`. Split grids 4/2/1. Collapse the nav with Priority+ at the width where the items stop fitting, never by shrinking them. Hide small print first and the call to action never. Measure before and after with the bundled audit.

The method was extracted from the stylesheet of [leftclick.ai](https://leftclick.ai) (read 2026-09-11) and rests on three established ideas: Responsive Web Design, Priority+ navigation and progressive disclosure. See the credits below.

## Install

Claude Code, as a personal skill:

```bash
git clone https://github.com/trifactorscalingllc/comfy-proportions.git ~/.claude/skills/comfy-proportions
```

Or as a project skill, into `.claude/skills/comfy-proportions` inside the repo you are working on.

The audit script needs Node 18 or later and Playwright. It looks for Playwright next to the skill first, then in `COMFY_PLAYWRIGHT`, then in a shared install. If none is found it prints the install command:

```bash
cd ~/.claude/skills/comfy-proportions && npm i playwright && npx playwright install chromium
```

## Use

Say what is wrong and where:

```
/comfy-proportions https://example.com the nav gets crowded on a tablet
/comfy-proportions ./src/styles.css headings look wrong when I resize
```

Or just describe a responsive problem. The skill triggers on "responsive", "resize", "proportions", "breakpoints", "hamburger", "nav collapse", "fluid type", "looks wrong when I resize" and "Priority+".

Claude will run the audit on the page as it is, apply the ten rules in order, and run the audit again. The two reports are the before and after.

## What is inside

```
.
SKILL.md                              the ten rules, the procedure, how to read the audit
README.md, LICENSE, CHANGELOG.md
references/
  principles.md                       the method in depth, with the root math
  leftclick-teardown.md               the studied reference, every fact cited to a selector
  priority-plus-nav.md                the pattern, the collapse-width rule, markup and state
  progressive-disclosure.md           what hides first, what never hides, dropdowns, dialogs
templates/
  comfy.css                           drop-in stylesheet with the guarded root and the two breakpoints
  example.html                        a page that uses it; also the audit fixture
scripts/
  audit.mjs                           Playwright audit, markdown table, exit code
examples/
  trifactorscaling-before.md          an audit of a fixed-px site, saved as the "before"
```

## The ten rules

1. One root. Set `font-size` once on a wrapper; size everything else in em.
2. Guard the root: `clamp(16px, 11.6px + 0.446vw, 22px)`. A floor for zoom, a cap for wide screens.
3. Fixed 16px root at 991px and below, so the seam is 16 to 16.
4. Two breakpoints, desktop-first, both max-width: 991px and 768px.
5. Grids split 4/2/1 and 3/2/1; two goes straight to one.
6. Priority+ nav: show what fits, tuck the rest behind a control. Never shrink the items.
7. The call to action never wraps and never hides.
8. Hero in svh: `min-height: calc(80svh - var(--nav-h))`, `auto` below the collapse.
9. Spacing in em: gutter 5em, section 6em, gap 1.5em. Line length by `max-width` on the text.
10. Disclose in order, then re-measure.

## The audit

```bash
node scripts/audit.mjs <url> [--widths 360,480,768,991,992,1024,1280,1440,1920] [--out dir] [--height N] [--no-shots]
```

For each width it takes a full-page screenshot and reports the root font-size, the h1 size and h1/root ratio, the hero's share of the viewport, every link or button whose text wraps to two lines (tagged by region), horizontal overflow, the column count of every grid, and whether the hamburger is showing. It prints a markdown table, writes `<out>/report.md`, and exits 1 when a call to action wraps outside the footer or any width overflows.

The reference site, measured:

| width | root | h1 | h1/root | hamburger |
|---|---|---|---|---|
| 991 | 16px | 36px | 2.25x | yes |
| 992 | 12.4px | 46.5px | 3.75x | no |
| 1440 | 18px | 67.5px | 3.75x | no |
| 1920 | 24px | 90px | 3.75x | no |

One proportion above the collapse, a 29 percent pop at the seam, and a root that keeps growing. The template keeps the proportion and fixes the other two.

## Credits

- **LeftClick** ([leftclick.ai](https://leftclick.ai)) is the studied reference. Its stylesheet is the source of the ratios, the two breakpoints and the grid splits. Every fact taken from it is cited to a selector in `references/leftclick-teardown.md`.
- **Responsive Web Design.** Ethan Marcotte, A List Apart, 25 May 2010. Fluid grids, flexible images, media queries. [alistapart.com/article/responsive-web-design](https://alistapart.com/article/responsive-web-design/)
- **Priority+ navigation.** Coined by Michael Scharnagl (justmarkup.com) in 2012. Written up by Brad Frost in [Complex Navigation Patterns for Responsive Design](https://bradfrost.com/blog/post/complex-navigation-patterns-for-responsive-design/) (27 August 2012) and [Revisiting the Priority+ Pattern](https://bradfrost.com/blog/post/revisiting-the-priority-pattern/) (4 May 2015).
- **Progressive disclosure.** Jakob Nielsen, Nielsen Norman Group, 3 December 2006. [nngroup.com/articles/progressive-disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

## License

MIT. Copyright 2026 TriFactor Scaling LLC.
