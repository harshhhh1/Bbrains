"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { notificationApi } from "@/services/api/client";
import AchievementUnlocked from "@/components/achievement";

const NotificationContext = createContext(undefined);

function emptyUnreadState() {
  return {
    count: 0,
    total: 0,
    byChannel: {},
  };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadState, setChatUnreadState] = useState(emptyUnreadState);
  const [assignmentUnreadCount, setAssignmentUnreadCount] = useState(0);
  const [productUnreadCount, setProductUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [levelUpToast, setLevelUpToast] = useState(null);
  const processedNotifications = useRef(new Set());
  const chatUnreadStateRef = useRef(chatUnreadState);
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    chatUnreadStateRef.current = chatUnreadState;
  }, [chatUnreadState]);

  const refreshUnreadCounts = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    try {
      refreshInFlightRef.current = true;
      const unreadResponse = await notificationApi.getUnreadCount();
      if (unreadResponse.success && unreadResponse.data) {
        setChatUnreadState(unreadResponse.data);
      }
    } catch {
      // Keep current state if polling fails.
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);

      if (notificationsResponse.success && notificationsResponse.data) {
        const newNotifications = notificationsResponse.data.notifications;
        // Detect level-up in unread notifications
        const levelUpNotif = newNotifications.find(
          (n) =>
            !n.read &&
            n.title === "Level Up!" &&
            !processedNotifications.current.has(n.id),
        );

        if (levelUpNotif) {
          setLevelUpToast({
            title: levelUpNotif.title,
            description: levelUpNotif.message || "You reached a new level!",
          });
          processedNotifications.current.add(levelUpNotif.id);
        }

        // Compute specific counts
        const unreadNotifs = newNotifications.filter((n) => !n.read);
        const assignments = unreadNotifs.filter((n) =>
          ["submission", "grade", "assignment"].includes(n.type),
        ).length;
        const products = unreadNotifs.filter((n) =>
          ["approval", "rejection", "product", "market"].includes(n.type),
        ).length;

        setNotifications(newNotifications);
        setUnreadCount(notificationsResponse.data.unreadCount);
        setAssignmentUnreadCount(assignments);
        setProductUnreadCount(products);
      }

      if (unreadResponse.success && unreadResponse.data) {
        setChatUnreadState(unreadResponse.data);
      }
    } catch {
      // Silently handle network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 10000);

    const handleWindowFocus = () => {
      void fetchNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const markRead = useCallback(
    async (id) => {
      try {
        const response = await notificationApi.markRead(id);
        if (!response.success) {
          return;
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                  readAt: new Date().toISOString(),
                }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        void refreshUnreadCounts();
      } catch {
        // Silently handle network errors
      }
    },
    [refreshUnreadCounts],
  );

  const markAllRead = useCallback(async () => {
    try {
      const response = await notificationApi.markAllRead();
      if (!response.success) {
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
      setChatUnreadState(emptyUnreadState());
    } catch {
      // Silently handle network errors
    }
  }, []);

  const markChannelRead = useCallback(
    async (channelId) => {
      try {
        const response = await notificationApi.markChannelRead(channelId);
        if (!response.success) {
          return;
        }

        const removedUnread =
          chatUnreadStateRef.current.byChannel[channelId] || 0;
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.channelId === channelId &&
            ["mention", "reply"].includes(notification.type)
              ? { ...notification, read: true, readAt: now }
              : notification,
          ),
        );

        setChatUnreadState((prev) => {
          const nextByChannel = { ...prev.byChannel };
          const removed = nextByChannel[channelId] || 0;
          delete nextByChannel[channelId];

          return {
            count: prev.count,
            total: Math.max(0, prev.total - removed),
            byChannel: nextByChannel,
          };
        });
        setUnreadCount((prev) => Math.max(0, prev - removedUnread));

        void refreshUnreadCounts();
      } catch {
        // Silently handle network errors
      }
    },
    [refreshUnreadCounts],
  );

  const registerIncomingChatNotification = useCallback((channelId, type) => {
    setChatUnreadState((prev) => ({
      count: prev.count,
      total: prev.total + 1,
      byChannel: {
        ...prev.byChannel,
        [channelId]: (prev.byChannel[channelId] || 0) + 1,
      },
    }));

    setUnreadCount((prev) => prev + 1);

    setNotifications((prev) => [
      {
        id: Date.now(),
        userId: "",
        title:
          type === "mention" ? "You were mentioned" : "Someone replied to you",
        type,
        channelId,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const registerIncomingAssignmentNotification = useCallback(
    (assignmentId, type) => {
      setAssignmentUnreadCount((prev) => prev + 1);
      setUnreadCount((prev) => prev + 1);

      setNotifications((prev) => [
        {
          id: Date.now(),
          userId: "",
          title:
            type === "submission"
              ? "New Assignment Submission"
              : "Assignment Graded",
          message:
            type === "submission"
              ? "A student has submitted an assignment for review"
              : "Your assignment has been graded",
          type,
          relatedId: String(assignmentId),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const registerIncomingProductNotification = useCallback((productId, type) => {
    setProductUnreadCount((prev) => prev + 1);
    setUnreadCount((prev) => prev + 1);

    setNotifications((prev) => [
      {
        id: Date.now(),
        userId: "",
        title: type === "approval" ? "Product Approved" : "Product Rejected",
        message:
          type === "approval"
            ? "Your product has been approved and is now live on the market"
            : "Your product has been rejected. Check the reason in your products page",
        type,
        relatedId: String(productId),
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const markAssignmentRead = useCallback(async (assignmentId) => {
    setAssignmentUnreadCount((prev) => Math.max(0, prev - 1));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    setNotifications((prev) =>
      prev.map((n) =>
        n.relatedId === assignmentId &&
        (n.type === "submission" || n.type === "grade")
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n,
      ),
    );
  }, []);

  const markProductRead = useCallback(async (productId) => {
    setProductUnreadCount((prev) => Math.max(0, prev - 1));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    setNotifications((prev) =>
      prev.map((n) =>
        n.relatedId === productId &&
        (n.type === "approval" || n.type === "rejection")
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      chatUnreadTotal: chatUnreadState.total,
      chatUnreadByChannel: chatUnreadState.byChannel,
      assignmentUnreadTotal: assignmentUnreadCount,
      productUnreadTotal: productUnreadCount,
      loading,
      fetchNotifications,
      refreshUnreadCounts,
      markRead,
      markAllRead,
      markChannelRead,
      registerIncomingChatNotification,
      registerIncomingAssignmentNotification,
      registerIncomingProductNotification,
      markAssignmentRead,
      markProductRead,
    }),
    [
      notifications,
      unreadCount,
      chatUnreadState,
      assignmentUnreadCount,
      productUnreadCount,
      loading,
      fetchNotifications,
      refreshUnreadCounts,
      markRead,
      markAllRead,
      markChannelRead,
      registerIncomingChatNotification,
      registerIncomingAssignmentNotification,
      registerIncomingProductNotification,
      markAssignmentRead,
      markProductRead,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {levelUpToast && (
        <AchievementUnlocked
          title={levelUpToast.title}
          description={levelUpToast.description}
          onClose={() => setLevelUpToast(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
