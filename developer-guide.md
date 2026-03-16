# /* === ELEMENTOR DEVELOPER QUICK GUIDE === */

## Animation System — Technical Reference

### Files
| File | Size (unmin) | Paste location |
|------|-------------|----------------|
| `animations.css` | ~1.5 KB | Elementor > Custom CSS **or** child theme `style.css` |
| `animations.js`  | ~2.7 KB | Elementor Pro > Custom Code (Footer) **or** `functions.php` via `wp_footer` |

---

### Data Attributes API

```html
<!-- Single element — choose one animation value -->
<div data-animate="fade-up">…</div>
<div data-animate="fade-left">…</div>
<div data-animate="fade-right">…</div>
<div data-animate="scale-in">…</div>
<div data-animate="blur-in">…</div>
<div data-animate="clip-up">…</div>

<!-- Delay override (ms); stacks on top of any group stagger -->
<div data-animate="fade-up" data-animate-delay="200">…</div>

<!-- Group: staggers every direct child that has data-animate.
     If NO children have data-animate, auto-applies fade-up to ALL. -->
<div data-animate-group>
  <div data-animate="scale-in">Card 1</div>
  <div data-animate="scale-in">Card 2</div>
  <div data-animate="scale-in">Card 3</div>
</div>

<!-- Re-animate every time the element enters the viewport -->
<div data-animate="fade-up" data-animate-once="false">…</div>
```

---

### Adding Attributes in Elementor

1. Select any widget in the Elementor editor.
2. Open the **Advanced** tab (top-right of the panel).
3. Scroll to **Custom Attributes**.
4. Click **+ Add Row**.
5. **Key** column → type the attribute name (e.g. `data-animate`).
6. **Value** column → type the value (e.g. `fade-up`).
7. For boolean attributes like `data-animate-group`, leave the Value column **empty**.

> Elementor renders custom attributes directly on the widget's wrapper `<div>`,
> which is exactly what the observer watches.

---

### 3-Column Feature Card Example

```html
<!-- In an Elementor HTML widget or via Custom Attributes on the row: -->
<div class="elementor-row" data-animate-group>

  <!-- Each column/card inherits stagger from the parent group -->
  <div class="elementor-col-33" data-animate="scale-in">
    <!-- card content -->
  </div>

  <div class="elementor-col-33" data-animate="scale-in">
    <!-- card content -->
  </div>

  <div class="elementor-col-33" data-animate="scale-in">
    <!-- card content -->
  </div>

</div>
<!-- Result: Card 1 fires at 0 ms, Card 2 at 80 ms, Card 3 at 160 ms -->
```

---

### Timing Customisation (CSS only)

Edit the `:root` block at the top of `animations.css`:

```css
:root {
  --sg-duration:   0.65s;   /* ← animation length   */
  --sg-ease:       cubic-bezier(0.16, 1, 0.3, 1);  /* ← easing  */
  --sg-distance:   36px;    /* ← travel distance    */
}
```

Per-group stagger step: change `STAGGER_STEP` at the top of `animations.js`:
```js
var STAGGER_STEP = 80;  /* ms between siblings */
```

---

### Observer Settings (JS)

```js
var IO_OPTIONS = {
  threshold:  0.12,            /* 12% of element visible → trigger */
  rootMargin: '0px 0px -40px 0px'  /* fire 40px before bottom edge */
};
```

Increasing `threshold` to `0.2` makes animations fire later (more of the
element must be visible first). Decrease `rootMargin`'s bottom value (e.g.
`-100px`) to fire even earlier.

---

### Performance Checklist
- [x] Single `IntersectionObserver` instance for all elements
- [x] `will-change` applied immediately before animation, removed on `transitionend`
- [x] Only `opacity`, `transform`, `filter`, `clip-path` animated (no layout props)
- [x] `requestAnimationFrame` wraps every class addition
- [x] `observer.unobserve()` called after fire-once elements animate
- [x] `MutationObserver` catches Elementor lazy-rendered sections
- [x] Zero scroll event listeners
- [x] `prefers-reduced-motion` respected at both CSS and JS layers
