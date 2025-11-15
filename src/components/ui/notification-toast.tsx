"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  link?: string;
  isExiting?: boolean;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  useEffect(() => {
    console.log("NotificationToast component mounted");

    const handleNewNotification = (event: CustomEvent<NotificationToast>) => {
      console.log("Toast event received:", event.detail);
      const toast = event.detail;
      setToasts((prev) => {
        console.log("Adding toast, current count:", prev.length);
        return [...prev, toast];
      });

      setTimeout(() => {
        console.log("Starting exit animation for toast:", toast.id);
        setToasts((prev) =>
          prev.map((t) => (t.id === toast.id ? { ...t, isExiting: true } : t))
        );
      }, 4500);

      setTimeout(() => {
        console.log("Removing toast:", toast.id);
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    window.addEventListener(
      "showNotificationToast",
      handleNewNotification as EventListener
    );

    return () => {
      console.log("NotificationToast component unmounting");
      window.removeEventListener(
        "showNotificationToast",
        handleNewNotification as EventListener
      );
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 500);
  };

  console.log("Current toasts count:", toasts.length);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[320px] max-w-[420px] transition-all duration-500 ${
            toast.isExiting
              ? "animate-out slide-out-to-right-full"
              : "animate-in slide-in-from-top-5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {toast.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => dismissToast(toast.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {toast.message}
              </p>
              {toast.link && (
                <a
                  href={toast.link}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View details →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function showNotificationToast(
  title: string,
  message: string,
  link?: string
) {
  const event = new CustomEvent("showNotificationToast", {
    detail: {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      link,
    },
  });
  window.dispatchEvent(event);
}
