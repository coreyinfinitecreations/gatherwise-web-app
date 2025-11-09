"use client";

import { useState } from "react";
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
import { useCampus, Campus } from "@/contexts/campus-context";
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
                  className="group"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 group-hover:text-white" />
                      <div>
                        <div className="font-medium group-hover:text-white">
                          {campus.name}
                        </div>
                        {campus.description && (
                          <div className="text-xs text-muted-foreground group-hover:text-white/80">
                            {campus.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 group-hover:text-white",
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
