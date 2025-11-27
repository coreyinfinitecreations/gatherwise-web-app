"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { CreatePathwayDialog } from "@/components/pathways/create-pathway-dialog";
import { EditPathwayDialog } from "@/components/pathways/edit-pathway-dialog";
import { EnrollMembersDialog } from "@/components/pathways/enroll-members-dialog";
import { ManageEnrollmentsDialog } from "@/components/pathways/manage-enrollments-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreVertical,
  Users,
  Clock,
  CheckCircle,
  Route,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "react-toastify";

export default function PathwaysPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [manageEnrollmentsOpen, setManageEnrollmentsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);
  const [selectedPathwayName, setSelectedPathwayName] = useState<string>("");
  const [pathwayToDelete, setPathwayToDelete] = useState<{id: string, name: string} | null>(null);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (user?.organizationId) {
        params.append("churchId", user.organizationId);
      }
      const response = await fetch(`/api/pathways?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched pathways:', data.pathways?.length, 'pathways');
        setPathways(data.pathways || []);
        
        const enrolled = data.pathways?.reduce((sum: number, p: any) => sum + (p._count?.progress || 0), 0) || 0;
        const completed = data.pathways?.reduce((sum: number, p: any) => {
          return sum + (p.progress?.filter((prog: any) => prog.completedAt)?.length || 0);
        }, 0) || 0;
        
        setTotalEnrolled(enrolled);
        setTotalCompleted(completed);
        
        return data.pathways || [];
      }
    } catch (error) {
      console.error("Failed to fetch pathways:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      fetchPathways();
    }
  }, [user?.organizationId]);

  const handleEditPathway = (pathwayId: string) => {
    setSelectedPathwayId(pathwayId);
    setEditDialogOpen(true);
  };

  const handleViewAnalytics = (pathwayId: string) => {
    router.push(`/dashboard/pathways/${pathwayId}/analytics`);
  };

  const handleManageSteps = (pathwayId: string) => {
    setSelectedPathwayId(pathwayId);
    setEditDialogOpen(true);
  };

  const handleDuplicate = async (pathwayId: string) => {
    try {
      console.log('Duplicating pathway:', pathwayId);
      const response = await fetch(`/api/pathways/${pathwayId}/duplicate`, {
        method: "POST",
      });

      console.log('Duplicate response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Duplicate result:', result);
        console.log('Fetching pathways after duplicate...');
        const updatedPathways = await fetchPathways();
        console.log('Pathways refetched, new count:', updatedPathways?.length);
        toast.success("Pathway duplicated successfully");
      } else {
        const errorData = await response.json();
        console.error('Duplicate error response:', errorData);
        throw new Error(errorData.error || "Failed to duplicate");
      }
    } catch (error: any) {
      console.error("Duplicate error:", error);
      toast.error(error.message || "Failed to duplicate pathway. Please try again.");
    }
  };

  const handleDeleteClick = (pathwayId: string, pathwayName: string) => {
    setPathwayToDelete({ id: pathwayId, name: pathwayName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pathwayToDelete) return;

    try {
      const response = await fetch(`/api/pathways/${pathwayToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPathways();
        toast.success("Pathway deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete pathway. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setPathwayToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pathways</h1>
            <p className="text-muted-foreground">
              Create and manage discipleship journeys for your church community
            </p>
          </div>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Pathway
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Pathways
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pathways.length}</div>
              <p className="text-xs text-muted-foreground">total pathways</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrolled
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrolled}</div>
              <p className="text-xs text-muted-foreground">members enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground">
                pathways completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">no data yet</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pathways" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pathways">All Pathways</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* All Pathways Tab */}
          <TabsContent value="pathways">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading pathways...</p>
                </CardContent>
              </Card>
            ) : pathways.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Route className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No pathways yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first pathway to start guiding members through
                    their spiritual journey
                  </p>
                  <Button
                    className="gap-2"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Pathway
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pathways.map((pathway: any) => (
                  <Card key={pathway.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <div>
                            <CardTitle className="text-lg">
                              {pathway.name}
                            </CardTitle>
                            <CardDescription>
                              {pathway.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPathwayId(pathway.id);
                              setSelectedPathwayName(pathway.name);
                              setEnrollDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Enroll Members
                          </Button>
                          <Badge variant="default">
                            {pathway.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditPathway(pathway.id)}
                              >
                                Edit Pathway
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewAnalytics(pathway.id)}
                              >
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleManageSteps(pathway.id)}
                              >
                                Manage Steps
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPathwayId(pathway.id);
                                  setSelectedPathwayName(pathway.name);
                                  setManageEnrollmentsOpen(true);
                                }}
                              >
                                Manage Enrollments
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(pathway.id)}
                              >
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(pathway.id, pathway.name)}
                                className="text-destructive focus:text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {pathway.churchId ? "Church-wide" : "Campus-specific"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No progress data yet
                </h3>
                <p className="text-muted-foreground">
                  Progress tracking will appear here once members enroll in
                  pathways
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No analytics data yet
                </h3>
                <p className="text-muted-foreground">
                  Analytics will appear here once you have pathway activity
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreatePathwayDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchPathways}
      />

      {selectedPathwayId && (
        <EditPathwayDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          pathwayId={selectedPathwayId}
          onSuccess={fetchPathways}
        />
      )}

      {selectedPathwayId && (
        <EnrollMembersDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          pathwayId={selectedPathwayId}
          pathwayName={selectedPathwayName}
          onSuccess={fetchPathways}
        />
      )}

      {selectedPathwayId && (
        <ManageEnrollmentsDialog
          open={manageEnrollmentsOpen}
          onOpenChange={setManageEnrollmentsOpen}
          pathwayId={selectedPathwayId}
          pathwayName={selectedPathwayName}
          onSuccess={fetchPathways}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the pathway &quot;{pathwayToDelete?.name}&quot; and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
