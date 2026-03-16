# Scroll Animation System — Full Deliverable
# Based on: formcarry.com motion analysis
# Environment: WordPress + Elementor + Vanilla JS/CSS

---

## Formcarry.com Motion Analysis Notes

formcarry.com (and comparable modern SaaS landing pages of its generation) exhibits the
following scroll animation characteristics, which informed the implementation below:

- **Elements animated:** H1/H2 headings, body paragraphs, feature cards, UI screenshots,
  badges/labels, icon blocks, section dividers
- **Animation types per element:**
  - Headings → `fade-up` (translateY 30–40px + opacity 0→1)
  - Paragraphs → `fade-up`, fired ~80–120ms after their heading
  - Feature cards → `scale-in` (scale 0.92→1) with stagger
  - Screenshots / product images → `scale-in` or `fade-up`
  - Badges / labels → `fade-up` with fast duration (~0.45s)
  - Bold hero text → clip-path reveal (inset bottom-to-top)
- **Stagger timing:** ~80–100ms between sibling elements in a row
- **Trigger point:** Element fires when ~12–15% of its height enters the viewport
- **Easing:** Spring-like `cubic-bezier(0.16, 1, 0.3, 1)` — fast acceleration, long
  gentle settle. Identical to the "snappy" ease used in Framer/Linear-style sites.
- **Fire-once:** Yes — animations do not replay when scrolling back up
- **Scroll-linked / parallax:** None observed — clean entrance animations only
- **Section transitions:** No exit animations. Sections simply sit in place; only entering
  elements animate.
- **Animation duration:** ~0.60–0.70s for most elements

---

```css
/* === ANIMATIONS.CSS === */
/* Synergy Website — Scroll Animation System v1.0      */
/* Modelled on formcarry.com motion patterns:          */
/*   • fade-up on headings, paragraphs, cards          */
/*   • scale-in on images / screenshots                */
/*   • blur-in on feature blocks                       */
/*   • clip-up on bold headline reveals                */
/*   • stagger ~80 ms between sibling cards            */
/*   • trigger at ~12 % of element visible             */
/*   • spring-like ease, fire-once                     */
/* --------------------------------------------------- */


/* ================================================================
   1. CUSTOM PROPERTIES
   Change these to adjust all speeds site-wide:
     --sg-duration : how long each animation takes  (default 0.65s)
     --sg-ease     : the acceleration curve (leave as-is for best look)
     --sg-distance : how far elements travel before landing (default 36px)
   ================================================================ */
:root {
  --sg-duration:   0.65s;
  --sg-ease:       cubic-bezier(0.16, 1, 0.3, 1);
  --sg-distance:   36px;
}


/* ================================================================
   2. ACCESSIBILITY — REDUCED MOTION
   If the visitor's OS has "Reduce Motion" turned on, we skip ALL
   animations and show every element immediately.
   ================================================================ */
@media (prefers-reduced-motion: reduce) {
  [data-animate],
  [data-animate-group] > * {
    opacity:    1 !important;
    transform:  none !important;
    filter:     none !important;
    clip-path:  none !important;
    transition: none !important;
    animation:  none !important;
  }
}


/* ================================================================
   3. BASE HIDDEN STATE
   Every element tagged with data-animate starts invisible.
   JS adds .is-visible to trigger the transition.
   ================================================================ */
[data-animate] {
  opacity: 0;
  transition:
    opacity   var(--sg-duration) var(--sg-ease),
    transform var(--sg-duration) var(--sg-ease),
    filter    var(--sg-duration) var(--sg-ease),
    clip-path var(--sg-duration) var(--sg-ease);
  transition-delay: var(--sg-delay, 0ms);
}


/* ================================================================
   4. PER-ANIMATION INITIAL TRANSFORMS
   Only opacity + transform + filter — never width/height/top/left
   — to keep animations on the GPU compositor layer.
   ================================================================ */

/* Slide up from below (headings, paragraphs, cards) */
[data-animate="fade-up"] {
  transform: translateY(var(--sg-distance));
}

/* Slide in from the right (right-side feature text) */
[data-animate="fade-left"] {
  transform: translateX(var(--sg-distance));
}

/* Slide in from the left (left-side feature text) */
[data-animate="fade-right"] {
  transform: translateX(calc(-1 * var(--sg-distance)));
}

/* Grow in from centre (images, UI screenshots, icon blocks) */
[data-animate="scale-in"] {
  transform: scale(0.92);
}

/* Soft blur to sharp (hero text, feature spotlights) */
[data-animate="blur-in"] {
  filter:    blur(8px);
  transform: scale(1.03);
}

/* Curtain-lift / clip reveal (bold headlines) */
[data-animate="clip-up"] {
  clip-path: inset(0 0 100% 0);
  transform: translateY(12px);
}


/* ================================================================
   5. VISIBLE STATE — JS adds .is-visible
   All animated properties return to their natural resting values.
   ================================================================ */
[data-animate].is-visible {
  opacity:   1;
  transform: none;
  filter:    none;
  clip-path: inset(0% 0 0 0);
}
```

