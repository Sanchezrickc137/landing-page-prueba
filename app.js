const menuToggle = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#site-navigation');
const menuLinks = [...navigation.querySelectorAll('a')];

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
}

menuToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
});
menuLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});

const sectionTargets = menuLinks.map(link => document.querySelector(link.hash));
let scrollScheduled = false;
function updateNavigation() {
  let current = sectionTargets[0];
  for (const section of sectionTargets) {
    if (section.getBoundingClientRect().top <= 165) current = section;
  }
  menuLinks.forEach(link => {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateNavigation);
  }
}, { passive: true });
window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 801px)').matches) closeMenu();
  updateNavigation();
});
updateNavigation();

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  status.textContent = 'Mensaje de confirmación';
  status.hidden = false;
});

const heroContent = document.querySelector('#hero-content');
document.querySelectorAll('[data-hero-effect]').forEach(button => {
  button.addEventListener('click', () => {
    const effect = button.dataset.heroEffect;
    const enabled = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(enabled));
    heroContent.classList.toggle('has-' + effect, enabled);
    if (effect === 'hover') {
      heroContent.querySelectorAll('.effect-target:not(a)').forEach(target => {
        if (enabled) target.setAttribute('tabindex', '0');
        else target.removeAttribute('tabindex');
      });
    }
  });
});

const transitionToggle = document.querySelector('#transition-toggle');
const heroSection = document.querySelector('#bienvenida');
const aboutSection = document.querySelector('#acerca-de');
const siteHeader = document.querySelector('.site-header');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let transitionEnabled = false;
let transitionFrame = null;
let transitionPreviewFrame = null;
const clampProgress = value => Math.min(1, Math.max(0, value));

function setTransitionProgress(exitProgress, entryProgress) {
  heroSection.style.setProperty('--hero-exit-opacity', String(1 - exitProgress));
  heroSection.style.setProperty('--hero-exit-y', (-48 * exitProgress) + 'px');
  aboutSection.style.setProperty('--about-enter-opacity', String(entryProgress));
  aboutSection.style.setProperty('--about-enter-y', (56 * (1 - entryProgress)) + 'px');
}

function updateSectionTransition() {
  transitionFrame = null;
  const enabled = transitionEnabled && !reducedMotion.matches;
  document.body.classList.toggle('section-transition-active', enabled);
  if (!enabled) {
    heroSection.style.removeProperty('--hero-exit-opacity');
    heroSection.style.removeProperty('--hero-exit-y');
    aboutSection.style.removeProperty('--about-enter-opacity');
    aboutSection.style.removeProperty('--about-enter-y');
    return;
  }

  const heroBounds = heroSection.getBoundingClientRect();
  const aboutBounds = aboutSection.getBoundingClientRect();
  const headerBottom = siteHeader.getBoundingClientRect().bottom;
  const exitProgress = clampProgress((headerBottom - heroBounds.top) / heroBounds.height);
  const entryDistance = Math.min(aboutBounds.height, window.innerHeight) * .55;
  const entryProgress = clampProgress((window.innerHeight - aboutBounds.top) / entryDistance);
  setTransitionProgress(exitProgress, entryProgress);
}

function requestTransitionUpdate() {
  if (transitionEnabled && transitionPreviewFrame === null && transitionFrame === null) {
    transitionFrame = requestAnimationFrame(updateSectionTransition);
  }
}

function stopTransitionPreview() {
  if (transitionPreviewFrame === null) return;
  cancelAnimationFrame(transitionPreviewFrame);
  transitionPreviewFrame = null;
  updateSectionTransition();
}

function previewSectionTransition() {
  const startY = window.scrollY;
  const targetY = Math.max(0, startY + aboutSection.getBoundingClientRect().top
    - siteHeader.getBoundingClientRect().height - 24);

  if (reducedMotion.matches) {
    window.scrollTo({ top: targetY, behavior: 'instant' });
    updateSectionTransition();
    return;
  }

  document.body.classList.add('section-transition-active');
  setTransitionProgress(0, 0);
  let startedAt;
  const easeInOut = progress => progress < .5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2;

  function animateTransition(now) {
    startedAt ??= now;
    const elapsed = now - startedAt;
    const exitProgress = clampProgress(elapsed / 360);
    const scrollProgress = easeInOut(clampProgress((elapsed - 120) / 860));
    const entryProgress = 1 - (1 - clampProgress((elapsed - 600) / 680)) ** 3;
    setTransitionProgress(exitProgress, entryProgress);
    window.scrollTo({ top: startY + (targetY - startY) * scrollProgress, behavior: 'instant' });

    if (elapsed < 1280) {
      transitionPreviewFrame = requestAnimationFrame(animateTransition);
    } else {
      transitionPreviewFrame = null;
      updateSectionTransition();
    }
  }
  transitionPreviewFrame = requestAnimationFrame(animateTransition);
}

transitionToggle.addEventListener('click', () => {
  transitionEnabled = !transitionEnabled;
  transitionToggle.setAttribute('aria-pressed', String(transitionEnabled));
  if (transitionFrame !== null) {
    cancelAnimationFrame(transitionFrame);
    transitionFrame = null;
  }
  stopTransitionPreview();
  if (transitionEnabled) previewSectionTransition();
  else updateSectionTransition();
});
window.addEventListener('scroll', requestTransitionUpdate, { passive: true });
window.addEventListener('resize', () => {
  stopTransitionPreview();
  requestTransitionUpdate();
});
window.addEventListener('wheel', stopTransitionPreview, { passive: true });
window.addEventListener('touchstart', stopTransitionPreview, { passive: true });
document.addEventListener('keydown', event => {
  if (['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
    stopTransitionPreview();
  }
});
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="#"]')) stopTransitionPreview();
});
reducedMotion.addEventListener('change', () => {
  stopTransitionPreview();
  updateSectionTransition();
});
