/* ============================================================
   DEVIN-FX ENGINE v1.0 — JavaScript
   Motion system inspired by devin.ai
   Namespace: data-fx / window.__fxEngine
   Target: WordPress + Elementor (vanilla JS, zero dependencies)

   ARCHITECTURE LAYERS:
     1. Core observer + reveal
     2. Stagger orchestration
     3. Word-reveal (optional — data-fx="word-reveal")
     4. Counter-up (optional — data-fx="counter-up")
     5. Line-draw init (optional — data-fx="line-draw")
     6. Spotlight-follow (experimental — data-fx="spotlight-follow")
     7. MutationObserver for Elementor lazy sections
     8. Boot sequence

   MINIFIED SIZE: ~2.9 KB
   ============================================================ */

(function (win, doc) {
  'use strict';

  /* ----------------------------------------------------------
     NAMESPACE GUARD — prevent double-initialization
     Handles: footer JS placement, Elementor frontend/init
     firing after DOMContentLoaded, aggressive plugin rescans.
     ---------------------------------------------------------- */
  if (win.__fxEngine) return;
  win.__fxEngine = true;


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
    doc.querySelectorAll('[data-fx]').forEach(function (el) {
      el.classList.add('fx-visible');
    });
    return;
  }


  /* ----------------------------------------------------------
     CONFIGURATION
     STAGGER_STEP : ms gap between sibling elements in a group
     IO_THRESHOLD : fraction of element that must be visible
     IO_MARGIN    : rootMargin offset (fires 50px before bottom
                    of viewport — comfortable timing)
     ---------------------------------------------------------- */
  var STAGGER_STEP = 100; /* ms */
  var IO_OPTIONS   = {
    threshold:  0.12,
    rootMargin: '0px 0px -50px 0px'
  };
  var VISIBLE_CLASS = 'fx-visible';


  /* ----------------------------------------------------------
     LAYER 1 — SINGLE SHARED IntersectionObserver
     One instance handles every [data-fx] on the page.
     ---------------------------------------------------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      revealElement(el);

      /* Fire-once (default): unobserve immediately after trigger.
         data-fx-once="false" opts the element in for repeat.    */
      if (el.dataset.fxOnce !== 'false') {
        io.unobserve(el);
      }
    });
  }, IO_OPTIONS);


  /* ----------------------------------------------------------
     LAYER 1B — REVEAL ONE ELEMENT
     Order of operations:
       1. Apply will-change just before animation (promotes layer)
       2. rAF batch: add visible class (avoids layout thrash)
       3. transitionend: remove will-change (frees compositor mem)
     ---------------------------------------------------------- */
  function revealElement(el) {
    el.style.willChange = 'transform, opacity, filter';

    requestAnimationFrame(function () {
      el.classList.add(VISIBLE_CLASS);

      /* Counter-up: kick off number animation on reveal */
      if (el.dataset.fx === 'counter-up') {
        startCounter(el);
      }

      el.addEventListener('transitionend', function onDone(e) {
        /* Only fire on the outermost property to avoid multiple triggers */
        if (e.target !== el) return;
        el.style.willChange = '';
        el.removeEventListener('transitionend', onDone);
      });
    });
  }


  /* ----------------------------------------------------------
     LAYER 2 — STAGGER ORCHESTRATION
     Called on [data-fx-group] parents before observing children.
     Writes --fx-delay CSS custom properties to each child.

     Behavior:
       - Children with data-fx → keep their effect, add delay
       - Children without data-fx → auto-apply "reveal-up"
       - data-fx-delay on a child acts as a base offset
       - data-fx-stagger on parent overrides STAGGER_STEP
     ---------------------------------------------------------- */
  function staggerGroup(parent) {
    /* Guard: only process each group once */
    if (parent.dataset.fxGroupDone) return;
    parent.dataset.fxGroupDone = '1';

    var step = parseInt(parent.dataset.fxStagger || STAGGER_STEP, 10);
    var children = [].slice.call(parent.children);

    /* Find children that already have data-fx */
    var targets = children.filter(function (c) {
      return c.hasAttribute('data-fx');
    });

    /* If none have data-fx, auto-apply reveal-up to all children */
    if (targets.length === 0) {
      targets = children;
      targets.forEach(function (c) {
        if (!c.hasAttribute('data-fx')) {
          c.setAttribute('data-fx', 'reveal-up');
        }
      });
    }

    targets.forEach(function (c, i) {
      var base  = parseInt(c.dataset.fxDelay || 0, 10);
      var delay = base + i * step;
      c.style.setProperty('--fx-delay', delay + 'ms');
    });
  }


  /* ----------------------------------------------------------
     LAYER 4A — WORD REVEAL
     Splits element text content into per-word span wrappers.
     Each word gets an incrementing --fx-delay.

     ONLY call on short, single-line headings.
     Do NOT use on body text, paragraphs, or rich HTML content.
     ---------------------------------------------------------- */
  function initWordReveal(el) {
    if (el.dataset.fxWordDone) return;
    el.dataset.fxWordDone = '1';

    var words = el.textContent.trim().split(/\s+/);
    var wordDelay = 55; /* ms between words */
    var baseDelay = parseInt(el.dataset.fxDelay || 0, 10);

    el.innerHTML = words.map(function (w, i) {
      var delay = baseDelay + i * wordDelay;
      return (
        '<span class="fx-word">' +
        '<span class="fx-word-inner" style="--fx-delay:' + delay + 'ms">' +
        w +
        '</span>' +
        '</span>'
      );
    }).join('');

    /* Observe all .fx-word-inner elements instead of the parent */
    el.querySelectorAll('.fx-word-inner').forEach(function (span) {
      span.style.willChange = 'transform, opacity';
      /* Add directly to a separate minimal observer for word spans */
      wordIo.observe(span);
    });

    /* Don't also observe the parent with the main IO */
    el.dataset.fxRegistered = '1';
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
     LAYER 4B — COUNTER UP
     Animates a number from 0 to data-fx-target (or textContent).
     Supports prefix, suffix, and decimal places.
     Uses ease-out cubic for natural deceleration.
     ---------------------------------------------------------- */
  function startCounter(el) {
    var raw      = el.dataset.fxTarget || el.textContent;
    var target   = parseFloat(raw) || 0;
    var duration = parseInt(el.dataset.fxDuration || 1500, 10);
    var prefix   = el.dataset.fxPrefix   || '';
    var suffix   = el.dataset.fxSuffix   || '';
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
     LAYER 4C — LINE DRAW INIT
     Measures SVG path lengths and sets --fx-stroke-len CSS var.
     Must run before observation so transition knows the length.
     ---------------------------------------------------------- */
  function initLineDraws(root) {
    root.querySelectorAll('[data-fx="line-draw"]').forEach(function (el) {
      el.querySelectorAll('path, polyline, line, circle').forEach(function (p) {
        var len = (p.getTotalLength && p.getTotalLength()) || 1000;
        p.style.setProperty('--fx-stroke-len', len);
      });
    });
  }


  /* ----------------------------------------------------------
     LAYER 5 — SPOTLIGHT FOLLOW (Experimental)
     Delegates to a single document-level mousemove listener.
     Updates --fx-mouse-x/y CSS custom properties on each
     [data-fx="spotlight-follow"] element.
     rAF-throttled to one update per frame.
     ---------------------------------------------------------- */
  var spotlightEls     = [];
  var spotlightPending = false;

  function initSpotlights(root) {
    root.querySelectorAll('[data-fx="spotlight-follow"]').forEach(function (el) {
      if (spotlightEls.indexOf(el) === -1) spotlightEls.push(el);
    });
  }

  /* Mousemove listener is always registered (cheaply exits if no spotlights).
     This ensures elements added later by Elementor lazy-load are also tracked. */
  doc.addEventListener('mousemove', function (e) {
    if (!spotlightEls.length || spotlightPending) return;
    spotlightPending = true;
    requestAnimationFrame(function () {
      spotlightEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
        var y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
        el.style.setProperty('--fx-mouse-x', x);
        el.style.setProperty('--fx-mouse-y', y);
      });
      spotlightPending = false;
    });
  });


  /* ----------------------------------------------------------
     CORE REGISTRATION
     Processes a subtree (default: entire document).
     Called at init and again from MutationObserver / Elementor.
     ---------------------------------------------------------- */
  function registerElements(root) {
    root = root || doc;

    /* Init helpers that must run before observation */
    initLineDraws(root);
    initSpotlights(root);

    /* Process groups first: writes --fx-delay to children
       before the IO fires for the first time.              */
    root.querySelectorAll('[data-fx-group]').forEach(staggerGroup);

    /* Observe every [data-fx] element */
    root.querySelectorAll('[data-fx]').forEach(function (el) {
      if (el.dataset.fxRegistered) return; /* double-registration guard */
      el.dataset.fxRegistered = '1';

      /* Word-reveal: split text into spans first */
      if (el.dataset.fx === 'word-reveal') {
        initWordReveal(el);
        return; /* wordIo handles observation */
      }

      /* Apply explicit data-fx-delay for non-group elements */
      if (el.dataset.fxDelay && !el.closest('[data-fx-group]')) {
        el.style.setProperty('--fx-delay', el.dataset.fxDelay + 'ms');
      }

      /* Spotlight-follow: not scroll-observed — mouse-driven only */
      if (el.dataset.fx === 'spotlight-follow') return;

      io.observe(el);
    });
  }


  /* ----------------------------------------------------------
     LAYER 7 — MUTATIONOBSERVER
     Catches Elementor lazy-rendered sections, popup builder
     injections, and any other deferred DOM mutations.
     Watches document.body for new [data-fx] subtrees.
     ---------------------------------------------------------- */
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return; /* skip text nodes */

        /* New node itself might be animated */
        if (node.hasAttribute && node.hasAttribute('data-fx')) {
          if (!node.dataset.fxRegistered) {
            node.dataset.fxRegistered = '1';
            if (node.dataset.fx === 'word-reveal') {
              initWordReveal(node);
            } else if (node.dataset.fx !== 'spotlight-follow') {
              if (node.dataset.fxDelay && !node.closest('[data-fx-group]')) {
                node.style.setProperty('--fx-delay', node.dataset.fxDelay + 'ms');
              }
              io.observe(node);
            }
          }
        }

        /* New subtree may contain animated children */
        if (node.querySelectorAll) {
          initLineDraws(node);
          initSpotlights(node);
          node.querySelectorAll('[data-fx-group]').forEach(staggerGroup);
          node.querySelectorAll('[data-fx]').forEach(function (el) {
            if (el.dataset.fxRegistered) return;
            el.dataset.fxRegistered = '1';
            if (el.dataset.fx === 'word-reveal') {
              initWordReveal(el);
            } else if (el.dataset.fx !== 'spotlight-follow') {
              if (el.dataset.fxDelay && !el.closest('[data-fx-group]')) {
                el.style.setProperty('--fx-delay', el.dataset.fxDelay + 'ms');
              }
              io.observe(el);
            }
          });
        }
      });
    });
  });


  /* ----------------------------------------------------------
     LAYER 8 — BOOT SEQUENCE
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
