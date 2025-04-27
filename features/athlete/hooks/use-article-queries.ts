"use client";
import type { CreateActivityType, UpdateActivityType } from "@/features/api-types/activity";
import type { ActivityTypeSelect } from "@/server/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivitiesByJourneyId,
  getActivityById,
  getActivityByUniqueId,
  updateActivity,
} from "../api/article-api";
import { activityKeys } from "./query-keys";

/**
 * Hook to fetch all activities
 * @param params Optional query parameters
 * @returns Query result with activities data, loading and error states
 */
export const useGetActivities = (params?: {
  limit?: number;
  page?: number;
  journeyId?: string;
  activityType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => getActivities(params),
  });
};

/**
 * Hook to fetch a single activity by ID
 * @param id The activity ID to fetch
 * @returns Query result with activity data, loading and error states
 */
export const useGetActivityById = (id: string) => {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivityById(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch an activity by unique ID
 * @param uniqueId The unique ID to fetch
 * @param options Optional configuration for the query
 * @returns Query result with activity data, loading and error states
 */
export const useGetActivityByUniqueId = (
  uniqueId: string,
  options?: {
    onError?: (error: Error) => void;
    onNotFound?: (id: string) => void;
    enabled?: boolean;
    retry?: boolean | number | ((failureCount: number, error: Error) => boolean);
  }
) => {
  const query = useQuery({
    queryKey: activityKeys.unique(uniqueId),
    queryFn: () => getActivityByUniqueId(uniqueId),
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

  // We'll handle not found errors in the error handler

  // Handle general errors
  const handleGeneralError = React.useCallback(
    (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      } else {
        toast.error(`Error fetching activity: ${error.message}`);
        console.error("Error fetching activity:", error);
      }
    },
    [options]
  );

  // Handle errors using the error property from the query result
  React.useEffect(() => {
    if (!query.error) return;

    // Call the general error handler for all errors
    handleGeneralError(query.error as Error);
  }, [query.error, handleGeneralError]);

  return query;
};

/**
 * Hook to fetch activities by journey ID
 * @param journeyId The journey ID to fetch activities for
 * @param params Optional query parameters
 * @returns Query result with activities data, loading and error states
 */
export const useGetActivitiesByJourneyId = (
  journeyId: string,
  params?: {
    limit?: number;
    page?: number;
    activityType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => {
  return useQuery({
    queryKey: activityKeys.journey(journeyId),
    queryFn: () => getActivitiesByJourneyId(journeyId, params),
    enabled: Boolean(journeyId),
  });
};

/**
 * Hook to create a new activity
 * @param options Optional configuration for the mutation
 * @returns Mutation for creating activities
 */
export const useCreateActivity = (options?: {
  onSuccess?: (data: ActivityTypeSelect) => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateActivityType) => createActivity(data),
    onSuccess: (data) => {
      toast.success("Activity created successfully");

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: activityKeys.all });

      // If the activity is associated with a journey, invalidate that journey's activities
      if (data.journeyId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.journey(data.journeyId) });
      }

      // Execute additional success callback if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      // Redirect if a path is provided
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create activity: ${error.message}`);
      console.error("Create activity error:", error);

      // Execute additional error callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update an activity
 * @param id The ID of the activity to update
 * @param options Optional configuration for the mutation
 * @returns Mutation for updating an activity
 */
export const useUpdateActivity = (
  id: string,
  options?: {
    onSuccess?: (data: ActivityTypeSelect) => void;
    onError?: (error: Error) => void;
    redirectPath?: string;
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateActivityType) => updateActivity(id, data),
    onSuccess: (data) => {
      toast.success("Activity updated successfully");

      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: activityKeys.unique(data.activityUniqueId as string),
      });

      // If the activity is associated with a journey, invalidate that journey's activities
      if (data.journeyId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.journey(data.journeyId as string) });
      }

      // Invalidate all activities list
      queryClient.invalidateQueries({ queryKey: activityKeys.all });

      // Execute additional success callback if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      // Redirect if a path is provided
      if (options?.redirectPath) {
        router.push(options.redirectPath);
      }
    },
    onError: (error) => {
      toast.error(`Failed to update activity: ${error.message}`);
      console.error("Update activity error:", error);

      // Execute additional error callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete an activity
 * @param id The ID of the activity to delete
 * @param options Optional configuration for the mutation
 * @returns Mutation for deleting an activity
 */
export const useDeleteActivity = (
  id: string,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    redirectPath?: string;
  }
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteActivity(id),
    onSuccess: () => {
      toast.success("Activity deleted successfully");

      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.all });

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
      toast.error(`Failed to delete activity: ${error.message}`);
      console.error("Delete activity error:", error);

      // Execute additional error callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
