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
})();
