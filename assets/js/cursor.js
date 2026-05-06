// Custom cursor + magnetic buttons (ported from portfolio main.js).
// Skips on touch devices.
// =================================================================
(function () {
    'use strict';

    if (window.matchMedia('(hover: none)').matches) return;

    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    var hoverSel = 'a,button,.post-card,.glass-card,.archive__item,.theme-opt,.theme-icon-btn,.btn,.btn-primary,.btn-outline,.btn-glassy,.share-btn,.filter-pill,.pagination-link,.layout-toggle-btn,.feature__item,.taxonomy-card,.tag-pill,.tweaks-btn,.twk-chip';
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverSel)) document.body.classList.add('c-hover');
    });
    document.addEventListener('mouseout', function (e) {
        if (e.target.closest(hoverSel)) document.body.classList.remove('c-hover');
    });
    document.addEventListener('mousedown', function () { document.body.classList.add('c-click'); });
    document.addEventListener('mouseup',   function () { document.body.classList.remove('c-click'); });

    (function lerp() {
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(lerp);
    })();
})();

// Magnetic buttons -- subtle pull-toward-cursor on hover.
(function () {
    'use strict';
    if (window.matchMedia('(hover: none)').matches) return;

    function apply(selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            if (el.dataset.magnetic === '1') return;
            el.dataset.magnetic = '1';

            el.addEventListener('mouseenter', function () {
                el.style.transition = 'transform 0.1s linear';
            });
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var cx = r.left + r.width / 2;
                var cy = r.top  + r.height / 2;
                el.style.transform = 'translate(' + ((e.clientX - cx) * 0.22) + 'px,' + ((e.clientY - cy) * 0.22) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
                el.style.transform = '';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        apply('.btn-primary,.btn-outline,.btn-glassy,.theme-opt,.theme-icon-btn,#back-to-top');
    });
})();