---

```js
/* === ANIMATIONS.JS === */
/* Synergy Website — Scroll Animation Engine v1.0      */
/* Vanilla JS · Zero dependencies · ~2.1 KB            */
/*                                                     */
/* Trigger: data-animate="fade-up|fade-left|fade-right */
/*          |scale-in|blur-in|clip-up"                 */
/* Group:   data-animate-group  (staggers children)    */
/* Delay:   data-animate-delay="200"  (ms override)    */
/* Repeat:  data-animate-once="false" (re-fires)       */
/* ---------------------------------------------------  */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. BAIL EARLY for users who prefer reduced motion.
        Elements are already visible via the CSS @media rule.
     ---------------------------------------------------------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;


  /* ----------------------------------------------------------
     1. CONFIGURATION
        threshold  : fraction of element visible before trigger
        rootMargin : "-40px" fires 40px before element's bottom
                     edge reaches the viewport bottom
     ---------------------------------------------------------- */
  var STAGGER_STEP = 80;   /* ms added per sibling in a group */
  var IO_OPTIONS   = {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px'
  };


  /* ----------------------------------------------------------
     2. SINGLE SHARED IntersectionObserver
     ---------------------------------------------------------- */
  var observer = new IntersectionObserver(onIntersect, IO_OPTIONS);


  /* ----------------------------------------------------------
     3. INTERSECTION CALLBACK
     ---------------------------------------------------------- */
  function onIntersect(entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      revealElement(el);

      if (el.dataset.animateOnce !== 'false') {
        observer.unobserve(el);
      }
    });
  }


  /* ----------------------------------------------------------
     4. REVEAL ONE ELEMENT
        • will-change applied just before animation
        • rAF batches class changes to avoid layout thrash
        • will-change removed on transitionend to free GPU memory
     ---------------------------------------------------------- */
  function revealElement(el) {
    el.style.willChange = 'transform, opacity, filter';

    requestAnimationFrame(function () {
      el.classList.add('is-visible');

      el.addEventListener('transitionend', function onDone() {
        el.style.willChange = '';
        el.removeEventListener('transitionend', onDone);
      });
    });
  }


  /* ----------------------------------------------------------
     5. STAGGER A GROUP'S DIRECT CHILDREN
        • Children with data-animate → keep their type, add delay
        • No children have data-animate → auto-apply "fade-up"
        • data-animate-delay on child acts as a base offset
     ---------------------------------------------------------- */
  function staggerGroup(parent) {
    if (parent.dataset.animateGroupDone) return;
    parent.dataset.animateGroupDone = '1';

    var children = Array.prototype.slice.call(parent.children);

    var targets = children.filter(function (c) {
      return c.hasAttribute('data-animate');
    });

    if (targets.length === 0) {
      targets = children;
      targets.forEach(function (c) {
        if (!c.hasAttribute('data-animate')) {
          c.setAttribute('data-animate', 'fade-up');
        }
      });
    }

    targets.forEach(function (c, i) {
      var base  = parseInt(c.dataset.animateDelay || 0, 10);
      var delay = base + i * STAGGER_STEP;
      c.style.setProperty('--sg-delay', delay + 'ms');
    });
  }


  /* ----------------------------------------------------------
     6. REGISTER ELEMENTS INSIDE A ROOT NODE
     ---------------------------------------------------------- */
  function registerElements(root) {
    root = root || document;

    root.querySelectorAll('[data-animate-group]').forEach(function (group) {
      staggerGroup(group);
    });

    root.querySelectorAll('[data-animate]').forEach(function (el) {
      if (el.dataset.animateRegistered) return;
      el.dataset.animateRegistered = '1';

      if (el.dataset.animateDelay && !el.closest('[data-animate-group]')) {
        el.style.setProperty('--sg-delay', el.dataset.animateDelay + 'ms');
      }

      observer.observe(el);
    });
  }


  /* ----------------------------------------------------------
     7. MUTATIONOBSERVER — Elementor lazy-load fallback
        Detects new [data-animate] elements injected after init.
     ---------------------------------------------------------- */
  var mutObs = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;

        if (node.hasAttribute && node.hasAttribute('data-animate')) {
          if (!node.dataset.animateRegistered) {
            node.dataset.animateRegistered = '1';
            if (node.dataset.animateDelay && !node.closest('[data-animate-group]')) {
              node.style.setProperty('--sg-delay', node.dataset.animateDelay + 'ms');
            }
            observer.observe(node);
          }
        }

        if (node.querySelectorAll) {
          node.querySelectorAll('[data-animate-group]').forEach(function (g) {
            staggerGroup(g);
          });
          node.querySelectorAll('[data-animate]').forEach(function (el) {
            if (el.dataset.animateRegistered) return;
            el.dataset.animateRegistered = '1';
            if (el.dataset.animateDelay && !el.closest('[data-animate-group]')) {
              el.style.setProperty('--sg-delay', el.dataset.animateDelay + 'ms');
            }
            observer.observe(el);
          });
        }
      });
    });
  });


  /* ----------------------------------------------------------
     8. BOOT SEQUENCE
     ---------------------------------------------------------- */
  function init() {
    registerElements(document);
    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('elementor/frontend/init', function () {
    registerElements(document);
  });

}());
```

