import webpush from "web-push";
import prisma from "../utils/prisma.js";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@bbrains.app";

let isConfigured = false;

function ensureWebPushConfigured() {
    if (isConfigured) return true;

    if (!vapidPublicKey || !vapidPrivateKey) {
        return false;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    isConfigured = true;
    return true;
}

async function deleteSubscription(endpoint) {
    if (!endpoint) return;

    try {
        await prisma.pushSubscription.delete({
            where: { endpoint },
        });
    } catch (error) {
        console.error("Failed to delete push subscription:", error);
    }
}

export async function sendPushNotification(
    userId,
    { title, body, icon = "/icon-192.png", badge = "/icon-192.png", url = "/chat", tag }
) {
    if (!userId || !title || !ensureWebPushConfigured()) {
        return;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
        select: {
            endpoint: true,
            p256dh: true,
            auth: true,
        },
    });

    if (subscriptions.length === 0) {
        return;
    }

    const payload = JSON.stringify({
        title,
        body,
        icon,
        badge,
        tag,
        data: { url },
    });

    await Promise.all(
        subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    },
                    payload
                );
            } catch (error) {
                const statusCode = error?.statusCode || error?.status;
                if (statusCode === 404 || statusCode === 410) {
                    await deleteSubscription(subscription.endpoint);
                    return;
                }

                console.error("Failed to send push notification:", error);
            }
        })
    );
}
