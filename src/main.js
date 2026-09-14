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
   Cada seção tem uma faixa de rolagem que vai de "o topo da seção entra na tela"
   até "a seção está em 50%" (o meio dela no meio da tela) — nesse ponto TUDO da
   seção já está revelado. A faixa é dividida em fatias, uma por item na ordem do
   HTML: o item 1 aparece na 1ª fatia de rolagem, o item 2 na 2ª, e assim por diante.
   É a rolagem que controla, não o tempo. Rolar de volta pra cima desfaz.
   Itens lado a lado (os 4 cards) ficam em fatias diferentes, por isso aparecem um
   de cada vez mesmo estando na mesma altura da tela.
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

const START_AT = 0.85;    // progresso 0: topo da seção a 85% da tela (começando a entrar)
const DONE_AT = 0.5;      // progresso 1: seção em 50% (meio dela no meio da tela) → tudo revelado
const ANIM_SHARE = 0.62;  // quanto da fatia é animação; o resto (0.38) é a pausa até o próximo
const RISE = 26;          // px que o item sobe ao entrar

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const groups = [];
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
    // começa quando o topo da seção entra na tela...
    const startY = g.top - vh * START_AT;
    // ...e termina quando a seção está em 50%: aqui tudo dela já apareceu.
    // O limite em maxScroll é essencial: na última seção não existe rolagem
    // suficiente pra levar o meio dela ao meio da tela, e sem isso o progresso
    // nunca chegaria a 1 — os últimos itens ficavam travados meio transparentes.
    const endY = Math.min(g.top + g.height * DONE_AT - vh * 0.5, maxScroll);
    const progress = clamp01((scrollY - startY) / Math.max(endY - startY, 1));

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
  // guardado aqui pra não fazer leitura de layout a cada frame da rolagem
  maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
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
  groups.forEach((g) => g.items.forEach((el) => el.classList.add('is-visible')));
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
