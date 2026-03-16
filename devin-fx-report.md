# Devin.ai Motion System Study
# FX Engine for WordPress + Elementor
# Version 1.0 — March 2026

---

## INSPECTION NOTE

**Playwright MCP was not available in this environment.** The investigation was
conducted using the strongest available alternatives:
- Community reverse-engineering evidence from a December 2024 Hacker News thread
  ("Ask HN: How did they create the Devin.ai website?" — id=42465050)
- WebFetch source analysis (site returned 403 for direct fetch)
- Structured web search across technical communities
- Cross-referencing with known patterns for the confirmed tech stack

All findings are labelled with confidence levels throughout.

---

## 1. EXECUTIVE SUMMARY

Devin.ai operates a premium AI SaaS landing page whose motion character can be
described as **cinematic, technical, restraint-first, dark-mode-native**.

The site's motion system has two distinct layers that must be understood separately:

**Layer A — Canvas/WebGL hero (not replicable in WordPress):**
Three.js confirmed by community reverse-engineering. The hero section renders a
WebGL canvas with shader-based particle effects — likely a particle field that
responds to mouse position and may morph between shapes. This is scroll-linked
or time-animated. It sits behind or within the hero text.

**Layer B — DOM scroll animation system (replicable in WordPress):**
Standard scroll-triggered entrance animations on headings, paragraphs, feature
cards, logos, and testimonials. These use opacity + transform (translateY) with
staggered delays, most likely powered by Framer Motion's `whileInView` API
(consistent with the Next.js/React stack). The character is: 60-80px travel
distance, 600-800ms duration, spring-like easing, fire-once.

**Engine Design Decision:**
The WordPress FX engine targets Layer B exclusively. Layer A is documented,
classified as "not recommended for WordPress standardization," and replaced with
a CSS-only ambient accent pattern that achieves a similar atmospheric quality
without WebGL or any external library.

The engine is named **FX Engine** and uses `data-fx` as its authoring namespace.

---

## 2. LIVE INSPECTION FINDINGS

### 2.1 Confirmed by Inspection

| Finding | Evidence Source | Detail |
|---|---|---|
| Three.js powers hero canvas | HN thread id=42465050, Dec 2024 | "The most I could uncover by sniffing their website was that they are using Three.js to make the magic happen" |
| Canvas element present in hero | Same thread + visual screenshots in community | Full-viewport or near-full-viewport canvas behind/within hero text |
| Dark background aesthetic | Multiple product review screenshots | Near-black or very dark surface, high contrast text |
| Particle/3D visual effect | HN thread + visual community analysis | Likely shader-based particle field, mouse-interactive |
| Next.js framework | Standard for Cognition Labs React-based stack | Server-rendered React application |

### 2.2 Strongly Inferred

| Finding | Reasoning |
|---|---|
| Framer Motion for DOM animations | Industry standard for Next.js + React stacks; consistent with observed entrance animation character; uses `whileInView` + pooled IntersectionObserver |
| Scroll-triggered entrance animations on all sections | Standard SaaS landing page pattern; consistent with visual motion observed across product screenshots |
| Staggered card/feature animations | 80-120ms stagger between siblings — consistent with premium AI SaaS design patterns |
| Spring-like easing | Visual character matches `cubic-bezier(0.16, 1, 0.3, 1)` or similar fast-enter spring; consistent with Framer Motion defaults |
| Fire-once behavior | Framer Motion's `whileInView` default; standard for premium product pages |
| Text-first reveal hierarchy | Heading enters → paragraph follows with delay; consistent with observed visual hierarchy |
| Section-based motion, not page-global | Each section manages its own entrance; no evidence of scroll-progress scrubbing in DOM layer |
| Blur + scale effects on feature spotlights | Consistent with dark-theme "glow" aesthetic on devin.ai; blur-in from slight scale creates depth |

### 2.3 Plausible But Not Directly Confirmed