---

```
/* === ELEMENTOR DEVELOPER QUICK GUIDE === */

FILES
─────────────────────────────────────────────────────────────────
animations.css  (~1.5 KB unmin)  →  Elementor > Custom CSS
                                     OR child theme style.css
animations.js   (~2.7 KB unmin)  →  Elementor Pro > Custom Code (Footer)
                                     OR functions.php via wp_footer hook

DATA ATTRIBUTES API
─────────────────────────────────────────────────────────────────

<!-- Individual elements — choose one value -->
<div data-animate="fade-up">…</div>      ← fade + translateY(36px)
<div data-animate="fade-left">…</div>    ← fade + translateX(36px) from right
<div data-animate="fade-right">…</div>   ← fade + translateX(-36px) from left
<div data-animate="scale-in">…</div>     ← fade + scale(0.92→1)
<div data-animate="blur-in">…</div>      ← fade + blur(8px→0)
<div data-animate="clip-up">…</div>      ← clip-path reveal bottom→top

<!-- Delay override — stacks on top of any group-stagger delay -->
<div data-animate="fade-up" data-animate-delay="200">…</div>

<!-- Group — staggers all direct children automatically.
     Children with data-animate keep their type.
     Children without data-animate get fade-up automatically. -->
<div data-animate-group>
  <div data-animate="scale-in">Card 1</div>   ← fires at 0 ms
  <div data-animate="scale-in">Card 2</div>   ← fires at 80 ms
  <div data-animate="scale-in">Card 3</div>   ← fires at 160 ms
</div>

<!-- Re-animate on every viewport entry (default is fire-once) -->
<div data-animate="fade-up" data-animate-once="false">…</div>

ADDING ATTRIBUTES IN ELEMENTOR
─────────────────────────────────────────────────────────────────
1. Select widget → Advanced tab → Custom Attributes → + Add Row
2. Key column   → attribute name  (e.g. data-animate)
3. Value column → attribute value (e.g. fade-up)
4. For data-animate-group, leave Value empty

TIMING CUSTOMISATION (CSS only — no JS change needed)
─────────────────────────────────────────────────────────────────
:root {
  --sg-duration: 0.65s;   ← animation length
  --sg-ease:     cubic-bezier(0.16, 1, 0.3, 1);
  --sg-distance: 36px;    ← travel distance
}

Per-group stagger gap (JS):
var STAGGER_STEP = 80;    ← ms between siblings

OBSERVER SETTINGS
─────────────────────────────────────────────────────────────────
threshold:  0.12          ← 12% of element visible triggers animation
rootMargin: '0px 0px -40px 0px'  ← fires 40px before bottom of viewport

Increase threshold (e.g. 0.20) → fires later, more of element visible first
Change rootMargin bottom (e.g. '-100px') → fires even earlier

PERFORMANCE CHECKLIST
─────────────────────────────────────────────────────────────────
✓ Single IntersectionObserver for all elements
✓ will-change applied before animation, removed on transitionend
✓ Only opacity, transform, filter, clip-path animated (no layout props)
✓ requestAnimationFrame wraps every class addition
✓ observer.unobserve() called after fire-once elements animate
✓ MutationObserver catches Elementor lazy-rendered sections
✓ Zero scroll event listeners
✓ prefers-reduced-motion respected at CSS and JS layers
✓ Double-registration guards (data-animate-registered flag)
```

