"use client";

import {
  createActivity,
  getActivitiesByJourneyId,
  getActivityByUniqueId,
  updateActivity,
} from "@/features/athlete/api";
import type { ActivityCreationFormValues } from "@/features/athlete/athlete-validator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityKeys } from "./query-keys";

/**
 * Hook to create a new activity
 */
export const useCreateActivity = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActivityCreationFormValues) => {
      // Convert form values to API format
      // Only include necessary fields and ensure proper types
      const apiData = {
        journeyId: data.journeyId,
        title: data.title,
        activityDate: data.activityDate,
        activityType: data.activityType,
        content: data.content,
        distanceKm: data.distanceKm,
        elevationGainM: data.elevationGainM,
        elevationLossM: data.elevationLossM,
        movingTimeSeconds: data.movingTimeSeconds,
        dayNumber: data.dayNumber,
        orderWithinDay: data.orderWithinDay,
      };

      return createActivity(apiData);
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
 */
export const useUpdateActivity = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ActivityCreationFormValues>;
    }) => {
      // Convert form values to API format
      // Only include necessary fields and ensure proper types
      const apiData = {
        title: data.title,
        activityDate: data.activityDate,
        activityType: data.activityType,
        content: data.content,
        distanceKm: data.distanceKm,
        elevationGainM: data.elevationGainM,
        elevationLossM: data.elevationLossM,
        movingTimeSeconds: data.movingTimeSeconds,
        dayNumber: data.dayNumber,
        orderWithinDay: data.orderWithinDay,
      };

      return updateActivity(id, apiData);
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
 * Hook to get activities by journey ID
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
    enabled: options?.enabled !== false,
  });
};

/**
 * Hook to get an activity by unique ID
 */
export const useGetActivityByUniqueId = (uniqueId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: activityKeys.byUniqueId(uniqueId),
    queryFn: () => getActivityByUniqueId(uniqueId),
    enabled: uniqueId !== "new" && options?.enabled !== false,
  });
};
