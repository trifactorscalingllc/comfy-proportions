# Priority+ navigation

The pattern was coined by Michael Scharnagl (justmarkup.com, 2012) and written up by Brad Frost in "Complex Navigation Patterns for Responsive Design" (2012) and "Revisiting the Priority+ Pattern" (2015). The idea in one line: show the navigation items that fit, in priority order, and tuck the rest behind a control. Do not shrink the items to make more of them fit.

The hamburger-at-one-width version, which the studied site uses, is the simplest case of the pattern. All items fit above the collapse width; none of them fit below it; the control takes over. The full pattern moves items behind the control one at a time as the width shrinks.

## The collapse-width rule

The collapse width is the width at which the primary items stop fitting at their intended size. It is measured, not chosen.

Add up, at the intended size: logo width, the gap after it, each primary link and the gap between them, the call to action, and the space the control will take. Compare that to the content width (viewport minus two gutters) as the viewport shrinks. The first width at which the sum is larger than the content width is the collapse. Round it to a whole number and use it as your one `max-width` query.

The studied site has two links and one call to action, and collapses at 991px. That is early for two links. It collapses there because the whole page collapses there: the root goes fixed, the grids split, the hero stops filling the viewport. One seam for everything is easier to reason about than several. If your nav has more items, the nav's own collapse width may be wider than the page's; use the wider one for the nav and keep the page seam where it is.

Two rules that follow from this:

- The items never shrink. `font-size: 0.7em` for links and `0.8em` for the CTA are their intended sizes at every width where they are shown. If they do not fit, they go behind the control. Do not add a query that makes them `0.6em` first.
- The call to action never wraps. `white-space: nowrap` on it, and on each link.

## Markup

```html
<header class="nav wrap">
  <a class="nav-logo" href="/" aria-label="Home"><img src="logo.svg" alt=""></a>

  <nav aria-label="Primary">
    <ul class="nav-links">
      <li><a class="nav-link" href="/services">Services</a></li>
      <li><a class="nav-link" href="/work">Work</a></li>
      <li><a class="nav-link" href="/about">About</a></li>
    </ul>
  </nav>

  <a class="btn nav-cta" href="/book">Book a call</a>

  <button class="menu-btn" type="button"
          aria-label="Menu" aria-expanded="false" aria-controls="menu-panel">
    <span class="menu-bar"></span>
    <span class="menu-bar"></span>
    <span class="menu-bar"></span>
  </button>
</header>

<div class="menu-panel" id="menu-panel" data-open="false">
  <nav aria-label="Primary, collapsed">
    <a class="nav-link" href="/services">Services</a>
    <a class="nav-link" href="/work">Work</a>
    <a class="nav-link" href="/about">About</a>
    <a class="nav-link" href="/book">Book a call</a>
  </nav>
</div>
```

The links appear twice: once in the bar and once in the panel. Only one copy is visible at any width. The call to action appears in the bar at every width and again in the panel, so it is reachable both ways.

## State

One piece of state owns everything: `aria-expanded` on the button. The panel's visibility, the button's icon, and the body scroll lock all follow from it.

```js
const btn = document.querySelector('.menu-btn');
const panel = document.getElementById(btn.getAttribute('aria-controls'));

function setOpen(open) {
  btn.setAttribute('aria-expanded', String(open));
  panel.dataset.open = String(open);
  document.body.classList.toggle('menu-open', open);
  if (!open) btn.focus();
}

btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setOpen(false);
});
window.matchMedia('(min-width: 992px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
```

```css
.menu-panel { position: fixed; inset: 0; opacity: 0; pointer-events: none; transition: opacity .3s ease; }
.menu-panel[data-open="true"] { opacity: 1; pointer-events: auto; }
.menu-open { overflow: hidden; }
```

The rules behind it:

- **One state.** Never toggle a class on the panel and a class on the button separately. They drift.
- **Escape closes.** And focus returns to the button, so a keyboard user is back where they started.
- **A link click closes.** In-page anchors would otherwise leave the panel over the content.
- **Crossing the collapse width closes.** A panel left open while the window grows past 991px sits over a page that already shows the links.
- **Body scroll is locked while open.** The studied site sets `document.body.style.overflow = 'hidden'`. A class is easier to see in the inspector.
- **Hover only where hover exists.** Hover styles go under `@media (hover: hover) and (pointer: fine)`. On touch, the first tap would otherwise show the hover state and the second tap would follow the link. Elsewhere, tap toggles.

## Dropdowns in the bar

If a primary item opens a submenu, the same rules apply to it. A button with `aria-expanded` and `aria-controls`, not a link. Open on click, and on hover only under `(hover: hover) and (pointer: fine)`, with a short close delay (about 150ms) so the pointer can cross the gap. Escape closes and returns focus. Only one submenu open at a time. Below the collapse, submenus become plain sections of the panel.

## The full pattern (items move one at a time)

When the nav has many items of unequal priority, do not collapse all of them at once. Order the list by priority, measure, and move the lowest-priority item into a "More" control until the rest fit.

```js
const list = document.querySelector('.nav-links');
const more = document.querySelector('.nav-more');       // <li> with a button and a hidden <ul>
const moreList = more.querySelector('ul');

function fit() {
  // put everything back
  while (moreList.firstElementChild) list.insertBefore(moreList.firstElementChild, more);
  more.hidden = true;
  // move the last item until the row fits on one line
  while (list.scrollWidth > list.clientWidth && list.children.length > 2) {
    more.hidden = false;
    moreList.prepend(more.previousElementSibling);
  }
}
new ResizeObserver(fit).observe(list);
```

Items keep their size. The control absorbs the ones that do not fit, lowest priority first. The call to action is not in this list; it stays in the bar.

## Checks

Run `scripts/audit.mjs`. At every width above the collapse the hamburger column should read `no` and the CTA-wraps column should read `0`. At every width at or below it the hamburger column should read `yes`. A `nav:` entry in the CTA-wraps column at any width is the nav's collapse width being too narrow.
