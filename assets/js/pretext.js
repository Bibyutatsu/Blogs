// =========================================================================
// Pretext: Zero-DOM Reflow Arithmetic Text Layout Engine
// Based on chenglou/pretext principles & portfolio implementation
// =========================================================================

const Pretext = (function () {
  'use strict';

  const cache = new Map();
  let ctx = null;

  function getContext(font) {
    if (!ctx) {
      const c = document.createElement('canvas');
      ctx = c.getContext('2d');
    }
    ctx.font = font;
    return ctx;
  }

  // Step 1: prepare(text, font)
  // Evaluates and caches character metrics once; returns an immutable handle
  function prepare(text, font) {
    const key = font + '::' + text;
    if (cache.has(key)) return cache.get(key);

    const c = getContext(font);
    const words = text.split(/\s+/);
    const wordWidths = new Float32Array(words.length);
    const spaceWidth = c.measureText(' ').width;

    for (let i = 0; i < words.length; i++) {
      wordWidths[i] = c.measureText(words[i]).width;
    }

    const prep = { text, font, words, wordWidths, spaceWidth };
    cache.set(key, prep);
    return prep;
  }

  // Step 2: layout(prep, containerWidth, lineHeight)
  // Pure arithmetic evaluation in microseconds with ZERO DOM touch (0ms layout reflow)
  function layout(prep, containerWidth, lineHeight) {
    if (containerWidth <= 0) return { height: 0, lineCount: 0, lines: [] };
    const { words, wordWidths, spaceWidth } = prep;
    let currentLineWidth = 0;
    let lineCount = 1;
    let currentLine = [];
    const lines = [];

    for (let i = 0; i < wordWidths.length; i++) {
      const w = wordWidths[i];
      if (currentLineWidth + w <= containerWidth || currentLineWidth === 0) {
        currentLine.push(words[i]);
        currentLineWidth += w + spaceWidth;
      } else {
        lines.push(currentLine.join(' '));
        currentLine = [words[i]];
        currentLineWidth = w + spaceWidth;
        lineCount++;
      }
    }
    if (currentLine.length > 0) lines.push(currentLine.join(' '));

    const height = Math.round(lineCount * lineHeight);
    return { height, lineCount, lines };
  }

  // Step 3: balance(prep, containerWidth, lineHeight)
  // Binary search to find optimal container width that balances multiline text without orphan words
  function balance(prep, containerWidth, lineHeight) {
    const natural = layout(prep, containerWidth, lineHeight);
    if (natural.lineCount <= 1) return containerWidth;

    let low = containerWidth * 0.72;
    let high = containerWidth;
    let bestWidth = containerWidth;
    const targetLines = natural.lineCount;

    for (let iter = 0; iter < 8; iter++) {
      const mid = (low + high) / 2;
      const res = layout(prep, mid, lineHeight);
      if (res.lineCount === targetLines) {
        bestWidth = mid;
        high = mid;
      } else {
        low = mid;
      }
    }
    return Math.round(bestWidth);
  }

  // Step 4: fitText(text, containerWidth, baseSize, minSize)
  // Calculates optimal single-line font size without DOM reflow
  function fitText(text, containerWidth, baseSize, minSize) {
    if (containerWidth <= 0) return baseSize;
    const prep = prepare(text, `${baseSize}px "Space Grotesk", sans-serif`);
    let totalW = 0;
    for (let i = 0; i < prep.wordWidths.length; i++) totalW += prep.wordWidths[i];
    totalW += (prep.words.length - 1) * prep.spaceWidth;

    if (totalW <= containerWidth) return baseSize;
    const scale = containerWidth / totalW;
    return Math.max(minSize, Math.round(baseSize * scale * 10) / 10);
  }

  // Step 5: shapeWrap(prep, containerWidth, lineHeight, obstacle)
  // Arithmetically wraps text lines around an obstacle contour (e.g. avatar)
  function shapeWrap(prep, containerWidth, lineHeight, obstacle) {
    if (containerWidth <= 0) return { height: 0, lines: [] };
    const { words, wordWidths, spaceWidth } = prep;
    let wordIdx = 0;
    const lines = [];
    let y = 0;

    while (wordIdx < words.length) {
      let availableWidth = containerWidth;
      let leftOffset = 0;
      if (obstacle && y >= obstacle.top && y <= obstacle.top + obstacle.height) {
        const relY = (y - obstacle.top) / obstacle.height;
        const exclusionWidth = obstacle.width * Math.sin(relY * Math.PI);
        if (obstacle.side === 'left') {
          leftOffset = exclusionWidth;
          availableWidth = Math.max(120, containerWidth - exclusionWidth);
        } else {
          availableWidth = Math.max(120, containerWidth - exclusionWidth);
        }
      }

      let lineWidth = 0;
      const lineWords = [];
      while (wordIdx < words.length) {
        const wWidth = wordWidths[wordIdx];
        if (lineWidth + wWidth <= availableWidth || lineWords.length === 0) {
          lineWords.push(words[wordIdx]);
          lineWidth += wWidth + spaceWidth;
          wordIdx++;
        } else {
          break;
        }
      }
      lines.push({ text: lineWords.join(' '), leftOffset, width: lineWidth });
      y += lineHeight;
    }

    return { height: lines.length * lineHeight, lines };
  }

  return { prepare, layout, balance, fitText, shapeWrap };
})();

