// Particle Animation for Blog Hero
// Ported from Portfolio Design System
// ====================================

(function () {
    'use strict';

    // Try to find canvas in homepage hero OR post page hero
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Find parent container - either #hero or .page__hero--overlay
    const heroSection = document.getElementById('hero') || canvas.closest('.page__hero--overlay');
    if (!heroSection) return;

    const ctx = canvas.getContext('2d');
    const html = document.documentElement;
    let width, height;
    let particles = [];
    let animationId;
    let isVisible = true;

    // Initialize canvas size
    const initCanvas = () => {
        width = canvas.width = heroSection.offsetWidth;
        height = canvas.height = heroSection.offsetHeight;
    };

    // Create particles
    const createParticles = () => {
        particles = [];
        // Slightly reduced density for larger particles
        const particleCount = Math.floor(width / 12);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1.5, // 1.5px to 3.5px
                opacity: Math.random() * 0.25 + 0.4 // 0.4 to 0.65
            });
        }
    };

    // Theme → particle color (RGB triplet read from --accent-rgb).
    let cachedColor = '0, 204, 255';
    const refreshColor = () => {
        const v = getComputedStyle(html).getPropertyValue('--accent-rgb').trim();
        if (v) cachedColor = v;
    };
    refreshColor();
    document.addEventListener('theme-change', refreshColor);

    // Draw particles and connections
    const drawParticles = () => {
        if (!isVisible) return; // Skip rendering when off-screen

        ctx.clearRect(0, 0, width, height);

        const color = cachedColor;

        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
            ctx.fill();

            // Move particle
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        // Draw connections between nearby particles
        particles.forEach((p1, i) => {
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ${0.6 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        animationId = requestAnimationFrame(drawParticles);
    };

    // Initialize
    initCanvas();
    createParticles();
    drawParticles();

    // Pause/resume animation based on visibility
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                drawParticles(); // Resume
            } else if (!isVisible && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
    }, { threshold: 0 });

    visibilityObserver.observe(heroSection);

    // Resize handler
    window.addEventListener('resize', () => {
        initCanvas();
        createParticles();
    });

    // Scroll to posts section (homepage only)
    const heroDown = document.getElementById('hero-down');
    if (heroDown) {
        heroDown.addEventListener('click', () => {
            const postsSection = document.getElementById('posts');
            if (postsSection) {
                postsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
})();
