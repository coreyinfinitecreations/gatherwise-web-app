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
  BellOff,
  Search,
  Settings,
  User,
  LogOut,
  Plus,
  Shield,
  Moon,
  Sun,
  Check,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { CampusSelector } from "@/components/campus/campus-selector";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useNotifications } from "@/contexts/notification-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    isMuted,
    toggleMute,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
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
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {isMuted ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary hover:bg-primary text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <DropdownMenuLabel className="p-0">
                  Notifications
                </DropdownMenuLabel>
                <div
                  className={`h-2 w-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  title={
                    connectionStatus === "connected"
                      ? "Connected"
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Disconnected"
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMute();
                  }}
                  className="h-7 text-xs"
                  title={
                    isMuted ? "Unmute notifications" : "Mute notifications"
                  }
                >
                  {isMuted ? (
                    <>
                      <BellOff className="h-3 w-3 mr-1" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Bell className="h-3 w-3 mr-1" />
                      Mute
                    </>
                  )}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllAsRead();
                    }}
                    className="h-7 text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-4 cursor-pointer ${
                      !notification.read ? "bg-muted/50" : ""
                    }`}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">
                            {notification.title}
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu modal={false}>
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
