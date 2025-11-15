"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCampus } from "@/contexts/campus-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { StateSelect } from "@/components/ui/state-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageCropModal } from "@/components/profile/image-crop-modal";
import {
  User,
  Calendar,
  Camera,
  Edit,
  DollarSign,
  Users,
  Route,
  Home,
  Church,
  MapPin,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { availableCampuses } = useCampus();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    campusId: "",
  });

  useEffect(() => {
    if (user?.id) {
      const storedImage = localStorage.getItem(`profileImage_${user.id}`);
      if (storedImage) {
        setProfileImage(storedImage);
      }
    }
  }, [user?.id]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile data");
      }

      const data = await response.json();
      return data.user;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zipCode: profileData.zipCode || "",
        campusId: profileData.campusId || "",
      });
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update profile");
    },
  });

  const handleSave = async () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zipCode: profileData.zipCode || "",
        campusId: profileData.campusId || "",
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleSaveProfileImage = (croppedImage: string) => {
    setProfileImage(croppedImage);
    if (user?.id) {
      localStorage.setItem(`profileImage_${user.id}`, croppedImage);
      window.dispatchEvent(
        new CustomEvent("profileImageChanged", {
          detail: { userId: user.id, image: croppedImage },
        })
      );
    }
    setSuccess("Profile picture updated!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (user?.id) {
      localStorage.removeItem(`profileImage_${user.id}`);
      window.dispatchEvent(
        new CustomEvent("profileImageChanged", {
          detail: { userId: user.id, image: null },
        })
      );
    }
    setSuccess("Profile picture removed");
    setTimeout(() => setSuccess(""), 3000);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-32 w-32">
              {profileImage ? (
                <AvatarImage src={profileImage} alt={user?.name || "Profile"} />
              ) : (
                <AvatarFallback className="text-3xl bg-primary dark:bg-[#312e81] text-white">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Camera className="h-4 w-4" />
              {profileImage ? "Change" : "Add Photo"}
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    {user?.role}
                  </Badge>
                  {user?.organizationName && (
                    <Badge variant="outline" className="gap-1">
                      <Church className="h-3 w-3" />
                      {user.organizationName}
                    </Badge>
                  )}
                  {profileData?.campusId && availableCampuses.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {availableCampuses.find(
                        (c) => c.id === profileData.campusId
                      )?.name || "Home Campus"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>Organization ID: {user?.organizationId || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Information (2/3 width) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal contact details
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">{profileData?.name || "—"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {profileData?.email || "—"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <PhoneInput
                        id="phone"
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData({ ...formData, phone: value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {profileData?.phone || "—"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {profileData?.address || "—"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">{profileData?.city || "—"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    {isEditing ? (
                      <StateSelect
                        value={formData.state}
                        onChange={(value: string) =>
                          setFormData({ ...formData, state: value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {profileData?.state || "—"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    {isEditing ? (
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {profileData?.zipCode || "—"}
                      </p>
                    )}
                  </div>

                  {availableCampuses.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="homeCampus">Home Campus</Label>
                      {isEditing ? (
                        <Select
                          value={formData.campusId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, campusId: value })
                          }
                        >
                          <SelectTrigger id="homeCampus">
                            <SelectValue placeholder="Select a campus" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCampuses.map((campus) => (
                              <SelectItem key={campus.id} value={campus.id}>
                                {campus.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2">
                          {availableCampuses.find(
                            (c) => c.id === profileData?.campusId
                          )?.name || "—"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Other Cards (1/3 width) */}
          <div className="space-y-6">
            {/* Pathways Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Pathway Progress
                </CardTitle>
                <CardDescription>
                  Track your spiritual growth journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Route className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No pathway progress to display
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Household Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Household Members
                </CardTitle>
                <CardDescription>
                  Manage your household and family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No household members added
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Giving Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Giving History
                </CardTitle>
                <CardDescription>
                  View your contribution history and statements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No giving history available
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Crop Modal */}
        <ImageCropModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSave={handleSaveProfileImage}
        />
      </div>
    </DashboardLayout>
  );
}
