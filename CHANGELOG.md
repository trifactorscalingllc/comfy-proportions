# Changelog

## 0.1.2 (2026-09-11)

- line-breaks rule 3: sentence blocks only for exactly two sentences; three or more flow.

## 0.1.1 (2026-09-11)

- references/line-breaks.md: balance, pretty, measure, sentence blocks, last-word glue.
- templates/comfy.css: the line-break rules.


All notable changes to Comfy Proportions are recorded here.

## [0.1.0] 2026-09-11

First release.

### Added

- `SKILL.md`: the ten rules, the procedure, and pointers to the references and templates.
- `references/principles.md`: the method in depth, with the root-size math and a worked re-derivation.
- `references/leftclick-teardown.md`: the studied reference, every fact cited to a selector in `styles.css`.
- `references/priority-plus-nav.md`: the Priority+ pattern, the collapse-width rule, markup and state guidance.
- `references/progressive-disclosure.md`: what hides first, what never hides, dropdown and dialog notes.
- `templates/comfy.css`: drop-in stylesheet with the guarded root, em type scale, two breakpoints, 4/2/1 grids, Priority+ nav and a theme-toggle scaffold.
- `templates/example.html`: a small page that uses the template, useful as an audit fixture.
- `scripts/audit.mjs`: Playwright audit that measures root size, h1 ratio, hero height, wrapping calls to action, horizontal overflow, grid column counts and hamburger visibility at a list of widths.
- `examples/trifactorscaling-before.md`: a saved audit of a fixed-px site, the "before" half of a before/after.
