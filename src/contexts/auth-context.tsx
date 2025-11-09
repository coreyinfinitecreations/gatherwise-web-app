"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/auth/user-manager";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPasskey: (email?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;

        const response = await fetch(`/api/auth/user/${userData.id}`);

        if (response.ok) {
          const { user: currentUser } = await response.json();

          if (currentUser && currentUser.isActive) {
            setUser(currentUser);
            document.cookie =
              "isAuthenticated=true; path=/; max-age=" + 60 * 60 * 24 * 7;
          } else {
            localStorage.removeItem("user");
            document.cookie =
              "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          }
        } else {
          localStorage.removeItem("user");
          document.cookie =
            "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.user) {
        setUser(data.user);

        // Store in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(data.user));

        // Set authentication cookie for middleware
        document.cookie =
          "isAuthenticated=true; path=/; max-age=" + 60 * 60 * 24 * 7; // 7 days

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Let the login component handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasskey = async (email?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // TODO: Create API route for passkey authentication
      console.error("Passkey login not yet implemented with API routes");
      return false;

      // const authenticatedUser = await UserManager.authenticateUserWithPasskey(
      //   email
      // );

      // if (authenticatedUser) {
      //   setUser(authenticatedUser);

      //   // Store in localStorage for persistence
      //   localStorage.setItem("user", JSON.stringify(authenticatedUser));

      //   // Set authentication cookie for middleware
      //   document.cookie =
      //     "isAuthenticated=true; path=/; max-age=" + 60 * 60 * 24 * 7; // 7 days

      //   return true;
      // }

      // return false;
    } catch (error) {
      console.error("Passkey login error:", error);
      throw error; // Let the login component handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);

    // Clear authentication state
    localStorage.removeItem("user");

    // Clear all auth-related cookies
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie =
      "session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithPasskey,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
