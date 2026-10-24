(() => {
  const background = document.querySelector('.site-background');
  const canvas = background?.querySelector('canvas');
  const toggle = document.querySelector('.motion-toggle');
  if (!background || !canvas || !toggle) return;

  const context = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const preferenceKey = 'tofu.background.paused';
  const pointer = { x: 0, y: 0, active: false };
  let paused = false;
  try { paused = localStorage.getItem(preferenceKey) === 'true'; } catch { /* Storage is optional. */ }

  let width = 1;
  let height = 1;
  let particles = [];
  let running = false;
  let frame = 0;
  let resizeFrame = 0;
  let lastDraw = 0;
  let elapsed = 0;

  const drawLight = (x, y, radius, alpha) => {
    context.fillStyle = `rgba(123, 190, 255, ${alpha * .15})`;
    context.beginPath();
    context.arc(x, y, radius * 3.5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = `rgba(203, 231, 255, ${alpha})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  };

  const draw = (delta = 0) => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const reach = Math.min(220, width * .5);

    if (pointer.active) {
      const light = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 210);
      light.addColorStop(0, 'rgba(111, 177, 255, .09)');
      light.addColorStop(1, 'rgba(111, 177, 255, 0)');
      context.fillStyle = light;
      context.fillRect(pointer.x - 210, pointer.y - 210, 420, 420);
    }

    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      if (pointer.active && delta) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 190) {
          const force = (1 - distance / 190) * 60 * delta;
          particle.x += dx / distance * force;
          particle.y += dy / distance * force;
        }
      }
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;
    }

    context.lineWidth = .85;
    for (let index = 0; index < particles.length; index++) {
      const particle = particles[index];
      for (let next = index + 1; next < particles.length; next++) {
        const other = particles[next];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const squaredDistance = dx * dx + dy * dy;
        if (squaredDistance >= reach * reach) continue;
        const strength = 1 - Math.sqrt(squaredDistance) / reach;
        context.strokeStyle = `rgba(139, 191, 243, ${strength * .34})`;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
        // Small lights travel along selected links without introducing flashes.
        if ((index + next) % 5 === 0 && squaredDistance > 2500) {
          const progress = (elapsed * .36 + particle.phase / (Math.PI * 2)) % 1;
          const alpha = Math.sin(progress * Math.PI) * strength * .9;
          drawLight(particle.x - dx * progress, particle.y - dy * progress, 1.5, alpha);
        }
      }
      const pulse = .58 + Math.sin(elapsed * .9 + particle.phase) * .2;
      drawLight(particle.x, particle.y, particle.radius, pulse);
    }
  };

  const resize = () => {
    const oldWidth = width;
    const oldHeight = height;
    width = Math.max(1, document.documentElement.clientWidth);
    height = Math.max(1, innerHeight);
    const count = Math.min(finePointer.matches ? 84 : 40, Math.max(28, Math.round(width * height / 17000)));
    particles = Array.from({ length: count }, (_, index) => {
      const existing = particles[index];
      const angle = Math.random() * Math.PI * 2;
      const speed = 12 + Math.random() * 14;
      return existing ? { ...existing, x: existing.x / oldWidth * width, y: existing.y / oldHeight * height } : {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * .8,
        radius: 1 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      };
    });
    if (context) {
      // Cap the canvas allocation as well as its frame rate on large displays.
      const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(3000000 / (width * height)));
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }
    lastDraw = 0;
  };

  const tick = (time) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (lastDraw && time - lastDraw < 1000 / 30) return;
    const delta = lastDraw ? Math.min((time - lastDraw) / 1000, .08) : 0;
    lastDraw = time;
    elapsed += delta;
    draw(delta);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
    background.classList.remove('is-running');
  };

  const sync = () => {
    const shouldRun = !paused && !reducedMotion.matches && !document.hidden;
    toggle.hidden = reducedMotion.matches;
    toggle.dataset.paused = String(paused);
    toggle.setAttribute('aria-label', paused ? '播放背景動畫' : '暫停背景動畫');
    toggle.title = toggle.getAttribute('aria-label');
    if (!shouldRun) {
      stop();
      pointer.active = false;
      return;
    }
    background.classList.add('is-running');
    if (!running) {
      running = true;
      lastDraw = 0;
      if (context) frame = requestAnimationFrame(tick);
    }
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(preferenceKey, String(paused)); } catch { /* Storage is optional. */ }
    sync();
  });
  addEventListener('pointermove', (event) => {
    if (!running || !finePointer.matches || event.pointerType !== 'mouse') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  addEventListener('pointerout', (event) => {
    if (!event.relatedTarget) pointer.active = false;
  }, { passive: true });
  addEventListener('blur', () => { pointer.active = false; });
  addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resize(); });
  }, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  addEventListener('pagehide', stop);
  addEventListener('pageshow', sync);
  resize();
  sync();
})();
