/* ================================================================
   PLATAFORMA — Tema e interações da home
================================================================ */

(function () {
  'use strict';

  // --- Tema claro/escuro (sincronizado com as apostilas) ---
  var raiz = document.documentElement;
  var CHAVE = 'estudos-tema';

  function aplicarTema(tema) {
    if (tema === 'light' || tema === 'dark') {
      raiz.setAttribute('data-theme', tema);
    } else {
      raiz.removeAttribute('data-theme');
    }
    var sistema = matchMedia('(prefers-color-scheme: dark)').matches;
    var efetivo = tema || (sistema ? 'dark' : 'light');
    document.querySelectorAll('.tema-botao').forEach(function (b) {
      b.setAttribute('aria-pressed', efetivo === 'dark');
      b.setAttribute('title', efetivo === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
    });
  }

  var salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch (e) {}
  aplicarTema(salvo);

  document.querySelectorAll('.tema-botao').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var atual = raiz.getAttribute('data-theme');
      var sistema = matchMedia('(prefers-color-scheme: dark)').matches;
      var efetivo = atual || (sistema ? 'dark' : 'light');
      var novo = efetivo === 'dark' ? 'light' : 'dark';
      aplicarTema(novo);
      try { localStorage.setItem(CHAVE, novo); } catch (e) {}
    });
  });

  // --- Menu lateral (drawer) ---
  var menuFundo = document.querySelector('.menu-lateral-fundo');
  var menuLateral = document.querySelector('.menu-lateral');
  var btnAbrir = document.querySelector('.menu-hamburguer');
  var btnFechar = document.querySelector('.menu-lateral-fechar');

  function abrirMenu() {
    if (!menuLateral || !menuFundo) return;
    menuLateral.classList.add('aberto');
    menuFundo.classList.add('aberto');
    menuFundo.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function fecharMenu() {
    if (!menuLateral || !menuFundo) return;
    menuLateral.classList.remove('aberto');
    menuFundo.classList.remove('aberto');
    menuFundo.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnAbrir) btnAbrir.addEventListener('click', abrirMenu);
  if (btnFechar) btnFechar.addEventListener('click', fecharMenu);
  if (menuFundo) menuFundo.addEventListener('click', fecharMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharMenu();
  });

  if (menuLateral) {
    menuLateral.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fecharMenu);
    });
  }

  // --- Carrosséis ---
  var wraps = document.querySelectorAll('.carrossel-trilho-wrap');

  wraps.forEach(function (wrap) {
    var trilho = wrap.querySelector('.carrossel-trilho');
    var esq    = wrap.querySelector('.carrossel-seta--esq');
    var dir    = wrap.querySelector('.carrossel-seta--dir');
    if (!trilho) return;

    var scrollAmt = 600;

    if (esq) {
      esq.addEventListener('click', function () {
        trilho.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
      });
    }

    if (dir) {
      dir.addEventListener('click', function () {
        trilho.scrollBy({ left: scrollAmt, behavior: 'smooth' });
      });
    }
  });
  // --- Banner em carrossel ---
  var hero = document.querySelector('.hero-carrossel');

  if (hero) {
    var slides = Array.from(hero.querySelectorAll('.hero-slide'));
    var bolinhas = Array.from(hero.querySelectorAll('.hero-bolinha'));
    var atual = 0;
    var relogio = null;
    var travas = { mouse: false, foco: false };
    var semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mostrar(i) {
      atual = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle('ativo', n === atual);
        if (n === atual) s.removeAttribute('aria-hidden');
        else s.setAttribute('aria-hidden', 'true');
      });
      bolinhas.forEach(function (b, n) {
        b.classList.toggle('ativa', n === atual);
        if (n === atual) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }

    function parar() {
      clearInterval(relogio);
      relogio = null;
    }

    function tocar() {
      parar();
      if (semAnimacao || travas.mouse || travas.foco || document.hidden) return;
      relogio = setInterval(function () { mostrar(atual + 1); }, 7000);
    }

    bolinhas.forEach(function (b, n) {
      b.addEventListener('click', function () { mostrar(n); tocar(); });
    });

    hero.addEventListener('mouseenter', function () { travas.mouse = true; parar(); });
    hero.addEventListener('mouseleave', function () { travas.mouse = false; tocar(); });
    hero.addEventListener('focusin', function () { travas.foco = true; parar(); });
    hero.addEventListener('focusout', function () { travas.foco = false; tocar(); });
    document.addEventListener('visibilitychange', tocar);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (menuLateral && menuLateral.classList.contains('aberto')) return;
      if (hero.getBoundingClientRect().bottom <= 0) return;
      mostrar(atual + (e.key === 'ArrowRight' ? 1 : -1));
      tocar();
    });

    tocar();
  }
})();
