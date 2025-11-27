"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "react-toastify";
import { Search, Loader2, Trash2, Calendar } from "lucide-react";

interface ManageEnrollmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathwayId: string;
  pathwayName: string;
  onSuccess: () => void;
}

interface Enrollment {
  id: string;
  userId: string;
  startedAt: string;
  completedAt: string | null;
  currentStep: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  completions: any[];
}

export function ManageEnrollmentsDialog({
  open,
  onOpenChange,
  pathwayId,
  pathwayName,
  onSuccess,
}: ManageEnrollmentsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<{
    id: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchEnrollments();
      setSearchQuery("");
    }
  }, [open, pathwayId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pathways/${pathwayId}/enroll`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollClick = (enrollmentId: string, userName: string) => {
    setEnrollmentToDelete({ id: enrollmentId, userName });
    setDeleteDialogOpen(true);
  };

  const handleUnenrollConfirm = async () => {
    if (!enrollmentToDelete) return;

    try {
      const response = await fetch(
        `/api/pathways/${pathwayId}/enroll/${enrollmentToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unenroll member");
      }

      toast.success("Member unenrolled successfully");
      fetchEnrollments();
      onSuccess();
    } catch (error) {
      console.error("Unenroll error:", error);
      toast.error("Failed to unenroll member. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const query = searchQuery.toLowerCase();
    return (
      enrollment.user.name?.toLowerCase().includes(query) ||
      enrollment.user.email?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProgressPercentage = (enrollment: Enrollment) => {
    if (enrollment.completedAt) return 100;
    return Math.round(
      (enrollment.completions.length / enrollment.currentStep) * 100
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Enrollments</DialogTitle>
            <DialogDescription>
              View and manage members enrolled in &quot;{pathwayName}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredEnrollments.length} member
                {filteredEnrollments.length !== 1 ? "s" : ""} enrolled
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery
                  ? "No members found matching your search"
                  : "No members enrolled yet"}
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">
                            {enrollment.user.name || "Unnamed User"}
                          </div>
                          {enrollment.completedAt && (
                            <Badge variant="default" className="bg-green-600">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.user.email}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started {formatDate(enrollment.startedAt)}
                          </div>
                          {enrollment.completedAt && (
                            <div>
                              Completed {formatDate(enrollment.completedAt)}
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1 bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${getProgressPercentage(
                                    enrollment
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground">
                              Step {enrollment.currentStep}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleUnenrollClick(
                            enrollment.id,
                            enrollment.user.name || "this member"
                          )
                        }
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {enrollmentToDelete?.userName} from this pathway
              and delete all their progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenrollConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
