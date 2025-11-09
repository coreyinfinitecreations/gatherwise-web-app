"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { useQueryClient } from "@tanstack/react-query";

export interface Campus {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  churchId: string;
  isActive: boolean;
}

interface CampusContextType {
  currentCampus: Campus | null;
  availableCampuses: Campus[];
  switchCampus: (campusId: string) => Promise<void>;
  isLoading: boolean;
  refetchCampuses: () => Promise<void>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCampuses = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/campuses", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campuses");
      }

      const data = await response.json();
      setAvailableCampuses(data.campuses);

      if (user.campusId) {
        const userCampus = data.campuses.find(
          (c: Campus) => c.id === user.campusId
        );
        setCurrentCampus(userCampus || data.campuses[0] || null);
      } else if (data.campuses.length > 0) {
        setCurrentCampus(data.campuses[0]);
      }
    } catch (error) {
      console.error("Error loading campuses:", error);
      setAvailableCampuses([]);
      setCurrentCampus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampuses();
  }, [user?.id]);

  const switchCampus = async (campusId: string) => {
    if (!user?.id) return;

    const campus = availableCampuses.find((c) => c.id === campusId);
    if (!campus) return;

    const previousCampus = currentCampus;
    setCurrentCampus(campus);

    try {
      const response = await fetch("/api/user/campus", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ campusId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campus");
      }

      await queryClient.invalidateQueries();
    } catch (error) {
      console.error("Error switching campus:", error);
      setCurrentCampus(previousCampus);
    }
  };

  const refetchCampuses = async () => {
    setIsLoading(true);
    await loadCampuses();
  };

  return (
    <CampusContext.Provider
      value={{
        currentCampus,
        availableCampuses,
        switchCampus,
        isLoading,
        refetchCampuses,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error("useCampus must be used within a CampusProvider");
  }
  return context;
}