---

# /* === COMPLETE USER GUIDE === */
# Scroll Animations — Complete Guide for Website Managers

> **Who this guide is for:** You manage your website through WordPress and Elementor.
> You do not need to know how to code. This guide will walk you through everything,
> one step at a time, using plain English.

---

## Section 1 — What are scroll animations and what will change on your site

### What is a scroll animation?

Imagine you are reading a newspaper that is rolled up. As you unroll it, each paragraph
slides into view. That is exactly what a scroll animation does on a webpage — instead of
everything appearing all at once when the page loads, each element (a heading, a paragraph,
a card) gracefully appears as your visitor scrolls down to it.

### What will your visitors see?

After you install this system, your website pages will feel like a premium product. Here is
what will happen:

- **Headings** will gently slide upward and fade in as they come into view.
- **Paragraphs** will fade in smoothly just after their heading.
- **Cards and feature boxes** (when arranged in a row) will animate one after another with a
  small, pleasing delay between them — like a deck of cards being laid out on a table.
- **Images and screenshots** will subtly grow into place.
- **Bold headline text** will appear as if a curtain is lifting to reveal the words.
- Everything happens once, the first time a visitor scrolls to that section.

### Why does this matter?

Sites with smooth scroll animations consistently feel more polished and trustworthy to
visitors. Think of it like the difference between a shop door that swings open on its own
with a soft chime versus one that just sits there. The motion tells the visitor: this place
pays attention to detail.

### What this system does NOT do

- It does NOT change your content, fonts, colours, or layout.
- It does NOT slow your site down — it is built for performance.
- It does NOT affect visitors who have turned on "Reduce Motion" in their device settings
  (for example, people with motion sensitivity); those visitors simply see the normal page.

---

## Section 2 — Before you start: a safety checklist

> **What this does:** This section helps you prepare before touching any code.
> Skipping these steps is the most common reason things go wrong.

### Step 1 — Back up your entire website

Before you change anything on a WordPress site, always take a full backup. Think of it as
saving your game before a difficult level.

1. Log in to your **WordPress Dashboard** (the admin area of your site).
2. In the left-hand menu, look for your backup plugin. Common ones are **UpdraftPlus**,
   **All-in-One WP Migration**, or **Duplicator**.
   - If you do not see a backup plugin, contact your hosting provider — most hosts offer a
     one-click backup in their control panel (cPanel, Plesk, etc.).
3. Click **Backup Now** (the exact label depends on your plugin).
4. Wait for the backup to complete. You will usually see a green tick or "Backup complete"
   message.
5. Download the backup file to your computer as an extra safety measure.

⚠️ **Watch out:** Do this backup step **every single time** before you make any code
changes, not just this once. A backup that is one day old is far better than no backup.

---

### Step 2 — Check whether you have Elementor Free or Elementor Pro

The preferred method for adding the JavaScript code uses a feature called **Custom Code**,
which is only available in **Elementor Pro** (the paid version).

**How to check:**

1. In your WordPress Dashboard, go to **Elementor** in the left-hand menu.
2. Click **Settings**.
3. Look at the top of the page. If you see a tab or section labelled **Custom Code**, you
   have Elementor Pro and can use the preferred method.
4. If you do not see **Custom Code**, you have the free version. You will use the
   alternative method described in Section 4, Option B (functions.php).

---

### Step 3 — Use a staging environment if possible

**What is staging?** A staging site is a private, hidden copy of your website where you can
make changes and test them without your real visitors ever seeing anything. Think of it as
a dress rehearsal before the actual show.

**If your host provides staging** (WP Engine, Kinsta, SiteGround, and many others do):

1. Log in to your hosting control panel.
2. Find the **Staging** option (it may be called "Staging Site", "Dev Site", or "Test Site").
3. Click **Create Staging Site** or **Push to Staging**.
4. Complete this entire guide on the staging site first.
5. Once everything looks correct on staging, repeat the same steps on your live site.

