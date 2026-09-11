# Progressive disclosure

Jakob Nielsen's term, from the Nielsen Norman Group. Show people the few things they need first. Reveal the rest when they ask for it or when there is room for it. On a responsive page "room" is width, and "asking" is a tap or a click.

The order matters more than the mechanism. Decide what gives way first, what gives way last, and what never gives way. Then the breakpoints write themselves.

## What hides first

In this order, as the width shrinks:

1. **Small print.** Copyright lines, legal links, "made with" credits. They can move below a divider, shrink to one line, or go.
2. **Secondary footer links.** Sitemap-style columns wrap two-up, then stack. A column with more than five links can collapse behind its heading.
3. **Secondary nav items.** Anything that is not a primary destination goes behind the control first. In the full Priority+ pattern this is one item at a time; in the simple case it is all of them at the collapse width.
4. **Decorative media.** A hero background image can go (the studied site hides it below the collapse and shows a plain background). A supporting illustration in a two-column block can go or move below the text.
5. **Supporting columns.** A stats row wraps. A four-column grid becomes two, then one. Cards that were side by side stack.
6. **Repeated calls to action.** If a page has the same button in four places, three of them can go on a phone. One stays.

## What never hides

- **The primary call to action.** It stays visible in the bar at every width, never wraps, and never shrinks below its intended size. The studied site hides its header button below 991px and moves it into the panel; this skill keeps it in the bar and duplicates it in the panel.
- **The logo, as the link home.**
- **The menu control.** Once the nav collapses, the control is the only way to the links. It has a visible label or an `aria-label`, and a 48px hit area.
- **The h1 and the first paragraph.** They are why the page exists.
- **Anything a person is in the middle of.** A form they are filling, a step they are on, an error they need to read.

If something is hidden at every width, it is not disclosure. Delete it.

## Mechanisms

- **`display: none`** for things that should not exist at a width. The helper classes `.hide-collapse` and `.hide-narrow` in the template do this. Never put them on the primary call to action.
- **The `hidden` attribute** for things that toggle at runtime. It is a single source of truth that CSS and JavaScript both respect.
- **Reflow** for things that should still be there: `flex-wrap`, a grid split, `order: -1` to move media above text.
- **A control** for things that should be there on request: the menu button, a "More" item, a details/summary block, a dialog.

Do not hide with `opacity: 0` alone. The content is still there for screen readers and the keyboard. Pair it with `pointer-events: none` and `visibility: hidden`, or use `hidden`.

## Dropdowns

- A dropdown is opened by a `button` with `aria-expanded` and `aria-controls`, not by a link.
- It opens on click. It also opens on hover, but only under `@media (hover: hover) and (pointer: fine)`, and it closes with a delay of about 150ms so the pointer can cross the gap.
- Escape closes it and returns focus to the button.
- Only one dropdown is open at a time.
- Below the collapse it becomes a plain section of the panel. No nested menus on a phone.

## Dialogs

Use the native `<dialog>` element and open it with `showModal()`. That gives you a focus trap, Escape to close, and an inert page behind it for free.

```html
<dialog id="book" class="dialog">
  <form method="dialog">
    <h2>Book a call</h2>
    ...
    <button value="cancel">Close</button>
  </form>
</dialog>
```

```js
const dlg = document.getElementById('book');
document.querySelector('[data-open="book"]').addEventListener('click', () => {
  dlg.showModal();
  document.body.classList.add('menu-open');   // same scroll lock as the menu
});
dlg.addEventListener('close', () => document.body.classList.remove('menu-open'));
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // backdrop click
```

```css
.dialog { width: min(40em, calc(100vw - 2.5em)); max-height: 90svh; overflow: auto; border: 0; border-radius: 1em; padding: 2em; }
.dialog::backdrop { background: rgba(0, 0, 0, .5); }
```

- **`showModal()`, not `show()`.** Only the modal form traps focus and makes the page behind it inert.
- **Lock body scroll** while it is open, the same way as the menu.
- **Backdrop click closes.** A click whose target is the dialog element itself (not its contents) is a click on the backdrop.
- **`max-height: 90svh` with `overflow: auto`.** A tall dialog scrolls inside itself. It never grows past the small viewport, so the close button is always on screen.
- **Width in em, capped by the viewport.** `min(40em, calc(100vw - 2.5em))` keeps a gutter on a phone.
- **Return focus.** `<dialog>` does this on `close()` for you when opened with `showModal()`.

## Checks

Run `scripts/audit.mjs` at 360px. The hamburger column should read `yes`, the CTA-wraps column should have no `nav:` or `hero:` entry, and the overflow column should read `none`. Then open the page at 360px by hand and confirm the primary call to action is on screen without scrolling.
