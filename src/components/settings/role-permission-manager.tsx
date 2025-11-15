"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Plus, Edit, Trash2, Users, Eye } from "lucide-react";

interface Permission {
  resource: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  isSystemRole?: boolean;
}

interface RolePermissionManagerProps {
  userId: string;
  churchId: string;
}

const RESOURCES = [
  { value: "people", label: "People" },
  { value: "events", label: "Events" },
  { value: "life_groups", label: "Life Groups" },
  { value: "pathways", label: "Pathways" },
  { value: "campuses", label: "Campuses" },
  { value: "settings", label: "Settings" },
  { value: "reports", label: "Reports" },
];

const SYSTEM_ROLES: CustomRole[] = [
  {
    id: "system-super-admin",
    name: "Super Admin",
    description: "Full system access with all permissions",
    isSystemRole: true,
    permissions: RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    })),
  },
  {
    id: "system-church-admin",
    name: "Church Admin",
    description: "Church-wide administrative access",
    isSystemRole: true,
    permissions: RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: true,
      canCreate: resource.value !== "settings",
      canUpdate: resource.value !== "settings",
      canDelete: resource.value !== "settings",
    })),
  },
  {
    id: "system-pastor",
    name: "Pastor",
    description: "Pastoral staff with broad access",
    isSystemRole: true,
    permissions: RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: true,
      canCreate: ["members", "events", "life_groups"].includes(resource.value),
      canUpdate: ["members", "events", "life_groups"].includes(resource.value),
      canDelete: false,
    })),
  },
  {
    id: "system-leader",
    name: "Leader",
    description: "Ministry leaders with limited permissions",
    isSystemRole: true,
    permissions: RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: ["members", "events", "life_groups"].includes(resource.value),
      canCreate: ["events", "life_groups"].includes(resource.value),
      canUpdate: ["events", "life_groups"].includes(resource.value),
      canDelete: false,
    })),
  },
  {
    id: "system-member",
    name: "Member",
    description: "Basic member access",
    isSystemRole: true,
    permissions: RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: resource.value === "events",
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    })),
  },
];

