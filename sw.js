/* Web Push receiver for UniMate, scoped to /UniMate/ on GitHub Pages. */
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "UniMate AI";
  const body = payload.body || payload.message || payload.text || "عندك تذكير جديد في UniMate.";
  const options = {
    body,
    data: { url: payload.url || self.registration.scope },
    tag: payload.tag || "unimate-reminder",
    renotify: false,
    requireInteraction: true,
    vibrate: [500, 250, 500, 250, 1000]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const scopeUrl = new URL(self.registration.scope);
    let targetUrl = new URL(event.notification.data?.url || scopeUrl.href, scopeUrl);
    if (targetUrl.origin !== scopeUrl.origin || !targetUrl.pathname.startsWith(scopeUrl.pathname)) {
      targetUrl = scopeUrl;
    }

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(scopeUrl.href) && "focus" in client) {
        await client.focus();
        if ("navigate" in client && client.url !== targetUrl.href) await client.navigate(targetUrl.href);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl.href);
  })());
});
