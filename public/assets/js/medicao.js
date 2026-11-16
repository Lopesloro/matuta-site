/*
  Medição do site da Cachaça Matuta.
  Os IDs abaixo são os que o site atual (Wix) já usa, lidos na rede em 15/11/2026.
  ativo: false na demonstração, para o tráfego de teste não entrar nos relatórios da Matuta.
  Ligar (ativo: true) só quando o site estiver no domínio matuta.com.br.

  Teste sem enviar nada: abra a página com ?medicao=teste. Os eventos ficam em window.__eventos
  e aparecem no console.
*/
window.MEDICAO = {
  ativo: false,
  metaPixel: '1961763057213007',
  ga4: 'G-S8LQNDCYRV',
  googleAds: 'AW-16570875956',
  clarity: 'mdlps2zoqv'
};

(function () {
  'use strict';
  var cfg = window.MEDICAO;
  var teste = /[?&]medicao=teste\b/.test(location.search);
  window.__eventos = [];

  if (cfg.ativo && !teste) {
    /* Meta Pixel */
    if (cfg.metaPixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', cfg.metaPixel);
      window.fbq('track', 'PageView');
    }
    /* Google: GA4 e Google Ads na mesma tag */
    if (cfg.ga4 || cfg.googleAds) {
      var g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + (cfg.ga4 || cfg.googleAds);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      if (cfg.ga4) window.gtag('config', cfg.ga4);
      if (cfg.googleAds) window.gtag('config', cfg.googleAds);
    }
    /* Microsoft Clarity */
    if (cfg.clarity) {
      (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', cfg.clarity);
    }
  }

  /* Cada ação do site vira um evento padrão em cada ferramenta */
  var mapa = {
    ver_rotulo: function (d) { return { meta: ['track', 'ViewContent', { content_name: d.nome, content_category: d.linha, content_type: 'product' }], google: ['view_item', { items: [{ item_name: d.nome, item_category: d.linha }] }] }; },
    contato: function (d) { return { meta: ['track', 'Contact', { method: d.canal }], google: ['generate_lead', { method: d.canal }] }; },
    buscar_estado: function (d) { return { meta: ['track', 'FindLocation', { region: d.uf }], google: ['search', { search_term: 'representante ' + d.uf }] }; },
    ver_video: function (d) { return { meta: ['trackCustom', 'AssistiuVideo', { video: d.titulo }], google: ['video_start', { video_title: d.titulo }] }; },
    maioridade: function () { return { google: ['age_gate_ok', {}] }; }
  };

  window.rastrear = function (nome, dados) {
    var m = mapa[nome]; if (!m) return;
    var ev = m(dados || {});
    window.__eventos.push({ nome: nome, dados: dados || {}, meta: ev.meta || null, google: ev.google || null });
    if (teste) { if (window.console) console.info('[medição]', nome, ev); return; }
    if (!cfg.ativo) return;
    if (ev.meta && window.fbq) window.fbq(ev.meta[0], ev.meta[1], ev.meta[2]);
    if (ev.google && window.gtag) window.gtag('event', ev.google[0], ev.google[1]);
  };
})();
