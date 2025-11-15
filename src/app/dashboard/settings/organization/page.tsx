"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users, Info, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";

export default function OrganizationPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  useEffect(() => {
    if (user?.organizationName) {
      setOrganizationName(user.organizationName);
    }
  }, [user]);

  const handleSaveOrganizationName = async () => {
    if (!organizationName.trim()) {
      toast.error("Organization name cannot be empty");
      return;
    }

    setIsSavingOrg(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ organizationName }),
      });

      if (!response.ok) throw new Error("Failed to update");

      if (user) {
        await updateUser({ ...user, organizationName });
      }
      toast.success("Organization name updated successfully");
      setIsEditingOrg(false);
    } catch (error) {
      toast.error("Failed to update organization name");
    } finally {
      setIsSavingOrg(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, security, and organization settings
          </p>
        </div>

        <Tabs
          value="organization"
          className="space-y-6"
          onValueChange={(value) => {
            if (value === "security") {
              router.push("/dashboard/settings");
            } else if (value === "team") {
              router.push("/dashboard/settings/roles");
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team & Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Information
                </CardTitle>
                <CardDescription>
                  Manage your church or organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Organization Name
                  </label>
                  {isEditingOrg ? (
                    <div className="space-y-2">
                      <Input
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Enter organization name"
                        className="bg-muted/50 border-border"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveOrganizationName}
                          disabled={isSavingOrg}
                        >
                          {isSavingOrg ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOrganizationName(user?.organizationName || "");
                            setIsEditingOrg(false);
                          }}
                          disabled={isSavingOrg}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {user?.organizationName || "Not set"}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingOrg(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization ID</label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user?.organizationId || "Not set"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Campus Management
                </CardTitle>
                <CardDescription>
                  Configure multi-campus settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Campus management features will be available here. You can
                    enable or disable multi-campus mode and manage
                    campus-specific settings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
