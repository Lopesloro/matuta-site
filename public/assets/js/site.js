(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* idade: lembra a resposta no aparelho */
  var idade = document.getElementById('idade');
  var ok = false;
  try { ok = localStorage.getItem('matuta-18') === 'sim'; } catch (e) {}
  if (idade && !ok) {
    idade.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    var b1 = idade.querySelector('[data-idade="sim"]');
    if (b1) b1.focus();
    idade.addEventListener('click', function (ev) {
      var r = ev.target.getAttribute('data-idade');
      if (r === 'sim') {
        try { localStorage.setItem('matuta-18', 'sim'); } catch (e) {}
        idade.classList.remove('on');
        document.documentElement.style.overflow = '';
      } else if (r === 'nao') {
        document.getElementById('idade-menor').style.display = 'block';
        idade.querySelector('.acoes').style.display = 'none';
      }
    });
  }

  /* header sólido depois de 80px */
  var h = document.getElementById('header');
  function hdr() { h.classList.toggle('solid', window.scrollY > 80); }
  addEventListener('scroll', hdr, { passive: true }); hdr();

  /* fecha o menu do celular ao escolher um item */
  var menu = document.querySelector('.menu-m');
  if (menu) menu.addEventListener('click', function (ev) { if (ev.target.tagName === 'A') menu.removeAttribute('open'); });

  /* reveal: uma vez, com rede de segurança para navegador de app (Instagram) */
  var revs = [].slice.call(document.querySelectorAll('.reveal'));
  function mostrarTudo() { revs.forEach(function (el) { el.classList.add('in'); }); }
  if (reduz || !('IntersectionObserver' in window)) { mostrarTudo(); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.18 });
    revs.forEach(function (el) { io.observe(el); });
    setTimeout(mostrarTudo, 3000);
  }

  /* vídeos: o da abertura já carrega; os outros só perto da tela, e pausam fora dela */
  var hero = document.querySelector('.hero video');
  if (hero && reduz) { hero.removeAttribute('autoplay'); hero.pause(); }
  var vids = [].slice.call(document.querySelectorAll('video[data-lazy]'));
  function carregar(v) {
    if (v.dataset.ok) return;
    [].forEach.call(v.querySelectorAll('source[data-src]'), function (s) { s.src = s.dataset.src; });
    v.load(); v.dataset.ok = '1';
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { carregar(v); if (!reduz) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
        else if (v.dataset.ok) { v.pause(); }
      });
    }, { rootMargin: '300px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* carta: filtros e setas */
  var vit = document.getElementById('vitrine');
  var filtros = [].slice.call(document.querySelectorAll('[data-filtro]'));
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filtro;
      filtros.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      [].forEach.call(vit.querySelectorAll('.rotulo'), function (r) { r.hidden = !(f === 'todas' || r.dataset.grupo === f); });
      vit.scrollTo({ left: 0, behavior: reduz ? 'auto' : 'smooth' });
    });
  });
  function passo() { var r = vit.querySelector('.rotulo:not([hidden])'); return r ? r.getBoundingClientRect().width + 28 : 320; }
  var pv = document.querySelector('.vit-btn.prev'), nx = document.querySelector('.vit-btn.next');
  if (pv) pv.addEventListener('click', function () { vit.scrollBy({ left: -passo(), behavior: reduz ? 'auto' : 'smooth' }); });
  if (nx) nx.addEventListener('click', function () { vit.scrollBy({ left: passo(), behavior: reduz ? 'auto' : 'smooth' }); });

  /* fichas: sem JS abrem por âncora (:target); com JS, por classe */
  var ultimo = null, aberta = null;
  function abrirFicha(f, origem) {
    if (!f) return;
    fecharFicha();
    aberta = f; ultimo = origem || null;
    f.classList.add('aberta');
    document.documentElement.style.overflow = 'hidden';
    var c = f.querySelector('.fechar'); if (c) c.focus({ preventScroll: true });
  }
  function fecharFicha() {
    if (!aberta) return;
    aberta.classList.remove('aberta'); aberta = null;
    document.documentElement.style.overflow = '';
    if (ultimo) { ultimo.focus({ preventScroll: true }); ultimo = null; }
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a.rotulo');
    if (a) { ev.preventDefault(); abrirFicha(document.getElementById(a.getAttribute('href').slice(1)), a); return; }
    if (aberta && ev.target === aberta) fecharFicha();
  });
  [].forEach.call(document.querySelectorAll('.ficha .fechar'), function (c) {
    c.addEventListener('click', function (ev) { ev.preventDefault(); fecharFicha(); });
  });
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { fecharPlayer(); fecharFicha(); } });
  if (location.hash.indexOf('#ficha-') === 0) abrirFicha(document.getElementById(location.hash.slice(1)));

  /* YouTube: documentário toca no lugar; receitas abrem num player sobreposto */
  function iframe(id) {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = 'Vídeo da Cachaça Matuta no YouTube';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    return f;
  }
  var player = null;
  function fecharPlayer() { if (player) { player.remove(); player = null; document.documentElement.style.overflow = ''; } }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-yt]');
    if (!a) return;
    ev.preventDefault();
    var id = a.dataset.yt;
    if (a.hasAttribute('data-inline')) {
      a.innerHTML = ''; a.appendChild(iframe(id)); a.removeAttribute('href');
      return;
    }
    fecharPlayer();
    player = document.createElement('div');
    player.className = 'ficha aberta';
    player.setAttribute('role', 'dialog'); player.setAttribute('aria-modal', 'true'); player.setAttribute('aria-label', 'Vídeo da receita');
    player.innerHTML = '<div class="ficha-box" style="display:block;max-width:1100px;background:#000"><button class="fechar" type="button">Fechar</button><div class="doc" style="margin:0"></div></div>';
    player.querySelector('.doc').appendChild(iframe(id));
    player.addEventListener('click', function (e) { if (e.target === player || e.target.classList.contains('fechar')) fecharPlayer(); });
    document.body.appendChild(player);
    document.documentElement.style.overflow = 'hidden';
    player.querySelector('.fechar').focus();
  });

  /* onde comprar */
  var uf = document.getElementById('uf'), res = document.getElementById('resultado');
  var lista = window.REPRESENTANTES || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fone(n) { n = String(n).replace(/\D/g, ''); return n.length === 11 ? '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7) : n.length === 10 ? '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6) : n; }
  if (uf) uf.addEventListener('change', function () {
    var v = uf.value, nome = uf.options[uf.selectedIndex].text;
    if (!v) { res.innerHTML = ''; return; }
    var reps = lista[v] || [];
    if (reps.length) {
      res.innerHTML = reps.map(function (r) {
        return '<h3>' + esc(r.nome) + '</h3><p>' + esc(r.cidade || '') + '</p><div class="acoes">' +
          (r.telefone ? '<a class="pill" href="tel:+55' + esc(String(r.telefone).replace(/\D/g, '')) + '">' + fone(r.telefone) + '</a>' : '') +
          (r.email ? '<a class="pill" href="mailto:' + esc(r.email) + '">Escrever</a>' : '') + '</div>';
      }).join('');
    } else {
      var assunto = encodeURIComponent('Onde comprar Matuta em ' + nome);
      var corpo = encodeURIComponent('Olá! Moro em ____ (' + v + ') e quero saber onde encontrar a Matuta.');
      res.innerHTML = '<h3>' + esc(nome) + '</h3><p>A lista de distribuidores de ' + esc(nome) + ' está sendo atualizada. Fale com o atendimento da Matuta e diga a sua cidade: a equipe indica quem atende você.</p>' +
        '<div class="acoes"><a class="pill" href="tel:+558330660228">(83) 3066-0228</a><a class="pill" href="mailto:atendimento@matuta.com.br?subject=' + assunto + '&amp;body=' + corpo + '">Mandar e-mail</a></div>';
    }
  });
})();
