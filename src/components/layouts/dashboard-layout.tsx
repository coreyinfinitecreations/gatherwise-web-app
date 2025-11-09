import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardFooter } from "@/components/dashboard/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PasskeySetupPrompt } from "@/components/auth/passkey-setup-prompt";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1 flex flex-col w-full">
            <DashboardHeader />
            <main className="flex-1 p-6 bg-background">{children}</main>
            <DashboardFooter />
          </SidebarInset>
        </div>
        <PasskeySetupPrompt />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
