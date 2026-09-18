// Service worker de la PWA "Panorama de Mercado".
// Estrategia: primero red, y si no hay señal se muestra la ultima edicion
// guardada. La pagina cambia una vez por dia, asi que nunca conviene servir
// la copia vieja cuando hay red disponible.
const CACHE = "mercado-v1";
const PAGINA = "/mercado/";

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.add(PAGINA)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);
  // solo nos ocupamos de la pagina y sus archivos; las fuentes de Google y
  // los links a las noticias van directo a la red
  if (url.origin !== self.location.origin || !url.pathname.startsWith(PAGINA)) return;

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((c) => c.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request).then((r) => r || caches.match(PAGINA)))
  );
});
