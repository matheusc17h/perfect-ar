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

/* ---------- Revelação conduzida pela POSIÇÃO DO SCROLL (sem bibliotecas) ----------
   Cada seção recebe uma faixa de rolagem que começa quando o topo dela chega à
   metade da tela. Essa faixa é dividida em fatias — uma por item, na ordem do HTML.
   Então o item 1 aparece na primeira fatia de rolagem, o item 2 na segunda, etc.:
   é a rolagem que controla, não o tempo. Rolar de volta pra cima desfaz.
   Itens lado a lado (os 4 cards, os 3 chips) ficam em fatias diferentes, por isso
   aparecem um de cada vez mesmo estando na mesma altura da tela.
   Não lê layout durante a rolagem (posições ficam em cache) → leve no celular. */
const CASCADE_SELECTOR = [
  '.hero__eyebrow', '.hero__title', '.hero__lead', '.hero__chips li',
  '.section__head .kicker', '.section__head h2', '.section__head p',
  '.card',
  '.why',
  '.benefits li',
  '.ba',
  '.video-block__media',
  '.video-block__text .kicker', '.video-block__text h2', '.video-block__text p', '.ticks li',
  '.about__text p',
  '.cta-final .kicker', '.cta-final h2', '.cta-final p'
].join(',');

const ANIM_SHARE = 0.62;  // quanto da fatia é animação; o resto (0.38) é a pausa até o próximo
const RISE = 26;          // px que o item sobe ao entrar

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const groups = [];

// O hero já está na tela quando a página abre (não existe rolagem antes dele),
// então ali a sequência é por tempo: um item de cada vez, com pausa entre eles.
const HERO_STEP = 620;      // ms entre um item e o próximo
const HERO_DURATION = 900;  // ms de animação de cada item
const hero = document.querySelector('.hero');
const heroItems = hero ? Array.from(hero.querySelectorAll(CASCADE_SELECTOR)) : [];

heroItems.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDuration = HERO_DURATION + 'ms';
  el.style.transitionDelay = i * HERO_STEP + 'ms';
});

document.querySelectorAll('main > section').forEach((section) => {
  if (section.classList.contains('hero')) return; // hero é por tempo (acima)
  const items = Array.from(section.querySelectorAll(CASCADE_SELECTOR));
  if (!items.length) return;
  items.forEach((el) => {
    el.classList.add('reveal');
    el.style.transition = 'none'; // a rolagem controla o valor direto, sem transição por tempo
  });
  groups.push({ section, items, top: 0, height: 0 });
});

function paint() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  for (const g of groups) {
    const n = g.items.length;
    // faixa de rolagem da cascata: proporcional ao tamanho da seção, com um mínimo
    const span = Math.max(g.height * 0.75, vh * 0.85);
    // 0 quando o topo da seção chega à metade da tela; 1 no fim da faixa
    const progress = clamp01((scrollY - (g.top - vh * 0.5)) / span);

    for (let i = 0; i < n; i++) {
      const el = g.items[i];
      const p = clamp01((progress - i / n) / (ANIM_SHARE / n));
      if (el._p === p) continue;
      el._p = p;
      if (p === 1) {
        el.style.opacity = '';
        el.style.transform = '';
        el.classList.add('is-visible');
      } else {
        el.classList.remove('is-visible');
        el.style.opacity = String(p);
        el.style.transform = `translate3d(0, ${((1 - p) * RISE).toFixed(1)}px, 0)`;
      }
    }
  }
}

function measure() {
  const scrollY = window.scrollY;
  for (const g of groups) {
    g.top = g.section.getBoundingClientRect().top + scrollY;
    g.height = g.section.offsetHeight;
  }
  paint();
}

let ticking = false;
const onScrollPaint = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; paint(); });
};

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroItems.forEach((el) => { el.style.transitionDelay = '0ms'; el.classList.add('is-visible'); });
  groups.forEach((g) => g.items.forEach((el) => el.classList.add('is-visible')));
} else {
  // hero: dispara a cascata por tempo logo após a primeira pintura
  requestAnimationFrame(() => {
    requestAnimationFrame(() => heroItems.forEach((el) => el.classList.add('is-visible')));
  });

  measure();
  window.addEventListener('scroll', onScrollPaint, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
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