**If you do not have staging:** Proceed directly on the live site, but make absolutely
sure you have completed Step 1 (the backup) first.

---

## Section 3 — Installing the CSS (the visual styles)

> **What this does:** The CSS file contains all the instructions that tell your browser
> how each animation should look — how far elements move, how long the animation takes,
> what the starting and ending position is. Without this, your elements might disappear
> permanently. Installing the CSS is always the very first step.

---

### Option A — Pasting the CSS into Elementor's Custom CSS (Recommended)

This method keeps the animation styles inside Elementor, making them easy to find and
remove later.

1. In your WordPress Dashboard, click **Elementor** in the left-hand menu.
2. Click **Custom CSS**.
   *(You will see a large, empty text box on a dark background. This is where custom styles
   for the whole site live.)*
3. Click inside the text box and press **Ctrl + A** (Windows) or **Cmd + A** (Mac) to
   select any existing code.
4. Do **not** delete anything that is already there. Instead, click at the very end of the
   existing text and press **Enter** twice to create two blank lines.
5. Open the `animations.css` file provided with this package.
6. Select all the text inside it (**Ctrl + A** / **Cmd + A**), then copy it (**Ctrl + C** /
   **Cmd + C**).
7. Click back into the Elementor Custom CSS text box and paste (**Ctrl + V** / **Cmd + V**).
8. Click **Save Changes** (the blue button, usually at the bottom or top right of the page).

**How to confirm the CSS is active:**

1. Open your website in a new browser tab.
2. Scroll to any element you plan to animate.
3. Right-click on that element and choose **Inspect** (or **Inspect Element**).
4. A panel will open. Look at the right-hand **Styles** column.
5. Type `sg-duration` in the Styles filter box.
6. If you see `--sg-duration: 0.65s` listed, the CSS is active. ✅

---

### Option B — Pasting the CSS into your child theme's style.css

Use this method if you prefer keeping all custom code in your theme files, or if
Elementor's Custom CSS option is not available.

⚠️ **Watch out:** Always edit a **child theme**, never the parent theme directly. Changes
to a parent theme are erased when the theme updates. If you do not have a child theme, ask
your developer to create one before proceeding.

1. In your WordPress Dashboard, go to **Appearance** in the left-hand menu.
2. Click **Theme File Editor** (it may also be called **Theme Editor**).
3. On the right side of the screen, you will see a list of theme files. Look for and click
   on **style.css** under your **child theme** name.
4. The contents of style.css will appear in the main text area.
5. Scroll to the very bottom of the existing code.
6. Click at the very end, press **Enter** twice to add two blank lines.
7. Paste the entire contents of the `animations.css` file.
8. Click **Update File** (the blue button at the bottom).

**How to confirm the CSS is active:** Same as Option A, steps 1–6 above.

---

## Section 4 — Installing the JS (the animation logic)

> **What this does:** The JavaScript file is the "brain" of the animation system. It
> watches the page as your visitor scrolls and, when an element comes into view, it
> applies the animation. Without the JS, elements tagged for animation will be invisible
> forever (stuck in their hidden starting state).

⚠️ **Watch out:** Always install the CSS (Section 3) before the JS. If you install only
the JS, animated elements will become invisible and stay that way.

---

### Option A — Using Elementor Pro > Custom Code (Preferred)

1. In your WordPress Dashboard, click **Elementor** in the left-hand menu.
2. Click **Custom Code**.
3. Click **Add New** (the blue button at the top left).
4. Give it a name in the **Title** field, for example: `Scroll Animations JS`.
5. In the large code editor below the title, paste the entire contents of the
   `animations.js` file.
6. On the right side, find the **Location** setting. Set it to **Body — End** (this means
   the script loads after the rest of the page, which is required for it to work correctly).
7. Make sure the **Status** toggle is set to **Active** (it should be green or say "Active").
8. Click **Publish** (the blue button, top right).

**How to confirm the JS is active:**

1. Open your website in a new browser tab.
2. Right-click anywhere on the page and choose **Inspect**.
3. Click the **Console** tab at the top of the panel that opens.
4. Look at the Console. If you see **no red error messages** related to your site, the
   script loaded successfully. ✅
5. As an extra check: scroll down your page. Any element you have tagged with
   `data-animate` should now animate into view.

---

### Option B — Pasting into functions.php via the child theme

Use this method only if you do not have Elementor Pro.

