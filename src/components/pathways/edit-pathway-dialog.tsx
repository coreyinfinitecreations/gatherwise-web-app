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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface EditPathwayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathwayId: string;
  onSuccess: () => void;
}

interface PathwayStep {
  id?: string;
  name: string;
  description: string;
  order: number;
}

export function EditPathwayDialog({
  open,
  onOpenChange,
  pathwayId,
  onSuccess,
}: EditPathwayDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<PathwayStep[]>([]);

  useEffect(() => {
    if (open && pathwayId) {
      fetchPathway();
    }
  }, [open, pathwayId]);

  const fetchPathway = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/pathways/${pathwayId}`);
      if (response.ok) {
        const data = await response.json();
        setName(data.pathway.name);
        setDescription(data.pathway.description || "");
        setIsActive(data.pathway.isActive);
        setSteps(
          data.pathway.steps.map((step: any) => ({
            id: step.id,
            name: step.name,
            description: step.description || "",
            order: step.order,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch pathway:", error);
    } finally {
      setFetching(false);
    }
  };

  const addStep = () => {
    const newStep: PathwayStep = {
      name: "",
      description: "",
      order: steps.length + 1,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (
    index: number,
    field: keyof PathwayStep,
    value: string
  ) => {
    setSteps(
      steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validSteps = steps.filter((step) => step.name.trim());

      const response = await fetch(`/api/pathways/${pathwayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          isActive,
          steps: validSteps.map((step, index) => ({
            name: step.name,
            description: step.description,
            order: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pathway");
      }

      toast.success("Pathway updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Update pathway error:", error);
      toast.error("Failed to update pathway. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {fetching ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading pathway...
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Edit Pathway</DialogTitle>
              <DialogDescription>
                Update your pathway details and steps
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Pathway Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-active" className="cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive
                      ? "This pathway is visible and available for enrollment"
                      : "This pathway is hidden and unavailable for enrollment"}
                  </p>
                </div>
                <Switch
                  id="edit-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
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
                      key={step.id || index}
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
                              updateStep(index, "name", e.target.value)
                            }
                            className="flex-1"
                            autoComplete="off"
                          />
                          {steps.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Step description (optional)"
                          value={step.description}
                          onChange={(e) =>
                            updateStep(index, "description", e.target.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
