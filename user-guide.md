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
7. Paste the entire contents of the `animations.css` file (same copy-paste process as
   Option A, steps 5–7).
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
   `data-animate` (you will add these in Section 5) should now animate into view.

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
**Update** or **Publish** (the green button at the bottom of the Elementor panel) to save
your changes.

---

### Step-by-step example: Animating a heading and a paragraph

**Goal:** The heading slides up and fades in. The paragraph then fades in 200ms later.

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
14. Click the **eye icon** (Preview) at the bottom to see your page. Scroll to the section
    and you should see the heading animate in, followed by the paragraph 0.2 seconds later.

✅ **What you should see:** The heading smoothly glides upward and fades in. About a
fifth of a second later, the paragraph does the same.

---

### Step-by-step example: A 3-column card row that cascades

**Goal:** Three side-by-side cards animate in one after the other (not all at the same time).

1. In Elementor, click on the **Section** or **Column container** that holds the three
   card columns. (Click on the outer section handle — the blue icon that appears at the
   top-left of the section when you hover over it.)
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
> the CSS to adjust how fast or slow animations feel — without needing to understand
> anything else about the code.

### The two concepts to understand

- **Duration** is how long the animation itself takes from start to finish. Think of it
  like setting a stopwatch: `0.65s` means the animation lasts 0.65 seconds.
- **Delay** is how long the element waits before it even starts moving. Think of it as an
  actor waiting for their cue: a delay of `200ms` means the element waits 0.2 seconds
  after it enters the screen before beginning its animation.

### Where to change the timing values

Open `animations.css` and look for this block right near the top (it is clearly labelled):

```css
:root {
  --sg-duration:   0.65s;   /* ← change this to make animations faster or slower */
  --sg-ease:       cubic-bezier(0.16, 1, 0.3, 1);   /* ← leave this alone */
  --sg-distance:   36px;    /* ← how far elements travel before landing */
}
```

**To make all animations faster:** Change `0.65s` to something like `0.45s`.
**To make all animations slower:** Change `0.65s` to something like `0.85s`.
**To make elements travel less:** Change `36px` to `20px`.
**To make elements travel more:** Change `36px` to `60px`.

### To change the stagger gap between siblings in a group

Open `animations.js` and look near the top for this line:

```js
var STAGGER_STEP = 80;   /* ms between siblings */
```

**To make the cascade faster** (less gap): Change `80` to `50`.
**To make the cascade more dramatic** (more gap): Change `80` to `150`.

⚠️ **Watch out:** Only change the number, not the text around it. Do not delete the
semicolon (`;`) at the end.

---

## Section 7 — Troubleshooting: what to do when something doesn't work

---

**Problem:** An element is invisible and never appears — the animation seems permanently stuck.

**Why it happens:** The JavaScript file did not load, OR the CSS was installed without the
JS, leaving the element in its hidden starting state permanently.

**Fix:**
1. Confirm the JS is installed and active (Section 4, "How to confirm the JS is active").
2. Open your browser's Console (right-click the page → **Inspect** → **Console** tab).
3. Look for any red error messages. If you see one mentioning your `animations.js`, the
   script has an error — re-paste the JS code from scratch.
4. If no errors appear, reload the page with the cache cleared: **Ctrl + Shift + R**
   (Windows) or **Cmd + Shift + R** (Mac).
5. If still invisible, check that the element truly has the `data-animate` attribute:
   right-click it → **Inspect** → in the HTML panel, look for `data-animate="…"` on the
   element.

---

**Problem:** The animation fires but looks choppy or jittery on mobile.

**Why it happens:** Older or budget mobile phones sometimes struggle with `filter`
animations (like `blur-in`). The other animation types (`fade-up`, `scale-in`) are
nearly always smooth.

**Fix:**
1. Switch elements using `blur-in` to `fade-up` instead on pages that look bad on mobile.
2. If the problem persists across animation types, increase `--sg-duration` in the CSS
   from `0.65s` to `0.8s` to give the browser more time to render each frame.

---

**Problem:** Animations work perfectly in the Elementor editor but not on the live site.

**Why it happens:** Elementor's preview mode loads the page differently from the live site.
Often the cause is a caching plugin serving an old, pre-animation version of the page.

**Fix:**
1. In your WordPress Dashboard, go to your caching plugin (e.g. **WP Rocket**, **W3 Total
   Cache**, **LiteSpeed Cache**).
2. Click **Clear Cache** or **Purge All**.
3. Visit your live site, clear your browser cache (**Ctrl + Shift + R**), and check again.
4. If you use a CDN (a content delivery network — a service that speeds up your site by
   storing copies of it around the world), clear the CDN cache as well.

---

**Problem:** Multiple elements in a group all animate at exactly the same time instead of one after another.

**Why it happens:** The `data-animate-group` attribute was not added to the **parent**
container, or it was added to the wrong element.