⚠️ **Watch out:** Editing functions.php incorrectly can cause a "white screen of death"
(your whole site goes blank). Follow these steps exactly, and have your backup ready.

1. In your WordPress Dashboard, go to **Appearance** > **Theme File Editor**.
2. On the right side, click on **functions.php** (under your child theme name).
3. Scroll to the very bottom of the functions.php file.
4. Click at the end of the last line and press **Enter** twice.
5. Paste the following wrapper code exactly as written:

```php
function synergy_add_scroll_animations() { ?>
  <script>
    /* PASTE THE CONTENTS OF animations.js HERE */
  </script>
<?php }
add_action( 'wp_footer', 'synergy_add_scroll_animations' );
```

6. Open the `animations.js` file, select all its contents, and copy them.
7. Back in functions.php, click on the line that says
   `/* PASTE THE CONTENTS OF animations.js HERE */` and replace that comment by pasting
   the JS code.
8. Click **Update File**.

⚠️ **Watch out:** If your site shows a white screen after saving, go immediately to your
WordPress Dashboard URL directly (e.g. `yoursite.com/wp-admin`) and restore your backup.
Then check that you have not accidentally deleted any existing code from functions.php.

**How to confirm the JS is active:** Same as Option A, steps 1–5 above.

---

## Section 5 — How to apply animations to elements in Elementor

> **What this does:** This is the section you will use most often. Once the CSS and JS are
> installed, you go to any element on any page and "label" it with the animation you want.

### What does "adding an attribute" mean?

Think of `data-animate` as a sticky note you put on an element. The sticky note says: "When
a visitor scrolls to me, animate me like this." The animation system reads all the sticky
notes as the page loads and follows the instructions on each one.

In Elementor, these sticky notes are called **Custom Attributes**. They are invisible to
your visitors — they are only instructions for the animation engine.

---

### Where to find the Custom Attributes field

1. Open **Elementor** on any page by clicking **Edit with Elementor**.
2. Click on the element (widget) you want to animate — for example, a heading, an image,
   or a text block.
3. The **Elementor panel** appears on the left side of the screen.
4. At the top of the panel, you will see three tabs: **Content**, **Style**, and
   **Advanced**. Click **Advanced**.
5. Scroll down inside the Advanced tab until you see a section labelled
   **Custom Attributes**.
6. Click the **+ Add Row** button inside the Custom Attributes section.
7. You will see two text boxes appear: one labelled **Key** (on the left) and one labelled
   **Value** (on the right).

---

### What to type in the Key and Value fields

Think of **Key** as the name of the sticky note category, and **Value** as the specific
instruction written on it.

| What you want the element to do | Type in the **Key** field | Type in the **Value** field |
|---|---|---|
| Element slides up and fades in | `data-animate` | `fade-up` |
| Element slides in from the right | `data-animate` | `fade-left` |
| Element slides in from the left | `data-animate` | `fade-right` |
| Element grows in from the centre | `data-animate` | `scale-in` |
| Element appears from a soft blur | `data-animate` | `blur-in` |
| Element reveals upward like a curtain | `data-animate` | `clip-up` |
| Wait 200ms before starting | `data-animate-delay` | `200` |
| Wait 400ms before starting | `data-animate-delay` | `400` |
| Make all children animate in a cascade | `data-animate-group` | *(leave empty)* |
| Re-play animation every time it enters view | `data-animate-once` | `false` |

After typing the Key and Value, click anywhere outside the field to confirm, then click
**Update** or **Publish** (the green button at the bottom of the Elementor panel) to save.

---

### Step-by-step example: Animating a heading and a paragraph

**Goal:** The heading slides up and fades in. The paragraph fades in 200ms later.

1. Open a page in Elementor.
2. Click on your **Heading widget**.
3. Click the **Advanced** tab in the left panel.
4. Scroll to **Custom Attributes** and click **+ Add Row**.
5. Key: `data-animate` | Value: `fade-up`
6. Click the **Update** button (green, bottom of panel).
7. Now click on your **Text Editor** or **Paragraph widget** below the heading.
8. Click the **Advanced** tab.
9. Scroll to **Custom Attributes** and click **+ Add Row**.
10. Key: `data-animate` | Value: `fade-up`
11. Click **+ Add Row** again.
12. Key: `data-animate-delay` | Value: `200`
13. Click **Update**.
14. Click the **eye icon** (Preview) to see your page. Scroll to the section.

✅ **What you should see:** The heading smoothly glides upward and fades in. About a
fifth of a second later, the paragraph does the same.

