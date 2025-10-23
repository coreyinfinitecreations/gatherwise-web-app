"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Lightweight local fallback for Campus context — replace with your real context implementation if available
type Campus = {
  id: string;
  name: string;
  description?: string | null;
};

function useCampus() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([]);
  const [currentCampus, setCurrentCampus] = useState<Campus | undefined>(
    undefined
  );

  useEffect(() => {
    // Initialize with a default campus; replace this with real data fetching or context logic.
    const defaultCampuses: Campus[] = [
      { id: "main", name: "Main Campus", description: undefined },
    ];
    setAvailableCampuses(defaultCampuses);
    setCurrentCampus(defaultCampuses[0]);
    setIsLoading(false);
  }, []);

  const switchCampus = (id: string) => {
    const campus = availableCampuses.find((c) => c.id === id);
    if (campus) {
      setCurrentCampus(campus);
    }
  };

  return { currentCampus, availableCampuses, switchCampus, isLoading };
}
import { cn } from "@/lib/utils";

export function CampusSelector() {
  const [open, setOpen] = useState(false);
  const { currentCampus, availableCampuses, switchCampus, isLoading } =
    useCampus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (availableCampuses.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {currentCampus?.name || "No Campus"}
        </span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {currentCampus?.name || "Select campus"}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search campuses..." />
          <CommandList>
            <CommandEmpty>No campus found.</CommandEmpty>
            <CommandGroup>
              {availableCampuses.map((campus: Campus) => (
                <CommandItem
                  key={campus.id}
                  value={campus.name}
                  onSelect={() => {
                    switchCampus(campus.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{campus.name}</div>
                        {campus.description && (
                          <div className="text-xs text-muted-foreground">
                            {campus.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentCampus?.id === campus.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
