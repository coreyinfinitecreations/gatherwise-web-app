"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateSelect } from "@/components/ui/state-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Church,
  User,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface RegistrationData {
  churchName: string;
  churchAddress: string;
  churchCity: string;
  churchState: string;
  churchZipCode: string;
  churchPhone: string;
  churchEmail: string;
  hasMultipleCampuses: string;
  campusName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminPhone: string;
  skipPayment: boolean;
  stripeToken?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<RegistrationData>({
    churchName: "",
    churchAddress: "",
    churchCity: "",
    churchState: "",
    churchZipCode: "",
    churchPhone: "",
    churchEmail: "",
    hasMultipleCampuses: "",
    campusName: "Main Campus",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    adminPhone: "",
    skipPayment: false,
  });

  const updateField = (
    field: keyof RegistrationData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.churchName.trim()) {
      setError("Church name is required");
      return false;
    }
    if (!formData.churchAddress.trim()) {
      setError("Church address is required");
      return false;
    }
    if (!formData.churchCity.trim()) {
      setError("City is required");
      return false;
    }
    if (!formData.churchState) {
      setError("State is required");
      return false;
    }
    if (!formData.churchZipCode.trim()) {
      setError("ZIP code is required");
      return false;
    }
    if (!/^\d{5}(-\d{4})?$/.test(formData.churchZipCode)) {
      setError("Invalid ZIP code format");
      return false;
    }
    if (!formData.hasMultipleCampuses) {
      setError("Please select if your church has multiple campuses");
      return false;
    }
    if (formData.hasMultipleCampuses === "yes" && !formData.campusName.trim()) {
      setError("Campus name is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.adminFirstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.adminLastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.adminEmail.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.adminPassword) {
      setError("Password is required");
      return false;
    }
    if (formData.adminPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          church: {
            name: formData.churchName,
            address: formData.churchAddress,
            city: formData.churchCity,
            state: formData.churchState,
            zipCode: formData.churchZipCode,
            phone: formData.churchPhone,
            email: formData.churchEmail,
            hasMultipleCampuses: formData.hasMultipleCampuses === "yes",
            campusName: formData.campusName,
          },
          admin: {
            firstName: formData.adminFirstName,
            lastName: formData.adminLastName,
            email: formData.adminEmail,
            password: formData.adminPassword,
            phone: formData.adminPhone,
          },
          skipPayment: formData.skipPayment,
          stripeToken: formData.stripeToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const loginSuccess = await login(
        formData.adminEmail,
        formData.adminPassword
      );

      if (loginSuccess) {
        router.push("/onboarding");
      } else {
        throw new Error("Login failed after registration");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && "Church Information"}
            {step === 2 && "Administrator Account"}
            {step === 3 && "Payment Setup (Optional)"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about your church"}
            {step === 2 && "Create your administrator account"}
            {step === 3 && "Start your 7-day free trial"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div
                className={`flex items-center gap-2 ${
                  step >= 1 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  {step > 1 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Church className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Church</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-muted">
                <div
                  className={`h-full transition-all ${
                    step >= 2 ? "bg-primary w-full" : "w-0"
                  }`}
                />
              </div>
              <div
                className={`flex items-center gap-2 ${
                  step >= 2 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  {step > 2 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Account</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-muted">
                <div
                  className={`h-full transition-all ${
                    step >= 3 ? "bg-primary w-full" : "w-0"
                  }`}
                />
              </div>
              <div
                className={`flex items-center gap-2 ${
                  step >= 3 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="churchName">Church Name *</Label>
                <Input
                  id="churchName"
                  value={formData.churchName}
                  onChange={(e) => updateField("churchName", e.target.value)}
                  placeholder="Enter your church name"
                />
              </div>
              <div>
                <Label htmlFor="churchAddress">Address *</Label>
                <Input
                  id="churchAddress"
                  value={formData.churchAddress}
                  onChange={(e) => updateField("churchAddress", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="churchCity">City *</Label>
                  <Input
                    id="churchCity"
                    value={formData.churchCity}
                    onChange={(e) => updateField("churchCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="churchState">State *</Label>
                  <StateSelect
                    value={formData.churchState}
                    onChange={(value: string) =>
                      updateField("churchState", value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="churchZipCode">ZIP Code *</Label>
                <Input
                  id="churchZipCode"
                  value={formData.churchZipCode}
                  onChange={(e) => updateField("churchZipCode", e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div>
                <Label htmlFor="churchPhone">Phone</Label>
                <PhoneInput
                  value={formData.churchPhone}
                  onChange={(value) => updateField("churchPhone", value)}
                />
              </div>
              <div>
                <Label htmlFor="churchEmail">Email</Label>
                <Input
                  id="churchEmail"
                  type="email"
                  value={formData.churchEmail}
                  onChange={(e) => updateField("churchEmail", e.target.value)}
                  placeholder="contact@church.org"
                />
              </div>
              <div>
                <Label>Does your church have multiple campuses? *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMultipleCampuses"
                      value="no"
                      checked={formData.hasMultipleCampuses === "no"}
                      onChange={(e) =>
                        updateField("hasMultipleCampuses", e.target.value)
                      }
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span>No, single campus</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMultipleCampuses"
                      value="yes"
                      checked={formData.hasMultipleCampuses === "yes"}
                      onChange={(e) =>
                        updateField("hasMultipleCampuses", e.target.value)
                      }
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span>Yes, multiple campuses</span>
                  </label>
                </div>
              </div>
              {formData.hasMultipleCampuses === "yes" && (
                <div>
                  <Label htmlFor="campusName">Primary Campus Name *</Label>
                  <Input
                    id="campusName"
                    value={formData.campusName}
                    onChange={(e) => updateField("campusName", e.target.value)}
                    placeholder="Main Campus, Downtown Campus, etc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can add additional campuses after registration
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <Input
                    id="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={(e) =>
                      updateField("adminFirstName", e.target.value)
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={(e) =>
                      updateField("adminLastName", e.target.value)
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateField("adminEmail", e.target.value)}
                  placeholder="admin@church.org"
                />
              </div>
              <div>
                <Label htmlFor="adminPhone">Phone</Label>
                <PhoneInput
                  value={formData.adminPhone}
                  onChange={(value) => updateField("adminPhone", value)}
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => updateField("adminPassword", e.target.value)}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <Label htmlFor="adminConfirmPassword">Confirm Password *</Label>
                <Input
                  id="adminConfirmPassword"
                  type="password"
                  value={formData.adminConfirmPassword}
                  onChange={(e) =>
                    updateField("adminConfirmPassword", e.target.value)
                  }
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  7-Day Free Trial
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Your trial starts today and ends in 7 days. No charges will be
                  made during your trial period.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">Trial Period:</span>
                  <span className="font-semibold text-purple-900">
                    {new Date().toLocaleDateString()} -{" "}
                    {new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="skipPayment"
                    checked={formData.skipPayment}
                    onChange={(e) =>
                      updateField("skipPayment", e.target.checked)
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <Label htmlFor="skipPayment" className="cursor-pointer">
                    Skip payment setup for now
                  </Label>
                </div>

                {!formData.skipPayment && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Add your payment method now to automatically activate your
                      subscription when your trial ends. You won't be charged
                      until then.
                    </p>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.skipPayment && (
                  <Alert>
                    <AlertDescription>
                      You can add payment information later from your account
                      settings before your trial expires.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="ml-auto">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto"
              >
                {isSubmitting ? "Creating Account..." : "Start Free Trial"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
