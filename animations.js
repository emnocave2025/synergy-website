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
        Elements are already visible via the CSS @media rule;
        we just skip all JS setup entirely.
     ---------------------------------------------------------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;


  /* ----------------------------------------------------------
     1. CONFIGURATION
        threshold  : fraction of element that must be visible
                     before the animation fires (0.12 = 12 %)
        rootMargin : virtual padding on the viewport boundary.
                     "-40px" at the bottom means the trigger
                     fires 40 px before the element's bottom
                     edge reaches the viewport bottom.
     ---------------------------------------------------------- */
  var STAGGER_STEP = 80;   /* ms added per sibling in a group */
  var IO_OPTIONS   = {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px'
  };


  /* ----------------------------------------------------------
     2. SINGLE SHARED IntersectionObserver
        One instance watches every [data-animate] on the page.
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

      /* Fire-once (default): stop watching after first trigger */
      if (el.dataset.animateOnce !== 'false') {
        observer.unobserve(el);
      }
    });
  }


  /* ----------------------------------------------------------
     4. REVEAL ONE ELEMENT
        • Apply will-change just before the animation so the
          browser can promote the layer without repainting the
          whole page.
        • Use rAF to batch class changes and avoid layout thrash.
        • Remove will-change on transitionend to free GPU memory.
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
        Called on any element with [data-animate-group].
        • If children already have data-animate → keep their
          animation type, just add incrementing delays.
        • If none have data-animate → auto-apply "fade-up" to
          every direct child, then stagger.
        • Respects each child's own data-animate-delay as a
          base offset (stagger is added on top of it).
     ---------------------------------------------------------- */
  function staggerGroup(parent) {
    /* Guard: skip if already processed (prevents double-run) */
    if (parent.dataset.animateGroupDone) return;
    parent.dataset.animateGroupDone = '1';

    var children = Array.prototype.slice.call(parent.children);

    /* Targets = children that already carry data-animate */
    var targets = children.filter(function (c) {
      return c.hasAttribute('data-animate');
    });

    /* If none have the attribute, auto-apply fade-up to all */
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
        • Processes groups first so stagger delays are written
          to CSS custom properties before the observer fires.
        • Guards against double-registration with a data flag.
     ---------------------------------------------------------- */
  function registerElements(root) {
    root = root || document;

    /* 6a. Stagger all groups */
    root.querySelectorAll('[data-animate-group]').forEach(function (group) {
      staggerGroup(group);
    });

    /* 6b. Observe every [data-animate] element */
    root.querySelectorAll('[data-animate]').forEach(function (el) {
      /* Skip already-registered elements */
      if (el.dataset.animateRegistered) return;
      el.dataset.animateRegistered = '1';

      /* Apply individual delay for non-group elements */
      if (el.dataset.animateDelay && !el.closest('[data-animate-group]')) {
        el.style.setProperty('--sg-delay', el.dataset.animateDelay + 'ms');
      }

      observer.observe(el);
    });
  }


  /* ----------------------------------------------------------
     7. MUTATIONOBSERVER — Elementor lazy-load fallback
        Elementor can inject new .elementor-section nodes into
        the DOM after initial page load (e.g. infinite scroll,
        popup builders, lazy-render sections).
        This watcher picks up any new [data-animate] elements
        injected after init() has already run.
     ---------------------------------------------------------- */
  var mutObs = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return; /* ignore text nodes */

        /* New node itself might be animated */
        if (node.hasAttribute && node.hasAttribute('data-animate')) {
          if (!node.dataset.animateRegistered) {
            node.dataset.animateRegistered = '1';
            if (node.dataset.animateDelay && !node.closest('[data-animate-group]')) {
              node.style.setProperty('--sg-delay', node.dataset.animateDelay + 'ms');
            }
            observer.observe(node);
          }
        }

        /* New node may contain animated children */
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
        • Runs on DOMContentLoaded (or immediately if DOM is
          already ready — handles Footer JS placement).
        • Also listens for Elementor's own "frontend init" event
          which fires after Elementor re-renders widgets.
        • MutationObserver watches for any further DOM changes.
     ---------------------------------------------------------- */
  function init() {
    registerElements(document);
    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    /* DOM already parsed (script is in footer) */
    init();
  }

  /* Elementor fires this after its frontend module bootstraps */
  window.addEventListener('elementor/frontend/init', function () {
    registerElements(document);
  });

}());
