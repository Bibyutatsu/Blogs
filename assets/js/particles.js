// Particle Animation for Blog Hero
// Ported from Portfolio Design System
// ====================================

(function () {
    'use strict';

    const heroSection = document.getElementById('hero');
    const canvas = document.getElementById('hero-canvas');

    if (!heroSection || !canvas) return;

    const ctx = canvas.getContext('2d');
    const html = document.documentElement;
    let width, height;
    let particles = [];
    let animationId;

    // Initialize canvas size
    const initCanvas = () => {
        width = canvas.width = heroSection.offsetWidth;
        height = canvas.height = heroSection.offsetHeight;
    };

    // Create particles
    const createParticles = () => {
        particles = [];
        // Slightly reduced density for larger particles
        const particleCount = Math.floor(width / 10);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 2, // 2px to 4px
                opacity: Math.random() * 0.3 + 0.5 // 0.5 to 0.8
            });
        }
    };

    // Draw particles and connections
    const drawParticles = () => {
        ctx.clearRect(0, 0, width, height);

        // Check theme for particle color
        const isDark = html.getAttribute('data-theme') === 'dark';
        const color = isDark ? '255, 255, 255' : '13, 53, 128';

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

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ${0.8 * (1 - dist / 120)})`;
                    ctx.lineWidth = 1;
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

    // Resize handler
    window.addEventListener('resize', () => {
        initCanvas();
        createParticles();
    });

    // Scroll to posts section
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