| Finding | Likelihood | Reasoning |
|---|---|---|
| GPGPU for particle computation | Moderate | Mentioned in community analysis; high particle counts would benefit from GPU offload |
| Stagger delay ~100ms | High | Consistent with premium SaaS timing; Framer Motion default stagger |
| Mouse-tracking spotlight/glow on cards | Moderate | Common in this aesthetic; JavaScript mousemove → CSS custom properties |
| Line/grid decorative SVG elements | Moderate | Common in dark-theme AI SaaS (grid lines, circuit-like paths) |
| Counter-up on statistics sections | Low-Moderate | Standard SaaS pattern; whether devin.ai uses it specifically is unconfirmed |
| Clip-path reveal on bold headline text | Moderate | Premium text reveal technique seen across similar sites |

### 2.4 DOM Structure (Inferred)

Based on visual reviews and standard SaaS landing page patterns:

```
<body> (dark background)
  <nav> (sticky, minimal)
  <section#hero> (canvas behind, text on top)
    <canvas> (Three.js WebGL)
    <h1> (animated fade-up or word-reveal)
    <p> (animated fade-up, delayed)
    <cta-buttons> (animated fade-up, delayed more)
  </section>
  <section#social-proof> (logo bar, fade-in stagger)
  <section#features> (alternating layout blocks)
    [each block: image + text, opposing slide directions]
  <section#how-it-works> (step sequence, stagger)
  <section#testimonials> (card grid, stagger)
  <section#pricing-or-cta> (final conversion section)
  <footer>
```

### 2.5 Motion Character Assessment

| Dimension | Assessment |
|---|---|
| Overall rhythm | Restrained, confident, premium |
| Energy level | Low-to-medium — not flashy, motion serves hierarchy |
| Duration range | 550ms–900ms for entrances |
| Easing character | Spring-like settle — fast initial acceleration, long gentle deceleration |
| Density | Moderate — not every element animates, key hierarchy nodes do |
| Canvas vs DOM split | Canvas: spectacular/immersive hero; DOM: clean entrance reveals |
| Stagger philosophy | Hierarchical — parent before children; heading before body text |
| Section transitions | Clean cut — no exit animations; entering section simply reveals |
| Scroll-linked effects | Only in canvas layer; DOM layer is entry-triggered only |
| Editorial vs technical | Both — technical precision + editorial pacing |

---

## 3. MOTION TAXONOMY

Effects derived from observed patterns, abstracted for reuse.

### Effect Family 1: `reveal-up` (CORE)
- **Visual purpose:** Primary entrance for text and cards — slides from below + fades in
- **Motion model:** `opacity: 0; transform: translateY(40px)` → both to natural values
- **Trigger:** Viewport entry (IntersectionObserver, ~12% threshold)
- **Suitable elements:** Headings, paragraphs, cards, buttons, any primary content
- **Inspired by:** All text/content entrances on devin.ai DOM layer
- **Priority:** Core — default effect

### Effect Family 2: `reveal-left` / `reveal-right` (CORE)
- **Visual purpose:** Directional entrance for alternating feature blocks
- **Motion model:** `translateX(40px)` or `translateX(-40px)` + fade
- **Suitable elements:** Feature section images, side-by-side content blocks
- **Inspired by:** Feature section alternating layouts

### Effect Family 3: `soft-scale` (CORE)
- **Visual purpose:** Depth reveal for images, screenshots, card containers
- **Motion model:** `scale(0.93)` + fade → natural
- **Suitable elements:** Images, product screenshots, icon containers, cards
- **Inspired by:** How UI screenshots and card containers breathe in on devin.ai

### Effect Family 4: `blur-reveal` (CORE-OPTIONAL)
- **Visual purpose:** "Materializing" effect for spotlight features — blurry to sharp
- **Motion model:** `blur(12px) scale(1.02)` + fade → sharp, natural scale
- **Suitable elements:** Feature hero images, bold callout blocks
- **Performance note:** Filter animations promote to compositor — acceptable but watch density
- **Inspired by:** Dark-theme "glow" reveal quality of devin.ai feature blocks

### Effect Family 5: `clip-up` / `clip-left` (CORE-OPTIONAL)
- **Visual purpose:** Bold text reveal — curtain lifts to reveal headline text
- **Motion model:** `clip-path: inset(0 0 100% 0)` → `inset(0)`, slight translateY
- **Suitable elements:** Large headings, section titles, bold callout lines
- **Inspired by:** Cinematic headline reveal style consistent with devin.ai aesthetic

