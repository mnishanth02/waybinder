"use client";

import type { CreateMediaType, UpdateMediaType } from "@/features/api-types/media";
import type { MediaTypeSelect } from "@/server/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMedia,
  deleteMedia,
  getMediaByActivityId,
  getMediaById,
  getMediaByJourneyId,
  getMediaByUserId,
  updateMedia,
} from "../api";
import { mediaKeys } from "./query-keys";

/**
 * Hook to get a media item by ID
 * @param id Media ID
 * @param options Query options including enabled flag
 * @returns Query result with media data
 */
export const useGetMediaById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => getMediaById(id),
    enabled: options?.enabled !== false && !!id,
  });
};

/**
 * Hook to get media items by journey ID
 * @param journeyId Journey ID
 * @param options Query options including pagination, filtering, and enabled flag
 * @returns Query result with media items and metadata
 */
export const useGetMediaByJourneyId = (
  journeyId: string,
  options?: {
    limit?: number;
    page?: number;
    mediaType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: mediaKeys.byJourney(journeyId, options),
    queryFn: () =>
      getMediaByJourneyId(journeyId, {
        limit: options?.limit,
        page: options?.page,
        mediaType: options?.mediaType,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
      }),
    enabled: options?.enabled !== false && !!journeyId,
  });
};

/**
 * Hook to get media items by activity ID
 * @param activityId Activity ID
 * @param options Query options including pagination, filtering, and enabled flag
 * @returns Query result with media items and metadata
 */
export const useGetMediaByActivityId = (
  activityId: string,
  options?: {
    limit?: number;
    page?: number;
    mediaType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: mediaKeys.byActivity(activityId, options),
    queryFn: () =>
      getMediaByActivityId(activityId, {
        limit: options?.limit,
        page: options?.page,
        mediaType: options?.mediaType,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
      }),
    enabled: options?.enabled !== false && !!activityId,
  });
};

/**
 * Hook to get media items by user ID
 * @param userId User ID
 * @param options Query options including pagination, filtering, and enabled flag
 * @returns Query result with media items and metadata
 */
export const useGetMediaByUserId = (
  userId: string,
  options?: {
    limit?: number;
    page?: number;
    mediaType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: mediaKeys.byUser(userId, options),
    queryFn: () =>
      getMediaByUserId(userId, {
        limit: options?.limit,
        page: options?.page,
        mediaType: options?.mediaType,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
      }),
    enabled: options?.enabled !== false && !!userId,
  });
};

/**
 * Hook to create a new media item
 * @param options Optional configuration including success callback
 * @returns Mutation object for creating a media item
 */
export const useCreateMedia = (options?: {
  onSuccess?: (data: MediaTypeSelect) => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: (data: CreateMediaType) => createMedia(data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });

      // Show success toast
      if (showToasts) {
        toast.success("Media created successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to create media: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update a media item
 * @param options Optional configuration including success callback
 * @returns Mutation object for updating a media item
 */
export const useUpdateMedia = (options?: {
  onSuccess?: (data: MediaTypeSelect) => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaType }) => updateMedia(id, data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(data.id) });

      // If the media is attached to a journey or activity, invalidate those queries too
      if (data.journeyId) {
        queryClient.invalidateQueries({ queryKey: mediaKeys.byJourney(data.journeyId) });
      }
      if (data.activityId) {
        queryClient.invalidateQueries({ queryKey: mediaKeys.byActivity(data.activityId) });
      }

      // Show success toast
      if (showToasts) {
        toast.success("Media updated successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to update media: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete a media item
 * @param options Optional configuration including success callback
 * @returns Mutation object for deleting a media item
 */
export const useDeleteMedia = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      queryClient.removeQueries({ queryKey: mediaKeys.detail(id) });

      // Show success toast
      if (showToasts) {
        toast.success("Media deleted successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to delete media: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
