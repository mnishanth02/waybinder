"use client";
import type { CreateJourneySchema, UpdateJourneySchema } from "@/features/api-types/journey";
import type { JourneyTypeSelect } from "@/server/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import type { z } from "zod";
import {
  createJourney,
  deleteJourney,
  getJourneyById,
  getJourneyBySlug,
  getJourneyByUniqueId,
  getJourneys,
  getMyJourneys,
  updateJourney,
} from "../api";
import { journeyKeys } from "./query-keys";

type CreateJourneyType = z.infer<typeof CreateJourneySchema>;
type UpdateJourneyType = z.infer<typeof UpdateJourneySchema>;

/**
 * Hook to fetch all journeys
 * @param params Optional query parameters
 * @returns Query result with journeys data, loading and error states
 */
export const useGetJourneys = (params?: {
  limit?: number;
  page?: number;
  journeyType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: journeyKeys.list(params),
    queryFn: () => getJourneys(params),
  });
};

/**
 * Hook to fetch a single journey by ID
 * @param id The journey ID to fetch
 * @returns Query result with journey data, loading and error states
 */
export const useGetJourneyById = (id: string) => {
  return useQuery({
    queryKey: journeyKeys.detail(id),
    queryFn: () => getJourneyById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch a journey by unique ID
 * @param uniqueId The unique ID to fetch
 * @param options Optional configuration for the query
 * @returns Query result with journey data, loading and error states
 */
export const useGetJourneyByUniqueId = (
  uniqueId: string,
  options?: {
    onError?: (error: Error) => void;
    onNotFound?: (id: string) => void;
    redirectOnNotFound?: string;
    enabled?: boolean;
    retry?: boolean | number | ((failureCount: number, error: Error) => boolean);
  }
) => {
  const router = useRouter();

  const query = useQuery({
    queryKey: journeyKeys.unique(uniqueId),
    queryFn: () => getJourneyByUniqueId(uniqueId),
    enabled:
      options?.enabled !== undefined ? options.enabled && Boolean(uniqueId) : Boolean(uniqueId),
    retry:
      options?.retry !== undefined
        ? options.retry
        : (failureCount) => {
            // Retry errors up to 3 times
            return failureCount < 3;
          },
  });

  // Handle errors using the error property from the query result
  React.useEffect(() => {
    if (query.error) {
      console.error(`Journey with unique ID ${uniqueId} not found or error occurred`);

      // Call the custom not found handler if provided
      if (options?.onNotFound) {
        options.onNotFound(uniqueId);
      }

      // Redirect if a redirect path is provided
      if (options?.redirectOnNotFound) {
        router.push(options.redirectOnNotFound);
      }

      // Call the general error handler if provided
      if (options?.onError) {
        options.onError(query.error as Error);
      }
    }
  }, [query.error, uniqueId, options, router]);

  return query;
};

/**
 * Hook to fetch a journey by slug
 * @param slug The slug to fetch
 * @returns Query result with journey data, loading and error states
 */
export const useGetJourneyBySlug = (slug: string) => {
  return useQuery({
    queryKey: journeyKeys.slug(slug),
    queryFn: () => getJourneyBySlug(slug),
    enabled: Boolean(slug),
  });
};

/**
 * Hook to fetch the current user's journeys
 * @param params Optional query parameters
 * @returns Query result with journeys data, loading and error states
 */
export const useGetMyJourneys = (params?: {
  limit?: number;
  page?: number;
  journeyType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: journeyKeys.me(),
    queryFn: () => getMyJourneys(params),
  });
};

/**
 * Hook to create a new journey
 * @param options Optional configuration for the mutation
 * @returns Mutation for creating journeys
 */
export const useCreateJourney = (options?: {
  onSuccess?: (data: JourneyTypeSelect) => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
  showToasts?: boolean; // Option to show toast notifications (default: true)
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateJourneyType) => createJourney(data),
    onSuccess: (data) => {
      // Show success toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.success("Journey created successfully");
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: journeyKeys.all });

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      // Redirect to the journey page or custom redirect path
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      // Show error toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.error(`Failed to create journey: ${error.message}`);
      }

      console.error("Create journey error:", error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update a journey
 * @param id The journey ID to update
 * @param options Optional configuration for the mutation
 * @returns Mutation for updating journeys
 */
export const useUpdateJourney = (
  id: string,
  options?: {
    onSuccess?: (data: JourneyTypeSelect) => void;
    onError?: (error: Error) => void;
    redirectPath?: string;
    showToasts?: boolean; // Option to show toast notifications (default: true)
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateJourneyType) => updateJourney(id, data),
    onSuccess: (data) => {
      // Show success toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.success("Journey updated successfully");
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(id) });

      // Only invalidate these queries if the data has the necessary properties
      if (data.title) {
        queryClient.invalidateQueries({ queryKey: journeyKeys.unique(data.journeyUniqueId) });
      }
      if (data.slug) {
        queryClient.invalidateQueries({ queryKey: journeyKeys.slug(data.slug) });
      }

      queryClient.invalidateQueries({ queryKey: journeyKeys.me() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.all });

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      // Redirect to the journey page or custom redirect path
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      // Show error toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.error(`Failed to update journey: ${error.message}`);
      }

      console.error("Update journey error:", error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete a journey
 * @param id The journey ID to delete
 * @param options Optional configuration for the mutation
 * @returns Mutation for deleting journeys
 */
export const useDeleteJourney = (
  id: string,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    redirectPath?: string;
    showToasts?: boolean; // Option to show toast notifications (default: true)
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteJourney(id),
    onSuccess: () => {
      // Show success toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.success("Journey deleted successfully");
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: journeyKeys.all });

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      // Redirect to the journey page or custom redirect path
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      // Show error toast unless explicitly disabled
      if (options?.showToasts !== false) {
        toast.error(`Failed to delete journey: ${error.message}`);
      }

      console.error("Delete journey error:", error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