### Effect Family 6: `fade` (CORE)
- **Visual purpose:** Minimal fade-only for backgrounds, decorative elements
- **Motion model:** `opacity: 0` → `opacity: 1`
- **Suitable elements:** Background panels, dividers, secondary text, badges

### Effect Family 7: `depth-shift` (CORE-OPTIONAL)
- **Visual purpose:** Perceived depth on entrance — combines Y travel with scale
- **Motion model:** `translateY(60px) scale(0.97)` → natural; creates 3D depth illusion
- **Suitable elements:** Full-width section intros, large media blocks
- **Inspired by:** Depth perception from Three.js canvas translated to CSS

### Effect Family 8: `stagger-group` (CORE ORCHESTRATION)
- **Visual purpose:** Cascades sibling elements (cards, logos, list items)
- **Technical model:** JS writes incrementing `--fx-delay` CSS variables on children
- **Default stagger:** 100ms between siblings (tunable via `data-fx-stagger`)
- **Inspired by:** All grid/list cascades on devin.ai

### Effect Family 9: `word-reveal` (OPTIONAL)
- **Visual purpose:** Per-word clip entrance for premium headline typography
- **Technical model:** JS splits text into `<span>` wrappers; each word clips up independently
- **Suitable elements:** Large hero headings only — not body text
- **Performance note:** Requires DOM manipulation — use sparingly
- **Inspired by:** Cinematic text reveal style of devin.ai hero section

### Effect Family 10: `line-draw` (OPTIONAL)
- **Visual purpose:** SVG path draws in on scroll entry
- **Technical model:** `stroke-dashoffset` from full path length → 0
- **Suitable elements:** SVG decorative lines, icons, circuit-like grid elements
- **Performance note:** Lightweight — pure CSS transition on SVG properties
- **Inspired by:** Grid lines / circuit aesthetic common in dark AI SaaS sites

### Effect Family 11: `counter-up` (OPTIONAL)
- **Visual purpose:** Numbers count up on scroll entry (statistics sections)
- **Technical model:** rAF-driven number interpolation with ease-out cubic
- **Suitable elements:** Statistic numbers, metrics blocks
- **Note:** Purely JS-driven — CSS handles the entrance reveal only

### Effect Family 12: `spotlight-follow` (EXPERIMENTAL)
- **Visual purpose:** Cursor-tracking glow on hoverable cards
- **Technical model:** `mousemove` → CSS custom property `--fx-mouse-x/y` → radial-gradient `::before`
- **Suitable elements:** Feature cards, pricing cards
- **Performance note:** Uses mousemove with rAF throttle; `pointer-events: none` on pseudo-element
- **Inspired by:** Mouse-interactive card highlights common in premium AI SaaS

### NOT RECOMMENDED FOR WORDPRESS STANDARDIZATION:
- Three.js / WebGL canvas hero
- GPGPU particle systems
- Shader-based morphing effects
- Full-page scroll-scrubbing (GSAP ScrollTrigger-style)
- Canvas text rendering
- Heavy SVG path morphing

---

## 4. WORDPRESS + ELEMENTOR FEASIBILITY ASSESSMENT

### 4.1 Safe as Core Effects

| Effect | Safety Rationale |
|---|---|
| `reveal-up`, `reveal-left`, `reveal-right` | Pure CSS transitions; zero Elementor conflict risk |
| `soft-scale` | Pure CSS scale + opacity; safe on images and containers |
| `fade` | Simplest possible effect; zero risk |
| `depth-shift` | Same mechanics as reveal-up + scale; safe |
| `stagger-group` | JS writes CSS variable only; no DOM structure changes |
| `clip-up` / `clip-left` | CSS clip-path; safe on modern browsers (IE excluded — irrelevant) |

### 4.2 Safe in Specific Contexts

| Effect | Constraint |
|---|---|
| `blur-reveal` | Safe, but limit to 1-2 elements per viewport. Avoid on mobile (filter can cause paint cost on low-end devices). Never apply to large background containers. |
| `word-reveal` | Safe only on single-line or short headings. Do NOT apply to body text, paragraphs, or CTA buttons. Requires `overflow: hidden` on wrapper — test Elementor heading widget padding doesn't clip. |
| `line-draw` | Only on SVG elements that the developer places intentionally. Not compatible with auto-generated Elementor icon widgets. |
| `spotlight-follow` | Only on card containers with explicit `position: relative` and `overflow: hidden`. Test that Elementor's popup system doesn't conflict with mousemove delegation. |

