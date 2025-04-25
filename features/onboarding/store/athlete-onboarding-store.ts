import type { AthleteOnboardingFormValues } from "@/features/onboarding/athlete-onboarding-validator";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Initial state matches the form schema
const initialState: AthleteOnboardingFormValues = {
  basicInfo: {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: new Date(),
    gender: "prefer-not-to-say",
    displayName: "",
    profileImage: null,
    coverPhoto: null,
    location: "",
    profileImageUrl: "",
    coverPhotoUrl: "",
  },
  sportsActivity: {
    primaryActivity1: {
      activity: "",
      experienceLevel: "beginner",
    },
    fitnessLevel: "beginner",
  },
  additionalInfo: {},
};

interface AthleteOnboardingState extends AthleteOnboardingFormValues {
  // Add state management actions
  currentStepIndex: number; // Track the current step index
  updateBasicInfo: (data: Partial<AthleteOnboardingFormValues["basicInfo"]>) => void;
  updateSportsActivity: (data: Partial<AthleteOnboardingFormValues["sportsActivity"]>) => void;
  updateAdditionalInfo: (data: Partial<AthleteOnboardingFormValues["additionalInfo"]>) => void;
  resetForm: () => void;
  getCurrentStepIndex: () => number;
  setCurrentStepIndex: (index: number) => void;
}

export const useAthleteOnboardingStore = create<AthleteOnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Track the current step index for persistence
      currentStepIndex: 0,

      // Update functions for each step
      updateBasicInfo: (data) =>
        set((state) => ({
          basicInfo: {
            ...state.basicInfo,
            ...data,
            profileImageUrl: data.profileImageUrl ?? state.basicInfo.profileImageUrl,
            coverPhotoUrl: data.coverPhotoUrl ?? state.basicInfo.coverPhotoUrl,
          },
        })),

      updateSportsActivity: (data) =>
        set((state) => ({
          sportsActivity: {
            ...state.sportsActivity,
            ...data,
          },
        })),

      updateAdditionalInfo: (data) =>
        set((state) => ({
          additionalInfo: {
            ...state.additionalInfo,
            ...data,
          },
        })),

      // Reset the form to initial state
      resetForm: () => set({ ...initialState, currentStepIndex: 0 }),

      // Get the current step index
      getCurrentStepIndex: () => get().currentStepIndex,

      // Set the current step index
      setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
    }),
    {
      name: "athlete-onboarding",
      // Custom storage serialization to handle complex objects like Date and File
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (item) {
            const parsed = JSON.parse(item);

            // Restore dates (basic info date fields)
            if (parsed.state.basicInfo?.dateOfBirth) {
              parsed.state.basicInfo.dateOfBirth = new Date(parsed.state.basicInfo.dateOfBirth);
            }

            // We can't store File objects, so they'll be null when restoring
            // That's fine as we'll handle file uploads separately
            return parsed;
          }
          return null;
        },
        setItem: (name, value) => {
          const serialized = JSON.stringify(value);
          localStorage.setItem(name, serialized);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
