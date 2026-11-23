// =========================================================================
// Canvas UI — Tactile Glass Shatter, Quantum Bursts & Theme Transitions
// Zero-Idle CPU Interactive Canvas Layer
// Ported from portfolio & vibecoding-fx
// =========================================================================

(function () {
  'use strict';

  const canvas = document.getElementById('canvas-ui-layer');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particles = [];
  let shockwaves = [];
  let activeThemeFX = null;
  let isRunning = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(renderLoop);
    }
  }

  // 1. Tactile Button Glass Shatter
  window.triggerCanvasUIButtonShatter = function (x, y) {
    if (x === undefined || y === undefined) {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const count = 16;
    const colors = {
      dark: ['rgba(0,204,255,0.85)', 'rgba(136,85,255,0.85)', 'rgba(255,255,255,0.95)'],
      light: ['rgba(0,85,204,0.75)', 'rgba(119,34,204,0.75)', 'rgba(255,255,255,0.9)'],
      batman: ['rgba(255,233,25,0.95)', 'rgba(255,51,51,0.85)', 'rgba(255,255,255,0.95)'],
      cyberpunk: ['rgba(255,0,128,0.9)', 'rgba(0,255,204,0.9)', 'rgba(255,255,255,0.95)'],
      ocean: ['rgba(0,229,176,0.9)', 'rgba(0,153,255,0.9)', 'rgba(255,255,255,0.95)']
    }[theme] || ['rgba(0,204,255,0.85)', 'rgba(255,255,255,0.95)'];

    // Spawn glass shards
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const speed = Math.random() * 5.5 + 3.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.28,
        size: Math.random() * 11 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.035 + 0.025
      });
    }

    // Expanding shockwave ripple
    shockwaves.push({
      x, y,
      radius: 6,
      maxRadius: 85,
      opacity: 0.75,
      color: colors[0],
      strokeWidth: 2
    });

    startLoop();
  };

  // 2. Quantum Gate Canvas Shockwaves & Ket Particle Bursts
  window.triggerCanvasUIQuantumGate = function (x, y, gate) {
    if (x === undefined || y === undefined) {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }
    const gatePalettes = {
      'H': ['#00ccff', '#8855ff', '#ffffff'],
      'X': ['#ff0080', '#ffaa00', '#ffffff'],
      'Y': ['#00ffaa', '#00ccff', '#ffffff'],
      'Z': ['#00e5ff', '#3b82f6', '#ffffff'],
      'reset': ['#ffffff', '#00ccff', '#8855ff']
    };
    const colors = gatePalettes[gate] || ['#00ccff', '#8855ff', '#ffffff'];

    // Concentric Quantum Orbital Rings
    for (let r = 1; r <= 3; r++) {
      shockwaves.push({
        x, y,
        radius: 8 * r,
        maxRadius: 105 + r * 28,
        opacity: 0.85 / r,
        color: colors[(r - 1) % colors.length],
        strokeWidth: 2.2 - r * 0.4,
        dashed: r % 2 === 0
      });
    }

    // Quantum Ket State Text Particles
    const symbols = gate === 'H' ? ['|+⟩', '|−⟩', '1/√2', '|ψ⟩'] :
                    gate === 'X' ? ['|1⟩', '|0⟩', '¬X', 'NOT'] :
                    gate === 'Y' ? ['|i⟩', '|−i⟩', 'σ_y', '|ψ⟩'] :
                    gate === 'Z' ? ['|ψ⟩', 'e^{iπ}', 'σ_z', '−|1⟩'] :
                    ['|0⟩', '|1⟩', '|ψ⟩', 'ket'];

    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.45;
      const speed = Math.random() * 4.8 + 3.2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        rot: (Math.random() - 0.5) * 0.4,
        vrot: (Math.random() - 0.5) * 0.06,
        size: Math.random() * 8 + 11,
        color: colors[i % colors.length],
        symbol: symbols[i % symbols.length],
        life: 1.0,
        decay: Math.random() * 0.024 + 0.018
      });
    }

    startLoop();
  };

  // 3. Fullscreen Theme Switcher Transitions (Easter Egg FX)
  window.triggerCanvasUIThemeEffect = function (theme, x, y) {
    if (x === undefined) x = window.innerWidth / 2;
    if (y === undefined) y = 60;

    activeThemeFX = {
      theme: theme,
      time: 0,
      maxTime: 26,
      x: x,
      y: y
    };

    const particleCount = theme === 'batman' ? 30 : 22;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 8 + 4;
      let color;
      if (theme === 'batman') {
        color = i % 2 === 0 ? 'rgba(255,233,25,0.95)' : 'rgba(30,30,30,0.9)';
      } else if (theme === 'ocean') {
        color = i % 2 === 0 ? 'rgba(0,229,176,0.9)' : 'rgba(0,153,255,0.9)';
      } else if (theme === 'cyberpunk') {
        color = i % 2 === 0 ? 'rgba(255,0,128,0.9)' : 'rgba(0,255,204,0.9)';
      } else if (theme === 'light') {
        color = i % 2 === 0 ? 'rgba(0,85,204,0.85)' : 'rgba(119,34,204,0.85)';
      } else {
        color = i % 2 === 0 ? 'rgba(0,204,255,0.9)' : 'rgba(136,85,255,0.9)';
      }

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 14 + 6,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.025
      });
    }

    startLoop();
  };

  // Delegated click trigger for tactile button shatter
  document.addEventListener('click', e => {
    const btn = e.target.closest(
      '.btn, .btn-primary, .btn-outline, .btn-glassy, .bento-btn, .theme-icon-btn, .theme-opt, .filter-pill, .share-btn, #back-to-top, .layout-toggle-btn, .tweaks-btn'
    );
    if (btn && !btn.classList.contains('theme-opt')) {
      window.triggerCanvasUIButtonShatter(e.clientX, e.clientY);
    }

    // Trigger quantum burst for taxonomy / filter tags
    const tag = e.target.closest('.post-tag, .tag-pill, .category-badge, .filter-pill');
    if (tag) {
      const gate = tag.classList.contains('active') ? 'H' : 'X';
      window.triggerCanvasUIQuantumGate(e.clientX, e.clientY, gate);
    }
  });

  // Render loop
  function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      if (sw.radius > 0) {
        ctx.save();
        if (sw.dashed) ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity;
        ctx.lineWidth = sw.strokeWidth;
        ctx.stroke();
        ctx.restore();
      }
      sw.radius += 4.8;
      sw.opacity *= 0.94;
      if (sw.radius >= sw.maxRadius || sw.opacity <= 0.02) {
        shockwaves.splice(i, 1);
      }
    }

    // 2. Draw glass shards & ket state particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.rot += p.vrot;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;

      if (p.symbol) {
        ctx.fillStyle = p.color;
        ctx.font = `600 ${Math.round(p.size)}px "Fira Code", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillText(p.symbol, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.5, p.size * 0.5);
        ctx.lineTo(p.size * 0.8, -p.size * 0.2);
        ctx.lineTo(p.size * 0.2, -p.size * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Fullscreen Theme Switcher Transitions
    if (activeThemeFX) {
      activeThemeFX.time++;
      const progress = activeThemeFX.time / activeThemeFX.maxTime;
      const alpha = 1 - progress;
      const t = activeThemeFX.theme;
      const ox = activeThemeFX.x;
      const oy = activeThemeFX.y;

      ctx.save();

      if (t === 'cyberpunk') {
        ctx.globalAlpha = alpha * 0.75;
        for (let s = 0; s < 10; s++) {
          const sy = (oy + (s * 40) + activeThemeFX.time * 16) % canvas.height;
          const sh = Math.random() * 5 + 3;
          ctx.fillStyle = s % 2 === 0 ? 'rgba(255,0,128,0.75)' : 'rgba(0,255,204,0.75)';
          ctx.fillRect(0, sy, canvas.width, sh);
        }
        for (let b = 0; b < 14; b++) {
          const bx = Math.random() * canvas.width;
          const by = Math.random() * canvas.height;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,255,204,0.55)' : 'rgba(255,0,128,0.55)';
          ctx.fillRect(bx, by, Math.random() * 100 + 35, Math.random() * 18 + 6);
        }
      } else if (t === 'batman') {
        ctx.globalAlpha = alpha * 0.85;
        const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width * 0.75);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${0.65 * alpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#FFE919';
        ctx.lineWidth = 3.5;
        for (let j = 0; j < 5; j++) {
          ctx.beginPath();
          const startX = (canvas.width / 5) * j;
          ctx.moveTo(startX, 0);
          ctx.lineTo(startX + (Math.sin(activeThemeFX.time + j) * 80) + 120, canvas.height * 0.5);
          ctx.lineTo(startX + (Math.cos(activeThemeFX.time + j) * 120) + 240, canvas.height);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(ox, oy, activeThemeFX.time * 55, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (t === 'ocean') {
        ctx.globalAlpha = alpha * 0.75;
        for (let w = 0; w < 4; w++) {
          ctx.fillStyle = w % 2 === 0 ? 'rgba(0,229,176,0.22)' : 'rgba(0,153,255,0.22)';
          ctx.beginPath();
          const waveBaseY = ((activeThemeFX.time * 30 + w * (canvas.height / 3.5)) % (canvas.height + 150)) - 50;
          ctx.moveTo(0, waveBaseY);
          for (let wx = 0; wx <= canvas.width; wx += 40) {
            const wy = waveBaseY + Math.sin(wx * 0.012 + activeThemeFX.time * 0.3 + w) * 28;
            ctx.lineTo(wx, wy);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,229,176,0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ox, oy, activeThemeFX.time * 48, 0, Math.PI * 2);
        ctx.stroke();
      } else if (t === 'light') {
        ctx.globalAlpha = alpha * 0.65;
        const flare = ctx.createRadialGradient(ox, oy, 10, ox, oy, activeThemeFX.time * 65);
        flare.addColorStop(0, 'rgba(255,255,255,0.85)');
        flare.addColorStop(0.4, 'rgba(180,215,255,0.45)');
        flare.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(0,85,204,0.7)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(ox, oy, activeThemeFX.time * 50, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Dark theme: deep midnight pulse
        ctx.globalAlpha = alpha * 0.75;
        ctx.strokeStyle = 'rgba(0,204,255,0.8)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(ox, oy, activeThemeFX.time * 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(136,85,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, Math.max(0, activeThemeFX.time * 50 - 35), 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      if (activeThemeFX.time >= activeThemeFX.maxTime) {
        activeThemeFX = null;
      }
    }

    // Auto-stop loop when quiescent to keep 0 idle CPU
    if (particles.length > 0 || shockwaves.length > 0 || activeThemeFX !== null) {
      requestAnimationFrame(renderLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isRunning = false;
    }
  }
})();
