// Theme Toggle - Matching Portfolio Behavior
// ==========================================

(function() {
    'use strict';
    
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    const html = document.documentElement;
    const icon = toggle.querySelector('i');
    
    // Load saved preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
    
    // Toggle handler
    toggle.addEventListener('click', function() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon(next);
    });
    
    function updateIcon(theme) {
        if (icon) {
            // Sun icon for dark mode (click to go light), Moon for light mode (click to go dark)
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
})();
