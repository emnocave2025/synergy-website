/* ============================================================
   FORMCARRY-FX ENGINE v1.0 — JavaScript
   Motion system inspired by formcarry.com
   Namespace: data-fc / window.__fcEngine
   Target: WordPress + Elementor (vanilla JS, zero dependencies)

   MOTION CHARACTER:
     GSAP Power3.out easing, 0.60s base, 28px travel distance.
     Fade-up as primary pattern. Stagger for grids and cards.
     Content-first, restrained, professional SaaS feel.

   ARCHITECTURE LAYERS:
     1. Core observer + reveal
     2. Stagger orchestration
     3. Word-reveal (optional — data-fc="word-reveal")
     4. Counter-up (optional — data-fc="counter-up")
     5. MutationObserver for Elementor lazy sections
     6. Boot sequence

   MINIFIED SIZE: ~2.4 KB
   ============================================================ */

(function (win, doc) {
  'use strict';

  /* ----------------------------------------------------------
     NAMESPACE GUARD — prevent double-initialization
     Handles: footer JS placement, Elementor frontend/init
     firing after DOMContentLoaded, plugin rescans.
     ---------------------------------------------------------- */
  if (win.__fcEngine) return;
  win.__fcEngine = true;


  /* ----------------------------------------------------------
     REDUCED MOTION BAIL
     CSS @media (prefers-reduced-motion) already makes elements
     visible. JS has nothing to do — exit immediately.
     ---------------------------------------------------------- */
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;


  /* ----------------------------------------------------------
     INTERSECTION OBSERVER SUPPORT CHECK
     If IO is missing (very old browsers), reveal everything.
     ---------------------------------------------------------- */
  if (typeof IntersectionObserver === 'undefined') {
    doc.querySelectorAll('[data-fc]').forEach(function (el) {
      el.classList.add('fc-visible');
    });
    return;
  }


  /* ----------------------------------------------------------
     CONFIGURATION
     STAGGER_STEP : ms gap between sibling elements in a group
     IO_THRESHOLD : fraction of element that must be visible
     IO_MARGIN    : rootMargin offset (fires 40px before bottom
                    of viewport — comfortable SaaS timing)
     ---------------------------------------------------------- */
  var STAGGER_STEP = 80; /* ms — tighter than devin-fx (100ms) */
  var IO_OPTIONS   = {
    threshold:  0.10,
    rootMargin: '0px 0px -40px 0px'
  };
  var VISIBLE_CLASS = 'fc-visible';


  /* ----------------------------------------------------------
     LAYER 1 — SINGLE SHARED IntersectionObserver
     One instance handles every [data-fc] on the page.
     ---------------------------------------------------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      revealElement(el);

      /* Fire-once (default): unobserve immediately after trigger.
         data-fc-once="false" opts in for repeat animations.    */
      if (el.dataset.fcOnce !== 'false') {
        io.unobserve(el);
      }
    });
  }, IO_OPTIONS);


  /* ----------------------------------------------------------
     LAYER 1B — REVEAL ONE ELEMENT
     Order of operations:
       1. Apply will-change just before animation
       2. rAF batch: add visible class (avoids layout thrash)
       3. transitionend: remove will-change (frees compositor)
     ---------------------------------------------------------- */
  function revealElement(el) {
    el.style.willChange = 'transform, opacity, filter';

    requestAnimationFrame(function () {
      el.classList.add(VISIBLE_CLASS);

      /* Counter-up: kick off number animation on reveal */
      if (el.dataset.fc === 'counter-up') {
        startCounter(el);
      }

      el.addEventListener('transitionend', function onDone(e) {
        /* Only fire on outermost property to avoid multiple triggers */
        if (e.target !== el) return;
        el.style.willChange = '';
        el.removeEventListener('transitionend', onDone);
      });
    });
  }


  /* ----------------------------------------------------------
     LAYER 2 — STAGGER ORCHESTRATION
     Called on [data-fc-group] parents before observing children.
     Writes --fc-delay CSS custom properties to each child.

     Behavior:
       - Children with data-fc → keep effect, add stagger delay
       - Children without data-fc → auto-apply "fade-up"
       - data-fc-delay on a child acts as a base offset
       - data-fc-stagger on parent overrides STAGGER_STEP
     ---------------------------------------------------------- */
  function staggerGroup(parent) {
    /* Guard: only process each group once */
    if (parent.dataset.fcGroupDone) return;
    parent.dataset.fcGroupDone = '1';

    var step = parseInt(parent.dataset.fcStagger || STAGGER_STEP, 10);
    var children = [].slice.call(parent.children);

    /* Find children that already have data-fc */
    var targets = children.filter(function (c) {
      return c.hasAttribute('data-fc');
    });

    /* If none have data-fc, auto-apply fade-up to all children */
    if (targets.length === 0) {
      targets = children;
      targets.forEach(function (c) {
        if (!c.hasAttribute('data-fc')) {
          c.setAttribute('data-fc', 'fade-up');
        }
      });
    }

    targets.forEach(function (c, i) {
      var base  = parseInt(c.dataset.fcDelay || 0, 10);
      var delay = base + i * step;
      c.style.setProperty('--fc-delay', delay + 'ms');
    });
  }


  /* ----------------------------------------------------------
     LAYER 3A — WORD REVEAL
     Splits element text into per-word span wrappers.
     Each word gets an incrementing --fc-delay.

     ONLY call on short, single-line headings.
     Do NOT use on body text, paragraphs, or rich HTML.
     ---------------------------------------------------------- */
  function initWordReveal(el) {
    if (el.dataset.fcWordDone) return;
    el.dataset.fcWordDone = '1';

    var words    = el.textContent.trim().split(/\s+/);
    var wordDelay = 55; /* ms between words */
    var baseDelay = parseInt(el.dataset.fcDelay || 0, 10);

    el.innerHTML = words.map(function (w, i) {
      var delay = baseDelay + i * wordDelay;
      return (
        '<span class="fc-word">' +
        '<span class="fc-word-inner" style="--fc-delay:' + delay + 'ms">' +
        w +
        '</span>' +
        '</span>'
      );
    }).join('');

    /* Observe all .fc-word-inner elements instead of the parent */
    el.querySelectorAll('.fc-word-inner').forEach(function (span) {
      span.style.willChange = 'transform, opacity';
      wordIo.observe(span);
    });

    /* Don't also observe the parent with the main IO */
    el.dataset.fcRegistered = '1';
  }

  /* Minimal second observer for word-reveal spans only */
  var wordIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var span = entry.target;
      requestAnimationFrame(function () {
        span.classList.add(VISIBLE_CLASS);
        span.addEventListener('transitionend', function onDone() {
          span.style.willChange = '';
          span.removeEventListener('transitionend', onDone);
        });
      });
      wordIo.unobserve(span);
    });
  }, IO_OPTIONS);


  /* ----------------------------------------------------------
     LAYER 3B — COUNTER UP
     Animates a number from 0 to data-fc-target (or textContent).
     Supports prefix, suffix, and decimal places.
     Uses ease-out cubic for natural deceleration.
     ---------------------------------------------------------- */
  function startCounter(el) {
    var raw      = el.dataset.fcTarget || el.textContent;
    var target   = parseFloat(raw) || 0;
    var duration = parseInt(el.dataset.fcDuration || 1500, 10);
    var prefix   = el.dataset.fcPrefix  || '';
    var suffix   = el.dataset.fcSuffix  || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var start    = performance.now();

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      /* Ease-out cubic: fast start, gentle settle */
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* ----------------------------------------------------------
     CORE REGISTRATION
     Processes a subtree (default: entire document).
     Called at init and again from MutationObserver / Elementor.
     ---------------------------------------------------------- */
  function registerElements(root) {
    root = root || doc;

    /* Process groups first: writes --fc-delay to children
       before the IO fires for the first time.              */
    root.querySelectorAll('[data-fc-group]').forEach(staggerGroup);

    /* Observe every [data-fc] element */
    root.querySelectorAll('[data-fc]').forEach(function (el) {
      if (el.dataset.fcRegistered) return; /* double-registration guard */
      el.dataset.fcRegistered = '1';

      /* Word-reveal: split text into spans first */
      if (el.dataset.fc === 'word-reveal') {
        initWordReveal(el);
        return; /* wordIo handles observation */
      }

      /* Apply explicit data-fc-delay for non-group elements */
      if (el.dataset.fcDelay && !el.closest('[data-fc-group]')) {
        el.style.setProperty('--fc-delay', el.dataset.fcDelay + 'ms');
      }

      io.observe(el);
    });
  }


  /* ----------------------------------------------------------
     LAYER 5 — MUTATIONOBSERVER
     Catches Elementor lazy-rendered sections, popup builder
     injections, and any other deferred DOM mutations.
     Watches document.body for new [data-fc] subtrees.
     ---------------------------------------------------------- */
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return; /* skip text nodes */

        /* New node itself might be animated */
        if (node.hasAttribute && node.hasAttribute('data-fc')) {
          if (!node.dataset.fcRegistered) {
            node.dataset.fcRegistered = '1';
            if (node.dataset.fc === 'word-reveal') {
              initWordReveal(node);
            } else {
              if (node.dataset.fcDelay && !node.closest('[data-fc-group]')) {
                node.style.setProperty('--fc-delay', node.dataset.fcDelay + 'ms');
              }
              io.observe(node);
            }
          }
        }

        /* New subtree may contain animated children */
        if (node.querySelectorAll) {
          node.querySelectorAll('[data-fc-group]').forEach(staggerGroup);
          node.querySelectorAll('[data-fc]').forEach(function (el) {
            if (el.dataset.fcRegistered) return;
            el.dataset.fcRegistered = '1';
            if (el.dataset.fc === 'word-reveal') {
              initWordReveal(el);
            } else {
              if (el.dataset.fcDelay && !el.closest('[data-fc-group]')) {
                el.style.setProperty('--fc-delay', el.dataset.fcDelay + 'ms');
              }
              io.observe(el);
            }
          });
        }
      });
    });
  });


  /* ----------------------------------------------------------
     LAYER 6 — BOOT SEQUENCE
     Handles: footer JS placement (DOM ready), Elementor's late
     frontend init event, and MutationObserver for deferred nodes.
     ---------------------------------------------------------- */
  function init() {
    registerElements(doc);
    mo.observe(doc.body, { childList: true, subtree: true });
  }

  /* DOMContentLoaded or immediate (if script is in footer) */
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Elementor fires this after its frontend module bootstraps.
     Re-scan guarantees widgets rendered after initial parse
     are picked up (tabs, accordions, popup content).         */
  win.addEventListener('elementor/frontend/init', function () {
    registerElements(doc);
  });

}(window, document));
