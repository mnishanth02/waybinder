"use client";
import { AthleteNotFoundError } from "@/lib/errors/athlete-error";
import type {
  AthleteOnboardingFormValues,
  AthleteUpdateFormValues,
} from "@/lib/validations/athlete-onboarding";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createAthlete,
  deleteAthlete,
  getAthleteById,
  getAthleteByUniqueId,
  getAthletes,
  getMyAthleteProfile,
  updateAthlete,
} from "../api/athlete-api";
import { athleteKeys } from "./query-keys";

/**
 * Utility function to transform a flat athlete profile from the API
 * back into the nested form structure used by the UI
 *
 * @param flatData The flat data structure from the API
 * @returns Nested form structure needed by the UI components
 */
// biome-ignore lint/suspicious/noExplicitAny: Needs to handle unknown API response structure
export const transformFlatToNested = (flatData: any): AthleteOnboardingFormValues => {
  return {
    basicInfo: {
      firstName: flatData.firstName,
      lastName: flatData.lastName,
      email: flatData.email,
      dateOfBirth: flatData.dateOfBirth ? new Date(flatData.dateOfBirth) : undefined,
      gender: flatData.gender,
      displayName: flatData.displayName ?? undefined,
      location: flatData.location ?? undefined,
      profileImageUrl: flatData.profileImageUrl ?? undefined,
      coverPhotoUrl: flatData.coverPhotoUrl ?? undefined,
      // profileImage and coverPhoto are handled separately (file uploads)
      profileImage: undefined,
      coverPhoto: undefined,
    },
    sportsActivity: {
      primaryActivity1: flatData.primaryActivity1,
      primaryActivity2: flatData.primaryActivity2 ?? undefined,
      primaryActivity3: flatData.primaryActivity3 ?? undefined,
      fitnessLevel: flatData.fitnessLevel,
      height: flatData.height ?? undefined,
      weight: flatData.weight ?? undefined,
    },
    additionalInfo: {
      bio: flatData.bio ?? undefined,
      goals: flatData.goals ?? undefined,
      sponsors: flatData.sponsors ?? undefined,
      websiteURLs: flatData.websiteURLs ?? undefined,
      stravaLinks: flatData.stravaLinks ?? undefined,
      instagramLinks: flatData.instagramLinks ?? undefined,
      facebookLinks: flatData.facebookLinks ?? undefined,
      twitterLinks: flatData.twitterLinks ?? undefined,
      otherSocialLinks: flatData.otherSocialLinks ?? undefined,
      youtubeURLs: flatData.youtubeURLs ?? undefined,
      emergencyContact: flatData.emergencyContact ?? undefined,
      allergies: flatData.allergies ?? undefined,
      medicalConditions: flatData.medicalConditions ?? undefined,
      medications: flatData.medications ?? undefined,
      bloodGroup: flatData.bloodGroup ?? undefined,
      privacySettings: flatData.privacySettings ?? undefined,
      communicationPreferences: flatData.communicationPreferences ?? undefined,
    },
  };
};

/**
 * Hook to fetch all athletes
 * @returns Query result with athletes data, loading and error states
 */
export const useGetAthletes = () => {
  return useQuery({
    queryKey: athleteKeys.lists(),
    queryFn: () => getAthletes(),
  });
};

/**
 * Hook to fetch a single athlete by ID
 * @param id The athlete ID to fetch
 * @returns Query result with athlete data, loading and error states
 */
export const useGetAthleteById = (id: string) => {
  return useQuery({
    queryKey: [athleteKeys.detail(id)],
    queryFn: () => getAthleteById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch an athlete by unique ID
 * @param id The unique ID to fetch
 * @returns Query result with athlete data, loading and error states
 */
export const useGetAthleteByUniqueId = (id: string) => {
  return useQuery({
    queryKey: [athleteKeys.unique(id)],
    queryFn: () => getAthleteByUniqueId(id),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      // Don't retry for AthleteNotFoundError
      if (error instanceof AthleteNotFoundError) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });
};

/**
 * Hook to fetch the current user's athlete profile
 * @returns Query result with athlete data, loading and error states
 */
export const useGetMyAthleteProfile = () => {
  return useQuery({
    queryKey: athleteKeys.me(),
    queryFn: getMyAthleteProfile,
  });
};

/**
 * Hook to create a new athlete profile
 * @param options Optional configuration for the mutation
 * @returns Mutation for creating athlete profiles with session-based user ID
 */
export const useCreateAthlete = (options?: {
  onSuccess?: (data: unknown) => void;
  redirectPath?: string;
  transformResponse?: boolean; // Option to transform the response back to form structure
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutationFn = (data: AthleteOnboardingFormValues) => {
    return createAthlete(data);
  };

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success("Athlete profile created successfully");
      queryClient.invalidateQueries({ queryKey: athleteKeys.all });

      if (options?.onSuccess) {
        const callbackData = options.transformResponse ? transformFlatToNested(data) : data;
        options.onSuccess(callbackData);
      }

      const athleteRedirect = `/athlete/${data.uniqueId}`;
      router.push(athleteRedirect);
    },
    onError: (error) => {
      toast.error(`Failed to create athlete profile: ${error.message}`);
      console.error("Create athlete error:", error);
    },
  });
};

/**
 * Hook to update an athlete profile
 * @param id The athlete ID to update
 * @param options Optional configuration for the mutation
 * @returns Mutation for updating athlete profiles
 */
export const useUpdateAthlete = (
  id: string,
  options?: {
    onSuccess?: (data: unknown) => void;
    redirectPath?: string;
    transformResponse?: boolean; // Option to transform the response back to form structure
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: AthleteUpdateFormValues) => updateAthlete(id, data),
    onSuccess: (data) => {
      toast.success("Athlete profile updated successfully");

      // Invalidate specific queries
      if (id) {
        queryClient.invalidateQueries({ queryKey: athleteKeys.detail(id) });
      }
      queryClient.invalidateQueries({ queryKey: athleteKeys.me() });
      queryClient.invalidateQueries({ queryKey: athleteKeys.all });

      // Execute additional success callback if provided
      if (options?.onSuccess) {
        // Transform data if requested
        const callbackData = options.transformResponse ? transformFlatToNested(data) : data;
        options.onSuccess(callbackData);
      }

      // Redirect if a path is provided
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      toast.error(`Failed to update athlete profile: ${error.message}`);
      console.error("Update athlete error:", error);
    },
  });
};

/**
 * Hook to delete an athlete profile
 * @param id The athlete ID to delete
 * @param options Optional configuration for the mutation
 * @returns Mutation for deleting athlete profiles
 */
export const useDeleteAthlete = (
  id: string,
  options?: {
    onSuccess?: () => void;
    redirectPath?: string;
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteAthlete(id),
    onSuccess: () => {
      toast.success("Athlete profile deleted successfully");

      // Invalidate specific queries
      if (id) {
        queryClient.invalidateQueries({ queryKey: athleteKeys.detail(id) });
      }
      queryClient.invalidateQueries({ queryKey: athleteKeys.all });

      // Execute additional success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      // Redirect if a path is provided
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete athlete profile: ${error.message}`);
      console.error("Delete athlete error:", error);
    },
  });
};