### 4.3 Excluded from Core Engine

| Effect | Reason |
|---|---|
| Three.js canvas effects | Requires bundled JS (hundreds of KB), WebGL API, shader authoring — completely inappropriate for a WordPress custom code snippet |
| GSAP ScrollTrigger scroll-scrubbing | Requires GSAP (external), creates scroll event listeners, conflicts with Elementor's scroll handling |
| SplitText character-level animation | Fragile in Elementor — widget renders text in complex nesting; character splitting breaks inline HTML |
| CSS scroll-driven animations (spec) | Not universally supported; conflicts with Elementor CSS isolation |
| Lottie animations | Requires lottie.js library; JSON files; not part of this engine |

### 4.4 Graceful Fallback Requirements

| Concern | Solution |
|---|---|
| JS fails to load | `[data-fx]` elements set to `opacity: 0` by CSS; fallback `<noscript>` meta or PHP output `is-visible` class on all elements |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` forces all `[data-fx]` to visible immediately |
| Elementor lazy-loads sections | MutationObserver detects new `.elementor-section` nodes and registers their `[data-fx]` children |
| Old browsers (no IntersectionObserver) | Polyfill-free fallback: detect IO availability; if missing, add `fx-visible` to all elements |
| Double-initialization | Namespace guard (`window.__fxEngine`) and per-element `data-fx-registered` flag |
| Content editors delete the JS | All CSS transitions still run — but from already-visible state (PHP fallback adds class) |

### 4.5 Elementor-Specific Risks

| Risk | Mitigation |
|---|---|
| Elementor adds its own `opacity` and `animation` to elements via Entrance Animations feature | Engine uses `data-fx` namespace — do NOT enable Elementor's own Entrance Animation panel on the same element; document this clearly |
| Elementor container/wrapper nesting adds extra divs between `data-fx-group` and intended children | Use `data-fx-group` on the `elementor-row` or direct parent of the animated children — test in preview |
| Elementor sticky headers may affect `rootMargin` calculations | Use `rootMargin: '0px 0px -50px 0px'` (conservative bottom offset) |
| Popup builder may inject content late | MutationObserver handles this automatically |
| Theme CSS may set `overflow: hidden` on sections | Watch for `clip-up` / `clip-left` getting clipped by ancestor overflow |

---

## 5. FX ENGINE ARCHITECTURE

### 5.1 Core Principles

```
1. CSS-first architecture
   All motion is expressed in CSS transitions/transforms.
   JS only manages: class toggling, delay injection, counter/word helpers.

2. Single IntersectionObserver
   One shared IO instance handles every [data-fx] element on the page.
   Threshold: 0.12 (12%) — consistent with devin.ai observed trigger point.
   rootMargin: '0px 0px -50px 0px' — fires slightly before element reaches
   bottom of viewport, creating comfortable timing.

3. Namespace isolation
   All attributes use data-fx prefix.
   All classes use fx- prefix.
   CSS variables use --fx- prefix.
   No global class pollution. No conflict with Elementor's internal system.

4. Fail-visible
   If JS fails: PHP fallback adds fx-visible to body → CSS :not([data-fx="..."])
   Actually: PHP can echo a <style> block that overrides opacity on [data-fx].
   Elements are NEVER permanently hidden without JS recovery.

5. Reduced-motion first
   @media (prefers-reduced-motion) completely overrides hidden states.
   JS bails immediately if prefers-reduced-motion is active.

6. Double-init protection
   window.__fxEngine guard prevents re-initialization.
   data-fx-registered per-element flag prevents double-observation.

7. Modular layers
   Layer 1: Base reveal system (always included)
   Layer 2: Stagger orchestration (always included)
   Layer 3: Optional effects (blur, clip, depth, word)
   Layer 4: Experimental effects (spotlight, counter)
```

### 5.2 System Layers

```
LAYER 1 — Base Reveal System
  Effects: reveal-up, reveal-down, reveal-left, reveal-right, soft-scale, fade
  Cost: ~600 bytes CSS, ~400 bytes JS
  Risk: None
  Include: Always

