"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fingerprint, Smartphone, Laptop } from "lucide-react";
import { PasskeyManager } from "@/lib/auth/passkey-manager";
import { useAuth } from "@/contexts/auth-context";

interface ConditionalPasskeyLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ConditionalPasskeyLogin({
  onSuccess,
  onError,
}: ConditionalPasskeyLoginProps) {
  const { loginWithPasskey } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });

  useEffect(() => {
    checkForPasskeys();
  }, []);

  const checkForPasskeys = async () => {
    try {
      // Get capabilities first
      const caps = await PasskeyManager.getCapabilities();
      setCapabilities(caps);

      // Only show if:
      // 1. WebAuthn is supported
      // 2. Platform authenticator is available
      // 3. There are REAL passkeys registered (not just demo data)
      if (caps.isSupported && caps.isPlatformAuthenticatorAvailable) {
        // Initialize demo data after capabilities check
        PasskeyManager.initializeDemoData();

        // Check if there are real passkeys registered by users
        // In a real app, this would check the server/database
        // For now, we'll be more conservative and only show if:
        // - Conditional mediation is available (browser has stored credentials)
        // - OR there's a specific flag indicating real passkeys exist
        const hasRealPasskeys =
          localStorage.getItem("hasRegisteredPasskeys") === "true";

        if (hasRealPasskeys && caps.isConditionalMediationAvailable) {
          setIsVisible(true);
        }

        // DEVELOPMENT MODE: Uncomment the line below to always show passkey option for testing
        // setIsVisible(caps.isSupported && caps.isPlatformAuthenticatorAvailable && PasskeyManager.hasAnyPasskeys());
      }
    } catch (error) {
      console.error("Error checking for passkeys:", error);
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      setIsLoading(true);

      // Try discoverable credential authentication (no specific user)
      const success = await loginWithPasskey(undefined);

      if (success) {
        onSuccess?.();
      } else {
        onError?.("Passkey authentication failed");
      }
    } catch (error: any) {
      console.error("Passkey login error:", error);

      if (
        error.message?.includes("cancelled") ||
        error.message?.includes("not allowed")
      ) {
        onError?.("Biometric authentication was cancelled.");
      } else {
        onError?.(error.message || "Passkey authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthenticatorIcon = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Mac")) {
      return <Laptop className="h-5 w-5" />;
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return <Smartphone className="h-5 w-5" />;
    }

    return <Fingerprint className="h-5 w-5" />;
  };

  const getAuthenticatorName = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Mac")) {
      return "Touch ID or Face ID";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "Face ID or Touch ID";
    } else if (userAgent.includes("Windows")) {
      return "Windows Hello";
    } else if (userAgent.includes("Android")) {
      return "Biometric authentication";
    }

    return "Biometric authentication";
  };

  // Don't render anything if passkeys aren't available
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {getAuthenticatorIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">Welcome Back!</CardTitle>
              <CardDescription>
                Sign in with {getAuthenticatorName()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handlePasskeyLogin}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Authenticating...
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" />
                Continue with {getAuthenticatorName()}
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center mt-3">
            Your biometric data stays on your device
          </div>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-100 px-2 text-muted-foreground">
            Or sign in with password
          </span>
        </div>
      </div>
    </>
  );
}
