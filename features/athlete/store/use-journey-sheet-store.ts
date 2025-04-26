"use client";
import { create } from "zustand";

type JourneySheetMode = "view" | "edit";

interface JourneySheetState {
  isOpen: boolean;
  journeyId: string | null;
  isNewJourney: boolean;
  mode: JourneySheetMode;

  // Actions
  openSheet: (journeyId: string | null, mode: JourneySheetMode | "new") => void;
  closeSheet: () => void;
  setMode: (mode: JourneySheetMode) => void;

  // URL state management
  updateUrlState: (
    journeyId: string | null,
    mode: JourneySheetMode | "new" | null
  ) => Promise<void>;
  clearUrlState: () => Promise<void>;

  // Internal state for nuqs integration
  setJourneyIdParam: ((value: string | null) => Promise<URLSearchParams>) | null;
  setModeParam: ((value: string | null) => Promise<URLSearchParams>) | null;
  registerQueryStateSetters: (
    setJourneyId: (value: string | null) => Promise<URLSearchParams>,
    setMode: (value: string | null) => Promise<URLSearchParams>
  ) => void;
}

export const useJourneySheetStore = create<JourneySheetState>((set, get) => ({
  isOpen: false,
  journeyId: null,
  isNewJourney: false,
  mode: "view",

  // Initialize setters as null - they will be set by the component using nuqs
  setJourneyIdParam: null,
  setModeParam: null,

  // Register the nuqs setters
  registerQueryStateSetters: (setJourneyId, setMode) => {
    set({
      setJourneyIdParam: setJourneyId,
      setModeParam: setMode,
    });
  },

  openSheet: (journeyId, mode) => {
    const { setJourneyIdParam, setModeParam } = get();

    if (mode === "new") {
      set({
        isOpen: true,
        journeyId: null,
        isNewJourney: true,
        mode: "edit", // New journeys are always in edit mode
      });

      // Update URL parameters using nuqs
      if (setJourneyIdParam && setModeParam) {
        setJourneyIdParam(null);
        setModeParam("new");
      }
    } else {
      set({
        isOpen: true,
        journeyId,
        isNewJourney: false,
        mode: mode as JourneySheetMode,
      });

      // Update URL parameters using nuqs
      if (setJourneyIdParam && setModeParam) {
        if (journeyId) {
          setJourneyIdParam(journeyId);
        }
        setModeParam(mode);
      }
    }
  },

  closeSheet: () => {
    const { setJourneyIdParam, setModeParam } = get();

    set({
      isOpen: false,
    });

    // Clear URL parameters using nuqs
    if (setJourneyIdParam && setModeParam) {
      setJourneyIdParam(null);
      setModeParam(null);
    }
  },

  setMode: (mode) => {
    const { setModeParam } = get();

    set({ mode });

    // Update URL parameter using nuqs
    if (setModeParam) {
      setModeParam(mode);
    }
  },

  // Explicit methods for URL state management
  updateUrlState: async (journeyId, mode) => {
    const { setJourneyIdParam, setModeParam } = get();

    if (setJourneyIdParam && setModeParam) {
      await setJourneyIdParam(journeyId);
      await setModeParam(mode === "new" ? "new" : mode);
    }

    return Promise.resolve();
  },

  clearUrlState: async () => {
    const { setJourneyIdParam, setModeParam } = get();

    if (setJourneyIdParam && setModeParam) {
      await setJourneyIdParam(null);
      await setModeParam(null);
    }

    return Promise.resolve();
  },
}));
