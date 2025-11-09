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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Fingerprint,
  Smartphone,
  Laptop,
  Info,
  CheckCircle,
  Plus,
} from "lucide-react";
import { PasskeyManager } from "@/lib/auth/passkey-manager";
import { useAuth } from "@/contexts/auth-context";

interface PasskeyLoginProps {
  email?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasskeyLogin({ email, onSuccess, onError }: PasskeyLoginProps) {
  const { loginWithPasskey } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });
  const [hasPasskeys, setHasPasskeys] = useState(false);

  useEffect(() => {
    // Initialize demo data for testing
    PasskeyManager.initializeDemoData();
    checkCapabilities();
  }, [email]);

  const checkCapabilities = async () => {
    const caps = await PasskeyManager.getCapabilities();
    setCapabilities(caps);

    if (email) {
      setHasPasskeys(PasskeyManager.hasPasskeys(email));
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      setIsLoading(true);

      // Check if user has passkeys before attempting authentication
      if (email && !PasskeyManager.hasPasskeys(email)) {
        onError?.(
          "No passkeys registered for this account. Please log in with password first and set up biometric authentication."
        );
        return;
      }

      const success = await loginWithPasskey(email);

      if (success) {
        onSuccess?.();
      } else {
        onError?.("Passkey authentication failed");
      }
    } catch (error: any) {
      console.error("Passkey login error:", error);

      if (
        error.message?.includes("No passkeys found") ||
        error.message?.includes("No passkeys have been registered")
      ) {
        onError?.(
          "No passkeys registered. Please log in with password and set up biometric authentication first."
        );
      } else if (
        error.message?.includes("cancelled") ||
        error.message?.includes("not allowed")
      ) {
        onError?.("Biometric authentication was cancelled. Please try again.");
      } else {
        onError?.(error.message || "Passkey authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyRegistration = async () => {
    if (!email) {
      onError?.(
        "Please enter your email address first to set up biometric authentication."
      );
      return;
    }

    try {
      setIsRegistering(true);

      const result = await PasskeyManager.startRegistration(email);

      if (result.success) {
        setHasPasskeys(true);
        onSuccess?.();
      } else {
        onError?.(result.error || "Failed to register passkey");
      }
    } catch (error: any) {
      console.error("Passkey registration error:", error);
      onError?.(error.message || "Failed to register passkey");
    } finally {
      setIsRegistering(false);
    }
  };

  const getAuthenticatorIcon = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Mac")) {
      return <Laptop className="h-6 w-6" />;
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return <Smartphone className="h-6 w-6" />;
    }

    return <Fingerprint className="h-6 w-6" />;
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

  if (!capabilities.isSupported) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Passkeys are not supported on this browser. Please use a modern
          browser like Chrome, Safari, or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  if (!capabilities.isPlatformAuthenticatorAvailable) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not available on this device. Please use
          password login.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            {getAuthenticatorIcon()}
          </div>
          <div>
            <CardTitle className="text-lg">Biometric Login</CardTitle>
            <CardDescription>
              Sign in securely with {getAuthenticatorName()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {email && hasPasskeys && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Passkey found for {email}. Click below to authenticate.
            </AlertDescription>
          </Alert>
        )}

        {email && !hasPasskeys && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No passkeys registered for {email}. You can set up biometric
              authentication now or log in with password first.
            </AlertDescription>
          </Alert>
        )}

        {!email && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter your email address above, then try biometric authentication
              or set up a new passkey.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {/* Existing passkey authentication */}
          {(!email || hasPasskeys) && (
            <Button
              onClick={handlePasskeyLogin}
              disabled={isLoading || isRegistering}
              size="lg"
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Sign in with {getAuthenticatorName()}
                </>
              )}
            </Button>
          )}

          {/* Passkey registration for new users */}
          {email && !hasPasskeys && (
            <Button
              onClick={handlePasskeyRegistration}
              disabled={isLoading || isRegistering}
              size="lg"
              className="w-full"
            >
              {isRegistering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Set up {getAuthenticatorName()}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Your biometric data never leaves this device and is not stored on our
          servers.
        </div>
      </CardContent>
    </Card>
  );
}

interface PasskeyRegistrationProps {
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasskeyRegistration({
  email,
  onSuccess,
  onError,
}: PasskeyRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    const caps = await PasskeyManager.getCapabilities();
    setCapabilities(caps);
  };

  const handlePasskeyRegistration = async () => {
    try {
      setIsLoading(true);

      const result = await PasskeyManager.startRegistration(email);

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.error || "Failed to register passkey");
      }
    } catch (error: any) {
      onError?.(error.message || "Failed to register passkey");
    } finally {
      setIsLoading(false);
    }
  };

  if (
    !capabilities.isSupported ||
    !capabilities.isPlatformAuthenticatorAvailable
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Set Up Biometric Login
        </CardTitle>
        <CardDescription>
          Enable secure, passwordless authentication with your device&apos;s
          biometrics
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          onClick={handlePasskeyRegistration}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Setting up...
            </>
          ) : (
            <>
              <Fingerprint className="h-4 w-4 mr-2" />
              Enable Biometric Login
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