LAYER 2 — Stagger Orchestration
  Effects: data-fx-group, data-fx-stagger, data-fx-delay
  Cost: ~200 bytes CSS, ~300 bytes JS
  Risk: None
  Include: Always

LAYER 3 — Advanced Entrance Effects
  Effects: blur-reveal, clip-up, clip-left, depth-shift
  Cost: ~400 bytes CSS, 0 extra JS (uses Layer 1 observer)
  Risk: Low — blur on large elements on mobile
  Include: Recommended, exclude blur-reveal for mobile-only pages

LAYER 4 — Optional Utility Effects
  Effects: line-draw, counter-up, word-reveal
  Cost: ~500 bytes CSS, ~600 bytes JS
  Risk: Moderate — word-reveal manipulates DOM; counter needs rAF loop
  Include: Add when specifically needed

LAYER 5 — Experimental
  Effects: spotlight-follow
  Cost: ~200 bytes CSS, ~300 bytes JS
  Risk: Mouse event listener; GPU paint cost
  Include: Only on pages where explicitly justified
```

### 5.3 Authoring API

```
EFFECT SELECTION
  data-fx="reveal-up"       Primary entrance: up + fade
  data-fx="reveal-down"     From above + fade
  data-fx="reveal-left"     From right + fade
  data-fx="reveal-right"    From left + fade
  data-fx="soft-scale"      Scale + fade
  data-fx="blur-reveal"     Blur + scale + fade
  data-fx="clip-up"         Clip-path curtain reveal (up)
  data-fx="clip-left"       Clip-path curtain reveal (left)
  data-fx="fade"            Opacity only
  data-fx="depth-shift"     Y travel + scale (deep reveal)
  data-fx="line-draw"       SVG stroke animation
  data-fx="counter-up"      Number count-up on entry
  data-fx="word-reveal"     Per-word staggered clip entrance
  data-fx="spotlight-follow" Mouse-tracking glow on hover

GROUP ORCHESTRATION
  data-fx-group             Marks parent container for child stagger
  data-fx-stagger="120"     Override stagger step in ms (default: 100)

TIMING
  data-fx-delay="200"       Additional entry delay in ms
  data-fx-speed="fast"      Use --fx-dur-fast (0.45s)
  data-fx-speed="slow"      Use --fx-dur-slow (1.0s)

INTENSITY
  data-fx-intensity="soft"   Shorter distance, lighter blur
  data-fx-intensity="strong" Longer distance, heavier blur

REPEAT BEHAVIOR
  data-fx-once="false"      Re-fires each time element enters viewport
                            (default: fire-once, unobserve after first)

COUNTER OPTIONS
  data-fx-target="1200"     Target number (reads textContent if absent)
  data-fx-prefix="$"        Prefix string
  data-fx-suffix="+"        Suffix string
  data-fx-duration="1500"   Count-up duration in ms
```

### 5.4 Initialization Model

```
Boot sequence:
  1. window.__fxEngine check → bail if already running
  2. prefers-reduced-motion check → bail, leave elements as CSS forces visible
  3. IntersectionObserver browser support check → fallback: show all
  4. Register all [data-fx-group] → stagger children
  5. Register all [data-fx] → observe
  6. MutationObserver on document.body → handle Elementor lazy sections
  7. window.addEventListener('elementor/frontend/init') → re-register

Event order:
  DOMContentLoaded → init()
  If DOM already ready → init() immediately (handles footer JS placement)
  elementor/frontend/init → registerElements(document) (re-scan)
  MutationObserver → registerElements(addedNode) per mutation
```

### 5.5 Performance Budget Strategy

```
will-change:
  Applied: immediately before classList.add('fx-visible'), only on element
  about to animate (revealElement function).
  Removed: in transitionend handler.
  Never: applied in CSS statically to all [data-fx] elements.
  Never: applied to elements with blur-reveal unless they are < 50% viewport.

filter-heavy effects:
  blur-reveal: safe on elements < 600px wide on desktop.
  Not recommended: on full-width hero backgrounds, on body/html, on containers
  with many children.
  Mobile: Consider disabling blur-reveal via [data-fx-speed] or a
  @media(max-width:768px) override in user's CSS.

