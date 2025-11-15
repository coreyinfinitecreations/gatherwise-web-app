"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  Route,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
  Globe,
  BookOpen,
  UserPlus,
  TrendingUp,
  ChevronRight,
  Church,
  Heart,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { LucideIcon } from "lucide-react";

type NavigationItem = {
  title: string;
  icon: LucideIcon;
  url?: string;
  items?: { title: string; url: string }[];
  badge?: string;
};

const baseNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "People",
    icon: Users,
    items: [
      { title: "All Members", url: "/dashboard/people" },
      { title: "Add Member", url: "/dashboard/people/add" },
      { title: "Visitors", url: "/dashboard/people/visitors" },
    ],
  },
  {
    title: "Life Groups",
    url: "/dashboard/life-groups",
    icon: Heart,
  },
  {
    title: "Pathways",
    icon: Route,
    items: [
      { title: "All Pathways", url: "/dashboard/pathways" },
      { title: "Create Pathway", url: "/dashboard/pathways/create" },
      { title: "Progress Tracking", url: "/dashboard/pathways/progress" },
    ],
  },
  {
    title: "Events",
    url: "/dashboard/events",
    icon: Calendar,
    badge: "3",
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Messages", url: "/dashboard/communication/messages" },
      { title: "Email Campaigns", url: "/dashboard/communication/email" },
      { title: "Announcements", url: "/dashboard/communication/announcements" },
    ],
  },
];

const campusesNavItem: NavigationItem = {
  title: "Campuses",
  icon: MapPin,
  url: "/dashboard/campuses",
};

const additionalNavigation: NavigationItem[] = [
  {
    title: "Website",
    icon: Globe,
    items: [
      { title: "Pages", url: "/dashboard/website/pages" },
      { title: "Blog", url: "/dashboard/website/blog" },
      { title: "Media", url: "/dashboard/website/media" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Overview", url: "/dashboard/reports" },
      { title: "Growth Metrics", url: "/dashboard/reports/growth" },
      { title: "Engagement", url: "/dashboard/reports/engagement" },
      { title: "Pathways Analytics", url: "/dashboard/reports/pathways" },
    ],
  },
];

export function DashboardSidebar() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [hasMultipleCampuses, setHasMultipleCampuses] = useState(false);
  const { user } = useAuth();
  const organizationName = user?.organizationName || "Your Organization";

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/profile", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasMultipleCampuses(data.user?.hasMultipleCampuses || false);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      }
    };

    fetchUserSettings();
  }, [user?.id]);

  const navigation = [
    ...baseNavigation,
    ...(hasMultipleCampuses ? [campusesNavItem] : []),
    ...additionalNavigation,
  ];

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar className="border-r border-primary-foreground/10 bg-primary dark:bg-gradient-to-br dark:from-[#6366f1] dark:to-[#312e81]">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-primary">
            <Church className="h-4 w-4 text-primary dark:text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Gatherwise</h2>
            <p className="text-xs text-white/70">{organizationName}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.items ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleItem(item.title)}
                    className="flex w-full items-center justify-between !text-white hover:!bg-white/10 data-[state=open]:!bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 !text-white" />
                      <span className="!text-white">{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 !text-white transition-transform ${
                        openItems.includes(item.title) ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                  {openItems.includes(item.title) && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="!text-white/90 hover:!bg-white/10 hover:!text-white"
                          >
                            <Link href={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  className="!text-white hover:!bg-white/10 data-[active=true]:!bg-white/10"
                >
                  <Link href={item.url!} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 !text-white" />
                    <span className="!text-white">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-white !text-primary"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="!text-white hover:!bg-white/10"
            >
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4 !text-white" />
                <span className="!text-white">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
