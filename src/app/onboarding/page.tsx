"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StateSelect } from "@/components/ui/state-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { ChevronRight, ChevronLeft, Check, AlertTriangle } from "lucide-react";

interface CampusFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [hasMultipleCampuses, setHasMultipleCampuses] = useState<string>("");
  const [observesMembership, setObservesMembership] = useState<string>("");
  const [campusCount, setCampusCount] = useState<string>("2");
  const [error, setError] = useState<string>("");
  const [campuses, setCampuses] = useState<CampusFormData[]>([
    {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    hasMultipleCampuses?: boolean;
    observesChurchMembership?: boolean;
  }>({});

  useEffect(() => {
    const fetchChurchData = async () => {
      try {
        const churchId = await getChurchId();
        if (churchId) {
          const response = await fetch(`/api/churches/${churchId}`, {
            headers: {
              "x-user-id": user?.id || "",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setRegistrationData({
              hasMultipleCampuses: data.church?.hasMultipleCampuses,
              observesChurchMembership: data.church?.observesChurchMembership,
            });

            if (data.church?.observesChurchMembership !== undefined) {
              setObservesMembership(
                data.church.observesChurchMembership ? "yes" : "no"
              );
            }

            if (data.church?.hasMultipleCampuses !== undefined) {
              setHasMultipleCampuses(
                data.church.hasMultipleCampuses ? "yes" : "no"
              );

              if (data.church.hasMultipleCampuses) {
                setStep(2);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching church data:", error);
      }
    };

    if (user?.id) {
      fetchChurchData();
    }
  }, [user?.id]);

  const updateCampus = (
    index: number,
    field: keyof CampusFormData,
    value: string
  ) => {
    const updated = [...campuses];
    updated[index] = { ...updated[index], [field]: value };
    setCampuses(updated);
  };

  const handleCampusCountChange = (count: string) => {
    setCampusCount(count);
    const num = parseInt(count);
    // Subtract 1 because we already have the Main Campus from registration
    const additionalCampusesNeeded = num - 1;
    const updated = [...campuses];

    if (additionalCampusesNeeded > campuses.length) {
      for (let i = campuses.length; i < additionalCampusesNeeded; i++) {
        updated.push({
          name: "",
          description: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          phone: "",
          email: "",
        });
      }
    } else {
      updated.splice(additionalCampusesNeeded);
    }

    setCampuses(updated);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const churchId = await getChurchId();

      if (!churchId) {
        throw new Error(
          "Church not found. Please ensure your account was set up correctly. You may need to register again."
        );
      }

      if (registrationData.observesChurchMembership === undefined) {
        const churchResponse = await fetch(`/api/churches/${churchId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({
            observesChurchMembership: observesMembership === "yes",
          }),
        });

        if (!churchResponse.ok) {
          const errorData = await churchResponse.json();
          throw new Error(
            errorData.error || "Failed to update church settings"
          );
        }
      }

      if (hasMultipleCampuses === "yes") {
        for (const campus of campuses) {
          if (campus.name) {
            const campusResponse = await fetch("/api/campuses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": user?.id || "",
              },
              body: JSON.stringify({
                name: campus.name,
                description: campus.description,
                address:
                  `${campus.address}, ${campus.city}, ${campus.state} ${campus.zipCode}`.trim(),
                phone: campus.phone,
                email: campus.email,
                isActive: true,
                churchId,
              }),
            });

            if (!campusResponse.ok) {
              const errorData = await campusResponse.json();
              throw new Error(
                errorData.error || `Failed to create campus: ${campus.name}`
              );
            }
          }
        }
      }

      const onboardingResponse = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          onboardingCompleted: true,
        }),
      });

      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json();
        throw new Error(errorData.error || "Failed to complete onboarding");
      }

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      setError(
        error.message || "An error occurred during setup. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const getChurchId = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Profile fetch error:", errorData);
        return null;
      }

      const data = await response.json();
      console.log("Profile data received:", data);
      console.log("Churches array:", data.user?.churches);
      console.log("Church ID:", data.user?.churchId);
      return data.user?.churchId || null;
    } catch (error) {
      console.error("Error fetching church ID:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Gatherwise!</CardTitle>
          <CardDescription>
            Let's finish setting up your church management system
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 &&
            registrationData.observesChurchMembership === undefined && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Does your church observe church membership?
                </h3>
                <RadioGroup
                  value={observesMembership}
                  onValueChange={setObservesMembership}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="yes" id="membership-yes" />
                    <Label
                      htmlFor="membership-yes"
                      className="flex-1 cursor-pointer"
                    >
                      Yes, we have formal church membership
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="no" id="membership-no" />
                    <Label
                      htmlFor="membership-no"
                      className="flex-1 cursor-pointer"
                    >
                      No, we track regular attendees
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

          {step === 2 && registrationData.hasMultipleCampuses === undefined && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Does your church have multiple campuses?
              </h3>
              <RadioGroup
                value={hasMultipleCampuses}
                onValueChange={setHasMultipleCampuses}
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="flex-1 cursor-pointer">
                    Yes, we have multiple locations
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="flex-1 cursor-pointer">
                    No, we have a single location
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {((step === 2 && registrationData.hasMultipleCampuses === true) ||
            (step === 3 && hasMultipleCampuses === "yes")) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                How many total campuses do you have?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Including your main location
              </p>
              <RadioGroup
                value={campusCount}
                onValueChange={handleCampusCountChange}
              >
                {["2", "3", "4", "5+"].map((count) => (
                  <div
                    key={count}
                    className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                  >
                    <RadioGroupItem value={count} id={count} />
                    <Label htmlFor={count} className="flex-1 cursor-pointer">
                      {count} {count === "5+" ? "or more" : ""} total campuses
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {((step === 2 && registrationData.hasMultipleCampuses === false) ||
            (step === 3 && hasMultipleCampuses === "no")) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Great! We've created a default campus for you.
              </h3>
              <p className="text-muted-foreground">
                You can add additional campuses later from your organization
                settings if needed.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  ✓ Main Campus has been set up
                </p>
              </div>
            </div>
          )}

          {((step === 3 && registrationData.hasMultipleCampuses === true) ||
            (step === 4 && hasMultipleCampuses === "yes")) && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-semibold">
                  Tell us about your additional campuses
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We've already set up your Main Campus. Add details for your
                  other locations below.
                </p>
              </div>
              {campuses.map((campus, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Campus {index + 2}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor={`name-${index}`}
                        className="flex items-center gap-1"
                      >
                        Campus Name
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </Label>
                      <Input
                        id={`name-${index}`}
                        placeholder="e.g., Main Campus, North Campus"
                        value={campus.name}
                        onChange={(e) =>
                          updateCampus(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Brief description of this campus"
                        value={campus.description}
                        onChange={(e) =>
                          updateCampus(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor={`address-${index}`}
                        className="flex items-center gap-1"
                      >
                        Street Address
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </Label>
                      <Input
                        id={`address-${index}`}
                        placeholder="123 Main St"
                        value={campus.address}
                        onChange={(e) =>
                          updateCampus(index, "address", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 grid gap-2">
                        <Label
                          htmlFor={`city-${index}`}
                          className="flex items-center gap-1"
                        >
                          City
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </Label>
                        <Input
                          id={`city-${index}`}
                          placeholder="City"
                          value={campus.city}
                          onChange={(e) =>
                            updateCampus(index, "city", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-32 grid gap-2">
                        <Label
                          htmlFor={`state-${index}`}
                          className="flex items-center gap-1"
                        >
                          State
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </Label>
                        <StateSelect
                          value={campus.state}
                          onChange={(value) =>
                            updateCampus(index, "state", value)
                          }
                          placeholder="State"
                        />
                      </div>
                      <div className="w-32 grid gap-2">
                        <Label
                          htmlFor={`zipCode-${index}`}
                          className="flex items-center gap-1"
                        >
                          ZIP
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </Label>
                        <Input
                          id={`zipCode-${index}`}
                          placeholder="12345"
                          value={campus.zipCode}
                          onChange={(e) =>
                            updateCampus(index, "zipCode", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`phone-${index}`}>Phone</Label>
                      <PhoneInput
                        id={`phone-${index}`}
                        placeholder="(555) 123-4567"
                        value={campus.phone}
                        onChange={(value) =>
                          updateCampus(index, "phone", value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`email-${index}`}>Email</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="campus@church.org"
                        value={campus.email}
                        onChange={(e) =>
                          updateCampus(index, "email", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 &&
              !(
                (step === 2 &&
                  registrationData.hasMultipleCampuses === false) ||
                (step === 3 && hasMultipleCampuses === "no")
              ) && (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 &&
                      registrationData.observesChurchMembership === undefined &&
                      !observesMembership) ||
                    (step === 2 &&
                      registrationData.hasMultipleCampuses === undefined &&
                      !hasMultipleCampuses) ||
                    (((step === 2 &&
                      registrationData.hasMultipleCampuses === true) ||
                      (step === 3 && hasMultipleCampuses === "yes")) &&
                      !campusCount)
                  }
                  className="ml-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            {((step === 2 && registrationData.hasMultipleCampuses === false) ||
              (step === 3 && hasMultipleCampuses === "no") ||
              (step === 3 && registrationData.hasMultipleCampuses === true) ||
              step === 4) && (
              <Button
                onClick={handleComplete}
                disabled={
                  isSubmitting ||
                  (registrationData.observesChurchMembership === undefined &&
                    !observesMembership) ||
                  ((hasMultipleCampuses === "yes" ||
                    registrationData.hasMultipleCampuses === true) &&
                    !campuses.every(
                      (c) =>
                        c.name && c.address && c.city && c.state && c.zipCode
                    ))
                }
                className="ml-auto"
              >
                {isSubmitting ? "Setting up..." : "Complete Setup"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
