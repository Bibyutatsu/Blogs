// ================================================
// Blog Enhancements - Animations & Interactivity
// ================================================

(function () {
    'use strict';

    const html = document.documentElement;

    // ================================
    // 1. Scroll Reveal Animations
    // ================================
    const initScrollReveal = () => {
        const revealElements = document.querySelectorAll('.post-card, .section-heading, .section-subtitle, .hero-container');

        if (revealElements.length === 0) return;

        // Add reveal class to elements
        revealElements.forEach((el, index) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${index * 0.1}s`;
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    };

    // ================================
    // 2. Reading Progress Bar
    // ================================
    const initReadingProgress = () => {
        const progressBar = document.getElementById('reading-progress');
        const article = document.querySelector('.page__content, article');

        if (!progressBar || !article) return;

        const updateProgress = () => {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            const start = articleTop - windowHeight;
            const end = articleTop + articleHeight - windowHeight;
            const progress = Math.min(Math.max((scrollTop - start) / (end - start), 0), 1);

            progressBar.style.width = `${progress * 100}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    };

    // ================================
    // 3. Back to Top Button
    // ================================
    const initBackToTop = () => {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
    };

    // ================================
    // 4. Category Filter Pills
    // ================================
    const initCategoryFilter = () => {
        const filterContainer = document.getElementById('category-filters');
        const postCards = document.querySelectorAll('.post-card');

        if (!filterContainer || postCards.length === 0) return;

        // Collect all categories
        const categories = new Set(['All']);
        postCards.forEach(card => {
            const category = card.dataset.category;
            if (category) categories.add(category);
        });

        // Create filter buttons
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-pill' + (category === 'All' ? ' active' : '');
            btn.textContent = category;
            btn.addEventListener('click', () => filterPosts(category, btn));
            filterContainer.appendChild(btn);
        });

        const filterPosts = (category, activeBtn) => {
            // Update active state
            filterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            activeBtn.classList.add('active');

            // Filter posts
            postCards.forEach(card => {
                const cardCategory = card.dataset.category || '';
                if (category === 'All' || cardCategory === category) {
                    card.style.display = '';
                    card.classList.add('revealed');
                } else {
                    card.style.display = 'none';
                }
            });
        };
    };

    // ================================
    // 5. Card Tilt Effect (3D Hover)
    // ================================
    const initCardTilt = () => {
        const cards = document.querySelectorAll('.post-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    };

    // ================================
    // 6. Share Buttons
    // ================================
    const initShareButtons = () => {
        const shareContainer = document.getElementById('share-buttons');
        if (!shareContainer) return;

        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);

        // Copy link button
        const copyBtn = shareContainer.querySelector('.share-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
        }
    };

    // ================================
    // 7. Smooth Anchor Scrolling
    // ================================
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // ================================
    // Initialize All
    // ================================
    document.addEventListener('DOMContentLoaded', () => {
        initScrollReveal();
        initReadingProgress();
        initBackToTop();
        initCategoryFilter();
        initCardTilt();
        initShareButtons();
        initSmoothScroll();
    });

})();
