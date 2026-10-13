(() => {
  const hero = document.getElementById('bienvenida');
  const background = hero?.querySelector('.hero-background');
  const toggle = document.getElementById('background-toggle');
  const options = document.getElementById('background-options');
  if (!hero || !background || !toggle || !options) return;

  const choices = [...options.querySelectorAll('[data-background-option]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');
  background.append(canvas);
  const context = canvas.getContext('2d');
  let selection = 'none';
  let visible = true;
  let frame = null;
  let width = 1;
  let height = 1;
  let previousTime = 0;
  let particles = [];
  const pointer = { x: 0, y: 0, active: false };

  function setExpanded(expanded) {
    options.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context?.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(42, Math.max(18, Math.round(width / 30)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: ((index * 0.61803398875 + 0.09) % 1) * width,
      y: ((index * 0.41421356237 + 0.13) % 1) * height,
      vx: Math.cos(index * 2.4) * 0.2,
      vy: Math.sin(index * 2.4) * 0.2,
      radius: 1.5 + (index % 3) * 0.65,
    }));
    if (selection === 'grid-3') draw(0);
  }

  function draw(step) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      if (pointer.active && !reducedMotion.matches && step > 0) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 150) {
          const force = (1 - distance / 150) * 1.8 * step;
          particle.x += dx / distance * force;
          particle.y += dy / distance * force;
        }
      }
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
    }
    for (let a = 0; a < particles.length; a += 1) {
      const first = particles[a];
      for (let b = a + 1; b < particles.length; b += 1) {
        const second = particles[b];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance < 165) {
          context.strokeStyle = `rgba(47, 133, 144, ${(1 - distance / 165) * 0.2})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
      context.fillStyle = 'rgba(31, 122, 137, 0.42)';
      context.beginPath();
      context.arc(first.x, first.y, first.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function animate(time) {
    frame = null;
    const step = previousTime ? Math.min((time - previousTime) / 16.667, 2) : 1;
    previousTime = time;
    draw(step);
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    const paused = !visible || document.hidden || reducedMotion.matches;
    hero.classList.toggle('is-background-paused', paused);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = 0;
    if (selection === 'grid-3' && !paused && context) frame = requestAnimationFrame(animate);
    else if (selection === 'grid-3') draw(0);
  }

  function resetPointer() {
    pointer.active = false;
    background.style.removeProperty('--pointer-x');
    background.style.removeProperty('--pointer-y');
  }

  function select(value) {
    selection = value;
    hero.dataset.background = value;
    toggle.classList.toggle('is-active', value !== 'none');
    for (const choice of choices) choice.setAttribute('aria-pressed', String(choice.dataset.backgroundOption === value));
    resetPointer();
    if (value === 'grid-3') resize();
    syncAnimation();
    setExpanded(false);
  }

  toggle.addEventListener('click', () => setExpanded(options.hidden));
  for (const choice of choices) {
    choice.addEventListener('click', () => {
      const value = choice.dataset.backgroundOption;
      select(value === selection ? 'none' : value);
      toggle.focus({ preventScroll: true });
    });
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('.background-control')) setExpanded(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !options.hidden) {
      setExpanded(false);
      toggle.focus({ preventScroll: true });
    }
  });

  function movePointer(event) {
    if (selection !== 'grid-3' || reducedMotion.matches || !visible) return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = Math.min(width, Math.max(0, event.clientX - bounds.left));
    pointer.y = Math.min(height, Math.max(0, event.clientY - bounds.top));
    pointer.active = true;
    background.style.setProperty('--pointer-x', `${pointer.x}px`);
    background.style.setProperty('--pointer-y', `${pointer.y}px`);
  }
  hero.addEventListener('pointermove', movePointer, { passive: true });
  hero.addEventListener('pointerdown', movePointer, { passive: true });
  hero.addEventListener('pointerleave', resetPointer);
  hero.addEventListener('pointercancel', resetPointer);
  hero.addEventListener('pointerup', event => { if (event.pointerType === 'touch') resetPointer(); });
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', () => { resetPointer(); syncAnimation(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) resetPointer();
      syncAnimation();
    }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize, { passive: true });
  select('none');
})();
