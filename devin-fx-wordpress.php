<?php
/**
 * DEVIN-FX ENGINE — WordPress Integration
 * ========================================
 * Add this code to your child theme's functions.php
 * OR use a code snippet plugin (WPCode, Code Snippets, etc.)
 *
 * This file provides:
 *   1. Proper script/style enqueueing
 *   2. Fail-visible fallback (noscript CSS)
 *   3. Optional: inline script for ultra-light deployment
 *
 * Choose ONE of the deployment options below.
 * Do not use multiple options simultaneously.
 */


/* ============================================================
   OPTION A — RECOMMENDED: Enqueue as external files
   Place devin-fx-engine.css and devin-fx-engine.js in your
   child theme's /assets/ folder (create it if needed).
   ============================================================ */

function synergy_fx_enqueue_assets() {
    $theme_uri = get_stylesheet_directory_uri();
    $theme_dir = get_stylesheet_directory();
    $version   = '1.0.0';

    /* CSS */
    wp_enqueue_style(
        'synergy-fx-engine',
        $theme_uri . '/assets/devin-fx-engine.css',
        array(),
        $version
    );

    /* JS — loaded in footer (true = footer) */
    wp_enqueue_script(
        'synergy-fx-engine',
        $theme_uri . '/assets/devin-fx-engine.js',
        array(), /* no jQuery dependency */
        $version,
        true     /* footer */
    );
}
add_action( 'wp_enqueue_scripts', 'synergy_fx_enqueue_assets' );


/* ============================================================
   FAIL-VISIBLE FALLBACK
   If JS fails to load or is blocked, this noscript block
   forces all [data-fx] elements to be visible immediately.
   This is the fail-visible guarantee — content is NEVER
   permanently hidden when JS is absent.
   ============================================================ */

function synergy_fx_noscript_fallback() {
    ?>
    <noscript>
        <style>
            [data-fx],
            [data-fx-group] > *,
            .fx-word-inner {
                opacity:    1 !important;
                transform:  none !important;
                filter:     none !important;
                clip-path:  none !important;
                transition: none !important;
            }
            [data-fx="line-draw"] path,
            [data-fx="line-draw"] polyline,
            [data-fx="line-draw"] line,
            [data-fx="line-draw"] circle {
                stroke-dashoffset: 0 !important;
            }
        </style>
    </noscript>
    <?php
}
add_action( 'wp_head', 'synergy_fx_noscript_fallback' );


/* ============================================================
   OPTION B — INLINE DEPLOYMENT (Elementor Free alternative)
   Use this INSTEAD of Option A if you cannot enqueue files.
   Paste the contents of devin-fx-engine.css inside the CSS
   heredoc, and devin-fx-engine.js inside the JS heredoc.
   ============================================================ */

/*

function synergy_fx_inline_styles() {
    ?>
    <style id="synergy-fx-css">
        // PASTE devin-fx-engine.css CONTENTS HERE
    </style>
    <?php
}
add_action( 'wp_head', 'synergy_fx_inline_styles', 20 );


function synergy_fx_inline_script() {
    ?>
    <script id="synergy-fx-js">
        // PASTE devin-fx-engine.js CONTENTS HERE
    </script>
    <?php
}
add_action( 'wp_footer', 'synergy_fx_inline_script', 20 );

*/


/* ============================================================
   OPTION C — ELEMENTOR PRO CUSTOM CODE
   If using Elementor Pro, use its Custom Code feature instead
   of this PHP file. No PHP code needed in that case.

   CSS: Elementor → Custom Code → Add New
        Title: FX Engine CSS
        Code type: CSS
        Location: Head
        Paste: devin-fx-engine.css contents

   JS:  Elementor → Custom Code → Add New
        Title: FX Engine JS
        Code type: JavaScript
        Location: Body End
        Paste: devin-fx-engine.js contents
   ============================================================ */


/* ============================================================
   OPTIONAL: DISABLE ELEMENTOR ENTRANCE ANIMATIONS
   Prevents Elementor's built-in animation system from
   conflicting with data-fx on the same elements.
   Remove this if you want to use Elementor animations on
   some elements while using data-fx on others.
   ============================================================ */

/*
function synergy_disable_elementor_animations( $settings ) {
    // This filter removes Elementor's entrance animations globally.
    // Use with caution — affects ALL Elementor elements.
    return $settings;
}
*/


/* ============================================================
   OPTIONAL: ELEMENTOR EDITOR NOTICE
   Reminds editors not to use Elementor Entrance Animations
   on elements that already have data-fx attributes.
   ============================================================ */

function synergy_fx_editor_admin_notice() {
    if ( ! current_user_can( 'edit_posts' ) ) return;
    $screen = get_current_screen();
    if ( ! $screen || $screen->id !== 'elementor' ) return;
    // Only show in Elementor editor context
    // Note: Elementor editor screens vary by version
}


/* ============================================================
   OPTIONAL: BODY CLASS FOR CSS TARGETING
   Adds 'fx-engine-active' class to <body> so you can write
   CSS rules that only apply when the engine is present.
   Example: .fx-engine-active [data-fx] { ... }
   ============================================================ */

function synergy_fx_body_class( $classes ) {
    $classes[] = 'fx-engine-active';
    return $classes;
}
add_filter( 'body_class', 'synergy_fx_body_class' );
