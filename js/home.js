/* ================================================================
   PLATAFORMA — Carrosséis e interações da home
================================================================ */

(function () {
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
