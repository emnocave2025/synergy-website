<?php
/**
 * FORMCARRY-FX ENGINE — WordPress Integration
 * ============================================
 * Add this code to your child theme's functions.php
 * OR use a code snippet plugin (WPCode, Code Snippets, etc.)
 *
 * This file provides:
 *   1. Proper script/style enqueueing
 *   2. Fail-visible fallback (noscript CSS)
 *   3. Optional: inline script for ultra-light deployment
 *   4. Optional: Elementor conflict prevention
 *
 * Choose ONE of the deployment options below.
 * Do not use multiple options simultaneously.
 *
 * NAMESPACE: data-fc / .fc- / --fc-*
 */


/* ============================================================
   OPTION A — RECOMMENDED: Enqueue as external files
   Place formcarry-fx-engine.css and formcarry-fx-engine.js
   in your child theme's /assets/ folder.
   ============================================================ */

function synergy_fc_enqueue_assets() {
    $theme_uri = get_stylesheet_directory_uri();
    $theme_dir = get_stylesheet_directory();
    $version   = '1.0.0';

    /* CSS */
    wp_enqueue_style(
        'synergy-fc-engine',
        $theme_uri . '/assets/formcarry-fx-engine.css',
        array(),
        $version
    );

    /* JS — loaded in footer (true = footer) */
    wp_enqueue_script(
        'synergy-fc-engine',
        $theme_uri . '/assets/formcarry-fx-engine.js',
        array(), /* no jQuery dependency */
        $version,
        true     /* footer */
    );
}
add_action( 'wp_enqueue_scripts', 'synergy_fc_enqueue_assets' );


/* ============================================================
   FAIL-VISIBLE FALLBACK
   If JS fails to load or is blocked, this noscript block
   forces all [data-fc] elements to be visible immediately.
   Content is NEVER permanently hidden when JS is absent.
   ============================================================ */

function synergy_fc_noscript_fallback() {
    ?>
    <noscript>
        <style>
            [data-fc],
            [data-fc-group] > *,
            .fc-word-inner {
                opacity:    1 !important;
                transform:  none !important;
                filter:     none !important;
                clip-path:  none !important;
                transition: none !important;
            }
        </style>
    </noscript>
    <?php
}
add_action( 'wp_head', 'synergy_fc_noscript_fallback' );


/* ============================================================
   OPTION B — INLINE DEPLOYMENT (Elementor Free alternative)
   Use INSTEAD of Option A if you cannot enqueue files.
   Paste CSS and JS contents inside the heredocs below.
   ============================================================ */

/*

function synergy_fc_inline_styles() {
    ?>
    <style id="synergy-fc-css">
        // PASTE formcarry-fx-engine.css CONTENTS HERE
    </style>
    <?php
}
add_action( 'wp_head', 'synergy_fc_inline_styles', 20 );


function synergy_fc_inline_script() {
    ?>
    <script id="synergy-fc-js">
        // PASTE formcarry-fx-engine.js CONTENTS HERE
    </script>
    <?php
}
add_action( 'wp_footer', 'synergy_fc_inline_script', 20 );

*/


/* ============================================================
   OPTION C — ELEMENTOR PRO CUSTOM CODE
   CSS: Elementor → Custom Code → Add New
        Title: FC Engine CSS
        Code type: CSS
        Location: Head
        Paste: formcarry-fx-engine.css contents

   JS:  Elementor → Custom Code → Add New
        Title: FC Engine JS
        Code type: JavaScript
        Location: Body End
        Paste: formcarry-fx-engine.js contents
   ============================================================ */


/* ============================================================
   OPTIONAL: BODY CLASS FOR CSS TARGETING
   Adds 'fc-engine-active' class to <body> so you can write
   CSS rules that only apply when the engine is present.
   Example: .fc-engine-active [data-fc] { ... }
   ============================================================ */

function synergy_fc_body_class( $classes ) {
    $classes[] = 'fc-engine-active';
    return $classes;
}
add_filter( 'body_class', 'synergy_fc_body_class' );


/* ============================================================
   OPTIONAL: DISABLE ELEMENTOR ENTRANCE ANIMATIONS
   Prevents Elementor's built-in animations from conflicting
   with data-fc on the same elements.

   IMPORTANT: Elements should use EITHER data-fc OR Elementor's
   entrance animations — never both on the same widget.
   ============================================================ */

/*
 * To disable Elementor entrance animations for a specific widget:
 * In Elementor editor → Advanced tab → Motion Effects → Entrance Animation → None
 *
 * To prevent editors from adding entrance animations on data-fc elements,
 * consider adding a note in your style guide or editorial guidelines.
 */


/* ============================================================
   OPTIONAL: ELEMENTOR EDITOR ADMIN NOTICE
   Reminds editors not to combine Elementor Entrance Animations
   with data-fc attributes on the same elements.
   ============================================================ */

function synergy_fc_elementor_admin_notice() {
    if ( ! current_user_can( 'edit_posts' ) ) return;
    $screen = get_current_screen();
    if ( ! $screen ) return;

    // Only show on Elementor-related admin pages
    if ( strpos( $screen->id, 'elementor' ) === false ) return;

    echo '<div class="notice notice-info is-dismissible">';
    echo '<p><strong>FC Animation Engine:</strong> Do not use Elementor Entrance Animations on elements that already have <code>data-fc</code> attributes. Using both will cause double-animation conflicts.</p>';
    echo '</div>';
}
add_action( 'admin_notices', 'synergy_fc_elementor_admin_notice' );
