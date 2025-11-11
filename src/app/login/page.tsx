"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword as validatePasswordSecurity } from "@/lib/auth/user-manager";
import { ConditionalPasskeyLogin } from "@/components/auth/conditional-passkey-login";
import { PasskeyManager } from "@/lib/auth/passkey-manager";

interface SecurityValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [capabilities, setCapabilities] = useState({
    isSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isConditionalMediationAvailable: false,
  });

  // Handle auto-login from test registration
  useEffect(() => {
    const autoLogin = searchParams.get("autoLogin");
    const sessionData = searchParams.get("sessionData");

    if (autoLogin === "true" && sessionData) {
      try {
        const userData = JSON.parse(decodeURIComponent(sessionData));

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Set authentication cookie
        document.cookie =
          "isAuthenticated=true; path=/; max-age=" + 60 * 60 * 24 * 7;

        // Show success message and redirect
        setSuccess("Account created successfully! Redirecting to dashboard...");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } catch (err) {
        console.error("Auto-login failed:", err);
        setError("Session data invalid. Please log in manually.");
      }
    }
  }, [searchParams, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Check passkey capabilities on mount
  useEffect(() => {
    PasskeyManager.getCapabilities().then(setCapabilities);
  }, []);

  const [securityValidation, setSecurityValidation] =
    useState<SecurityValidation>({
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChars: false,
    });

  const validatePassword = (password: string): SecurityValidation => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "password") {
      setSecurityValidation(validatePassword(value));
    }

    // Clear errors on input change
    if (error) setError("");
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(
        "Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    // Client-side validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePasswordSecurity(formData.password);

    if (!passwordValidation.isValid) {
      setError(
        `Password does not meet security requirements: ${passwordValidation.errors.join(
          ", "
        )}`
      );
      setIsLoading(false);
      return;
    }

    try {
      // Attempt login using auth context
      const loginSuccess = await login(formData.email, formData.password);

      if (!loginSuccess) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setError(
            "Account locked due to multiple failed login attempts. Contact your system administrator."
          );
        } else {
          setError(
            `Invalid credentials. ${5 - newAttempts} attempts remaining.`
          );
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      setSuccess("Authentication successful. Redirecting to dashboard...");

      // Check if user should be prompted to set up biometric authentication
      const hasPasskeys = PasskeyManager.hasPasskeys(formData.email);
      const shouldPromptForPasskey =
        capabilities.isSupported &&
        capabilities.isPlatformAuthenticatorAvailable &&
        formData.email &&
        !hasPasskeys;

      if (shouldPromptForPasskey) {
        // Store a flag to show passkey setup prompt after redirect
        localStorage.setItem("showPasskeySetup", "true");
      }

      // Use replace to avoid back button issues
      router.replace("/dashboard");
    } catch (err: any) {
      // Handle specific error messages from UserManager
      if (err.message?.includes("Account locked")) {
        setIsLocked(true);
        setError(err.message);
      } else if (err.message?.includes("Account is deactivated")) {
        setError(
          "Your account has been deactivated. Please contact your administrator."
        );
      } else {
        setError(
          "Authentication failed. Please check your credentials and try again."
        );
      }
    }

    setIsLoading(false);
  };

  const SecurityIndicator = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
      )}
      <span className={isValid ? "text-green-600" : "text-gray-500"}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gatherwise Login</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enterprise-grade security for your church management
          </p>
        </div>

        {/* Security Badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Bank-level Security</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            256-bit encryption, multi-factor authentication, and advanced threat
            protection
          </p>
        </div>

        {/* Conditional Passkey Login - Only shows if passkeys are available */}
        <ConditionalPasskeyLogin
          onSuccess={() => router.replace("/dashboard")}
          onError={(error) => setError(error)}
        />

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your church management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Security Validation */}
              {formData.password && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">
                    Security Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    <SecurityIndicator
                      isValid={securityValidation.minLength}
                      text="At least 8 characters"
                    />
                    <SecurityIndicator
                      isValid={securityValidation.hasUpperCase}
                      text="One uppercase letter"
                    />
                    <SecurityIndicator
                      isValid={securityValidation.hasLowerCase}
                      text="One lowercase letter"
                    />
                    <SecurityIndicator
                      isValid={securityValidation.hasNumbers}
                      text="One number"
                    />
                    <SecurityIndicator
                      isValid={securityValidation.hasSpecialChars}
                      text="One special character"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-hover-lift"
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In Securely"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <div className="mt-4 text-center space-y-2">
              <button className="text-sm text-primary hover:underline">
                Forgot your password?
              </button>
              <div className="text-xs text-gray-500">
                Need help? Contact your church administrator
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>
            <Link href="/test/register" className="w-full">
              <Button variant="outline" className="w-full">
                Create an Account
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Security Features */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Security Features</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Multi-Factor Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Threat Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Session Monitoring</span>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Demo Credentials</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>
              <strong>Admin:</strong> admin@gatherwise.com / Password123!
            </div>
            <div>
              <strong>Pastor:</strong> pastor@gatherwise.com / Password123!
            </div>
            <div className="mt-2 pt-2 border-t border-yellow-200 text-xs">
              💡 <strong>Tip:</strong> After logging in, visit Settings to set
              up biometric authentication
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
