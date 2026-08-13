self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "ParkPing alert";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "Someone is trying to reach you about your car.",
      data: { url: data.url || "/" },
      icon: "/icon.svg",
      badge: "/icon.svg",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