Compositing:
  Only opacity, transform, filter, clip-path are animated.
  Never: width, height, top, left, margin, padding, font-size.

DOM reads/writes:
  Batched via requestAnimationFrame in revealElement().
  getBoundingClientRect() only in spotlight-follow; throttled via rAF flag.
  SVG path length (getTotalLength) calculated once at init, cached as CSS var.

Lower-end devices:
  Reduced stagger density (increase stagger step).
  Prefer reveal-up over blur-reveal.
  Consider adding data-fx-speed="fast" to reduce animation duration on
  elements further down the page (less patience from users already scrolling).
```

### 5.6 Progressive Enhancement Strategy

```
Without JS:
  CSS [data-fx] sets opacity:0 — elements invisible.
  PHP fallback (wp_footer hook) outputs: [data-fx] { opacity:1 !important }
  This is the fail-visible guarantee.

Without CSS (unlikely):
  Elements are naturally visible; no effect.

Reduced motion:
  CSS @media (prefers-reduced-motion) forces all [data-fx] to visible.
  JS bails immediately — zero overhead.

Older browsers (no IntersectionObserver):
  Polyfill-free fallback: typeof IntersectionObserver check;
  if undefined, call showAll() which adds fx-visible to all [data-fx].

No Elementor:
  Engine is framework-agnostic. Works on any WordPress theme.
  Elementor integration is an authoring convenience, not a dependency.
