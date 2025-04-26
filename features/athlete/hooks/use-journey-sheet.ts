"use client";

import { useJourneySheetStore } from "../store/use-journey-sheet-store";

/**
 * Hook to manage the journey sheet from anywhere in the application
 *
 * @returns Functions to open, close, and manage the journey sheet
 */
export const useJourneySheet = () => {
  const { openSheet, closeSheet, setMode, updateUrlState, clearUrlState } = useJourneySheetStore();

  return {
    /**
     * Opens the journey sheet with the specified journey ID and mode
     */
    openJourneySheet: (journeyId: string | null, mode: "view" | "edit" | "new") => {
      openSheet(journeyId, mode);
    },

    /**
     * Closes the journey sheet and clears URL parameters
     */
    closeJourneySheet: () => {
      closeSheet();
    },

    /**
     * Changes the mode of the journey sheet
     */
    setJourneySheetMode: (mode: "view" | "edit") => {
      setMode(mode);
    },

    /**
     * Updates URL parameters without changing the sheet state
     */
    updateUrlState: (journeyId: string | null, mode: "view" | "edit" | "new" | null) => {
      return updateUrlState(journeyId, mode);
    },

    /**
     * Clears URL parameters without changing the sheet state
     */
    clearUrlState: () => {
      return clearUrlState();
    },
  };
};
