"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  switchCampus: (campusId: string) => void;
  isLoading: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load campuses from API
    loadCampuses();

    // Load saved campus preference from localStorage
    const savedCampusId = localStorage.getItem("selectedCampusId");
    if (savedCampusId) {
      loadCampus(savedCampusId);
    }
  }, []);

  const loadCampuses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCampuses: Campus[] = [
        {
          id: "1",
          name: "Main Campus",
          description: "Our original location",
          address: "123 Main St, City, State",
          churchId: "church-1",
          isActive: true,
        },
        {
          id: "2",
          name: "North Campus",
          description: "North side location",
          address: "456 North Ave, City, State",
          churchId: "church-1",
          isActive: true,
        },
        {
          id: "3",
          name: "Online Campus",
          description: "Virtual campus for online attendees",
          churchId: "church-1",
          isActive: true,
        },
      ];

      setAvailableCampuses(mockCampuses);

      // Set default campus if none selected
      if (!currentCampus && mockCampuses.length > 0) {
        setCurrentCampus(mockCampuses[0]);
      }
    } catch (error) {
      console.error("Error loading campuses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampus = async (campusId: string) => {
    const campus = availableCampuses.find((c) => c.id === campusId);
    if (campus) {
      setCurrentCampus(campus);
    }
  };

  const switchCampus = (campusId: string) => {
    const campus = availableCampuses.find((c) => c.id === campusId);
    if (campus) {
      setCurrentCampus(campus);
      localStorage.setItem("selectedCampusId", campusId);

      // Refresh page data for new campus
      window.location.reload();
    }
  };

  return (
    <CampusContext.Provider
      value={{
        currentCampus,
        availableCampuses,
        switchCampus,
        isLoading,
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
