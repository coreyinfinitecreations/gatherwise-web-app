import { PasskeyManager } from "./passkey-manager";

// Demo passkey setup for development
export async function setupDemoPasskeys() {
  try {
    // Check if running in browser and if WebAuthn is supported
    if (typeof window === "undefined" || !PasskeyManager.isSupported()) {
      console.log("WebAuthn not supported or running server-side");
      return;
    }

    // Demo users to set up passkeys for
    const demoUsers = [
      "admin@gatherwise.com",
      "pastor@gatherwise.com",
      "staff@gatherwise.com",
    ];

    console.log("Demo passkey setup available for:", demoUsers);

    // In a real application, you would show UI to let users register their passkeys
    // For demo purposes, we'll log instructions
    console.log(`
🔐 Passkey Demo Setup Instructions:

1. Open the login page at http://localhost:3002/login
2. Try clicking "Sign in with Touch ID/Face ID" (if available on your device)
3. For demo accounts, you can register passkeys after logging in with password first
4. Supported demo accounts:
   - admin@gatherwise.com / Password123!
   - pastor@gatherwise.com / Password123!
   - staff@gatherwise.com / Password123!

Note: Passkeys require HTTPS in production and a registered domain.
In development (localhost), most browsers will work for testing.
    `);
  } catch (error) {
    console.error("Demo passkey setup error:", error);
  }
}

// Function to show passkey capabilities in development
export function logPasskeyCapabilities() {
  if (typeof window === "undefined") return;

  PasskeyManager.getCapabilities().then((capabilities) => {
    console.log("🔐 Passkey Capabilities:", {
      browserSupported: capabilities.isSupported,
      biometricsAvailable: capabilities.isPlatformAuthenticatorAvailable,
      conditionalUISupported: capabilities.isConditionalMediationAvailable,
      userAgent: navigator.userAgent,
    });
  });
}
