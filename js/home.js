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
  // --- Banner em carrossel: card central, vizinhos nas bordas, volta infinita ---
  var hero = document.querySelector('.hero-carrossel');
  var trilhoHero = hero && hero.querySelector('.hero-trilho');

  if (trilhoHero) {
    var reais = Array.from(trilhoHero.querySelectorAll('.hero-slide'));
    var total = reais.length;
    var copias = Math.min(2, total);

    // Cópias feitas uma vez nas pontas, para sempre haver vizinho dos dois lados
    reais.slice(-copias).reverse().forEach(function (s) {
      trilhoHero.insertBefore(s.cloneNode(true), trilhoHero.firstChild);
    });
    reais.slice(0, copias).forEach(function (s) {
      trilhoHero.appendChild(s.cloneNode(true));
    });

    var todos = Array.from(trilhoHero.querySelectorAll('.hero-slide'));
    var barra = hero.querySelector('.hero-progresso span');
    var semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pos = copias;
    var andando = false;
    var reserva = null;
    var travas = { mouse: false, foco: false };

    function aplicar() {
      trilhoHero.style.setProperty('--i', pos);
      todos.forEach(function (s, n) {
        s.classList.toggle('ativo', n === pos);
        s.inert = n !== pos;
      });
    }

    function recomecarBarra() {
      if (!barra) return;
      barra.style.animation = 'none';
      void barra.offsetWidth;
      barra.style.animation = '';
    }

    function terminar() {
      clearTimeout(reserva);
      andando = false;
      if (pos >= copias && pos < copias + total) return;
      pos += pos < copias ? total : -total;
      hero.classList.add('sem-transicao');
      aplicar();
      void trilhoHero.offsetWidth;
      hero.classList.remove('sem-transicao');
    }

    function mover(direcao) {
      if (andando) return;
      andando = true;
      pos += direcao;
      aplicar();
      recomecarBarra();
      reserva = setTimeout(terminar, 750);
    }

    function pausar() {
      hero.classList.toggle('pausado', travas.mouse || travas.foco);
    }

    trilhoHero.addEventListener('transitionend', function (e) {
      if (e.target === trilhoHero && e.propertyName === 'transform') terminar();
    });

    if (barra && !semAnimacao) {
      barra.addEventListener('animationend', function () { mover(1); });
    }

    hero.querySelectorAll('.hero-sliver').forEach(function (b) {
      b.addEventListener('click', function (e) {
        mover(b.classList.contains('hero-sliver--dir') ? 1 : -1);
        if (e.detail > 0) b.blur();
      });
    });

    hero.addEventListener('mouseenter', function () { travas.mouse = true; pausar(); });
    hero.addEventListener('mouseleave', function () { travas.mouse = false; pausar(); });
    hero.addEventListener('focusin', function () { travas.foco = true; pausar(); });
    hero.addEventListener('focusout', function () { travas.foco = false; pausar(); });

    var toqueX = null;
    hero.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (toqueX === null) return;
      var d = e.changedTouches[0].clientX - toqueX;
      toqueX = null;
      if (Math.abs(d) > 40) mover(d < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (menuLateral && menuLateral.classList.contains('aberto')) return;
      if (hero.getBoundingClientRect().bottom <= 0) return;
      mover(e.key === 'ArrowRight' ? 1 : -1);
    });

    // Ao girar o celular ou redimensionar, o card recentraliza sem deslizar
    var fimResize = null;
    window.addEventListener('resize', function () {
      hero.classList.add('sem-transicao');
      clearTimeout(fimResize);
      fimResize = setTimeout(function () { hero.classList.remove('sem-transicao'); }, 150);
    });

    hero.classList.add('sem-transicao');
    aplicar();
    void trilhoHero.offsetWidth;
    hero.classList.remove('sem-transicao');
  }
})();
