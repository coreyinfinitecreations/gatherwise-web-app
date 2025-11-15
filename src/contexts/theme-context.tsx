"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    setMounted(true);

    if (isLoginPage) {
      setTheme("light");
      return;
    }

    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
    }
  }, [isLoginPage]);

  useEffect(() => {
    if (!mounted || !user) return;

    const fetchUserTheme = async () => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.themePreference) {
            setTheme(data.user.themePreference as Theme);
            localStorage.setItem("theme", data.user.themePreference);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user theme preference:", error);
      }
    };

    fetchUserTheme();
  }, [mounted, user]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (isLoginPage) {
      root.classList.remove("dark");
      return;
    }

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    if (user) {
      fetch("/api/user/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ theme }),
      }).catch((error) => {
        console.error("Failed to save theme preference:", error);
      });
    }
  }, [theme, mounted, user, isLoginPage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
