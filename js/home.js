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
  // --- Símbolo de informações nos cards: abre a ficha, e o resto do card abre a apostila ---
  document.querySelectorAll('a.card-plat, a.card-poster').forEach(function (card) {
    var slug = (card.getAttribute('href').match(/estudos\/([^/]+)\//) || [])[1];
    var capa = card.querySelector('.card-plat-thumb, .card-poster-thumb');
    if (!slug || !capa || !document.getElementById('ficha-' + slug)) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'card-info';
    b.dataset.ficha = 'ficha-' + slug;
    b.setAttribute('aria-label', 'Mais informações sobre ' + card.querySelector('.card-plat-titulo').textContent);
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
    capa.appendChild(b);
  });

  // --- Progresso de leitura: barra nos cards e fileira "Continuar lendo" ---
  var leitura = {};
  try { leitura = JSON.parse(localStorage.getItem('kosmopolis-leitura')) || {}; } catch (e) {}

  document.querySelectorAll('a.card-plat, a.card-poster').forEach(function (card) {
    var slug = (card.getAttribute('href').match(/estudos\/([^/]+)\//) || [])[1];
    var capa = card.querySelector('.card-plat-thumb, .card-poster-thumb');
    if (!leitura[slug] || !capa) return;
    var barra = document.createElement('span');
    barra.className = 'card-progresso';
    barra.style.setProperty('--lido', leitura[slug].pct + '%');
    capa.appendChild(barra);
  });

  var continuar = document.getElementById('continuar');
  var emCurso = Object.keys(leitura).filter(function (slug) {
    return leitura[slug].pct < 95;
  }).sort(function (a, b) {
    return leitura[b].data - leitura[a].data;
  });

  emCurso.forEach(function (slug) {
    [['horizontal', 'card-plat'], ['vertical', 'card-poster']].forEach(function (forma) {
      var origem = document.querySelector('.fileira-' + forma[0] + ' a.' + forma[1] + '[href="estudos/' + slug + '/index.html"]');
      if (!origem) return;
      var card = origem.cloneNode(true);
      var minutos = parseInt((origem.textContent.match(/(\d+) min/) || [])[1], 10);
      var falta = Math.max(1, Math.ceil(minutos * (100 - leitura[slug].pct) / 100));
      card.setAttribute('href', origem.getAttribute('href') + (leitura[slug].ancora ? '#' + leitura[slug].ancora : ''));
      card.querySelector('.card-plat-sub').textContent = leitura[slug].pct + '% lido · ' + (minutos ? 'faltam ' + falta + ' min' : '');
      continuar.querySelector('.fileira-' + forma[0] + ' .carrossel-trilho').appendChild(card);
      continuar.hidden = false;
    });
  });

  // --- Selo "Novo": só na apostila mais recente, a primeira de "Publicadas recentemente" ---
  var maisNova = document.querySelector('#apostilas a.card-plat');
  if (maisNova) {
    document.querySelectorAll('section:not(#continuar) a[href="' + maisNova.getAttribute('href') + '"]').forEach(function (card) {
      var capa = card.querySelector('.card-plat-thumb, .card-poster-thumb');
      if (!capa) return;
      var selo = document.createElement('span');
      selo.className = 'card-novo';
      selo.textContent = 'Novo';
      capa.appendChild(selo);
    });
  }

  // --- Busca: o índice sai dos cards e das fichas, então apostila nova entra sozinha ---
  var buscaJanela = document.querySelector('.busca-janela');

  if (buscaJanela) {
    var buscaCampo = buscaJanela.querySelector('.busca-campo');
    var buscaAviso = buscaJanela.querySelector('.busca-aviso');
    var buscaLista = buscaJanela.querySelector('.busca-resultados');

    var normalizar = function (s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Termo curto só vale no começo da palavra: "ur" acha Ur e Uruk, não "cultura"
    var contem = function (texto, termo) {
      if (termo.length > 3) return texto.indexOf(termo) >= 0;
      return (' ' + texto.replace(/[^a-z0-9]+/g, ' ')).indexOf(' ' + termo) >= 0;
    };

    var separarPalavras = function (s) {
      return s.split(/[^a-z0-9]+/).filter(function (p) { return p.length >= 3; });
    };

    // Conta letras trocadas, faltando, sobrando ou de lugar invertido entre duas palavras
    var distancia = function (a, b) {
      var linhas = [];
      for (var i = 0; i <= a.length; i++) {
        linhas[i] = [i];
        for (var j = 1; j <= b.length; j++) {
          if (i === 0) { linhas[0][j] = j; continue; }
          var custo = a[i - 1] === b[j - 1] ? 0 : 1;
          linhas[i][j] = Math.min(linhas[i - 1][j] + 1, linhas[i][j - 1] + 1, linhas[i - 1][j - 1] + custo);
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            linhas[i][j] = Math.min(linhas[i][j], linhas[i - 2][j - 2] + 1);
          }
        }
      }
      return linhas[a.length][b.length];
    };

    // Palavra curta tolera menos erro, senão quase tudo pareceria igual
    var erroAceito = function (termo) {
      if (termo.length < 4) return 0;
      return termo.length === 4 ? 1 : 2;
    };

    var menorErro = function (termo, palavras) {
      var limite = erroAceito(termo);
      var menor = Infinity;
      if (!limite) return menor;
      palavras.forEach(function (p) {
        var d = distancia(termo, p);
        if (p.length > termo.length) d = Math.min(d, distancia(termo, p.slice(0, termo.length)));
        if (d <= limite && d < menor) menor = d;
      });
      return menor;
    };

    var erroTotal = function (termos, texto, palavras) {
      return termos.reduce(function (soma, t) {
        return soma + (contem(texto, t) ? 0 : menorErro(t, palavras));
      }, 0);
    };

    var indice = [];
    var vistos = {};
    document.querySelectorAll('section.carrossel:not(#continuar) .fileira-horizontal .carrossel-trilho > *').forEach(function (card) {
      var titulo = card.querySelector('.card-plat-titulo').textContent;
      if (vistos[titulo]) return;
      vistos[titulo] = true;
      var href = card.getAttribute('href');
      var slug = href ? href.split('/')[1] : '';
      var ficha = document.getElementById('ficha-' + slug);
      var img = card.querySelector('img');
      var selo = card.querySelector('.badge');
      var fileira = card.closest('section').querySelector('h2').textContent;
      var tipo = card.querySelector('.card-plat-sub').textContent.split(' · ')[0];
      var capitulos = ficha ? Array.from(ficha.querySelectorAll('.ficha-capitulos a')).map(function (a) {
        var nome = normalizar(a.textContent);
        return { nome: a.textContent, href: a.getAttribute('href'), busca: nome, palavras: separarPalavras(nome) };
      }) : [];
      var textoBusca = normalizar([titulo, tipo, fileira, selo ? selo.textContent : '', ficha ? ficha.querySelector('.ficha-resumo').textContent : ''].join(' ') + ' ' + capitulos.map(function (c) { return c.nome; }).join(' '));
      indice.push({
        titulo: titulo,
        tipo: tipo,
        fileira: fileira,
        href: href,
        capa: img ? img.getAttribute('src') : '',
        capitulos: capitulos,
        tituloBusca: normalizar(titulo),
        tituloPalavras: separarPalavras(normalizar(titulo)),
        busca: textoBusca,
        palavras: separarPalavras(textoBusca)
      });
    });

    var mostrarResultado = function (item, capitulo) {
      var linha = document.createElement(item.href ? 'a' : 'div');
      linha.className = 'busca-item' + (item.href ? '' : ' busca-item--breve');
      if (item.href) linha.href = capitulo ? capitulo.href : item.href;
      var capa = document.createElement('span');
      capa.className = 'busca-capa';
      if (item.capa) {
        var img = document.createElement('img');
        img.src = item.capa;
        img.alt = '';
        capa.appendChild(img);
      }
      var texto = document.createElement('span');
      texto.className = 'busca-texto';
      var titulo = document.createElement('span');
      titulo.className = 'busca-titulo';
      titulo.textContent = item.titulo;
      var info = document.createElement('span');
      info.className = 'busca-info';
      info.textContent = item.href ? item.tipo + (capitulo ? ' · Capítulo: ' + capitulo.nome : '') : 'Em breve · ' + item.fileira;
      texto.appendChild(titulo);
      texto.appendChild(info);
      linha.appendChild(capa);
      linha.appendChild(texto);
      buscaLista.appendChild(linha);
    };

    var buscar = function () {
      var consulta = buscaCampo.value.trim();
      var termos = normalizar(consulta).split(/\s+/).filter(Boolean);
      buscaLista.textContent = '';

      if (!termos.length) {
        buscaAviso.textContent = 'Apostilas publicadas';
        indice.filter(function (i) { return i.href; }).forEach(function (i) { mostrarResultado(i); });
        return;
      }

      var achados = indice.filter(function (i) {
        return termos.every(function (t) { return contem(i.busca, t); });
      }).map(function (i) {
        var capitulo = i.capitulos.filter(function (c) {
          return termos.every(function (t) { return contem(c.busca, t); });
        })[0];
        var noTitulo = termos.every(function (t) { return contem(i.tituloBusca, t); });
        return { item: i, capitulo: capitulo, nota: (noTitulo ? 4 : 0) + (i.href ? 2 : 0) + (capitulo ? 1 : 0) };
      });

      // Só procura parecidos quando a palavra exata não achou nada
      var aproximada = !achados.length;
      if (aproximada) {
        // "de", "do" e parecidos não ajudam a achar nada
        var principais = termos.filter(function (t) { return t.length > 2; });
        achados = !principais.length ? [] : indice.map(function (i) {
          var capitulo = i.capitulos.filter(function (c) {
            return erroTotal(principais, c.busca, c.palavras) < Infinity;
          })[0];
          var noTitulo = erroTotal(principais, i.tituloBusca, i.tituloPalavras) < Infinity;
          return { item: i, capitulo: capitulo, erro: erroTotal(principais, i.busca, i.palavras), nota: (noTitulo ? 4 : 0) + (i.href ? 2 : 0) + (capitulo ? 1 : 0) };
        }).filter(function (a) { return a.erro < Infinity; });

        // Fica só com os mais parecidos, para não trazer coincidências
        var menor = Math.min.apply(null, achados.map(function (a) { return a.erro; }));
        achados = achados.filter(function (a) { return a.erro === menor; });
      }

      achados.sort(function (a, b) { return (a.erro || 0) - (b.erro || 0) || b.nota - a.nota; });

      if (!achados.length) {
        buscaAviso.textContent = 'Nada encontrado para "' + consulta + '". Tente outro tema.';
      } else if (aproximada) {
        buscaAviso.textContent = 'Resultados parecidos com "' + consulta + '"';
      } else {
        buscaAviso.textContent = achados.length + (achados.length > 1 ? ' resultados' : ' resultado');
      }
      achados.slice(0, 12).forEach(function (a) { mostrarResultado(a.item, a.capitulo); });
    };

    document.querySelector('.busca-botao').addEventListener('click', function () {
      buscaCampo.value = '';
      buscar();
      buscaJanela.showModal();
      buscaCampo.focus();
    });
    buscaCampo.addEventListener('input', buscar);
    buscaJanela.querySelector('.busca-fechar').addEventListener('click', function () { buscaJanela.close(); });
    buscaJanela.addEventListener('click', function (e) {
      if (e.target === buscaJanela) buscaJanela.close();
    });
    buscaJanela.querySelector('.busca-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var primeiro = buscaLista.querySelector('a.busca-item');
      if (primeiro) primeiro.click();
    });
  }

  // --- Fileira de apostilas: gira para os dois lados, sem fim ---
  document.querySelectorAll('.fileira-horizontal, .fileira-vertical').forEach(function (wrap) {
    var trilho = wrap.querySelector('.carrossel-trilho');
    var cards = Array.from(trilho.children);
    if (cards.length < 4) return;

    function copiar(card) {
      var c = card.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('tabindex', '-1');
      c.querySelectorAll('button').forEach(function (b) { b.tabIndex = -1; });
      return c;
    }

    // Duas cópias de cada lado dão folga para um arrasto longo no celular
    for (var i = 0; i < 2; i++) {
      var antes = document.createDocumentFragment();
      cards.forEach(function (card) {
        antes.appendChild(copiar(card));
        trilho.appendChild(copiar(card));
      });
      trilho.insertBefore(antes, trilho.firstChild);
    }
    trilho.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; });
    wrap.classList.add('giro');

    var vertical = wrap.classList.contains('fileira-vertical');
    var periodo = 0;
    var casa = 0;
    var largura = 0;

    function esquerda(el) { return el.getBoundingClientRect().left; }

    // Horizontal: primeiro card junto da margem. Vertical: segundo card no centro.
    function centralizar() {
      var alvo = vertical ? cards[1] : cards[0];
      var ajuste = vertical
        ? (alvo.offsetWidth - trilho.clientWidth) / 2
        : -parseFloat(getComputedStyle(trilho).scrollPaddingLeft);
      periodo = esquerda(cards[cards.length - 1].nextElementSibling) - esquerda(cards[0]);
      casa = trilho.scrollLeft + esquerda(alvo) - esquerda(trilho) + ajuste;
      trilho.scrollLeft = casa;
    }

    // Parado longe do meio, volta um período inteiro: a tela não muda
    var espera;
    trilho.addEventListener('scroll', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        var voltas = periodo ? Math.round((trilho.scrollLeft - casa) / periodo) : 0;
        if (voltas) trilho.scrollLeft -= voltas * periodo;
      }, 140);
    }, { passive: true });

    function seta(lado, rotulo, desenho, sentido) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fileira-seta fileira-seta--' + lado;
      b.setAttribute('aria-label', rotulo);
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + desenho + '"/></svg>';
      b.addEventListener('click', function () {
        var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        trilho.scrollBy({ left: sentido * (esquerda(cards[1]) - esquerda(cards[0])), behavior: calmo ? 'auto' : 'smooth' });
      });
      wrap.appendChild(b);
    }
    seta('esq', 'Card anterior', 'm15 18-6-6 6-6', -1);
    seta('dir', 'Próximo card', 'm9 18 6-6-6-6', 1);

    // Só uma das fileiras aparece; ela se ajusta ao surgir e quando a largura muda
    function ajustar() {
      var w = trilho.clientWidth;
      if (w && w !== largura) { largura = w; centralizar(); }
    }
    ajustar();
    new ResizeObserver(ajustar).observe(trilho);
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
    var travas = { mouse: false, foco: false, ficha: false };

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
      hero.classList.toggle('pausado', travas.mouse || travas.foco || travas.ficha);
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

    // Delegado porque os slides das pontas e os cards das fileiras têm cópias
    document.addEventListener('click', function (e) {
      var botao = e.target.closest('[data-ficha]');
      var ficha = botao && document.getElementById(botao.dataset.ficha);
      if (!ficha) return;
      e.preventDefault();
      travas.ficha = true;
      pausar();
      ficha.showModal();
    });

    document.querySelectorAll('.ficha').forEach(function (ficha) {
      ficha.querySelector('.ficha-fechar').addEventListener('click', function () { ficha.close(); });
      ficha.addEventListener('click', function (e) {
        if (e.target === ficha) ficha.close();
      });
      ficha.addEventListener('close', function () {
        travas.ficha = false;
        pausar();
      });
    });

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
      if (document.querySelector('dialog[open]')) return;
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
