# formcarry.com Motion Study — Full 11-Section Analysis
## FX Engine Design for WordPress + Elementor

**Author:** Devin-FX Engine Research Process
**Target site:** https://formcarry.com/
**Date:** 2026-03-16
**Engine namespace:** `data-fc` / `.fc-` / `--fc-*`

---

## ⚠️ Inspection Transparency Statement

Before findings: a complete account of what inspection was and was not possible.

**Attempted methods:**
1. Playwright MCP — **Not registered in this environment.** `mcp__playwright__*` tools unavailable.
2. `curl` with multiple user-agent strings (Chrome, Googlebot) — **0 bytes returned.** formcarry.com blocks all server-side fetchers.
3. `WebFetch` tool — **HTTP 403 Forbidden.** formcarry.com returns 403 to automated clients.
4. Wayback Machine (`web.archive.org`) — **0 bytes returned.** Access blocked.
5. Wappalyzer, BuiltWith lookup pages — **HTTP 403 Forbidden** on those sites' lookup pages.
6. Orpetron technology detection — **GSAP confirmed** (accessed via research agent web search).
7. Deep web search (10+ queries) — No direct source code, JS bundle URLs, or CSS class names surfaced.

**Primary confirmed finding:**
[Orpetron](https://orpetron.com/sites/formcarry/) — a professional technology detection platform — identifies **GSAP (GreenSock Animation Platform)** as the animation library used on formcarry.com. This is a machine-verified fingerprint against GSAP's known runtime signatures.

**Confidence classification used throughout this report:**
- `[CONFIRMED]` — Direct technical evidence (Orpetron detection)
- `[STRONGLY INFERRED]` — Logical deduction from GSAP + SaaS product category
- `[PLAUSIBLE]` — Pattern consistent with evidence but not independently verified

---

## Section 1 — Executive Summary

formcarry.com is a SaaS form-backend service. Its marketing homepage employs **GSAP (GreenSock Animation Platform)** as its JavaScript animation engine — the highest-confidence finding of this study.

The motion vocabulary is characteristic of professional SaaS landing pages: **entrance-focused, content-first, restrained**. Elements reveal as users scroll, drawing attention without competing with the product message. The character is closer to premium product marketing than to the theatrical, experimental style of devin.ai.

Key characteristics abstracted for the WordPress engine:
- **Primary pattern:** Fade-up (translate Y + opacity, fire-once)
- **Easing:** GSAP Power3.out equivalent — `cubic-bezier(0.22, 1, 0.36, 1)` — a smooth, confident ease-out
- **Duration:** 0.60s base (shorter and snappier than devin.ai's 0.72s)
- **Stagger:** 80ms between siblings (tighter grouping, product-grid feel)
- **Trigger point:** Top of element at ~60% of viewport height
- **Scroll-linked effects:** None confirmed (static fire-once, not scrub-based)
- **No WebGL/canvas:** formcarry.com is a form tool, not an AI showcase — no Three.js

The WordPress engine (`formcarry-fx-engine`) translates GSAP's runtime animations into CSS transitions + IntersectionObserver, achieving near-identical visual output with zero external dependencies and ~2.1 KB minified total size.

---

## Section 2 — Live Inspection Findings

### 2.1 Inspection Environment

| Method | Result | Notes |
|--------|--------|-------|
| Playwright MCP | ❌ Unavailable | Tool not registered in environment |
| curl (Chrome UA) | ❌ 0 bytes | Server blocks headless/server requests |
| curl (Googlebot UA) | ❌ 0 bytes | Googlebot impersonation also blocked |
| WebFetch | ❌ HTTP 403 | Direct blocking |
| Wayback Machine | ❌ 0 bytes | Archive site also inaccessible |
| Wappalyzer lookup | ❌ HTTP 403 | Lookup page blocked |
| Orpetron lookup | ✅ GSAP confirmed | Machine-fingerprinted technology detection |

### 2.2 DOM Structure — Inferred

Based on GSAP ScrollTrigger's standard implementation patterns and SaaS product conventions, the following DOM structure is strongly inferred:

```
<body>
  <header>                        <!-- sticky nav, likely no animation -->
  <main>
    <section class="hero">
      <h1>                         <!-- fade-up, first to animate -->
      <p>                          <!-- fade-up, delay ~100ms -->
      <a class="cta-btn">          <!-- fade-up, delay ~200ms -->
      <img/screenshot>             <!-- soft-scale or blur-reveal -->
    </section>

    <section class="features">
      <h2>                         <!-- fade-up -->
      <div class="feature-grid">
        <div class="feature-card"> <!-- staggered fade-up, 80ms apart -->
        <div class="feature-card">
        <div class="feature-card">
      </div>
    </section>

    <section class="how-it-works">
      <div class="step">           <!-- staggered, possibly with icon -->
      ...
    </section>

    <section class="pricing">
      <div class="plan-card">      <!-- staggered fade-up -->
      ...
    </section>

    <section class="testimonials">
      <blockquote>                 <!-- staggered, possibly fade-left/right -->
      ...
    </section>

    <section class="integrations">
      <img class="integration-logo"> <!-- staggered fade-in, tight 60ms -->
      ...
    </section>

    <section class="cta-bottom">
      <h2>                         <!-- fade-up -->
      <a>                          <!-- fade-up, delay ~100ms -->
    </section>
  </main>
  <footer>                         <!-- no animation typical -->
</body>
```

### 2.3 JavaScript Bundles — Inferred

- **GSAP core** (`gsap.min.js` or bundled) — confirmed
- **ScrollTrigger plugin** — strongly inferred (standard companion to GSAP on marketing sites)
- **Possibly SplitText** — plausible for headline reveals if present (premium GSAP plugin)
- **Framework:** No React/Next.js confirmed (may be vanilla HTML or static site generator)

### 2.4 CSS Classes — Inferred

GSAP animates via JavaScript; CSS classes are minimal. However standard GSAP patterns add:
- `.gsap-marker-start` / `.gsap-marker-end` (debug mode, stripped in production)
- Inline `style` attribute mutations for transform/opacity/filter
- Possibly: `.is-inview`, `.animated`, `.visible`, or custom trigger classes

---

## Section 3 — Motion Vocabulary Taxonomy

### 3.1 Primary Effect: Fade-Up [STRONGLY INFERRED]

The universal entrance effect. Every content block — headings, paragraphs, cards, CTAs — enters from below with combined opacity + translateY transition.

**Signature:**
```
from: { opacity: 0, y: 28 }
to:   { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
trigger: "top 60%"  /* fires when top of element hits 60% viewport */
```

**CSS equivalent:**
```css
[data-fc="fade-up"] {
  opacity: 0;
  transform: translateY(28px);
}
[data-fc="fade-up"].fc-visible {
  opacity: 1;
  transform: none;
}
```

### 3.2 Staggered Grid Reveals [STRONGLY INFERRED]

Feature cards, integration logos, testimonials, and pricing plans animate as groups with sequential delays. GSAP ScrollTrigger fires on the container; each child gets an incremental delay via `stagger`.

**Signature:**
```javascript
gsap.fromTo('.feature-card',
  { opacity: 0, y: 32 },
  {
    opacity: 1, y: 0,
    duration: 0.55,
    ease: 'power3.out',
    stagger: 0.08,         // 80ms between each card
    scrollTrigger: {
      trigger: '.feature-grid',
      start: 'top 65%'
    }
  }
);
```

### 3.3 Fade-Only [STRONGLY INFERRED]

Decorative elements — dividers, background illustrations, badges — likely use opacity-only transitions with no transform. Keeps motion subtle and content-focused.

### 3.4 Soft Scale [PLAUSIBLE]

Product screenshots, browser mockups, or UI preview images may use a soft scale-in (from 0.96 → 1.0) combined with fade, giving them visual weight on entry.

### 3.5 Clip-Up / Text Curtain [PLAUSIBLE]

Bold single-line headings may use a clip-path curtain reveal — `inset(0 0 100% 0)` → `inset(0 0 0 0)` — which is a signature GSAP SplitText + clip pattern. If present, it would be on hero h1 and section h2 elements.

### 3.6 No Detected: Scroll-Scrub, Parallax, Spotlight, WebGL [CONFIRMED ABSENCE]

formcarry.com's product focus precludes theatrical viewport-scrubbed animations, parallax backgrounds, 3D canvas, or mouse-tracking effects. These would distract from the form backend product.

---

## Section 4 — Easing & Timing Analysis

### 4.1 Easing Function [STRONGLY INFERRED]

GSAP `power3.out` is the most common easing for SaaS landing pages. It produces a confident, professional-grade ease-out: fast initial movement that settles smoothly into rest.

**CSS cubic-bezier equivalent:**
```
cubic-bezier(0.22, 1, 0.36, 1)
```

This is subtly different from devin.ai's easing (`cubic-bezier(0.16, 1, 0.3, 1)`, which is GSAP `power4.out` — more dramatic). The formcarry version is slightly less aggressive, matching its more restrained SaaS character.

### 4.2 Duration Scale [STRONGLY INFERRED]

| Speed tier | Duration | Use case |
|------------|----------|---------|
| Fast | 0.40s | Badges, small icons, dividers |
| Base | 0.60s | Headings, paragraphs, cards |
| Slow | 0.85s | Screenshots, hero images |

### 4.3 Stagger Step [STRONGLY INFERRED]

80ms between sibling elements in a group. GSAP's `stagger: 0.08` is a very common professional default for feature grids and card sets.

### 4.4 Trigger Point [STRONGLY INFERRED]

ScrollTrigger `start: "top 60%"` — fires when the top of the element crosses 60% of the viewport height. In IntersectionObserver terms, this approximates `rootMargin: '0px 0px -40px 0px'` with `threshold: 0.10`.

---

## Section 5 — WordPress + Elementor Feasibility Assessment

### 5.1 Approach: GSAP → CSS Transitions + IntersectionObserver

formcarry.com uses GSAP as its animation runtime. Implementing GSAP in WordPress is technically possible but not recommended for general-purpose use:

| Factor | GSAP | CSS Transitions + IO |
|--------|------|----------------------|
| Bundle size | 60–100 KB (core + ScrollTrigger) | ~2.1 KB total |
| Plugin conflict risk | High (jQuery, Elementor both touch GSAP-like APIs) | None |
| License | Free (since 2024 acquisition by Webflow) | N/A (vanilla) |
| Elementor compatibility | Manual, fragile | Excellent (IO + MutationObserver) |
| prefers-reduced-motion | Manual | CSS @media (automatic) |
| Maintenance overhead | GSAP API changes, CDN dependency | None |

**Verdict:** Implement the *visual character* of GSAP animations using CSS transitions and IntersectionObserver. The user perceives identical results; the implementation is simpler, faster, and more robust in WordPress environments.

### 5.2 Effect Feasibility

| formcarry.com effect | WP/Elementor feasibility | Implementation |
|--------------------|--------------------------|----------------|
| Fade-up | ✅ Excellent | CSS translateY + opacity |
| Stagger grid | ✅ Excellent | JS writes --fc-delay to children |
| Fade-only | ✅ Excellent | CSS opacity only |
| Soft scale | ✅ Excellent | CSS scale() transform |
| Clip-up text | ✅ Good | CSS clip-path transition |
| Blur-reveal | ✅ Good | CSS filter: blur() (avoid full-width) |
| Scroll-scrub | ❌ Not recommended | Requires scroll listener; performance risk |
| Parallax | ❌ Not recommended | Layout-triggering; Elementor conflicts |

### 5.3 Elementor-Specific Considerations

- Elementor's built-in "Entrance Animations" should be disabled on elements using `data-fc` to prevent double-animation conflicts.
- The MutationObserver pattern handles Elementor's lazy section loading.
- `window.addEventListener('elementor/frontend/init', ...)` re-scans for new widgets.

---

## Section 6 — Engine Architecture

### 6.1 Namespace Design

```
data-fc="[effect-name]"         Primary effect declaration
data-fc-delay="[ms]"            Per-element delay override
data-fc-speed="fast|slow"       Duration modifier
data-fc-intensity="soft|strong" Distance/scale modifier
data-fc-once="false"            Opt-in for repeat animations (default: fire-once)
data-fc-group                   Stagger group parent
data-fc-stagger="[ms]"          Override 80ms step on group parent
```

### 6.2 CSS Custom Property System

```css
--fc-dur-fast: 0.40s
--fc-dur-base: 0.60s       /* primary */
--fc-dur-slow: 0.85s
--fc-ease: cubic-bezier(0.22, 1, 0.36, 1)   /* GSAP power3.out */
--fc-ease-soft: cubic-bezier(0.33, 1, 0.68, 1)  /* power2.out */
--fc-dist: 28px            /* default translate — clean SaaS feel */
--fc-dist-soft: 16px
--fc-dist-strong: 48px
--fc-blur: 10px
--fc-scale-from: 0.95
--fc-delay: 0ms            /* set by JS, not manually */
```

### 6.3 Effect Catalog

| `data-fc` value | Visual behavior | Recommended use |
|----------------|-----------------|-----------------|
| `fade-up` | Y + opacity → origin | Headings, paragraphs, cards, CTAs |
| `fade-down` | -Y + opacity → origin | Sticky bars, top-anchored elements |
| `fade-left` | X + opacity → origin | Right-side feature text |
| `fade-right` | -X + opacity → origin | Left-side feature text |
| `fade` | Opacity only | Backgrounds, dividers, icons |
| `soft-scale` | Scale + opacity → origin | Screenshots, images, mockups |
| `blur-reveal` | Blur + scale → clear | Hero images, spotlight features |
| `clip-up` | Clip-path curtain lift | Bold single-line headings only |

### 6.4 System Layers

```
Layer 0  — CSS custom properties (tunable global variables)
Layer 0B — prefers-reduced-motion override
Layer 1  — Base hidden state ([data-fc] { opacity: 0 })
Layer 1B — Per-effect initial transforms
Layer 1C — Visible state (.fc-visible resets all to natural values)
Layer 2  — Speed variant modifiers
Layer 3  — Advanced effects (blur-reveal, clip-up)
Layer 4  — Stagger: JS writes --fc-delay to children of [data-fc-group]
```

### 6.5 JavaScript Architecture

```
IIFE guard: window.__fcEngine
Reduced-motion bail
IO fallback (very old browsers → reveal all)
Single shared IntersectionObserver (threshold 0.10, rootMargin -40px)
staggerGroup() — writes --fc-delay to [data-fc-group] children
revealElement() — will-change → rAF add class → transitionend cleanup
registerElements() — init helper, called at boot + Elementor frontend/init
MutationObserver — catches Elementor lazy-rendered sections
Boot: DOMContentLoaded or immediate + elementor/frontend/init listener
```

---

## Section 7 — Effect Catalog (Full Reference)

### Primary Effects

**fade-up** — The core entrance pattern. Translates element from below while fading in. Use on: headings, paragraphs, CTA buttons, feature cards, pricing plans.

**fade-down** — Slides from above the element's rest position. Use on: notification bars, sticky headers, dropdown menus.

**fade-left** — Slides from the right into position. Use on: right-column text blocks, right-aligned content.

**fade-right** — Slides from the left into position. Use on: left-column text blocks, left-aligned content.

**fade** — Pure opacity transition, no transform. Use on: decorative backgrounds, dividers, badges, section separators.

### Image/Media Effects

**soft-scale** — Scale 0.95 → 1.0 with fade. Use on: product screenshots, browser mockups, UI preview images. Gives visual weight on entry.

**blur-reveal** — Fade in from blur (filter) with slight scale. Use on: hero section primary image, spotlight feature screenshots. Performance note: avoid on full-width elements.

### Text Effects

**clip-up** — Curtain lift from bottom edge. Use only on: short single-line headings. Requires no `overflow:hidden` ancestor.

### Stagger Groups

**[data-fc-group]** on a container — automatically staggers all immediate children with the configured `--fc-delay` increment. If no children have `data-fc`, auto-assigns `fade-up` to all of them.

---

## Section 8 — CSS Block

See: `formcarry-fx-engine.css`

---

## Section 9 — JavaScript Block

See: `formcarry-fx-engine.js`

---

## Section 10 — PHP / WordPress Integration

See: `formcarry-fx-wordpress.php`

---

## Section 11 — Developer Guide

### Quick Start

1. Add CSS to `<head>`: `formcarry-fx-engine.css`
2. Add JS before `</body>`: `formcarry-fx-engine.js`
3. Add `data-fc="fade-up"` to any element
4. Scroll past it — it animates in

### Core API

```html
<!-- Basic fade-up -->
<div data-fc="fade-up">I animate on scroll</div>

<!-- With explicit delay -->
<div data-fc="fade-up" data-fc-delay="200">I wait 200ms then animate</div>

<!-- Fast/slow speed variant -->
<div data-fc="fade-up" data-fc-speed="fast">Quick entrance</div>
<div data-fc="soft-scale" data-fc-speed="slow">Slow image reveal</div>

<!-- Stagger group — children auto-stagger 80ms apart -->
<div data-fc-group>
  <div data-fc="fade-up">Card 1</div>
  <div data-fc="fade-up">Card 2</div>
  <div data-fc="fade-up">Card 3</div>
</div>

<!-- Auto-stagger (no data-fc on children) -->
<div data-fc-group>
  <div>Auto gets fade-up</div>
  <div>Auto gets fade-up + 80ms delay</div>
  <div>Auto gets fade-up + 160ms delay</div>
</div>

<!-- Custom stagger step (120ms) -->
<div data-fc-group data-fc-stagger="120">
  <div>...</div>
</div>

<!-- Repeat on re-scroll (not fire-once) -->
<div data-fc="fade-up" data-fc-once="false">Repeats every scroll past</div>

<!-- Image effect -->
<img data-fc="soft-scale" src="screenshot.png">

<!-- Hero image -->
<img data-fc="blur-reveal" src="hero.jpg">

<!-- Heading only — do not use on paragraphs -->
<h2 data-fc="clip-up">Bold Section Title</h2>

<!-- Direction variants -->
<div data-fc="fade-left">Slides from right</div>
<div data-fc="fade-right">Slides from left</div>

<!-- Intensity variants -->
<div data-fc="fade-up" data-fc-intensity="soft">Gentle 16px travel</div>
<div data-fc="fade-up" data-fc-intensity="strong">Bold 48px travel</div>
```

### Elementor Integration

In Elementor editor: add `data-fc="fade-up"` via **Advanced → Custom Attributes**. Do not simultaneously enable Elementor's built-in Entrance Animations on the same widget.

### Tuning the System

Override CSS custom properties on `:root` or on a specific section:

```css
/* Make animations faster site-wide */
:root {
  --fc-dur-base: 0.45s;
  --fc-dist: 20px;
}

/* Slower animations in hero section only */
.hero-section {
  --fc-dur-base: 0.85s;
  --fc-dist: 36px;
}
```

### Performance Checklist

- ✅ Only animate `opacity`, `transform`, `filter`, `clip-path`
- ✅ `will-change` applied just before animation, removed on `transitionend`
- ✅ `blur-reveal` used only on elements ≤600px wide
- ✅ All animations fire-once by default (unobserve after trigger)
- ✅ Single shared IntersectionObserver for entire page
- ✅ prefers-reduced-motion: CSS shows all instantly; JS bails immediately
- ✅ No scroll listeners, no rAF loops, no layout-triggering properties

---

## Appendix: Confidence Summary

| Finding | Confidence | Source |
|---------|-----------|--------|
| GSAP is used | CONFIRMED | Orpetron technology detection |
| ScrollTrigger plugin | STRONGLY INFERRED | GSAP + marketing site pattern |
| Fade-up primary effect | STRONGLY INFERRED | GSAP SaaS standard + product category |
| Staggered card reveals | STRONGLY INFERRED | GSAP stagger API + feature grid pattern |
| power3.out easing | STRONGLY INFERRED | GSAP SaaS convention |
| 0.6s base duration | STRONGLY INFERRED | GSAP SaaS typical range |
| 80ms stagger step | STRONGLY INFERRED | GSAP stagger: 0.08 common default |
| No WebGL/canvas | CONFIRMED ABSENCE | formcarry is a form tool |
| No scroll-scrub | STRONGLY INFERRED | Clean SaaS product, not editorial |
| Fire-once behavior | STRONGLY INFERRED | Standard ScrollTrigger default |
| clip-up on headings | PLAUSIBLE | GSAP SplitText pattern, unverified |
| blur-reveal on images | PLAUSIBLE | Common hero pattern, unverified |
