/**
 * web-1P motion — vanilla, žádné závislosti.
 * 1) reveal on scroll  2) card pointer-glow  3) scroll-scrubbed video patička
 * Respektuje prefers-reduced-motion.
 */
const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1) Reveal: [data-reveal] / [data-reveal-group] */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal],[data-reveal-group]');
  const show = (el) => {
    el.classList.add('is-visible');
    if (el.hasAttribute('data-reveal-group')) {
      Array.from(el.children).forEach((c, i) => { c.style.transitionDelay = `${i * 60}ms`; });
    }
  };
  if (rm || !('IntersectionObserver' in window)) { els.forEach(show); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // jakýkoli dotek viewportu odhalí (spolehlivé i u vysokých gridů)
      if (e.isIntersecting || e.intersectionRatio > 0) { show(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => obs.observe(el));
  // Failsafe: cokoli ještě skrytého odhal po 1.5 s (kdyby observer nesepnul)
  setTimeout(() => els.forEach((el) => { if (!el.classList.contains('is-visible')) show(el); }), 1500);
}

/* 2) Pointer glow na kartách [data-glow] — real DOM element, transform compositor-only */
function initGlow() {
  if (rm) return;
  document.querySelectorAll('[data-glow]').forEach((card) => {
    const orb = document.createElement('span');
    orb.className = 'glow-orb';
    orb.setAttribute('aria-hidden', 'true');
    card.appendChild(orb);
    card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect();
      orb.style.transform = `translate(${ev.clientX - r.left - 140}px, ${ev.clientY - r.top - 140}px)`;
    });
  });
}

/* 3) Scroll-scrubbed video patička — video.currentTime řízené scrollem */
function initVideoScrub() {
  const section = document.querySelector('[data-scrub]');
  const video = section && section.querySelector('video');
  if (!section || !video) return;
  if (rm) {
    video.preload = 'auto';
    video.addEventListener('loadedmetadata', () => { try { video.currentTime = video.duration; } catch (_) {} });
    return;
  }
  let duration = 0, visible = false;
  const pre = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) { video.preload = 'auto'; pre.disconnect(); }
  }, { rootMargin: '500px 0px' });
  pre.observe(section);
  video.addEventListener('loadedmetadata', () => { duration = video.duration; });
  const vis = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px 0px' });
  vis.observe(section);
  function tick() {
    if (visible && duration) {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (section.offsetHeight + vh)));
      try { video.currentTime = progress * duration; } catch (_) {}
      section.classList.toggle('scrub-done', progress > 0.85);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function boot() { initReveal(); initGlow(); initVideoScrub(); }
if (document.readyState !== 'loading') boot();
else document.addEventListener('DOMContentLoaded', boot);
