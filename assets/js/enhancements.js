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

        // Global '/' shortcut to focus search
        document.addEventListener('keydown', e => {
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                searchInput.focus();
                const posts = document.getElementById('posts');
                if (posts) window.scrollTo({ top: posts.offsetTop - 70, behavior: 'smooth' });
            }
        });
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
    // 8. Dynamic Experience & Stat Counters
    // ================================
    const updateDynamicExperience = () => {
        const expEl = document.getElementById('stat-exp');
        if (!expEl) return;
        const start = new Date(2019, 5, 1); // June 2019
        const now = new Date();
        const diffYears = Math.max(0, (now - start) / (1000 * 60 * 60 * 24 * 365.25));
        expEl.dataset.target = diffYears.toFixed(1);
        expEl.dataset.suffix = '+';
        expEl.textContent = diffYears.toFixed(1) + '+';
    };

    const initCounters = () => {
        updateDynamicExperience();
        const nums = document.querySelectorAll('.stat-num[data-target]');
        if (!nums.length) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = parseFloat(el.dataset.target);
                const isFloat = target % 1 !== 0;
                const suffix = el.dataset.suffix || '';
                const start = performance.now();
                const dur = 1800;

                (function tick(now) {
                    const p = Math.min((now - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = isFloat
                        ? (target * ease).toFixed(1) + suffix
                        : Math.floor(target * ease) + suffix;
                    if (p < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
                    }
                })(start);

                obs.unobserve(el);
            });
        }, { threshold: 0.5 });

        nums.forEach(n => obs.observe(n));
    };

    // ================================
    // 9. Sticky Nav, Smooth Scroll & Mobile Menu
    // ================================
    const initMobileNav = () => {
        const menuToggle = document.getElementById('menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (!menuToggle || !navLinks) return;

        const updateAria = () => {
            const isOpen = navLinks.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            document.body.classList.toggle('menu-open');
            navLinks.classList.toggle('open');
            updateAria();
        });

        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                document.body.classList.remove('menu-open');
                navLinks.classList.remove('open');
                updateAria();
            });
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                document.body.classList.remove('menu-open');
                navLinks.classList.remove('open');
                updateAria();
            }
        });
    };

    const initMastheadScroll = () => {
        const nav = document.getElementById('nav') || document.getElementById('masthead') || document.querySelector('.masthead');
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
                const target = document.getElementById(a.dataset.section);
                if (target) {
                    e.preventDefault();
                    window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
                }
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
    // 10. Holographic Foil & 3D Tilt (Pokemon Cards CSS style)
    // ================================
    let _tiltEnabled = true;

    const initHoloCards = () => {
        if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

        const cards = document.querySelectorAll('.holo-card:not([data-holo-active])');
        cards.forEach(card => {
            card.setAttribute('data-holo-active', 'true');
            let rafId = null;

            function onMouseMove(e) {
                if (!_tiltEnabled) return;
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const px = (x * 100).toFixed(1);
                const py = (y * 100).toFixed(1);
                const dx = x - 0.5;
                const dy = y - 0.5;

                const maxDeg = 11;
                const rotX = (dy * -maxDeg).toFixed(2);
                const rotY = (dx * maxDeg).toFixed(2);

                const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90).toFixed(1);
                const foilX = (50 + dx * 60).toFixed(1);
                const foilY = (50 + dy * 60).toFixed(1);

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.setProperty('--pointer-x', `${px}%`);
                    card.style.setProperty('--pointer-y', `${py}%`);
                    card.style.setProperty('--foil-x', `${foilX}%`);
                    card.style.setProperty('--foil-y', `${foilY}%`);
                    card.style.setProperty('--angle', `${angle}deg`);
                    card.style.setProperty('--holo-opacity', '1');
                    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) translateZ(8px)`;
                });
            }

            function onMouseEnter() {
                if (!_tiltEnabled) return;
                card.style.transition = 'transform 0.12s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
            }

            function onMouseLeave() {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.38s ease, box-shadow 0.38s ease';
                card.style.setProperty('--holo-opacity', '0');
                card.style.transform = '';
            }

            card.addEventListener('mouseenter', onMouseEnter);
            card.addEventListener('mousemove', onMouseMove);
            card.addEventListener('mouseleave', onMouseLeave);
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
                document.querySelectorAll('.holo-card, .post-card').forEach(c => {
                    c.style.transform = '';
                    c.style.setProperty('--holo-opacity', '0');
                });
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
    // 14. Code Block Copy Button with Canvas UI Shatter
    // ================================
    const initCodeBlockCopy = () => {
        const codeBlocks = document.querySelectorAll('.page__content pre');
        codeBlocks.forEach(pre => {
            if (pre.closest('.code-block-wrapper') || pre.classList.contains('mermaid')) return;
            const code = pre.querySelector('code');
            if (!code) return;

            let lang = 'code';
            const classes = (code.className || '').split(/\s+/);
            for (const cls of classes) {
                if (cls.startsWith('language-')) {
                    lang = cls.replace('language-', '');
                    break;
                }
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);

            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML = `
                <span class="code-lang-badge">${lang}</span>
                <button type="button" class="code-copy-btn" aria-label="Copy code">
                    <i class="far fa-copy" aria-hidden="true"></i> Copy
                </button>
            `;

            wrapper.appendChild(header);
            wrapper.appendChild(pre);

            const copyBtn = header.querySelector('.code-copy-btn');
            copyBtn.addEventListener('click', (e) => {
                const text = code.innerText;
                const markCopied = () => {
                    if (typeof window.triggerCanvasUIButtonShatter === 'function') {
                        window.triggerCanvasUIButtonShatter(e.clientX, e.clientY);
                    }
                    copyBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="far fa-copy" aria-hidden="true"></i> Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                };

                const fallbackCopy = (str) => {
                    const ta = document.createElement('textarea');
                    ta.value = str;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    try { document.execCommand('copy'); } catch (_) {}
                    document.body.removeChild(ta);
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(markCopied).catch(() => {
                        fallbackCopy(text);
                        markCopied();
                    });
                } else {
                    fallbackCopy(text);
                    markCopied();
                }
            });
        });
    };

    // ================================
    // 15. Ebooks Post Interactive Transliteration Sandbox
    // ================================
    const initTranslitWidget = () => {
        const widget = document.getElementById('translit-demo-widget');
        if (!widget) return;

        const input = document.getElementById('translit-input');
        const runBtn = document.getElementById('translit-run-btn');
        const bnEl = document.getElementById('translit-bn');
        const countEl = document.getElementById('translit-count');
        const chipsContainer = document.getElementById('translit-chips');

        const DICT = {
            'feluda': { bn: 'ফেলুদা', variants: ['feluda', 'feloo-da', 'pheluda', 'felu-da', 'feludaa', 'phelu-da'] },
            'byomkesh': { bn: 'ব্যোমকেশ', variants: ['byomkesh', 'bomkesh', 'byomkes', 'byomkesha', 'bomkesha', 'byomkeshe'] },
            'satyajit': { bn: 'সত্যজিৎ', variants: ['satyajit', 'sottyojit', 'satyajit roy', 'satyajita', 'satyajeet'] },
            'vidyasagar': { bn: 'বিদ্যাসাগর', variants: ['vidyasagar', 'biddasagar', 'bidyasagar', 'vidyasagara', 'iswar chandra vidyasagar'] },
            'humayun': { bn: 'হুমায়ূন', variants: ['humayun', 'humayan', 'humayun ahmed', 'humayoon', 'humaiyun'] },
            'shonku': { bn: 'শঙ্কু', variants: ['shonku', 'sanku', 'prof shonku', 'shanku', 'sonku'] },
            'kakababu': { bn: 'কাকাবাবু', variants: ['kakababu', 'kaka-babu', 'kakababoo', 'kaka babu'] },
            'banerjee': { bn: 'বন্দ্যোপাধ্যায়', variants: ['banerjee', 'bandyopadhyay', 'bandopadhyay', 'bonerjea'] }
        };

        const update = () => {
            const raw = (input.value || '').trim().toLowerCase();
            const matched = DICT[raw] || {
                bn: 'স্বয়ংক্রিয় অনুলিপি (' + raw + ')',
                variants: [raw, raw + 'a', raw + 'o', raw.replace(/ee/g, 'i'), raw.replace(/oo/g, 'u'), raw + '-da']
            };

            bnEl.textContent = matched.bn;
            countEl.textContent = matched.variants.length;
            chipsContainer.innerHTML = '';
            matched.variants.forEach(v => {
                const chip = document.createElement('span');
                chip.className = 'widget-chip';
                chip.textContent = v;
                chipsContainer.appendChild(chip);
            });
        };

        if (runBtn) {
            runBtn.addEventListener('click', (e) => {
                if (typeof window.triggerCanvasUIButtonShatter === 'function') {
                    window.triggerCanvasUIButtonShatter(e.clientX, e.clientY);
                }
                update();
            });
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (runBtn) runBtn.click();
                }
            });
            update();
        }
    };

    // ================================
    // 16. Ebooks Post Mini Theme Canvas Simulator
    // ================================
    const initThemeCanvasWidget = () => {
        const c = document.getElementById('ebooks-post-canvas');
        if (!c) return;

        const ctx = c.getContext('2d');
        if (!ctx) return;

        const THEME_PALETTES = {
            dark:      { n1: '#00ccff', n2: '#8855ff', edge: 'rgba(0, 204, 255, 0.22)', bg: '#050518' },
            light:     { n1: '#0055cc', n2: '#7722cc', edge: 'rgba(0, 85, 204, 0.22)',  bg: '#f8f9fa' },
            batman:    { n1: '#ffe919', n2: '#ff3333', edge: 'rgba(255, 233, 25, 0.25)', bg: '#0b0b0b' },
            cyberpunk: { n1: '#ff0080', n2: '#00ffcc', edge: 'rgba(255, 0, 128, 0.25)', bg: '#090014' },
            ocean:     { n1: '#00e5b0', n2: '#0099ff', edge: 'rgba(0, 229, 176, 0.25)', bg: '#001322' }
        };

        let currentPal = THEME_PALETTES.dark;

        const count = 35;
        const pts = [];
        for (let i = 0; i < count; i++) {
            pts.push({
                x: Math.random() * c.width,
                y: Math.random() * c.height,
                vx: (Math.random() - 0.5) * 0.9,
                vy: (Math.random() - 0.5) * 0.9,
                r: Math.random() * 2.5 + 1.5,
                colorType: Math.random() > 0.5 ? 'n1' : 'n2'
            });
        }

        const render = () => {
            ctx.fillStyle = currentPal.bg;
            ctx.fillRect(0, 0, c.width, c.height);

            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x;
                    const dy = pts[i].y - pts[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 85) {
                        ctx.beginPath();
                        ctx.strokeStyle = currentPal.edge;
                        ctx.lineWidth = 1 - (dist / 85);
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.stroke();
                    }
                }
            }

            pts.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > c.width) p.vx *= -1;
                if (p.y < 0 || p.y > c.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = currentPal[p.colorType];
                ctx.fill();
            });

            requestAnimationFrame(render);
        };

        render();

        const btnContainer = document.getElementById('theme-demo-btns');
        if (btnContainer) {
            btnContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.theme-demo-chip');
                if (!btn) return;
                btnContainer.querySelectorAll('.theme-demo-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const t = btn.dataset.themeVal;
                if (THEME_PALETTES[t]) {
                    currentPal = THEME_PALETTES[t];
                    if (typeof window.triggerCanvasUIButtonShatter === 'function') {
                        window.triggerCanvasUIButtonShatter(e.clientX, e.clientY);
                    }
                }
            });
        }
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
        initMobileNav();
        initMastheadScroll();
        initHoloCards();
        initTweaks();
        initShareButtons();
        initLayoutToggle();
        initLazyImages();
        initCodeBlockCopy();
        initTranslitWidget();
        initThemeCanvasWidget();
    });

})();
