"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (requiredRole && user && !requiredRole.includes(user.role)) {
        // Redirect to unauthorized page or dashboard
        router.push("/dashboard?error=unauthorized");
        return;
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, isLoading, user, router, requiredRole]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h2 className="text-lg font-semibold">Authenticating...</h2>
            <p className="text-sm text-muted-foreground">
              Verifying your secure session
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
