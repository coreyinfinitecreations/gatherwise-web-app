"use client";

import { useCampus } from "../contexts/campus-context";

export interface CampusFilterOptions {
  includeCampusData?: boolean;
  includeChurchWideData?: boolean;
}

export function useCampusFilter(options: CampusFilterOptions = {}) {
  const { currentCampus } = useCampus();

  const { includeCampusData = true, includeChurchWideData = false } = options;

  // Generate filter parameters for API calls
  const getFilterParams = () => {
    const params: Record<string, string | boolean> = {};

    if (includeCampusData && currentCampus) {
      params.campusId = currentCampus.id;
    }

    if (includeChurchWideData) {
      params.includeChurchWide = true;
    }

    return params;
  };

  // Filter local data arrays by campus
  const filterByCampus = <T extends { campusId?: string | null }>(
    data: T[]
  ): T[] => {
    if (!currentCampus || !includeCampusData) {
      return data;
    }

    return data.filter((item) => {
      // Include items that belong to current campus
      if (item.campusId === currentCampus.id) {
        return true;
      }

      // Include church-wide items (no specific campus) if enabled
      if (includeChurchWideData && (!item.campusId || item.campusId === null)) {
        return true;
      }

      return false;
    });
  };

  // Get display context for the current campus
  const getDisplayContext = () => ({
    campusName: currentCampus?.name || "All Campuses",
    showingCampusData: includeCampusData && !!currentCampus,
    showingChurchWideData: includeChurchWideData,
  });

  return {
    currentCampus,
    getFilterParams,
    filterByCampus,
    getDisplayContext,
  };
}
