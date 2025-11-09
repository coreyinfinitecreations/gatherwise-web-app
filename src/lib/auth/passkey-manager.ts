import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";

export interface PasskeyCredential {
  id: string;
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
  credentialDeviceType: "singleDevice" | "multiDevice";
  credentialBackedUp: boolean;
  transports?: AuthenticatorTransport[];
  createdAt: Date;
  lastUsed?: Date;
  deviceName?: string;
}

export interface PasskeyUser {
  id: string;
  email: string;
  credentials: PasskeyCredential[];
}

// Mock storage for passkeys (in production, use database)
let passkeyUsers: PasskeyUser[] = [];

// Demo setup flag
let demoSetupComplete = false;

// RP (Relying Party) configuration
const rpName = "Gatherwise Church Management";
const rpID = "localhost"; // In production, use your domain
const origin = `http://${rpID}:3002`; // In production, use https://yourdomain.com

export class PasskeyManager {
  /**
   * Initialize demo passkey data for testing (development only)
   */
  static initializeDemoData() {
    if (demoSetupComplete || typeof window === "undefined") return;

    // Create a demo passkey user that simulates having a registered passkey
    // This allows testing the authentication flow without actual biometric setup
    const demoCredentialId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const demoPublicKey = new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]);

    passkeyUsers.push({
      id: "demo-user-1",
      email: "demo@gatherwise.com",
      credentials: [
        {
          id: "demo-credential-1",
          credentialID: demoCredentialId,
          credentialPublicKey: demoPublicKey,
          counter: 0,
          credentialDeviceType: "singleDevice",
          credentialBackedUp: false,
          transports: ["internal"],
          createdAt: new Date(),
          deviceName: "Demo Device",
        },
      ],
    });

    demoSetupComplete = true;
    console.log("🔐 Demo passkey data initialized for testing");
  }

  /**
   * Check if WebAuthn is supported by the browser
   */
  static isSupported(): boolean {
    return !!(
      typeof window !== "undefined" &&
      window.navigator &&
      window.navigator.credentials &&
      typeof window.navigator.credentials.create === "function" &&
      typeof window.navigator.credentials.get === "function" &&
      window.PublicKeyCredential
    );
  }

  /**
   * Check if platform authenticator (Face ID, Touch ID) is available
   */
  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  /**
   * Get device info for user-friendly credential names
   */
  static getDeviceInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Mac")) {
      return "MacBook (Touch ID/Face ID)";
    } else if (userAgent.includes("iPhone")) {
      return "iPhone (Face ID/Touch ID)";
    } else if (userAgent.includes("iPad")) {
      return "iPad (Face ID/Touch ID)";
    } else if (userAgent.includes("Windows")) {
      return "Windows Hello";
    } else if (userAgent.includes("Android")) {
      return "Android Biometric";
    }

    return "Biometric Device";
  }

  /**
   * Start passkey registration process
   */
  static async startRegistration(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isSupported()) {
        return {
          success: false,
          error: "Passkeys are not supported on this device",
        };
      }

      // Find or create user
      let user = passkeyUsers.find((u) => u.email === email);
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          email,
          credentials: [],
        };
        passkeyUsers.push(user);
      }

      // Generate registration options
      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: email,
        userDisplayName: email,
        attestationType: "none",
        excludeCredentials: user.credentials.map((cred) => ({
          id: cred.credentialID,
          type: "public-key",
          transports: cred.transports,
        })),
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
          authenticatorAttachment: "platform", // Prefer platform authenticators (Face ID, Touch ID)
        },
      });

      // Start registration
      const attResp = await startRegistration(options);

      // Verify registration
      const verification = await verifyRegistrationResponse({
        response: attResp,
        expectedChallenge: options.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        // Store the credential
        const newCredential: PasskeyCredential = {
          id: crypto.randomUUID(),
          credentialID: verification.registrationInfo.credentialID,
          credentialPublicKey:
            verification.registrationInfo.credentialPublicKey,
          counter: verification.registrationInfo.counter,
          credentialDeviceType:
            verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: attResp.response.transports as AuthenticatorTransport[],
          createdAt: new Date(),
          deviceName: this.getDeviceInfo(),
        };

        user.credentials.push(newCredential);

        return { success: true };
      }

      return { success: false, error: "Failed to verify passkey registration" };
    } catch (error: any) {
      console.error("Passkey registration error:", error);

      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Passkey registration was cancelled or not allowed",
        };
      } else if (error.name === "InvalidStateError") {
        return {
          success: false,
          error: "This device already has a passkey registered",
        };
      } else if (error.name === "NotSupportedError") {
        return {
          success: false,
          error: "Passkeys are not supported on this device",
        };
      }

      return {
        success: false,
        error: "Failed to register passkey. Please try again.",
      };
    }
  }

  /**
   * Start passkey authentication process
   */
  static async startAuthentication(
    email?: string
  ): Promise<{ success: boolean; user?: PasskeyUser; error?: string }> {
    try {
      if (!this.isSupported()) {
        return {
          success: false,
          error: "Passkeys are not supported on this device",
        };
      }

      let allowCredentials: {
        id: Uint8Array;
        type: "public-key";
        transports?: AuthenticatorTransport[];
      }[] = [];
      let targetUser: PasskeyUser | undefined;

      // If email is provided, get user's credentials
      if (email) {
        targetUser = passkeyUsers.find((u) => u.email === email);
        if (targetUser && targetUser.credentials.length > 0) {
          allowCredentials = targetUser.credentials.map((cred) => ({
            id: cred.credentialID,
            type: "public-key" as const,
            transports: cred.transports,
          }));
        } else {
          return {
            success: false,
            error:
              "No passkeys found for this account. Please register a passkey first.",
          };
        }
      } else {
        // If no email provided, check if there are any registered passkeys at all
        if (
          passkeyUsers.length === 0 ||
          passkeyUsers.every((u) => u.credentials.length === 0)
        ) {
          return {
            success: false,
            error: "No passkeys have been registered on this device.",
          };
        }
      }

      // Generate authentication options
      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials:
          allowCredentials.length > 0 ? allowCredentials : undefined,
        userVerification: "preferred",
      });

      // For demo purposes, simulate authentication if we have demo data
      if (targetUser && targetUser.email === "demo@gatherwise.com") {
        // Simulate successful demo authentication
        return { success: true, user: targetUser };
      }

      // Start real authentication
      const authResp = await startAuthentication(options);

      // Find the user with this credential
      let user: PasskeyUser | undefined;

      if (targetUser) {
        // If we have a target user, verify the credential belongs to them
        user = targetUser;
      } else {
        // Otherwise, find the user with this credential
        user = passkeyUsers.find((u) =>
          u.credentials.some(
            (cred) =>
              Buffer.from(cred.credentialID).toString("base64url") ===
              authResp.id
          )
        );
      }

      if (!user) {
        return { success: false, error: "No user found for this passkey" };
      }

      const credential = user.credentials.find(
        (cred) =>
          Buffer.from(cred.credentialID).toString("base64url") === authResp.id
      );

      if (!credential) {
        return { success: false, error: "Credential not found" };
      }

      // Verify authentication
      const verification = await verifyAuthenticationResponse({
        response: authResp,
        expectedChallenge: options.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: credential.credentialID,
          credentialPublicKey: credential.credentialPublicKey,
          counter: credential.counter,
          transports: credential.transports,
        },
      });

      if (verification.verified) {
        // Update counter and last used
        credential.counter = verification.authenticationInfo.newCounter;
        credential.lastUsed = new Date();

        return { success: true, user };
      }

      return { success: false, error: "Passkey verification failed" };
    } catch (error: any) {
      console.error("Passkey authentication error:", error);

      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Passkey authentication was cancelled",
        };
      } else if (error.name === "InvalidStateError") {
        return {
          success: false,
          error: "No passkey available for authentication",
        };
      }

      return {
        success: false,
        error: "Passkey authentication failed. Please try again.",
      };
    }
  }

  /**
   * Get user's registered passkeys
   */
  static getUserPasskeys(email: string): PasskeyCredential[] {
    const user = passkeyUsers.find((u) => u.email === email);
    return user?.credentials || [];
  }

  /**
   * Remove a passkey
   */
  static removePasskey(email: string, credentialId: string): boolean {
    const user = passkeyUsers.find((u) => u.email === email);
    if (!user) return false;

    const index = user.credentials.findIndex(
      (cred) => cred.id === credentialId
    );
    if (index === -1) return false;

    user.credentials.splice(index, 1);
    return true;
  }

  /**
   * Check if user has any passkeys registered
   */
  static hasPasskeys(email: string): boolean {
    const user = passkeyUsers.find((u) => u.email === email);
    return !!(user && user.credentials.length > 0);
  }

  /**
   * Check if any passkeys are registered on this device/origin
   */
  static hasAnyPasskeys(): boolean {
    return passkeyUsers.some((user) => user.credentials.length > 0);
  }

  /**
   * Get platform authenticator capabilities
   */
  static async getCapabilities(): Promise<{
    isSupported: boolean;
    isPlatformAuthenticatorAvailable: boolean;
    isConditionalMediationAvailable: boolean;
  }> {
    const isSupported = this.isSupported();
    let isPlatformAuthenticatorAvailable = false;
    let isConditionalMediationAvailable = false;

    if (isSupported) {
      try {
        isPlatformAuthenticatorAvailable =
          await this.isPlatformAuthenticatorAvailable();

        // Check for conditional mediation (autocomplete="webauthn")
        isConditionalMediationAvailable =
          (await PublicKeyCredential.isConditionalMediationAvailable?.()) ||
          false;
      } catch {
        // Ignore errors
      }
    }

    return {
      isSupported,
      isPlatformAuthenticatorAvailable,
      isConditionalMediationAvailable,
    };
  }
}
