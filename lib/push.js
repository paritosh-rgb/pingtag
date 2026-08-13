import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:hello@pingtag.local";

export function hasPushConfig() {
  return Boolean(publicKey && privateKey);
}

export function getPublicVapidKey() {
  return publicKey || "";
}

export async function sendPush(subscription, payload) {
  if (!hasPushConfig()) {
    return { delivered: false, reason: "VAPID keys are not configured." };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  await webpush.sendNotification(subscription, JSON.stringify(payload));
  return { delivered: true };
}
