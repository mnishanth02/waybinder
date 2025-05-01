"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getActivityGeoJson,
  getActivityStats,
  getActivityTrackpoints,
  uploadGpsFile,
} from "../api/gps-api";

/**
 * Hook for uploading GPS files
 * @returns Mutation for uploading GPS files
 */
export const useUploadGpsFile = () => {
  return useMutation({
    mutationFn: ({
      file,
      journeyId,
      activityId,
      onProgress,
    }: {
      file: File;
      journeyId: string;
      activityId?: string;
      onProgress?: (progress: number) => void;
    }) => uploadGpsFile(file, journeyId, activityId, onProgress),
  });
};

/**
 * Hook for fetching GeoJSON data for an activity
 * @param activityId The activity ID
 * @param simplificationLevel Optional simplification level
 * @param enabled Whether to enable the query
 * @returns Query result with GeoJSON data
 */
export const useActivityGeoJson = (
  activityId: string,
  simplificationLevel: "high" | "medium" | "low" | "none" = "medium",
  enabled = true
) => {
  return useQuery({
    queryKey: ["activityGeoJson", activityId, simplificationLevel],
    queryFn: () => getActivityGeoJson(activityId, simplificationLevel),
    enabled: enabled && !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for fetching statistics for an activity
 * @param activityId The activity ID
 * @param enabled Whether to enable the query
 * @returns Query result with statistics data
 */
export const useActivityStats = (activityId: string, enabled = true) => {
  return useQuery({
    queryKey: ["activityStats", activityId],
    queryFn: () => getActivityStats(activityId),
    enabled: enabled && !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for fetching trackpoints for an activity
 * @param activityId The activity ID
 * @param options Optional parameters (limit, page, timeRange)
 * @param enabled Whether to enable the query
 * @returns Query result with trackpoints data
 */
export const useActivityTrackpoints = (
  activityId: string,
  options: {
    limit?: number;
    page?: number;
    timeRange?: { start: string; end: string };
  } = {},
  enabled = true
) => {
  const { limit = 1000, page = 1, timeRange } = options;

  return useQuery({
    queryKey: ["activityTrackpoints", activityId, limit, page, timeRange],
    queryFn: () => getActivityTrackpoints(activityId, { limit, page, timeRange }),
    enabled: enabled && !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
