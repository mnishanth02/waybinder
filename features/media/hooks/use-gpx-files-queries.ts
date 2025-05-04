"use client";

import type { CreateGpxFileType, UpdateGpxFileType } from "@/features/api-types/media";
import type { GpxFilesTypeSelect } from "@/server/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGpxFile,
  deleteGpxFile,
  getGpxFileById,
  getGpxFileByMediaId,
  getGpxFilesByActivityId,
  updateGpxFile,
} from "../api";
import { gpxFileKeys, mediaKeys } from "./query-keys";

/**
 * Hook to get a GPX file by ID
 * @param id GPX file ID
 * @param options Query options including enabled flag
 * @returns Query result with GPX file data
 */
export const useGetGpxFileById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: gpxFileKeys.detail(id),
    queryFn: () => getGpxFileById(id),
    enabled: options?.enabled !== false && !!id,
  });
};

/**
 * Hook to get a GPX file by media ID
 * @param mediaId Media ID
 * @param options Query options including enabled flag
 * @returns Query result with GPX file data
 */
export const useGetGpxFileByMediaId = (mediaId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: gpxFileKeys.byMedia(mediaId),
    queryFn: () => getGpxFileByMediaId(mediaId),
    enabled: options?.enabled !== false && !!mediaId,
  });
};

/**
 * Hook to get GPX files by activity ID
 * @param activityId Activity ID
 * @param options Query options including pagination and enabled flag
 * @returns Query result with GPX files and metadata
 */
export const useGetGpxFilesByActivityId = (
  activityId: string,
  options?: {
    limit?: number;
    page?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: gpxFileKeys.byActivity(activityId, options),
    queryFn: () =>
      getGpxFilesByActivityId(activityId, {
        limit: options?.limit,
        page: options?.page,
      }),
    enabled: options?.enabled !== false && !!activityId,
  });
};

/**
 * Hook to create a new GPX file
 * @param options Optional configuration including success callback
 * @returns Mutation object for creating a GPX file
 */
export const useCreateGpxFile = (options?: {
  onSuccess?: (data: GpxFilesTypeSelect) => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: (data: CreateGpxFileType) => createGpxFile(data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: gpxFileKeys.all });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(data.mediaId) });
      queryClient.invalidateQueries({ queryKey: gpxFileKeys.byActivity(data.activityId) });

      // Show success toast
      if (showToasts) {
        toast.success("GPX file created successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to create GPX file: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update a GPX file
 * @param options Optional configuration including success callback
 * @returns Mutation object for updating a GPX file
 */
export const useUpdateGpxFile = (options?: {
  onSuccess?: (data: GpxFilesTypeSelect) => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGpxFileType }) => updateGpxFile(id, data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: gpxFileKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(data.mediaId) });
      queryClient.invalidateQueries({ queryKey: gpxFileKeys.byActivity(data.activityId) });

      // Show success toast
      if (showToasts) {
        toast.success("GPX file updated successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to update GPX file: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete a GPX file
 * @param options Optional configuration including success callback
 * @returns Mutation object for deleting a GPX file
 */
export const useDeleteGpxFile = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}) => {
  const queryClient = useQueryClient();
  const showToasts = options?.showToasts !== false;

  return useMutation({
    mutationFn: (id: string) => deleteGpxFile(id),
    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: gpxFileKeys.all });
      queryClient.removeQueries({ queryKey: gpxFileKeys.detail(id) });

      // Show success toast
      if (showToasts) {
        toast.success("GPX file deleted successfully");
      }

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      // Show error toast
      if (showToasts) {
        toast.error(`Failed to delete GPX file: ${error.message}`);
      }

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
