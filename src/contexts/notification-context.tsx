"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";

export interface Notification {
  id: string;
  userId: string;
  type:
    | "SYSTEM"
    | "EVENT"
    | "MEMBER"
    | "LIFE_GROUP"
    | "PATHWAY"
    | "ANNOUNCEMENT";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
  toggleMute: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notificationsMuted") === "true";
    }
    return false;
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastNotificationIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        if (data.notifications && data.notifications.length > 0) {
          const newestId = data.notifications[0].id;
          
          if (lastNotificationIdRef.current && lastNotificationIdRef.current !== newestId) {
            const storedMuted = localStorage.getItem("notificationsMuted") === "true";
            
            if (!storedMuted) {
              const newNotification = data.notifications[0];
              const toastEvent = new CustomEvent("showNotificationToast", {
                detail: {
                  id: newNotification.id,
                  title: newNotification.title,
                  message: newNotification.message,
                  type: newNotification.type,
                  link: newNotification.link,
                },
              });
              window.dispatchEvent(toastEvent);
            }
          }
          
          lastNotificationIdRef.current = newestId;
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user?.id]);

  const connectWebSocket = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;

      ws.send(
        JSON.stringify({
          type: "auth",
          userId: user.id,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "auth_success") {
          console.log("WebSocket authenticated");
          fetchNotifications();
        } else if (data.type === "notification") {
          console.log("Received notification via WebSocket:", data.data);
          setNotifications((prev) => [data.data, ...prev]);

          const storedMuted =
            localStorage.getItem("notificationsMuted") === "true";

          if (!storedMuted) {
            console.log("Dispatching toast event...");
            const toastEvent = new CustomEvent("showNotificationToast", {
              detail: {
                id: data.data.id,
                title: data.data.title,
                message: data.data.message,
                link: data.data.link,
              },
            });
            window.dispatchEvent(toastEvent);
            console.log("Toast event dispatched");
          } else {
            console.log("Notifications muted - toast not shown");
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setConnectionStatus("disconnected");
      wsRef.current = null;

      if (reconnectAttempts.current < 5) {
        setConnectionStatus("connecting");
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      } else {
        console.log("WebSocket reconnection failed, falling back to polling");
        startPolling();
      }
    };

    wsRef.current = ws;
  }, [user?.id, fetchNotifications]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    console.log("Starting notification polling (every 10 seconds)");
    setConnectionStatus("connected");
    
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 10000);
    
    fetchNotifications();
  }, [fetchNotifications]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
      console.log("Stopped notification polling");
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopPolling();
    };
  }, [user?.id, fetchNotifications, connectWebSocket, stopPolling]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("notificationsMuted", String(newValue));
      return newValue;
    });
  };

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        connectionStatus,
        isMuted,
        toggleMute,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetchNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