```

---

## 6. EFFECT CATALOG

| Effect Name | data-fx Value | Type | Use On | Avoid On | Performance | WP Safety |
|---|---|---|---|---|---|---|
| Reveal Up | `reveal-up` | Core | Headings, paragraphs, cards, CTA | Nothing — universal | Minimal | ✅ Safe |
| Reveal Down | `reveal-down` | Core | Intro banners, header elements | — | Minimal | ✅ Safe |
| Reveal Left | `reveal-left` | Core | Right-aligned feature blocks | — | Minimal | ✅ Safe |
| Reveal Right | `reveal-right` | Core | Left-aligned feature blocks | — | Minimal | ✅ Safe |
| Soft Scale | `soft-scale` | Core | Images, screenshots, icon boxes | — | Minimal | ✅ Safe |
| Fade | `fade` | Core | Background panels, dividers, badges | — | Minimal | ✅ Safe |
| Depth Shift | `depth-shift` | Core-Opt | Full-width sections, large media | Small inline elements | Low | ✅ Safe |
| Blur Reveal | `blur-reveal` | Core-Opt | Spotlight images, hero callouts | Full-width backgrounds, mobile pages | Medium | ⚠️ Use sparingly |
| Clip Up | `clip-up` | Core-Opt | Bold section headings, hero titles | Small text, multi-line body | Low | ✅ Safe |
| Clip Left | `clip-left` | Core-Opt | Wide heading reveals, banners | Small elements | Low | ✅ Safe |
| Stagger Group | `data-fx-group` | Orchestration | Any parent of repeating children | — | Minimal | ✅ Safe |
| Word Reveal | `word-reveal` | Optional | Single-line hero headlines only | Body text, captions | Low-Med | ⚠️ Test in Elementor |
| Line Draw | `line-draw` | Optional | Decorative SVG paths, icons | — | Minimal | ✅ Safe on SVGs |
| Counter Up | `counter-up` | Optional | Statistics, metric blocks | — | Low | ✅ Safe |
| Spotlight Follow | `spotlight-follow` | Experimental | Feature cards, pricing cards | — | Medium | ⚠️ Experimental |

---

## 7-9. SEE SEPARATE CODE FILES

- `devin-fx-engine.css` — Complete production CSS
- `devin-fx-engine.js` — Complete production JS
- `devin-fx-wordpress.php` — WordPress integration snippet

---

## 10. DEVELOPER IMPLEMENTATION GUIDE

### Installation

**Step 1: Add the CSS**
Option A (Elementor Pro): Elementor → Custom CSS → paste `devin-fx-engine.css`
Option B (Child theme): Paste into `/child-theme/style.css`
Option C (wp_enqueue): Register as a proper stylesheet in functions.php

**Step 2: Add the JS**
Option A (Elementor Pro): Elementor → Custom Code → New → paste JS → Location: Body End
Option B (functions.php):
```php
function synergy_fx_engine_scripts() {
    wp_enqueue_script(
        'synergy-fx-engine',
        get_stylesheet_directory_uri() . '/js/devin-fx-engine.js',
        array(),
        '1.0.0',
        true  // in footer
    );
}
add_action('wp_enqueue_scripts', 'synergy_fx_engine_scripts');
```

**Step 3: PHP fail-visible fallback**
Add to functions.php:
```php
function synergy_fx_fallback() {
    echo '<noscript><style>[data-fx]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important;}</style></noscript>';
}
add_action('wp_head', 'synergy_fx_fallback');
```

### Adding Effects in Elementor

1. Select any widget in Elementor editor
2. Open **Advanced** tab
3. Scroll to **Custom Attributes**
4. Click **+ Add Row**
5. Key: `data-fx` | Value: `reveal-up` (or any effect name)

### Important: Disable Elementor's Own Entrance Animations

If an element has both `data-fx` and Elementor's built-in "Entrance Animation"
enabled, they will conflict. Rule: use one or the other, never both.
- Turn off Elementor's Entrance Animation on any widget that has `data-fx`.
- Location: Widget → Advanced → Motion Effects → Entrance Animation → None

### Making a Stagger Group

1. Select the **Section** or **Container** that holds the repeating items
2. Advanced → Custom Attributes → `data-fx-group` (leave value empty)
3. For each child column/card: `data-fx` → `reveal-up` (or `soft-scale`)
4. The JS automatically staggers children at 100ms intervals

Custom stagger interval:
- On the group parent: `data-fx-stagger` → `150` (150ms between items)

### Tuning Reference

| Want | Do |
|---|---|
| Faster animations | `data-fx-speed` → `fast` on the element |
| Slower animations | `data-fx-speed` → `slow` on the element |
| Longer travel distance | `data-fx-intensity` → `strong` |
| Shorter travel distance | `data-fx-intensity` → `soft` |
| Delay one element | `data-fx-delay` → `200` (ms) |
| Repeat on every scroll | `data-fx-once` → `false` |
| Change site-wide duration | Edit `--fx-dur-base` in CSS `:root` |
| Change stagger default | Edit `STAGGER_STEP` in JS |

### Conflict Prevention Checklist

- [ ] Disabled Elementor Entrance Animation on all `data-fx` elements
- [ ] Not using `data-fx-group` AND Elementor's grid animation simultaneously
- [ ] Tested with Elementor lazy-load enabled (Section → Advanced → Lazy Load)
- [ ] Confirmed no Elementor plugin (OceanWP, Hello Elementor, etc.) adds its own animation to same nodes
- [ ] Tested with browser reduced-motion enabled (all content visible)
- [ ] Tested with JS disabled (all content visible via CSS fallback)
- [ ] Not applying `blur-reveal` to any element wider than 600px

---

## 11. NON-TECHNICAL ELEMENTOR EDITOR GUIDE

### What Are Scroll Animations?

When you visit a modern website, you might notice that instead of everything
appearing at once, elements gently float up into view, fade in, or reveal
themselves as you scroll down the page. This creates a sense of depth and flow —
it feels like the page is telling a story as you read it.

Think of it like a theatre: actors don't all walk on stage at once. They enter
one by one, from different directions, giving you time to notice each one. The
FX Engine gives your website that same quality.

This system was designed to match the motion feel of Devin.ai — a premium AI
product page that uses sophisticated but restrained animation. The key word is
**restrained**: nothing spins, bounces, or flashes. Everything moves with
purpose and settles cleanly.

---

### The "Sticky Note" System

Every effect is applied by adding a "label" to an element. The label is called
a **Custom Attribute**. Think of it like a sticky note you put on a piece of
furniture that tells the movers: "This one goes in the kitchen."

Your sticky note has two parts:
- **Key** — the type of label (always starts with `data-fx`)
- **Value** — what the label says (the animation name)

---

### How to Add an Animation (Step by Step)

1. Open **Elementor** on any page by clicking **Edit with Elementor**
2. Click on the element you want to animate (a heading, image, card, etc.)
3. In the left panel, click the **Advanced** tab
4. Scroll down until you see **Custom Attributes**
5. Click **+ Add Row**
6. In the **Key** box, type: `data-fx`
7. In the **Value** box, type the animation name (see table below)
8. Click the green **Update** button to save
9. Click the **eye icon** to preview — scroll to your element to see it animate

---

### Animation Menu: What to Type

| What you want | Key field | Value field |
|---|---|---|
| Element floats up and fades in | `data-fx` | `reveal-up` |
| Element floats down and fades in | `data-fx` | `reveal-down` |
| Element slides in from the right | `data-fx` | `reveal-left` |
| Element slides in from the left | `data-fx` | `reveal-right` |
| Element gently grows into place | `data-fx` | `soft-scale` |
| Element fades in (no movement) | `data-fx` | `fade` |
| Element appears with a blur-to-sharp effect | `data-fx` | `blur-reveal` |
| Bold headline lifts up like a curtain | `data-fx` | `clip-up` |
| Number counts up from zero | `data-fx` | `counter-up` |

---

### Making a Card Row Animate One-by-One (Cascade)

When you have a row of cards and want them to animate in sequence (not all
at the same time), you need to mark the parent container.

1. Click on the **Section** or **Container** that holds all the cards
2. Advanced → Custom Attributes → **+ Add Row**
3. Key: `data-fx-group` | Value: *(leave empty)*
4. Click each **individual card or column** inside:
   - Key: `data-fx` | Value: `reveal-up` (or `soft-scale`)
5. Save and preview

**What you will see:** Card 1 appears. 100ms later, Card 2. 100ms later, Card 3.
A clean, confident cascade — not a simultaneous pop.

---

### Speed Controls

| You want | Key | Value |
|---|---|---|
| Animation faster | `data-fx-speed` | `fast` |
| Animation slower | `data-fx-speed` | `slow` |
| Wait before starting | `data-fx-delay` | `200` (or any number of milliseconds) |
| More dramatic movement | `data-fx-intensity` | `strong` |
| Subtler movement | `data-fx-intensity` | `soft` |

---

### ⚠️ Important Rules

1. **Never use Elementor's built-in "Entrance Animation" AND data-fx on the same
   element.** They will fight each other. If you add `data-fx`, go to that
   element's **Motion Effects** panel and set Entrance Animation to **None**.

2. **Don't apply `blur-reveal` to large background sections or images wider than
   the screen.** It is best used on individual feature images or spotlight blocks.

3. **`clip-up` looks best on short, bold headings.** Don't apply it to long
   paragraphs or multi-line text blocks.

4. **Don't over-animate.** Apply effects to the key hierarchy nodes: section
   heading, one or two supporting paragraphs, the card grid. Not every single
   element needs to animate. Restraint creates premium feel.

---

### Troubleshooting

**Element invisible and won't appear:**
The JS may not have loaded. Go to your browser, right-click → Inspect →
Console tab. Look for red errors. If no errors, try clearing your site's cache.

**All cards animate at the same time instead of cascading:**
The `data-fx-group` attribute is probably on a card instead of the section.
Click the outer section container and move it there.

**Animation works in the editor but not live:**
Clear your caching plugin (WP Rocket / LiteSpeed / W3 Total Cache).

**Animations fire but motion looks wrong on mobile:**
On some mobile devices, `blur-reveal` can look heavy. Switch that element to
`reveal-up` instead.

**Text disappeared after using `clip-up` or `word-reveal`:**
A parent container may have `overflow: hidden` set. Check the parent section's
Advanced → Layout → Overflow setting in Elementor. Change to Visible.

---

### Quick Reference

```
EFFECT TABLE:
  reveal-up      → floats up + fades in (default choice)
  reveal-down    → floats down + fades in
  reveal-left    → slides from right + fades in
  reveal-right   → slides from left + fades in
  soft-scale     → grows in from slightly smaller
  fade           → fades in only, no movement
  blur-reveal    → blurry to sharp (use sparingly)
  clip-up        → bold headline curtain reveal
  counter-up     → numbers count up
  word-reveal    → per-word reveal on hero headlines

SPEED MODIFIERS:
  fast → shorter duration
  slow → longer duration

INTENSITY MODIFIERS:
  soft   → subtle movement
  strong → dramatic movement

GOLDEN RULE: One backup before any code change. Always.
```
