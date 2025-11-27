"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface EnrollMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathwayId: string;
  pathwayName: string;
  onSuccess: () => void;
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
}

export function EnrollMembersDialog({
  open,
  onOpenChange,
  pathwayId,
  pathwayName,
  onSuccess,
}: EnrollMembersDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchMembers();
      setSelectedMembers(new Set());
      setSearchQuery("");
    }
  }, [open]);

  const fetchMembers = async () => {
    try {
      setFetching(true);
      const params = new URLSearchParams();
      if (user?.organizationId) {
        params.append("churchId", user.organizationId);
      }

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load members");
    } finally {
      setFetching(false);
    }
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const toggleAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleEnroll = async () => {
    if (selectedMembers.size === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/pathways/${pathwayId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selectedMembers),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll members");
      }

      const data = await response.json();

      if (data.skipped > 0) {
        toast.success(
          `Enrolled ${data.enrollments.length} member(s). ${data.skipped} already enrolled.`
        );
      } else {
        toast.success(
          `Successfully enrolled ${data.enrollments.length} member(s)`
        );
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Enroll error:", error);
      toast.error("Failed to enroll members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enroll Members</DialogTitle>
          <DialogDescription>
            Select members to enroll in &quot;{pathwayName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoComplete="off"
            />
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No members found matching your search"
                : "No members available"}
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedMembers.size === filteredMembers.length &&
                    filteredMembers.length > 0
                  }
                  onCheckedChange={toggleAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All ({selectedMembers.size} selected)
                </label>
              </div>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleMember(member.id)}
                    >
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <label
                        htmlFor={member.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          {member.name || "Unnamed User"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={loading || selectedMembers.size === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              `Enroll ${selectedMembers.size} Member${
                selectedMembers.size !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
