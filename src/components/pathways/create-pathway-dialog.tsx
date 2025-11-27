"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useCampus } from "@/contexts/campus-context";
import { toast } from "react-toastify";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface CreatePathwayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PathwayStep {
  id: string;
  name: string;
  description: string;
  order: number;
}

export function CreatePathwayDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePathwayDialogProps) {
  const { user } = useAuth();
  const { currentCampus } = useCampus();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<"church" | "campus">("church");
  const [steps, setSteps] = useState<PathwayStep[]>([
    { id: "1", name: "", description: "", order: 1 },
  ]);

  const addStep = () => {
    const newStep: PathwayStep = {
      id: Date.now().toString(),
      name: "",
      description: "",
      order: steps.length + 1,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof PathwayStep, value: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    setLoading(true);

    try {
      const validSteps = steps.filter((step) => step.name.trim());

      const response = await fetch("/api/pathways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          churchId: user.organizationId,
          campusId: scope === "campus" ? currentCampus?.id : null,
          steps: validSteps.map((step, index) => ({
            name: step.name,
            description: step.description,
            order: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create pathway");
      }

      setName("");
      setDescription("");
      setScope("church");
      setSteps([{ id: "1", name: "", description: "", order: 1 }]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Create pathway error:", error);
      toast.error("Failed to create pathway. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Create New Pathway</DialogTitle>
            <DialogDescription>
              Design a discipleship journey for your church community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Pathway Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Newcomer Pathway, Membership Class"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of this pathway..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <div data-1p-ignore data-lpignore="true">
                <Select
                  value={scope}
                  onValueChange={(value: "church" | "campus") =>
                    setScope(value)
                  }
                >
                  <SelectTrigger id="scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="church">Church-wide</SelectItem>
                    <SelectItem value="campus">
                      Campus-specific ({currentCampus?.name || "Current campus"}
                      )
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {scope === "church"
                  ? "Available to all campuses in your organization"
                  : "Only available to members of the selected campus"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pathway Steps</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex gap-3 p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center pt-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="Step name"
                          value={step.name}
                          onChange={(e) =>
                            updateStep(step.id, "name", e.target.value)
                          }
                          className="flex-1"
                          autoComplete="off"
                        />
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Step description (optional)"
                        value={step.description}
                        onChange={(e) =>
                          updateStep(step.id, "description", e.target.value)
                        }
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Steps will guide members through the pathway in order. You can
                add more details and requirements later.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Pathway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
