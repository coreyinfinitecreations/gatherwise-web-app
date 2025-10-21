import { Badge } from "@/components/ui/badge";

export function DashboardFooter() {
  // This would typically come from a context or API call
  const organizationId = "GW-2024-3847";
  const organizationName = "Grace Community Church";

  return (
    <footer className="flex h-12 items-center justify-between border-t bg-background px-6 text-sm text-muted-foreground">
      {/* Left side - can be used for additional info */}
      <div className="flex items-center gap-4">
        <span>© 2024 Gatherwise</span>
        <span className="text-xs">v1.0.0</span>
      </div>

      {/* Right side - Organization ID */}
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
