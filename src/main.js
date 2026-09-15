import './style.css';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

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
   Cada item tem sua própria faixa de rolagem, ancorada na posição dele: começa a
   aparecer ao entrar pela base da tela e está completo ao chegar em ~55% da altura
   da tela. Ancorar no item (e não na seção) garante que a animação aconteça onde o
   usuário está olhando, inclusive nos itens do fim de seções altas.
   É a rolagem que controla, não o tempo. Rolar de volta pra cima desfaz.
   Vizinhos de mesma altura (os 4 cards, as pílulas de benefícios) cruzariam a marca
   no mesmo instante, então cada um ganha um deslocamento extra de rolagem (ROW_STEP)
   — é isso que faz eles aparecerem um de cada vez.
   Não lê layout durante a rolagem (posições ficam em cache) → leve no celular. */
const CASCADE_SELECTOR = [
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

const ITEM_START = 0.95;  // começa a aparecer quando o item entra pela base da tela
const ITEM_DONE = 0.55;   // está 100% visível quando chega a 55% da altura da tela
const ROW_STEP = 110;     // px de rolagem entre vizinhos de mesma altura
const RISE = 26;          // px que o item sobe ao entrar

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const items = [];
let maxScroll = 0;

/* ---------- Hero: sequência letra a letra no carregamento (GSAP + SplitText) ----------
   O hero já está na tela quando a página abre (não existe rolagem antes dele), então
   aqui a sequência roda no load: tudo começa invisível e aparece um item de cada vez,
   na ordem — selo → título → texto → botão 1 → botão 2 → os 3 chips.
   Títulos/textos/chips entram letra a letra; os botões (que têm ícone SVG dentro)
   entram inteiros. O GSAP vem no bundle do site, não de CDN — sem depender de rede. */
const HERO_ORDER = '.hero__eyebrow, .hero__title, .hero__lead, .hero__actions .btn, .hero__chips li';
const HERO_CHARS = '.hero__title, .hero__lead, .hero__chips li'; // esses vão letra a letra
const HERO_GAP = '>+0.08';   // pausa entre um item e o próximo (depois que o anterior termina)
const HERO_DUR = 0.4;        // duração da entrada de cada letra / item
const HERO_SPREAD = 0.4;     // teto do espalhamento das letras de um mesmo texto

const hero = document.querySelector('.hero');
const heroItems = hero ? Array.from(hero.querySelectorAll(HERO_ORDER)) : [];

function initHeroSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out', force3D: true } });

  heroItems.forEach((el, i) => {
    const pos = i === 0 ? 0 : HERO_GAP;

    if (el.matches(HERO_CHARS) && el.textContent.trim()) {
      const split = SplitText.create(el, { type: 'words,chars', charsClass: 'gsap-char' });
      tl.from(split.chars, {
        y: 22,
        opacity: 0,
        duration: HERO_DUR,
        immediateRender: true, // esconde já na criação, senão o item pisca antes de animar
        stagger: { amount: Math.min(HERO_SPREAD, split.chars.length * 0.02) }
      }, pos);
    } else {
      tl.from(el, {
        y: 16,
        opacity: 0,
        duration: HERO_DUR,
        immediateRender: true
      }, pos);
    }
  });
}

document.querySelectorAll('main > section').forEach((section) => {
  if (section.classList.contains('hero')) return; // hero é por tempo (acima)
  section.querySelectorAll(CASCADE_SELECTOR).forEach((el) => {
    el.classList.add('reveal');
    items.push({ el, top: 0, order: 0 });
  });
});

function paint() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  for (const it of items) {
    // Cada item é ancorado na PRÓPRIA posição: começa a aparecer quando entra
    // pela base da tela e está completo ao chegar em ~55% da altura da tela.
    // Assim a animação acontece onde o usuário está olhando, inclusive nos itens
    // do fim de seções altas (a lista de benefícios, por exemplo).
    // `order` desloca os vizinhos de mesma altura (os 4 cards, as pílulas),
    // que cruzariam a mesma marca no mesmo instante — é o que faz um de cada vez.
    const shift = it.order * ROW_STEP;
    const startY = it.top - vh * ITEM_START + shift;
    // sem o limite em maxScroll, itens perto do fim da página nunca chegariam
    // a 55% da tela e ficariam travados meio transparentes
    const endY = Math.min(it.top - vh * ITEM_DONE + shift, maxScroll);

    const p = clamp01((scrollY - startY) / Math.max(endY - startY, 1));
    if (it.p === p) continue;
    it.p = p;

    const el = it.el;
    if (p === 1) {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = ''; // devolve a transition do CSS → hover volta a ser suave
      el.classList.add('is-visible');
    } else {
      el.classList.remove('is-visible');
      el.style.transition = 'none'; // durante a revelação é a rolagem que manda
      el.style.opacity = String(p);
      el.style.transform = `translate3d(0, ${((1 - p) * RISE).toFixed(1)}px, 0)`;
    }
  }
}

function measure() {
  const scrollY = window.scrollY;
  // guardado aqui pra não fazer leitura de layout a cada frame da rolagem
  maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

  let prevTop = null;
  let order = 0;
  for (const it of items) {
    it.top = it.el.getBoundingClientRect().top + scrollY;
    // itens consecutivos na mesma altura formam uma "linha" (grid/flex lado a lado)
    order = prevTop !== null && Math.abs(it.top - prevTop) <= 8 ? order + 1 : 0;
    prevTop = it.top;
    it.order = order;
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
  items.forEach((it) => it.el.classList.add('is-visible'));
} else {
  initHeroSequence();

  measure();
  window.addEventListener('scroll', onScrollPaint, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);

  // Se a altura da página mudar depois (vídeo, imagem ou fonte terminando de
  // carregar), as posições em cache ficam erradas e o progresso para no meio.
  // O ResizeObserver só dispara quando o tamanho realmente muda, então é barato.
  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(document.body);
  }
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