export function RolePermissionManager({
  userId,
  churchId,
}: RolePermissionManagerProps) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(
    RESOURCES.map((resource) => ({
      resource: resource.value,
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    }))
  );

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles", userId],
    queryFn: async () => {
      const response = await fetch("/api/roles", {
        headers: {
          "x-user-id": userId,
          "x-church-id": churchId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      return response.json();
    },
  });

  const mergedSystemRoles = SYSTEM_ROLES.map((systemRole) => {
    const dbRole = rolesData?.roles?.find(
      (r: any) => r.name === systemRole.name && r.isSystemRole
    );
    return dbRole || systemRole;
  });

  const customRolesOnly =
    rolesData?.roles?.filter((r: any) => !r.isSystemRole) || [];

  const createRoleMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      permissions: Permission[];
    }) => {
      if (!churchId) {
        throw new Error("Church ID not found. Please refresh and try again.");
      }

      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-church-id": churchId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", userId] });
      toast.success("Role created successfully!");
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      description: string;
      permissions: Permission[];
    }) => {
      const response = await fetch(`/api/roles/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", userId] });
      toast.success("Role updated successfully!");
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", userId] });
      toast.success("Role deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setPermissions(
      RESOURCES.map((resource) => ({
        resource: resource.value,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      }))
    );
    setSelectedRole(null);
  };

  const handleViewRole = (role: CustomRole) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");

    const updatedPermissions = RESOURCES.map((resource) => {
      const existingPerm = role.permissions.find(
        (p: any) => p.resource === resource.value
      );
      return (
        existingPerm || {
          resource: resource.value,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        }
      );
    });
    setPermissions(updatedPermissions);
    setIsViewDialogOpen(true);
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    createRoleMutation.mutate({
      name: roleName,
      description: roleDescription,
      permissions: permissions.filter(
        (p) => p.canRead || p.canCreate || p.canUpdate || p.canDelete
      ),
    });
  };

  const handleEditRole = (role: CustomRole) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");

    const updatedPermissions = RESOURCES.map((resource) => {
      const existingPerm = role.permissions.find(
        (p: any) => p.resource === resource.value
      );
      return (
        existingPerm || {
          resource: resource.value,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        }
      );
    });
    setPermissions(updatedPermissions);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (selectedRole.isSystemRole) {
      const systemRoleData = {
        name: roleName,
        description: roleDescription,
        permissions: permissions,
        isSystemRole: true,
      };

      try {
        const response = await fetch("/api/roles/system", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
            "x-church-id": churchId,
          },
          body: JSON.stringify(systemRoleData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update system role");
        }

        await queryClient.invalidateQueries({ queryKey: ["roles", userId] });
        toast.success("System role updated successfully!");
        setIsEditDialogOpen(false);
        resetForm();
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      updateRoleMutation.mutate({
        id: selectedRole.id,
        name: roleName,
        description: roleDescription,
        permissions: permissions.filter(
          (p) => p.canRead || p.canCreate || p.canUpdate || p.canDelete
        ),
      });
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const updatePermission = (
    resourceValue: string,
    field: keyof Permission,
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.resource === resourceValue ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permission Management
            </CardTitle>
            <CardDescription className="mt-2">
              Create custom roles and manage permissions for your team
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a custom role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Volunteer Coordinator"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role's responsibilities..."
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead className="text-center">Read</TableHead>
                          <TableHead className="text-center">Create</TableHead>
                          <TableHead className="text-center">Update</TableHead>
                          <TableHead className="text-center">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {RESOURCES.map((resource) => {
                          const perm = permissions.find(
                            (p) => p.resource === resource.value
                          );
                          return (
                            <TableRow key={resource.value}>
                              <TableCell className="font-medium">
                                {resource.label}
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={perm?.canRead || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(
                                      resource.value,
                                      "canRead",
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={perm?.canCreate || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(
                                      resource.value,
                                      "canCreate",
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={perm?.canUpdate || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(
                                      resource.value,
                                      "canUpdate",
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={perm?.canDelete || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(
                                      resource.value,
                                      "canDelete",
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p>Loading roles...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mergedSystemRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{role.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                      System
                    </span>
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
                {role.name === "Super Admin" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRole(role)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            ))}

            {customRolesOnly && customRolesOnly.length > 0 && (
              <>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Custom Roles
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {customRolesOnly.map((role: CustomRole) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">
                        {role.name}
                      </h3>
                      {role.description && (
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={deleteRoleMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role name, description, and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Create</TableHead>
                        <TableHead className="text-center">Update</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RESOURCES.map((resource) => {
                        const perm = permissions.find(
                          (p) => p.resource === resource.value
                        );
                        return (
                          <TableRow key={resource.value}>
                            <TableCell className="font-medium">
                              {resource.label}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canRead || false}
                                onCheckedChange={(checked) =>
                                  updatePermission(
                                    resource.value,
                                    "canRead",
                                    checked as boolean
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canCreate || false}
                                onCheckedChange={(checked) =>
                                  updatePermission(
                                    resource.value,
                                    "canCreate",
                                    checked as boolean
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canUpdate || false}
                                onCheckedChange={(checked) =>
                                  updatePermission(
                                    resource.value,
                                    "canUpdate",
                                    checked as boolean
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canDelete || false}
                                onCheckedChange={(checked) =>
                                  updatePermission(
                                    resource.value,
                                    "canDelete",
                                    checked as boolean
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Role Dialog (Read-only) */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {roleName}
                {selectedRole?.isSystemRole && (
                  <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                    System Role
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                {roleDescription || "View role permissions"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Create</TableHead>
                        <TableHead className="text-center">Update</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RESOURCES.map((resource) => {
                        const perm = permissions.find(
                          (p) => p.resource === resource.value
                        );
                        return (
                          <TableRow key={resource.value}>
                            <TableCell className="font-medium">
                              {resource.label}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canRead || false}
                                disabled
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canCreate || false}
                                disabled
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canUpdate || false}
                                disabled
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perm?.canDelete || false}
                                disabled
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  resetForm();
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
