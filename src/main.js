import './style.css';

/* ---------- Ano no rodapé ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Header com sombra ao rolar ---------- */
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobile ---------- */
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Comparador antes / depois ---------- */
document.querySelectorAll('[data-ba]').forEach((ba) => {
  const frame = ba.querySelector('.ba__frame');
  const before = ba.querySelector('.ba__before');
  const handle = ba.querySelector('.ba__handle');
  let dragging = false;

  const setPos = (clientX) => {
    const rect = frame.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    before.style.width = pct + '%';
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(pct)));
  };

  const start = (e) => {
    dragging = true;
    frame.setPointerCapture?.(e.pointerId);
    setPos(e.clientX);
  };
  const move = (e) => { if (dragging) setPos(e.clientX); };
  const end = () => { dragging = false; };

  frame.addEventListener('pointerdown', start);
  frame.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);

  handle.addEventListener('keydown', (e) => {
    const cur = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    let next = cur;
    if (e.key === 'ArrowLeft') next = cur - 4;
    else if (e.key === 'ArrowRight') next = cur + 4;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(100, next));
    before.style.width = next + '%';
    handle.style.left = next + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(next)));
  });
});

/* ---------- Entrada de texto no scroll (GSAP + SplitText) ----------
   Ao entrar na tela, a seção toca UMA vez uma sequência: os elementos entram
   na ordem do HTML, um de cada vez (kicker → h2 → p → h3 → ...). Títulos e textos
   curtos entram com as letras subindo (y:40 → 0 + fade); o resto com um fade suave. */
function initSplitReveal() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  if (!gsap || !ScrollTrigger || !SplitText) return; // CDN indisponível → fallback CSS/IntersectionObserver
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add('gsap-ready');

  // Títulos / textos curtos → letra a letra
  const charSel = [
    '.hero__title',
    '.section__head .kicker', '.section__head h2',
    '.card h3', '.card__tag',
    '.why h3',
    '.benefits li',
    '.video-block__text .kicker', '.video-block__text h2', '.ticks li',
    '.cta-final .kicker', '.cta-final h2',
    '.hero__chips li'
  ].join(',');
  // Parágrafos / blocos maiores → fade suave subindo
  const fadeSel = [
    '.hero__eyebrow', '.hero__lead',
    '.section__head p',
    '.card p', '.why p',
    '.video-block__text p', '.video-block__media',
    '.about__text p',
    '.ba',
    '.cta-final p'
  ].join(',');
  const allSel = charSel + ',' + fadeSel;

  // Uma timeline por seção → garante a ordem e o "um de cada vez"
  gsap.utils.toArray('main > section').forEach((section) => {
    const items = gsap.utils.toArray(section.querySelectorAll(allSel)); // já vem na ordem do DOM
    if (!items.length) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%', once: true }
    });

    items.forEach((el, i) => {
      const pos = i === 0 ? 0 : '<0.28'; // cada um começa 0,28s depois do anterior (cascata na hierarquia)
      if (el.matches(charSel) && el.textContent.trim()) {
        const split = SplitText.create(el, { type: 'words,chars', charsClass: 'gsap-char' });
        tl.from(split.chars, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: { amount: Math.min(0.7, split.chars.length * 0.035) }
        }, pos);
      } else {
        tl.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.55,
          ease: 'power2.out'
        }, pos);
      }
    });
  });

  ScrollTrigger.refresh();
}

// Espera as fontes carregarem para não dividir as letras com a métrica errada
if (document.fonts && document.fonts.ready) {
  Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 2000))
  ]).then(initSplitReveal);
} else {
  initSplitReveal();
}
