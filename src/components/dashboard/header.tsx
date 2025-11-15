"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Plus,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { CampusSelector } from "@/components/campus/campus-selector";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [hasMultipleCampuses, setHasMultipleCampuses] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  // Load profile image from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedImage = localStorage.getItem(`profileImage_${user.id}`);
      setProfileImage(storedImage);
    }
  }, [user?.id]);

  // Listen for profile image changes
  useEffect(() => {
    const handleProfileImageChange = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        setProfileImage(event.detail.image);
      }
    };

    window.addEventListener(
      "profileImageChanged",
      handleProfileImageChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "profileImageChanged",
        handleProfileImageChange as EventListener
      );
    };
  }, [user?.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 w-full">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />

        {/* Campus Selector - Only show if user has multiple campuses */}
        {hasMultipleCampuses && <CampusSelector />}

        {/* Search */}
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members, groups, pathways..."
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Quick Actions */}
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-4">
              <div className="font-medium">New member joined</div>
              <div className="text-sm text-muted-foreground">
                Sarah Johnson completed the visitor pathway
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                2 hours ago
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-4">
              <div className="font-medium">Pathway milestone reached</div>
              <div className="text-sm text-muted-foreground">
                5 members completed &quot;Foundations of Faith&quot;
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                1 day ago
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-4">
              <div className="font-medium">Life group update needed</div>
              <div className="text-sm text-muted-foreground">
                Young Adults group requires attendance update
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                2 days ago
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={user?.name || "User"} />
                ) : (
                  <AvatarFallback className="bg-primary dark:bg-[#312e81] text-white">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@church.org"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Secure Session</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer group">
                <User className="mr-2 h-4 w-4 group-hover:text-white" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer group">
                <Settings className="mr-2 h-4 w-4 group-hover:text-white" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="group">
              <LogOut className="mr-2 h-4 w-4 group-hover:text-white" />
              <span>Sign Out Securely</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
