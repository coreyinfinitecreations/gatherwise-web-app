"use client";

import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

export function DashboardFooter() {
  const { user } = useAuth();

  const organizationId = user?.organizationId || "N/A";
  const organizationName = user?.organizationName || "Unknown Organization";

  return (
    <footer className="flex h-12 items-center justify-between border-t bg-background px-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>© {new Date().getFullYear()} Gatherwise</span>
        <span className="text-xs">v1.0.0</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs">Organization:</span>
        <Badge variant="outline" className="font-mono text-xs">
          {organizationId}
        </Badge>
        <span className="hidden sm:inline text-xs text-muted-foreground">
          {organizationName}
        </span>
      </div>
    </footer>
  );
}