// Automatic Pretext Typography Enhancements
(function () {
  'use strict';

  function applyPretextBalancing() {
    // 1. Balance section headings to prevent single hanging words
    document.querySelectorAll('.section-heading, .section-subtitle, .hero-content h1').forEach(el => {
      const text = el.textContent.trim();
      if (!text) return;
      const cs = window.getComputedStyle(el);
      const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.3);
      const containerW = el.parentElement ? el.parentElement.clientWidth : window.innerWidth;
      const prep = Pretext.prepare(text, font);
      const balancedW = Pretext.balance(prep, Math.min(containerW, 800), lh);
      if (balancedW > 0 && balancedW < containerW) {
        el.style.maxWidth = `${balancedW}px`;
      }
    });

    // 2. Uniform card layout calculation across posts grid with zero reflow
    const cards = document.querySelectorAll('.post-card');
    if (cards.length > 0) {
      const firstCard = cards[0];
      const bodyEl = firstCard.querySelector('.post-card-body') || firstCard;
      const cardWidth = (bodyEl.clientWidth > 0 ? bodyEl.clientWidth : firstCard.clientWidth) - 48;
      if (cardWidth > 150) {
        let maxTitleH = 0;
        let maxExcerptH = 0;

        cards.forEach(card => {
          const titleEl = card.querySelector('.post-card-title');
          const excerptEl = card.querySelector('.post-card-excerpt');
          if (titleEl) {
            const prepT = Pretext.prepare(titleEl.textContent.trim(), '600 18px "Space Grotesk", sans-serif');
            const h = Pretext.layout(prepT, cardWidth, 24).height;
            if (h > maxTitleH) maxTitleH = h;
          }
          if (excerptEl) {
            const prepE = Pretext.prepare(excerptEl.textContent.trim(), '14.5px "Inter", sans-serif');
            const h = Pretext.layout(prepE, cardWidth, 24).height;
            if (h > maxExcerptH) maxExcerptH = h;
          }
        });

        // Set minimum height on title container for perfect alignment across grid rows
        if (maxTitleH > 0 && window.innerWidth > 680) {
          cards.forEach(card => {
            const titleEl = card.querySelector('.post-card-title');
            if (titleEl) titleEl.style.minHeight = `${maxTitleH}px`;
          });
        }
      }
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyPretextBalancing, 150);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPretextBalancing);
  } else {
    applyPretextBalancing();
  }
})();
