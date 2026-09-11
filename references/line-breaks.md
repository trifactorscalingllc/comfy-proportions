# Line breaks that read well

A section description that wraps as "The numbers, the replies and the calls all come back to / you." is
not a copy problem. It is a layout problem: the browser broke the line at the last possible point and
left one word alone. Four rules stop it, in this order.

## 1. Balance headings, pretty paragraphs

```css
h1, h2, h3, .lede { text-wrap: balance; }   /* equal-length lines for short blocks */
p, li, figcaption   { text-wrap: pretty; }   /* no single-word last lines in long blocks */
```

`balance` re-flows a block of up to six lines so every line is about the same length. Use it on
headings and short ledes. `pretty` costs more, works on any length, and its one job is to stop the
last line being a lone word. Both are safe: a browser that does not know them ignores them. Set
them once on the wrapper's type rules, not per element.

## 2. Give the text a measure, not the page

A description under a centred heading should never run the width of the section. Cap it with a
`max-width` in `ch` (or `em`) on the text element itself: 60 to 70ch for body, 40 to 50ch for a
lede. A lede that is one line at 1440 and two lines at 1200 with a lone word is a lede with no
measure.

## 3. Break where the sentence breaks

When a description is two sentences, the natural break is the full stop. Split it into two blocks
(`<span style="display:block">` per sentence) so the second sentence starts its own line at every
width. Never let a sentence break mid-thought when a full stop is available. The site's `Lines`
helper does exactly this; the rule is the same in any framework: split on `(?<=[.!?])\s+`.

## 4. Glue the last two words

If a line can still end on one short word (you, it, us, now), join the last two words with a
non-breaking space when rendering: `text.replace(/ (\S+)$/, ' $1')`. The browser then has to
bring two words down together, which reads as intended instead of orphaned. Apply it to ledes and
captions, not to headings that already balance.

## What to check

At 1440, 1280, 992 and 390: no lede or card paragraph ends in a one-word line; no heading has a
last line shorter than a third of the one above it; no sentence starts in the last four characters
of a line. The audit script prints text blocks whose last line is a single word when run with
`--orphans`.
