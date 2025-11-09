"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Fingerprint,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Info,
} from "lucide-react";
import {
  PasskeyManager,
  type PasskeyCredential,
} from "@/lib/auth/passkey-manager";
import { PasskeyRegistration } from "@/components/auth/passkey-login";
import { useAuth } from "@/contexts/auth-context";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSecurityData();
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      // Get WebAuthn capabilities
      const caps = await PasskeyManager.getCapabilities();
      setCapabilities(caps);

      // Get user's passkeys
      if (user?.email) {
        const userPasskeys = PasskeyManager.getUserPasskeys(user.email);
        setPasskeys(userPasskeys);
      }
    } catch (error) {
      console.error("Error loading security data:", error);
      setError("Failed to load security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyRegistrationSuccess = () => {
    setSuccess("Biometric authentication has been set up successfully!");

    // Mark that real passkeys have been registered
    localStorage.setItem("hasRegisteredPasskeys", "true");

    loadSecurityData(); // Refresh the passkey list
    setTimeout(() => setSuccess(""), 5000);
  };

  const handlePasskeyRegistrationError = (error: string) => {
    setError(error);
    setTimeout(() => setError(""), 5000);
  };

  const handleRemovePasskey = (credentialId: string) => {
    if (!user?.email) return;

    const success = PasskeyManager.removePasskey(user.email, credentialId);
    if (success) {
      setSuccess("Passkey removed successfully");
      loadSecurityData();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Failed to remove passkey");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getDeviceIcon = (deviceName?: string) => {
    if (!deviceName) return <Fingerprint className="h-5 w-5" />;

    if (deviceName.includes("MacBook") || deviceName.includes("Mac")) {
      return <Laptop className="h-5 w-5" />;
    } else if (deviceName.includes("iPhone") || deviceName.includes("iPad")) {
      return <Smartphone className="h-5 w-5" />;
    }

    return <Fingerprint className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Security Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account security and authentication methods
            </p>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication methods
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security Overview
            </CardTitle>
            <CardDescription>
              Current security status and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Password Protected</div>
                  <div className="text-sm text-muted-foreground">
                    Strong password set
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {passkeys.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium">Biometric Login</div>
                  <div className="text-sm text-muted-foreground">
                    {passkeys.length > 0
                      ? `${passkeys.length} device(s) registered`
                      : "Not set up"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Secure Session</div>
                  <div className="text-sm text-muted-foreground">
                    Active encryption
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biometric Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Biometric Authentication (Passkeys)
            </CardTitle>
            <CardDescription>
              Secure, passwordless login using your device&apos;s biometric
              sensors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WebAuthn Support Status */}
            <div className="space-y-3">
              <h4 className="font-medium">Device Compatibility</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  {capabilities.isSupported ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">WebAuthn Support</span>
                </div>
                <div className="flex items-center gap-2">
                  {capabilities.isPlatformAuthenticatorAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Biometric Sensors</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Registered Passkeys */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Registered Devices</h4>
                <Badge variant="secondary">{passkeys.length} active</Badge>
              </div>

              {passkeys.length > 0 ? (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(passkey.deviceName)}
                        <div>
                          <div className="font-medium">
                            {passkey.deviceName || "Unknown Device"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Added {passkey.createdAt.toLocaleDateString()}
                            {passkey.lastUsed &&
                              ` • Last used ${passkey.lastUsed.toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePasskey(passkey.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No biometric authentication devices registered. Set one up
                    below for faster, more secure login.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Add New Passkey */}
            {capabilities.isSupported &&
              capabilities.isPlatformAuthenticatorAvailable &&
              user?.email && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Device
                  </h4>
                  <PasskeyRegistration
                    email={user.email}
                    onSuccess={handlePasskeyRegistrationSuccess}
                    onError={handlePasskeyRegistrationError}
                  />
                </div>
              )}

            {!capabilities.isSupported && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Biometric authentication is not supported on this browser.
                  Please use a modern browser like Chrome, Safari, or Edge.
                </AlertDescription>
              </Alert>
            )}

            {capabilities.isSupported &&
              !capabilities.isPlatformAuthenticatorAvailable && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No biometric sensors detected on this device. Biometric
                    login requires a device with Touch ID, Face ID, or Windows
                    Hello.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Security Tips</CardTitle>
            <CardDescription>
              Best practices for keeping your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Use biometric login:</strong> Passkeys are more secure
                  than passwords and can&apos;t be phished.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Keep your devices updated:</strong> Regular updates
                  include important security patches.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Register multiple devices:</strong> Set up passkeys on
                  your phone and computer for convenience.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Log out from shared devices:</strong> Always sign out
                  when using public or shared computers.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
