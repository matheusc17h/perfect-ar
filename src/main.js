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
