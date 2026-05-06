// ================================================
// Blog Enhancements - Animations & Interactivity
// ================================================

(function () {
    'use strict';

    // ================================
    // 1. Scroll Reveal Animations
    // ================================
    const initScrollReveal = () => {
        const els = document.querySelectorAll('.reveal');
        if (els.length === 0) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });

        els.forEach(el => obs.observe(el));
    };

    const initCardReveal = () => {
        const cards = document.querySelectorAll('.post-card');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    setTimeout(() => e.target.classList.add('revealed'), i * 80);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08 });
        cards.forEach(c => obs.observe(c));
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

        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
    };

    // ================================
    // 4. Category Filter Pills
    // ================================
    const initCategoryFilter = () => {
        const filterContainer = document.getElementById('category-filters');
        const postCards = document.querySelectorAll('.post-card');

        if (!filterContainer || postCards.length === 0) return;

        // Count categories using data-cats for multi-category support
        const catCount = {};
        postCards.forEach(card => {
            const cats = (card.dataset.cats || card.dataset.category || 'Uncategorized').split(',');
            cats.forEach(c => {
                c = c.trim();
                if (c) catCount[c] = (catCount[c] || 0) + 1;
            });
        });

        // All pill
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-pill active';
        allBtn.textContent = 'All';
        allBtn.dataset.cat = 'all';
        filterContainer.appendChild(allBtn);

        // Category pills sorted by count
        Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            const btn = document.createElement('button');
            btn.className = 'filter-pill';
            btn.textContent = `${cat} (${count})`;
            btn.dataset.cat = cat;
            filterContainer.appendChild(btn);
        });

        const filterPosts = (cat) => {
            postCards.forEach(card => {
                const cats = (card.dataset.cats || card.dataset.category || '').split(',').map(c => c.trim());
                const show = cat === 'all' || cats.includes(cat);
                card.style.display = show ? '' : 'none';
                if (show) card.classList.add('revealed');
            });
            checkNoResults(postCards);
        };

        filterContainer.addEventListener('click', e => {
            const pill = e.target.closest('.filter-pill');
            if (!pill) return;
            filterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterPosts(pill.dataset.cat);
        });
    };

    function checkNoResults(postCards) {
        const noResults = document.getElementById('no-results');
        if (!noResults) return;
        const visible = Array.from(postCards).filter(p => p.style.display !== 'none');
        noResults.style.display = visible.length === 0 ? 'block' : 'none';
    }

    // ================================
    // 5. Post Search (title + excerpt + tags)
    // ================================
    const initPostSearch = () => {
        const searchInput = document.getElementById('post-search');
        const clearBtn = document.getElementById('search-clear');
        const postCards = document.querySelectorAll('.post-card');

        if (!searchInput || postCards.length === 0) return;

        const doSearch = (q) => {
            postCards.forEach(card => {
                const title = (card.dataset.title || '').toLowerCase();
                const excerpt = (card.dataset.excerpt || '').toLowerCase();
                const tags = (card.dataset.tags || '').toLowerCase();
                const match = !q || title.includes(q) || excerpt.includes(q) || tags.includes(q);
                card.style.display = match ? '' : 'none';
                if (match) card.classList.add('revealed');
            });
            if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
            checkNoResults(postCards);
        };

        searchInput.addEventListener('input', e => doSearch(e.target.value.trim().toLowerCase()));

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                doSearch('');
                searchInput.focus();
            });
        }
    };

    // ================================
    // 6. Taxonomy (Categories & Tags sections)
    // ================================
    const buildTaxonomy = () => {
        const postCards = document.querySelectorAll('.post-card');
        const cGrid = document.getElementById('categories-grid');
        const tGrid = document.getElementById('tags-grid');

        if (!postCards.length) return;

        // Categories
        if (cGrid) {
            const catMap = {};
            postCards.forEach(p => {
                (p.dataset.cats || p.dataset.category || 'Uncategorized').split(',').forEach(c => {
                    c = c.trim();
                    if (c) catMap[c] = (catMap[c] || 0) + 1;
                });
            });

            Object.entries(catMap).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
                const card = document.createElement('a');
                card.href = '#posts';
                card.className = 'taxonomy-card';
                card.innerHTML = `<span class="taxonomy-card-name">${cat}</span><span class="taxonomy-card-count">${count} post${count > 1 ? 's' : ''}</span>`;
                card.addEventListener('click', e => {
                    e.preventDefault();
                    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                    const pill = document.querySelector(`.filter-pill[data-cat="${cat}"]`);
                    if (pill) {
                        pill.classList.add('active');
                        pill.click();
                    }
                    const posts = document.getElementById('posts');
                    if (posts) window.scrollTo({ top: posts.offsetTop - 70, behavior: 'smooth' });
                });
                cGrid.appendChild(card);
            });
        }

        // Tags
        if (tGrid) {
            const tagMap = {};
            postCards.forEach(p => {
                (p.dataset.tags || '').split(',').forEach(t => {
                    t = t.trim();
                    if (t) tagMap[t] = (tagMap[t] || 0) + 1;
                });
            });

            Object.entries(tagMap).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
                const pill = document.createElement('a');
                pill.href = '#posts';
                pill.className = 'tag-pill';
                pill.textContent = `${tag} ×${count}`;
                pill.addEventListener('click', e => {
                    e.preventDefault();
                    const input = document.getElementById('post-search');
                    const clearBtn = document.getElementById('search-clear');
                    if (input) {
                        input.value = tag;
                        if (clearBtn) clearBtn.style.display = 'block';
                        input.dispatchEvent(new Event('input'));
                    }
                    const posts = document.getElementById('posts');
                    if (posts) window.scrollTo({ top: posts.offsetTop - 70, behavior: 'smooth' });
                });
                tGrid.appendChild(pill);
            });
        }
    };

    // ================================
    // 7. Share Buttons
    // ================================
    const initShareButtons = () => {
        const shareContainer = document.getElementById('share-buttons');
        if (!shareContainer) return;

        const copyBtn = shareContainer.querySelector('.share-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
                });
            });
        }
    };

    // ================================
    // 8. Stat Counters
    // ================================
    const initCounters = () => {
        const nums = document.querySelectorAll('.stat-num[data-target]');
        if (!nums.length) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = +el.dataset.target;
                const start = Date.now();
                const dur = 1800;

                (function tick() {
                    const p = Math.min((Date.now() - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(ease * target);
                    if (p < 1) requestAnimationFrame(tick);
                })();

                obs.unobserve(el);
            });
        }, { threshold: 0.5 });

        nums.forEach(n => obs.observe(n));
    };

    // ================================
    // 9. Sticky Nav + Active Section
    // ================================
    const initMastheadScroll = () => {
        const nav = document.getElementById('masthead') || document.querySelector('.masthead');
        if (!nav) return;

        const sections = ['posts', 'categories', 'tags'].map(id => ({
            id,
            el: document.getElementById(id),
            link: document.querySelector(`.nav-links a[data-section="${id}"]`)
        }));

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 40);

            let cur = '';
            sections.forEach(s => {
                if (s.el && s.el.getBoundingClientRect().top <= 120) cur = s.id;
            });
            sections.forEach(s => {
                if (s.link) s.link.classList.toggle('active', s.id === cur);
            });
        }, { passive: true });

        // Smooth scroll for nav links
        document.querySelectorAll('.nav-links a[data-section]').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const target = document.getElementById(a.dataset.section);
                if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
            });
        });

        // Hero-down & browse-btn
        ['hero-down', 'browse-btn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => {
                const posts = document.getElementById('posts');
                if (posts) window.scrollTo({ top: posts.offsetTop - 70, behavior: 'smooth' });
            });
        });
    };

    // ================================
    // 10. 3D Card Tilt
    // ================================
    let _tiltEnabled = true;

    const initCardTilt = () => {
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                if (!_tiltEnabled) return;
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(6px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    };

    // ================================
    // 11. Tweaks Panel
    // ================================
    const initTweaks = () => {
        const btn = document.getElementById('tweaks-btn');
        const panel = document.getElementById('tweaks-panel');
        const closeBtn = document.getElementById('tweaks-close');
        const dragHandle = document.getElementById('tweaks-drag-handle');

        if (!btn || !panel) return;

        // Open / close
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const hidden = panel.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', !hidden);
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
            });
        }

        document.addEventListener('click', e => {
            if (!btn.contains(e.target) && !panel.contains(e.target)) {
                panel.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Draggable panel
        if (dragHandle) {
            let ox = 20, oy = 20;
            dragHandle.addEventListener('mousedown', e => {
                const r = panel.getBoundingClientRect();
                const sx = e.clientX, sy = e.clientY;
                const startR = window.innerWidth - r.right;
                const startB = window.innerHeight - r.bottom;

                const onMove = ev => {
                    ox = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, startR - (ev.clientX - sx)));
                    oy = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, startB - (ev.clientY - sy)));
                    panel.style.right = ox + 'px';
                    panel.style.bottom = oy + 'px';
                };
                const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
                e.preventDefault();
            });
        }

        // Accent Palette
        const PALETTES = {
            default: { accent: 'oklch(72% 0.20 210)', accent2: 'oklch(63% 0.22 285)', rgb: '0,204,255', rgb2: '136,85,255' },
            coral:   { accent: '#ff6b4a', accent2: '#ffb830', rgb: '255,107,74', rgb2: '255,184,48' },
            mint:    { accent: '#00e5b0', accent2: '#0099ff', rgb: '0,229,176', rgb2: '0,153,255' },
            rose:    { accent: '#ff4d8d', accent2: '#ff8c42', rgb: '255,77,141', rgb2: '255,140,66' },
        };
        let activePalette = 'default';

        function applyPalette(key) {
            const p = PALETTES[key];
            if (!p) return;
            activePalette = key;
            const root = document.documentElement;
            root.style.setProperty('--accent', p.accent);
            root.style.setProperty('--accent-2', p.accent2);
            root.style.setProperty('--accent-rgb', p.rgb);
            root.style.setProperty('--accent-2-rgb', p.rgb2);
            document.querySelectorAll('#palette-chips .twk-chip').forEach(c => {
                const on = c.dataset.palette === key;
                c.dataset.on = on ? '1' : '0';
                c.setAttribute('aria-checked', on);
            });
        }

        function resetPalette() {
            ['--accent', '--accent-2', '--accent-rgb', '--accent-2-rgb'].forEach(p =>
                document.documentElement.style.removeProperty(p)
            );
        }

        const paletteChips = document.getElementById('palette-chips');
        if (paletteChips) {
            paletteChips.addEventListener('click', e => {
                const chip = e.target.closest('.twk-chip');
                if (!chip) return;
                const key = chip.dataset.palette;
                if (key === activePalette) return;
                if (key === 'default') {
                    resetPalette();
                    activePalette = 'default';
                    document.querySelectorAll('#palette-chips .twk-chip').forEach(c => {
                        c.dataset.on = c.dataset.palette === 'default' ? '1' : '0';
                        c.setAttribute('aria-checked', c.dataset.palette === 'default');
                    });
                } else {
                    applyPalette(key);
                }
            });
        }

        // Reset palette on theme change
        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                resetPalette();
                activePalette = 'default';
                document.querySelectorAll('#palette-chips .twk-chip').forEach(c => {
                    c.dataset.on = c.dataset.palette === 'default' ? '1' : '0';
                    c.setAttribute('aria-checked', c.dataset.palette === 'default');
                });
            });
        });

        // Card Density
        const DENSITIES = {
            compact: { pad: '16px 18px 14px', gap: '16px' },
            regular: { pad: '26px 26px 22px', gap: '26px' },
            comfy:   { pad: '34px 34px 28px', gap: '36px' },
        };
        const seg = document.getElementById('density-seg');
        const thumb = document.getElementById('density-thumb');
        let activeDensity = 'regular';

        if (seg && thumb) {
            const densityBtns = seg.querySelectorAll('button[data-density]');
            const n = densityBtns.length;

            function updateThumb(idx) {
                thumb.style.left = `calc(2px + ${idx} * (100% - 4px) / ${n})`;
                thumb.style.width = `calc((100% - 4px) / ${n})`;
            }
            updateThumb(1); // Regular is default

            function applyDensity(key) {
                const d = DENSITIES[key];
                if (!d) return;
                activeDensity = key;
                const grid = document.getElementById('posts-grid');
                if (grid) grid.style.gap = d.gap;
                document.querySelectorAll('.post-card-link').forEach(l => { l.style.padding = d.pad; });
                densityBtns.forEach((b, i) => {
                    const on = b.dataset.density === key;
                    b.setAttribute('aria-checked', on);
                    if (on) updateThumb(i);
                });
            }

            seg.addEventListener('click', e => {
                const b = e.target.closest('button[data-density]');
                if (!b) return;
                applyDensity(b.dataset.density);
            });
        }

        // Visual Effect Toggles
        function initToggle(id, onEnable, onDisable) {
            const toggle = document.getElementById(id);
            if (!toggle) return;
            toggle.addEventListener('click', () => {
                const on = toggle.dataset.on === '1';
                toggle.dataset.on = on ? '0' : '1';
                toggle.setAttribute('aria-checked', !on);
                if (on) onDisable(); else onEnable();
            });
        }

        initToggle('particles-toggle',
            () => { const c = document.getElementById('hero-canvas'); if (c) c.style.display = ''; },
            () => { const c = document.getElementById('hero-canvas'); if (c) c.style.display = 'none'; }
        );

        initToggle('tilt-toggle',
            () => { _tiltEnabled = true; },
            () => {
                _tiltEnabled = false;
                document.querySelectorAll('.post-card').forEach(c => { c.style.transform = ''; });
            }
        );

        initToggle('cursor-toggle',
            () => {
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                if (dot) dot.style.display = '';
                if (ring) ring.style.display = '';
                document.body.style.cursor = 'none';
            },
            () => {
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                if (dot) dot.style.display = 'none';
                if (ring) ring.style.display = 'none';
                document.body.style.cursor = '';
            }
        );
    };

    // ================================
    // 12. Layout Width Toggle
    // ================================
    const initLayoutToggle = () => {
        const toggleBtn = document.getElementById('layout-toggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        const body = document.body;

        const savedLayout = localStorage.getItem('layout-width');
        if (savedLayout === 'wide') {
            body.classList.add('wide');
            toggleBtn.classList.add('is-wide');
            if (icon) icon.className = 'fas fa-compress-alt';
        }

        toggleBtn.addEventListener('click', () => {
            const isWide = body.classList.toggle('wide');
            toggleBtn.classList.toggle('is-wide', isWide);
            if (icon) icon.className = isWide ? 'fas fa-compress-alt' : 'fas fa-expand-alt';
            localStorage.setItem('layout-width', isWide ? 'wide' : 'focused');
        });
    };

    // ================================
    // 13. Lazy Load Post Images
    // ================================
    const initLazyImages = () => {
        document.querySelectorAll('.page__content img').forEach((img, index) => {
            if (index === 0) return;
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
        });
    };

    // ================================
    // Initialize All
    // ================================
    document.addEventListener('DOMContentLoaded', () => {
        initScrollReveal();
        initCardReveal();
        initReadingProgress();
        initBackToTop();
        initCategoryFilter();
        buildTaxonomy();
        initPostSearch();
        initCounters();
        initMastheadScroll();
        initCardTilt();
        initTweaks();
        initShareButtons();
        initLayoutToggle();
        initLazyImages();
    });

})();