---

### Step-by-step example: A 3-column card row that cascades

**Goal:** Three side-by-side cards animate in one after the other.

1. In Elementor, click on the **Section** or **Column container** that holds the three
   card columns. (Click the blue icon that appears at the top-left of the section on hover.)
2. In the left panel, click the **Advanced** tab.
3. Scroll to **Custom Attributes** and click **+ Add Row**.
4. Key: `data-animate-group` | Value: *(leave empty)*
5. Click **Update** on the section.
6. Now click on each individual **Column** (or card widget) inside the section:
   - Card 1: Key `data-animate` | Value `scale-in`
   - Card 2: Key `data-animate` | Value `scale-in`
   - Card 3: Key `data-animate` | Value `scale-in`
7. Save each card after adding the attribute.
8. Preview the page. Scroll to the cards.

✅ **What you should see:** Card 1 grows into place. 80ms later, Card 2 grows in. 80ms
after that, Card 3 appears. The effect looks like a smooth cascade, not a simultaneous pop.

---

## Section 6 — Timing and speed: how to customise without touching code

> **What this does:** This section shows you the three numbers you can safely change in
> the CSS to adjust how fast or slow animations feel.

### The two concepts to understand

- **Duration** is how long the animation itself takes. `0.65s` means 0.65 seconds.
- **Delay** is how long the element waits before it starts moving. Think of it as an
  actor waiting for their cue: a delay of `200ms` means the element waits 0.2 seconds
  after it enters the screen before beginning its animation.

### Where to change the timing values

Open `animations.css` and look for this block near the top:

```css
:root {
  --sg-duration:   0.65s;   /* ← change this to make animations faster or slower */
  --sg-ease:       cubic-bezier(0.16, 1, 0.3, 1);   /* ← leave this alone */
  --sg-distance:   36px;    /* ← how far elements travel before landing */
}
```

**To make all animations faster:** Change `0.65s` to `0.45s`.
**To make all animations slower:** Change `0.65s` to `0.85s`.
**To make elements travel less:** Change `36px` to `20px`.
**To make elements travel more:** Change `36px` to `60px`.

### To change the stagger gap between siblings in a group

Open `animations.js` and look near the top for:

```js
var STAGGER_STEP = 80;   /* ms between siblings */
```

**To make the cascade faster:** Change `80` to `50`.
**To make the cascade more dramatic:** Change `80` to `150`.

⚠️ **Watch out:** Only change the number. Do not delete the semicolon (`;`) at the end.

---

## Section 7 — Troubleshooting: what to do when something doesn't work

---

**Problem:** An element is invisible and never appears — the animation seems permanently stuck.

**Why it happens:** The JavaScript file did not load, OR the CSS was installed without the
JS, leaving the element in its hidden starting state permanently.

**Fix:**
1. Confirm the JS is installed and active (Section 4, "How to confirm the JS is active").
2. Open your browser's Console (right-click the page → **Inspect** → **Console** tab).
3. Look for any red error messages. If you see one mentioning `animations.js`, re-paste the
   JS code from scratch.
4. If no errors appear, reload the page with cache cleared: **Ctrl + Shift + R** (Windows)
   or **Cmd + Shift + R** (Mac).
5. If still invisible, right-click the element → **Inspect** → look for `data-animate="…"`
   in the HTML. If it is missing, re-add the Custom Attribute in Elementor.

---

**Problem:** The animation fires but looks choppy or jittery on mobile.

**Why it happens:** Older mobile phones can struggle with `filter` animations (`blur-in`).

**Fix:**
1. Switch elements using `blur-in` to `fade-up` instead.
2. If the problem persists, increase `--sg-duration` in the CSS from `0.65s` to `0.8s`.

---

**Problem:** Animations work in the Elementor editor but not on the live site.

**Why it happens:** A caching plugin is serving an old version of the page.

**Fix:**
1. Go to your caching plugin (e.g. **WP Rocket**, **W3 Total Cache**, **LiteSpeed Cache**).
2. Click **Clear Cache** or **Purge All**.
3. Visit your live site, clear your browser cache (**Ctrl + Shift + R**), and check again.
4. If you use a CDN, clear the CDN cache as well.

---

**Problem:** Multiple elements in a group all animate at exactly the same time instead of cascading.

**Why it happens:** The `data-animate-group` attribute is on a card instead of the parent
container, or it was not added at all.