**Fix:**
1. In Elementor, click on the **Section** or **outer wrapper** that contains the cards —
   not one of the cards themselves.
2. Open **Advanced** > **Custom Attributes**.
3. Confirm you see `data-animate-group` with an empty value in the list.
4. If it is on a card instead of the parent, remove it from the card and add it to the
   section instead.
5. Save and refresh.

---

**Problem:** The site showed a white screen or JS error after pasting the code.

**Why it happens:** A syntax error was introduced when pasting (an extra character, a
missing bracket, or code pasted twice).

**Fix:**
1. Do not panic. Your backup is your safety net.
2. If you pasted into **functions.php**: go to `yoursite.com/wp-admin` directly, navigate
   to **Appearance** > **Theme File Editor** > **functions.php**, and delete the entire
   block you added. Click **Update File**.
3. If you pasted into **Elementor Custom Code**: go to **Elementor** > **Custom Code**,
   find your entry, and set its Status to **Inactive**.
4. Restore from backup if neither of the above is accessible.

---

**Problem:** An animation doesn't fire on a section that appears after scrolling (Elementor lazy load).

**Why it happens:** Elementor's "lazy load" feature delays rendering some sections until
the visitor scrolls near them. By the time those sections appear in the DOM (the underlying
page structure), the animation system may have already finished its first scan.

**Fix:**
This system includes an automatic fallback (a MutationObserver) that detects newly
added sections. If animations still don't fire:
1. In **Elementor** > **Settings** > **Advanced**, look for **Optimized DOM Output** or
   **Lazy Load** settings and try toggling them.
2. Alternatively, add a small delay to the affected element:
   `data-animate-delay` → `300`. This gives the section a moment to fully render.

---

## Section 8 — How to remove an animation from a specific element

> **What this does:** Sometimes you will add an animation to an element and then change
> your mind. This section explains how to remove it cleanly from just that one element.

1. Open the page in **Elementor**.
2. Click on the element whose animation you want to remove.
3. Open the **Advanced** tab in the left panel.
4. Scroll to **Custom Attributes**.
5. Find the row with `data-animate` in the Key column.
6. Click the **red minus (–) icon** or the **trash / delete icon** on that row to remove it.
7. If there is also a `data-animate-delay` or `data-animate-once` row, remove those too.
8. Click **Update** to save.
9. Refresh your live page (with **Ctrl + Shift + R**) to confirm the element now appears
   immediately without animating.

✅ **What you should see:** The element is now visible as soon as the page loads for that
section, with no animation.

---

## Section 9 — How to completely uninstall the animation system

> **What this does:** If your client decides the animations are not right for the site,
> or if you need to do a complete reset, this section tells you how to remove everything
> cleanly so that no elements are left invisible.

⚠️ **Watch out:** Remove the CSS and JS together in the same session. If you remove the
JS but leave the CSS, elements tagged with `data-animate` will be invisible permanently.

### Step 1 — Remove all data-animate attributes

Before removing the code, make all elements visible again by removing their attributes.
You can do this one element at a time (follow Section 8 for each element), or:

1. If you have a developer available: they can do a search-and-replace in the database to
   remove all `data-animate` attributes at once.
2. If you are doing it yourself: go through each page you animated and remove the
   Custom Attributes following the steps in Section 8.

### Step 2 — Remove the JS

- **If you used Elementor Custom Code:** Go to **Elementor** > **Custom Code**, find your
  "Scroll Animations JS" entry, and click **Delete**. Confirm when prompted.
- **If you used functions.php:** Go to **Appearance** > **Theme File Editor** >
  **functions.php**, find the block you added (it starts with
  `function synergy_add_scroll_animations`), delete the entire block, and click
  **Update File**.

### Step 3 — Remove the CSS

- **If you used Elementor Custom CSS:** Go to **Elementor** > **Custom CSS**, find the
  animation CSS (it starts with `/* === ANIMATIONS.CSS === */`), select it all, delete it,
  and click **Save Changes**.
- **If you used style.css:** Go to **Appearance** > **Theme File Editor** > **style.css**
  in your child theme, find the animation CSS block, delete it, and click **Update File**.

### Step 4 — Verify

1. Clear your site's cache.
2. Open the live site and check all previously animated pages.
3. All elements should now be visible immediately, with no animation and no invisible
   elements.

---

## Section 10 — Quick Reference Card

> Print or screenshot this table and keep it handy.

### Animation types

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

### Where to paste the code

| File | Paste location |
|---|---|
| `animations.css` | **Elementor > Custom CSS** OR **Appearance > Theme File Editor > style.css** (child theme) |
| `animations.js` | **Elementor > Custom Code** (Pro) OR wrapped in PHP in **functions.php** (child theme) |

### The one rule to always follow

> **Back up your site before making any changes.** Every time. No exceptions.
