"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { RolePermissionManager } from "@/components/settings/role-permission-manager";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users } from "lucide-react";

export default function RolesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [churchId, setChurchId] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      fetchChurchId();
    }
  }, [user]);

  const fetchChurchId = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/churches", {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.churches && data.churches.length > 0) {
          setChurchId(data.churches[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching church ID:", error);
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
          value="team"
          className="space-y-6"
          onValueChange={(value) => {
            if (value === "security") {
              router.push("/dashboard/settings");
            } else if (value === "organization") {
              router.push("/dashboard/settings/organization");
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

          <TabsContent value="team" className="space-y-6">
            <RolePermissionManager
              churchId={churchId || user?.organizationId || ""}
              userId={user?.id || ""}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