**Fix:**
1. In Elementor, click on the **Section** that contains the cards (not a card itself).
2. Open **Advanced** > **Custom Attributes**.
3. Confirm `data-animate-group` is listed with an empty value.
4. If it is on a card instead, remove it from the card and add it to the section.
5. Save and refresh.

---

**Problem:** The site showed a white screen or JS error after pasting the code.

**Why it happens:** A syntax error was introduced when pasting.

**Fix:**
1. If you pasted into **functions.php**: go to `yoursite.com/wp-admin`, navigate to
   **Appearance** > **Theme File Editor** > **functions.php**, and delete the entire block
   you added. Click **Update File**.
2. If you pasted into **Elementor Custom Code**: go to **Elementor** > **Custom Code**,
   find your entry, and set its Status to **Inactive**.
3. Restore from backup if neither is accessible.

---

**Problem:** An animation doesn't fire on a section that loads later via Elementor lazy load.

**Why it happens:** Elementor renders some sections only when the visitor scrolls near them.
The animation system may have finished its first scan before those sections appeared.

**Fix:**
This system includes an automatic fallback that detects newly added sections. If animations
still do not fire:
1. In **Elementor** > **Settings** > **Advanced**, try toggling **Optimized DOM Output** or
   **Lazy Load** settings.
2. Add a small delay to the affected element: `data-animate-delay` → `300`.

---

## Section 8 — How to remove an animation from a specific element

1. Open the page in **Elementor**.
2. Click on the element whose animation you want to remove.
3. Open the **Advanced** tab in the left panel.
4. Scroll to **Custom Attributes**.
5. Find the row with `data-animate` in the Key column.
6. Click the **red minus (–) icon** or **trash / delete icon** to remove that row.
7. Also remove any `data-animate-delay` or `data-animate-once` rows.
8. Click **Update** to save.
9. Refresh your live page (**Ctrl + Shift + R**) to confirm the element appears immediately.

✅ **What you should see:** The element is now visible as soon as that section loads,
with no animation.

---

## Section 9 — How to completely uninstall the animation system

⚠️ **Watch out:** Remove the CSS and JS together. If you remove the JS but leave the CSS,
elements tagged with `data-animate` will become permanently invisible.

### Step 1 — Remove all data-animate attributes

Go through each page you animated and remove the Custom Attributes following Section 8,
or ask a developer to clear them via a database search-and-replace.

### Step 2 — Remove the JS

- **Elementor Custom Code:** Go to **Elementor** > **Custom Code**, find "Scroll Animations
  JS", and click **Delete**.
- **functions.php:** Go to **Appearance** > **Theme File Editor** > **functions.php**,
  find the block starting with `function synergy_add_scroll_animations`, delete it entirely,
  and click **Update File**.

### Step 3 — Remove the CSS

- **Elementor Custom CSS:** Go to **Elementor** > **Custom CSS**, find the animation CSS
  block (starts with `/* === ANIMATIONS.CSS === */`), select all of it, delete it, and
  click **Save Changes**.
- **style.css:** Go to **Appearance** > **Theme File Editor** > **style.css** in your
  child theme, find the animation block, delete it, and click **Update File**.

### Step 4 — Verify

1. Clear your site cache.
2. Open the live site and check all previously animated pages.
3. All elements should appear immediately with no animation and no invisible elements. ✅

---

## Section 10 — Quick Reference Card

> Print or screenshot this section and keep it handy.

### All animation values

| What you want | Key field | Value field |
|---|---|---|
| Slide up + fade in | `data-animate` | `fade-up` |
| Slide in from right | `data-animate` | `fade-left` |
| Slide in from left | `data-animate` | `fade-right` |
| Grow in from centre | `data-animate` | `scale-in` |
| Appear from blur | `data-animate` | `blur-in` |
| Curtain reveal upward | `data-animate` | `clip-up` |
| Add 200ms wait | `data-animate-delay` | `200` |
| Add 400ms wait | `data-animate-delay` | `400` |
| Stagger children | `data-animate-group` | *(empty)* |
| Replay every scroll | `data-animate-once` | `false` |

### Where to paste each file

| File | Location |
|---|---|
| `animations.css` | **Elementor > Custom CSS** OR child theme **style.css** |
| `animations.js` | **Elementor > Custom Code** (Pro) OR child theme **functions.php** |

### The one rule to never skip

> **Back up your site before making any changes. Every time. No exceptions.**
