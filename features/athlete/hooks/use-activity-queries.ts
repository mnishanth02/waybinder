"use client";

import type { CreateActivityType, UpdateActivityType } from "@/features/api-types/activity";
import {
  createActivity,
  deleteActivity,
  getActivitiesByJourneyId,
  getActivityByUniqueId,
  updateActivity,
} from "@/features/athlete/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityKeys } from "./query-keys";

/**
 * Hook to create a new activity
 * @param options Optional configuration including success callback
 * @returns Mutation object for creating an activity
 */
export const useCreateActivity = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateActivityType) => {
      return createActivity(data);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: activityKeys.byJourney(data.journeyId),
      });

      toast.success("Activity created successfully");

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity");
    },
  });
};

/**
 * Hook to update an existing activity
 * @param options Optional configuration including success callback
 * @returns Mutation object for updating an activity
 */
export const useUpdateActivity = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateActivityType;
    }) => {
      return updateActivity(id, data);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: activityKeys.byJourney(data.journeyId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.detail(data.id),
      });

      toast.success("Activity updated successfully");

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity");
    },
  });
};

/**
 * Hook to delete an activity
 * @param options Optional configuration including success callback
 * @returns Mutation object for deleting an activity
 */
export const useDeleteActivity = (options?: {
  onSuccess?: () => void;
  journeyId?: string; // Optional journeyId to invalidate specific journey queries
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteActivity(id);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });

      // If journeyId is provided, invalidate that specific journey's activities
      if (options?.journeyId) {
        queryClient.invalidateQueries({
          queryKey: activityKeys.byJourney(options.journeyId),
        });
      }

      // Invalidate the deleted activity's detail query
      queryClient.invalidateQueries({
        queryKey: activityKeys.detail(variables),
      });

      toast.success("Activity deleted successfully");

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity");
    },
  });
};

/**
 * Hook to get activities by journey ID
 * @param journeyId Journey unique ID
 * @param options Query options including pagination, filtering, and enabled flag
 * @returns Query result with activities and metadata
 */
export const useGetActivitiesByJourneyId = (
  journeyId: string,
  options?: {
    limit?: number;
    page?: number;
    activityType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: activityKeys.byJourney(journeyId, options),
    queryFn: () =>
      getActivitiesByJourneyId(journeyId, {
        limit: options?.limit,
        page: options?.page,
        activityType: options?.activityType,
        search: options?.search,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
      }),
    enabled: options?.enabled !== false && !!journeyId,
  });
};

/**
 * Hook to get an activity by unique ID
 * @param uniqueId Activity unique ID
 * @param options Query options including enabled flag
 * @returns Query result with activity data
 */
export const useGetActivityByUniqueId = (uniqueId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: activityKeys.byUniqueId(uniqueId),
    queryFn: () => getActivityByUniqueId(uniqueId),
    enabled: uniqueId !== "new" && options?.enabled !== false && !!uniqueId,
  });
};
