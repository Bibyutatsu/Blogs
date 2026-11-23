// =========================================================================
// ShaderGradient & Particle Constellation (Three.js WebGL Engine)
// Fluid wavy grain gradient with film grain dither & 5-theme color interpolation
// Ported from portfolio & vibecoding-fx
// =========================================================================

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const heroSection = document.getElementById('hero') || canvas.closest('.page__hero--overlay');
  if (!heroSection) return;

  // Graceful 2D Canvas Fallback if Three.js is not available
  if (typeof THREE === 'undefined') {
    init2DFallback(canvas, heroSection);
    return;
  }

  // 1. Scene, Camera, Renderer Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 280;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    console.warn('WebGL init failed, using fallback:', e);
    init2DFallback(canvas, heroSection);
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. ShaderGradient Plane (Fluid wavy grain gradient)
  const gradVertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float w1 = sin(pos.x * 0.006 + uTime * 0.35) * cos(pos.y * 0.006 + uTime * 0.28) * 35.0;
      float w2 = sin((pos.x + pos.y) * 0.004 + uTime * 0.45) * 20.0;
      pos.z += w1 + w2;
      vElevation = (w1 + w2) / 55.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const gradFragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uOpacity;

    float grain(vec2 uv, float t) {
      return fract(sin(dot(uv + fract(t * 0.04), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    }

    void main() {
      vec2 p = vUv;
      float f1 = sin(p.x * 3.14159 + uTime * 0.25) * 0.5 + 0.5;
      float f2 = cos(p.y * 3.14159 + uTime * 0.2 + vElevation * 0.8) * 0.5 + 0.5;
      float f3 = sin((p.x + p.y + vElevation) * 2.0 + uTime * 0.3) * 0.5 + 0.5;

      vec3 colA = mix(uColor1, uColor2, f1);
      vec3 colB = mix(uColor3, uColor4, f2);
      vec3 finalCol = mix(colA, colB, f3);

      // Film grain dither to prevent 8-bit banding on dark monitors
      float g = grain(gl_FragCoord.xy, uTime) * 0.055;
      finalCol += vec3(g);

      gl_FragColor = vec4(finalCol, uOpacity);
    }
  `;

  const THEME_GRADIENTS = {
    dark:      { c1: 0x050518, c2: 0x160830, c3: 0x01172e, c4: 0x1f0a3d, op: 0.55 },
    light:     { c1: 0xeeeef8, c2: 0xd8e4fc, c3: 0xebe0f8, c4: 0xfcfcff, op: 0.65 },
    batman:    { c1: 0x000000, c2: 0x1f1c00, c3: 0x120000, c4: 0x2e2700, op: 0.70 },
    cyberpunk: { c1: 0x200018, c2: 0x00201e, c3: 0x320038, c4: 0x00332e, op: 0.62 },
    ocean:     { c1: 0x010c16, c2: 0x002024, c3: 0x01162a, c4: 0x00322b, op: 0.60 },
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const initialGrad = THEME_GRADIENTS[initialTheme] || THEME_GRADIENTS.dark;

  const targetGrad = {
    c1: new THREE.Color(initialGrad.c1),
    c2: new THREE.Color(initialGrad.c2),
    c3: new THREE.Color(initialGrad.c3),
    c4: new THREE.Color(initialGrad.c4),
    op: initialGrad.op
  };

  const gradUniforms = {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(initialGrad.c1) },
    uColor2: { value: new THREE.Color(initialGrad.c2) },
    uColor3: { value: new THREE.Color(initialGrad.c3) },
    uColor4: { value: new THREE.Color(initialGrad.c4) },
    uOpacity: { value: initialGrad.op }
  };

  const gradMat = new THREE.ShaderMaterial({
    vertexShader: gradVertexShader,
    fragmentShader: gradFragmentShader,
    uniforms: gradUniforms,
    transparent: true,
    depthWrite: false
  });

  const gradGeo = new THREE.PlaneGeometry(1800, 1300, 40, 40);
  const gradMesh = new THREE.Mesh(gradGeo, gradMat);
  gradMesh.position.set(0, 0, -220);
  scene.add(gradMesh);

  // 3. Particle Constellation Field (Nodes & Dynamic Lines)
  const NODE_COUNT = 55;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(1.6, 8, 8);
  const THEME_ACCENTS = {
    dark:      { a1: 0x00ccff, a2: 0x8855ff },
    light:     { a1: 0x0055cc, a2: 0x7722cc },
    batman:    { a1: 0xFFE919, a2: 0xff3333 },
    cyberpunk: { a1: 0xff0080, a2: 0x00ffcc },
    ocean:     { a1: 0x00e5b0, a2: 0x0099ff }
  };
  const initialAccents = THEME_ACCENTS[initialTheme] || THEME_ACCENTS.dark;

  for (let i = 0; i < NODE_COUNT; i++) {
    const isSecondary = i % 3 === 0;
    const mat = new THREE.MeshBasicMaterial({
      color: isSecondary ? initialAccents.a2 : initialAccents.a1,
      transparent: true,
      opacity: 0.65
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 550,
      (Math.random() - 0.5) * 360,
      (Math.random() - 0.5) * 120
    );
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      vz: (Math.random() - 0.5) * 0.25
    };
    scene.add(mesh);
    nodes.push(mesh);
  }

  // Constellation Connection Lines
  const MAX_LINES = 140;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineColors = new Float32Array(MAX_LINES * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineSegmentsMaterial
    ? new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false })
    : new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false });

  const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineMesh);

  const colA = new THREE.Color(initialAccents.a1);
  const colB = new THREE.Color(initialAccents.a2);

  function updateLines() {
    let count = 0;
    for (let i = 0; i < nodes.length && count < MAX_LINES; i++) {
      for (let j = i + 1; j < nodes.length && count < MAX_LINES; j++) {
        const dx = nodes[i].position.x - nodes[j].position.x;
        const dy = nodes[i].position.y - nodes[j].position.y;
        const dz = nodes[i].position.z - nodes[j].position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 110) {
          const idx = count * 6;
          const factor = 1 - dist / 110;
          const c = count % 2 === 0 ? colA : colB;

          linePositions[idx]     = nodes[i].position.x;
          linePositions[idx + 1] = nodes[i].position.y;
          linePositions[idx + 2] = nodes[i].position.z;
          linePositions[idx + 3] = nodes[j].position.x;
          linePositions[idx + 4] = nodes[j].position.y;
          linePositions[idx + 5] = nodes[j].position.z;

          lineColors[idx]     = c.r * factor;
          lineColors[idx + 1] = c.g * factor;
          lineColors[idx + 2] = c.b * factor;
          lineColors[idx + 3] = c.r * factor;
          lineColors[idx + 4] = c.g * factor;
          lineColors[idx + 5] = c.b * factor;

          count++;
        }
      }
    }
    lineGeo.setDrawRange(0, count * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  // 4. Theme synchronization hook
  function applyThemeColors(theme) {
    const tg = THEME_GRADIENTS[theme] || THEME_GRADIENTS.dark;
    targetGrad.c1.setHex(tg.c1);
    targetGrad.c2.setHex(tg.c2);
    targetGrad.c3.setHex(tg.c3);
    targetGrad.c4.setHex(tg.c4);
    targetGrad.op = tg.op;

    const acc = THEME_ACCENTS[theme] || THEME_ACCENTS.dark;
    colA.setHex(acc.a1);
    colB.setHex(acc.a2);

    nodes.forEach((n, idx) => {
      n.material.color.setHex(idx % 3 === 0 ? acc.a2 : acc.a1);
    });
  }

  document.addEventListener('theme-change', e => {
    applyThemeColors(e.detail.theme);
  });

  // 5. Cursor Parallax
  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 6. Scroll visibility & zero-idle GPU loop
  let heroGone = false;
  let isLooping = true;

  window.addEventListener('scroll', () => {
    heroGone = window.scrollY > window.innerHeight * 1.1;
    canvas.style.opacity = window.scrollY > window.innerHeight * 0.95 ? '0' : '1';
  }, { passive: true });

  const visibilityObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const isVisible = entry.isIntersecting;
      if (isVisible && !isLooping) {
        isLooping = true;
        requestAnimationFrame(render);
      } else if (!isVisible && isLooping) {
        isLooping = false;
      }
    });
  }, { threshold: 0 });
  visibilityObs.observe(heroSection);

  // 7. Render Loop
  let frame = 0;
  function render() {
    if (!isLooping) return;
    requestAnimationFrame(render);
    if (heroGone) return;

    frame++;

    // Move nodes
    nodes.forEach(n => {
      n.position.x += n.userData.vx;
      n.position.y += n.userData.vy;
      n.position.z += n.userData.vz;
      if (Math.abs(n.position.x) > 300) n.userData.vx *= -1;
      if (Math.abs(n.position.y) > 200) n.userData.vy *= -1;
      if (Math.abs(n.position.z) > 70)  n.userData.vz *= -1;
    });

    // Camera parallax
    tx += (mx * 16 - tx) * 0.035;
    ty += (my * 10 - ty) * 0.035;
    camera.position.x = tx;
    camera.position.y = -ty;
    camera.lookAt(0, 0, 0);

    // ShaderGradient wave time and color lerp
    gradUniforms.uTime.value += 0.016;
    gradUniforms.uColor1.value.lerp(targetGrad.c1, 0.04);
    gradUniforms.uColor2.value.lerp(targetGrad.c2, 0.04);
    gradUniforms.uColor3.value.lerp(targetGrad.c3, 0.04);
    gradUniforms.uColor4.value.lerp(targetGrad.c4, 0.04);
    gradUniforms.uOpacity.value += (targetGrad.op - gradUniforms.uOpacity.value) * 0.04;

    if (frame % 3 === 0) updateLines();

    renderer.render(scene, camera);
  }
  render();

  // Fallback function
  function init2DFallback(c, parent) {
    const ctx = c.getContext('2d');
    let w = (c.width = parent.offsetWidth);
    let h = (c.height = parent.offsetHeight);
    let pts = [];
    const count = Math.floor(w / 14);

    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.3 + 0.4
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const color = '0, 204, 255';
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
