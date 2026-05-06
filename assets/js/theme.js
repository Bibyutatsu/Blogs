// Theme Switcher (5 themes) - mirrors portfolio behaviour.
// Storage key: 'bm-theme' (shared with the portfolio site).
// =========================================================
(function () {
    'use strict';

    var ALLOWED = ['dark', 'light', 'batman', 'cyberpunk', 'ocean'];
    var LABELS = { dark: 'Dark', light: 'Light', batman: 'Batman', cyberpunk: 'Cyber', ocean: 'Ocean' };

    var btn = document.getElementById('theme-btn');
    var pop = document.getElementById('theme-popover');
    if (!btn || !pop) return;
    var opts = pop.querySelectorAll('.theme-opt');
    var label = btn.querySelector('.theme-label');

    function readSaved() {
        var v = localStorage.getItem('bm-theme') || localStorage.getItem('theme') || 'dark';
        return ALLOWED.indexOf(v) === -1 ? 'dark' : v;
    }

    function applyTheme(theme, save) {
        document.documentElement.setAttribute('data-theme', theme);
        if (save) {
            localStorage.setItem('bm-theme', theme);
            // Also write the legacy key so anything reading 'theme' keeps working.
            localStorage.setItem('theme', theme);
        }
        opts.forEach(function (o) {
            o.classList.toggle('active', o.dataset.theme === theme);
        });
        if (label) label.textContent = LABELS[theme] || theme;
        // Notify other modules (particles, mermaid).
        document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: theme } }));
    }

    // Init from saved preference (FOUC-script already sets data-theme; this syncs the UI).
    applyTheme(readSaved(), false);

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = pop.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !pop.contains(e.target)) {
            pop.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    pop.addEventListener('click', function (e) { e.stopPropagation(); });

    opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
            applyTheme(opt.dataset.theme, true);
            pop.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });

    // Sync between tabs.
    window.addEventListener('storage', function (e) {
        if (e.key === 'bm-theme' && ALLOWED.indexOf(e.newValue) !== -1) {
            applyTheme(e.newValue, false);
        }
    });
})();
