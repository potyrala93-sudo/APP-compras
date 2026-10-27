/* Service worker: deixa o app abrir e funcionar sem internet */
const VERSAO = 'compras-v7';
const ARQUIVOS = [
  './', 'index.html', 'styles.css', 'config.js', 'js/store.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
];
const CDNS = ['cdn.jsdelivr.net', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  // 'reload': pega os arquivos direto do servidor, nunca uma cópia antiga guardada pelo navegador
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function comTempo(promessa, ms) {
  return new Promise((ok, falha) => { const t = setTimeout(() => falha(new Error('timeout')), ms); promessa.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); falha(e); }); });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Bibliotecas e fontes: usa o que já está guardado
  if (CDNS.includes(url.hostname)) {
    e.respondWith(caches.open(VERSAO).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') c.put(req, r.clone());
      return r;
    }));
    return;
  }

  // Arquivos do próprio app: sempre confere no servidor se há versão nova; sem internet, usa a guardada
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(VERSAO);
      try {
        const r = await comTempo(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), 4000);
        if (r.ok) c.put(req, r.clone());
        return r;
      } catch (_) {
        return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
      }
    })());
  }
  // Chamadas ao Supabase passam direto (o app guarda os dados no aparelho)
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const pedido = e.notification.data && e.notification.data.pedido;
  e.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (janelas.length) {
      const w = janelas[0];
      await w.focus();
      if (pedido) w.postMessage({ abrir: '#/status?id=' + pedido });
      return;
    }
    return self.clients.openWindow('./' + (pedido ? '#/status?id=' + pedido : ''));
  })());
});
