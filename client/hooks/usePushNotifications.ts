"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { notificationApi } from "@/services/api/client"

type PermissionStateValue = NotificationPermission | "unsupported"

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
}

async function getExistingSubscription() {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    return registration.pushManager.getSubscription()
}

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [permissionState, setPermissionState] = useState<PermissionStateValue>(
        typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
    )

    const isSupported = useMemo(
        () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window,
        []
    )

    const syncSubscriptionState = useCallback(async () => {
        if (!isSupported) {
            setPermissionState("unsupported")
            setIsSubscribed(false)
            return
        }

        try {
            const subscription = await getExistingSubscription()
            setIsSubscribed(Boolean(subscription))
            setPermissionState(Notification.permission)
        } catch {
            setIsSubscribed(false)
        }
    }, [isSupported])

    useEffect(() => {
        void syncSubscriptionState()
    }, [syncSubscriptionState])

    const subscribe = useCallback(async () => {
        if (!isSupported) {
            return false
        }

        const publicKey = process.env.VAPID_PUBLIC_PUSH_KEY
        if (!publicKey) {
            throw new Error("Missing VAPID_PUBLIC_PUSH_KEY")
        }

        const permission = await Notification.requestPermission()
        setPermissionState(permission)

        if (permission !== "granted") {
            return false
        }

        const registration = await navigator.serviceWorker.register("/sw.jssw.js", { scope: "/" })
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        const response = await notificationApi.subscribePush(subscription.toJSON())
        if (!response.success) {
            throw new Error(response.message || "Failed to save push subscription")
        }

        setIsSubscribed(true)
        return true
    }, [isSupported])

    const unsubscribe = useCallback(async () => {
        if (!isSupported) {
            return false
        }

        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        const subscription = await registration.pushManager.getSubscription()
        if (!subscription) {
            setIsSubscribed(false)
            return true
        }

        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        const response = await notificationApi.unsubscribePush(endpoint)
        if (!response.success) {
            throw new Error(response.message || "Failed to remove push subscription")
        }

        setIsSubscribed(false)
        return true
    }, [isSupported])

    return {
        isSupported,
        isSubscribed,
        subscribe,
        unsubscribe,
        permissionState,
    }
}
