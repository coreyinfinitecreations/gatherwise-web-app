"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Fingerprint, ArrowRight } from "lucide-react";
import { PasskeyManager } from "@/lib/auth/passkey-manager";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export function PasskeySetupPrompt() {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });

  useEffect(() => {
    checkShouldShow();
  }, [user]);

  const checkShouldShow = async () => {
    try {
      if (!user?.email) return;

      // Check if we should show the passkey setup prompt
      const shouldShow = localStorage.getItem("showPasskeySetup") === "true";
      const wasRecentlyDismissed = localStorage.getItem(
        "passkeyPromptDismissed"
      );

      // Don't show if recently dismissed (within last 24 hours)
      if (wasRecentlyDismissed) {
        const dismissedTime = new Date(wasRecentlyDismissed);
        const now = new Date();
        const hoursSinceDismissed =
          (now.getTime() - dismissedTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) {
          return;
        }
      }

      // Check capabilities
      const caps = await PasskeyManager.getCapabilities();
      setCapabilities(caps);

      const hasPasskeys = PasskeyManager.hasPasskeys(user.email);

      // Show if:
      // 1. Device supports passkeys AND
      // 2. User doesn't have any passkeys AND
      // 3. Either the flag is set OR this is a fresh login session
      if (
        caps.isSupported &&
        caps.isPlatformAuthenticatorAvailable &&
        !hasPasskeys &&
        (shouldShow || !wasRecentlyDismissed)
      ) {
        setIsVisible(true);
        // Clear the flag so it doesn't show again this session
        localStorage.removeItem("showPasskeySetup");
      }
    } catch (error) {
      console.error("Error checking passkey setup prompt:", error);
    }
  };

  const handleSetupPasskeys = () => {
    // Clear the toast immediately
    setIsVisible(false);
    // Clear any localStorage flags
    localStorage.removeItem("showPasskeySetup");
    // Navigate to settings
    router.push("/dashboard/settings");
  };

  const handleDismiss = () => {
    // Clear the toast immediately
    setIsVisible(false);
    // Clear any localStorage flags
    localStorage.removeItem("showPasskeySetup");
    // Set a flag to not show this again for a while
    localStorage.setItem("passkeyPromptDismissed", new Date().toISOString());
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Alert className="border-primary/20 bg-white shadow-lg backdrop-blur-sm">
        <Fingerprint className="h-5 w-5" />
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <AlertDescription className="font-medium text-sm">
              🎉 Welcome! Set up biometric login for faster, more secure access
            </AlertDescription>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleSetupPasskeys}
                size="sm"
                className="text-xs h-7"
              >
                Set up now
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs h-7"
              >
                Maybe later
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
