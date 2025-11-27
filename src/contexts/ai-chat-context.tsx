"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";

interface AIChatContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aiChatVisible");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/user/ai-chat-settings", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsVisible(data.aiChatVisible);
          localStorage.setItem(
            "aiChatVisible",
            JSON.stringify(data.aiChatVisible)
          );
        }
      } catch (error) {
        console.error("Failed to fetch AI chat settings:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchSettings();
  }, [user?.id]);

  useEffect(() => {
    const updateSettings = async () => {
      if (!isInitialized || !user?.id) return;

      try {
        await fetch("/api/user/ai-chat-settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ aiChatVisible: isVisible }),
        });

        localStorage.setItem("aiChatVisible", JSON.stringify(isVisible));
      } catch (error) {
        console.error("Failed to update AI chat settings:", error);
      }
    };

    updateSettings();
  }, [isVisible, user?.id, isInitialized]);

  const toggleVisibility = () => {
    setIsVisible((prev: boolean) => !prev);
  };

  return (
    <AIChatContext.Provider value={{ isVisible, toggleVisibility }}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
}
