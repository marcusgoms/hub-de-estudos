// =================================================================
// ESTUDO — nav lateral/painel flutuante, animações, tema
// =================================================================

(function () {
  'use strict';

  // ----------------- Tema claro/escuro -----------------
  var raiz = document.documentElement;
  var botoesTema = document.querySelectorAll('.tema-botao');
  var CHAVE = 'estudos-tema';

  function aplicarTema(tema) {
    if (tema === 'light' || tema === 'dark') {
      raiz.setAttribute('data-theme', tema);
    } else {
      raiz.removeAttribute('data-theme');
    }
    var sistema = matchMedia('(prefers-color-scheme: dark)').matches;
    var efetivo = tema || (sistema ? 'dark' : 'light');
    botoesTema.forEach(function (b) {
      b.setAttribute('aria-pressed', efetivo === 'dark');
      b.setAttribute('title', efetivo === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
    });
  }

  var salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch (e) {}
  aplicarTema(salvo);

  botoesTema.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var atual = raiz.getAttribute('data-theme');
      var sistema = matchMedia('(prefers-color-scheme: dark)').matches;
      var efetivo = atual || (sistema ? 'dark' : 'light');
      var novo = efetivo === 'dark' ? 'light' : 'dark';
      aplicarTema(novo);
      try { localStorage.setItem(CHAVE, novo); } catch (e) {}
    });
  });

  // ----------------- Navegação de capítulos -----------------
  var capitulos = Array.from(document.querySelectorAll('.capitulo'));
  var topicos = Array.from(document.querySelectorAll('.topico'));

  // Pega tanto a sidebar (desktop) quanto o painel flutuante (mobile/tablet)
  var todasAsNavs = Array.from(document.querySelectorAll('.estudo-nav, .nav-painel'));

  function topoAbs(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function atualizarAtivo() {
    var linha = window.scrollY + 140;
    var capAtivo = capitulos[0] ? capitulos[0].id : null;
    for (var i = 0; i < capitulos.length; i++) {
      if (topoAbs(capitulos[i]) <= linha) capAtivo = capitulos[i].id;
    }

    var topAtivo = null;
    for (var j = 0; j < topicos.length; j++) {
      if (topoAbs(topicos[j]) <= linha) topAtivo = topicos[j].id;
    }
    if (topAtivo && capAtivo && topAtivo.indexOf(capAtivo + '-') !== 0) topAtivo = null;

    todasAsNavs.forEach(function (nav) {
      var itensCap = Array.from(nav.querySelectorAll('.nav-capitulos > li'));
      var linksTopicos = Array.from(nav.querySelectorAll('.nav-topicos a[href^="#"]'));

      itensCap.forEach(function (li) {
        li.classList.toggle('ativo', li.dataset.cap === capAtivo);
      });
      linksTopicos.forEach(function (a) {
        a.classList.toggle('ativo', a.getAttribute('href') === '#' + topAtivo);
      });
    });
  }

  // Clicar no nome do capítulo na sidebar desktop: abre os tópicos
  document.querySelectorAll('.estudo-nav .nav-cap').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var li = this.closest('li');
      var parent = this.closest('.estudo-nav');
      var itensCap = Array.from(parent.querySelectorAll('.nav-capitulos > li'));
      var jaAberto = li.classList.contains('aberto');
      itensCap.forEach(function (x) { x.classList.remove('aberto'); });
      if (!jaAberto) li.classList.add('aberto');
    });
  });

  // Clicar num tópico na sidebar: navega
  document.querySelectorAll('.estudo-nav .nav-topicos a').forEach(function (link) {
    link.addEventListener('click', function (e) { irPara(alvoDoTopico(this), e); });
  });

  // O primeiro tópico leva à abertura do capítulo, para mostrar a capa
  function alvoDoTopico(link) {
    var primeiro = link.closest('.nav-topicos').querySelector('a') === link;
    return primeiro ? '#' + link.closest('li[data-cap]').dataset.cap : link.getAttribute('href');
  }

  function irPara(alvo, e) {
    var el = document.querySelector(alvo);
    if (el) {
      if (e) e.preventDefault();
      var topo = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topo, behavior: 'smooth' });
      history.replaceState(null, '', alvo);
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { atualizarAtivo(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  atualizarAtivo();

  // Links diretos: a rolagem suave do CSS nao completa durante o carregamento
  window.addEventListener('load', function () {
    var alvo = location.hash && document.getElementById(location.hash.slice(1));
    if (alvo) window.scrollTo({ top: topoAbs(alvo) - 80, behavior: 'instant' });
  });

  // ----------------- Painel flutuante (tablet + mobile) -----------------
  var fab = document.querySelector('.nav-fab');
  var painel = document.querySelector('.nav-painel');
  var fundo = document.querySelector('.nav-painel-fundo');
  var fechar = document.querySelector('.nav-painel-fechar');

  function abrirPainel() {
    if (!painel || !fundo) return;
    painel.classList.add('aberto');
    fundo.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }

  function fecharPainel() {
    if (!painel || !fundo) return;
    painel.classList.remove('aberto');
    fundo.classList.remove('aberto');
    document.body.style.overflow = '';
  }

  if (fab) fab.addEventListener('click', abrirPainel);
  if (fundo) fundo.addEventListener('click', fecharPainel);
  if (fechar) fechar.addEventListener('click', fecharPainel);

  // Capítulos no painel: abrem accordion de tópicos (igual à sidebar)
  if (painel) {
    painel.querySelectorAll('.nav-cap').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var li = this.closest('li');
        var itensCap = Array.from(painel.querySelectorAll('.nav-capitulos > li'));
        var jaAberto = li.classList.contains('aberto');
        itensCap.forEach(function (x) { x.classList.remove('aberto'); });
        if (!jaAberto) li.classList.add('aberto');
      });
    });

    // Tópicos no painel: navegar e fechar
    painel.querySelectorAll('.nav-topicos a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        fecharPainel();
        irPara(alvoDoTopico(this), e);
      });
    });
  }

  // ----------------- Animações no scroll -----------------
  var alvosAnima = document.querySelectorAll(
    '.topico, .bloco-grid, .par-imagens, .trio-imagens, ' +
    '.figura-largura-plena, .caixa, .dado, .citacao, ' +
    '.capitulo-abertura-hero, .capitulo-abertura-lado'
  );
  alvosAnima.forEach(function (el) { el.classList.add('anima'); });

  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visivel');
          observador.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    var limite = window.scrollY + window.innerHeight;
    alvosAnima.forEach(function (el) {
      var abs = el.getBoundingClientRect().top + window.scrollY;
      if (abs < limite) el.classList.add('visivel');
      else observador.observe(el);
    });
  } else {
    alvosAnima.forEach(function (el) { el.classList.add('visivel'); });
  }
})();
