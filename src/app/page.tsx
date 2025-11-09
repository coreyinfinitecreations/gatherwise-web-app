"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Shield } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gatherwise</h1>
          <p className="text-sm text-gray-600">Church Management System</p>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          Loading secure environment...
        </p>
      </div>
    </div>
  );
}
