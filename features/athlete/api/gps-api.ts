/**
 * GPS API client functions
 *
 * This file contains functions for interacting with the GPS API endpoints.
 */

/**
 * Upload a GPS file
 * @param file The file to upload
 * @param journeyId The journey ID
 * @param activityId Optional activity ID for updates
 * @param onProgress Optional progress callback
 * @returns API response
 */
export const uploadGpsFile = async (
  file: File,
  journeyId: string,
  activityId?: string,
  onProgress?: (progress: number) => void
) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("journeyId", journeyId);
    if (activityId) {
      formData.append("activityId", activityId);
    }

    // In a real implementation, we would use a proper upload progress tracking
    // For now, we'll simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 5, 90);
      onProgress?.(progress);
    }, 100);

    // Upload file
    const response = await fetch("/api/gps/upload", {
      method: "POST",
      body: formData,
    });

    clearInterval(progressInterval);

    // Complete progress
    onProgress?.(100);

    // Process response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading GPS file:", error);
    return {
      success: false,
      message: "Failed to upload GPS file",
      error: error instanceof Error ? error.message : "Unknown error uploading GPS file",
    };
  }
};

/**
 * Get GeoJSON for an activity
 * @param activityId The activity ID
 * @param simplificationLevel Optional simplification level
 * @returns API response with GeoJSON data
 */
export const getActivityGeoJson = async (
  activityId: string,
  simplificationLevel: "high" | "medium" | "low" | "none" = "medium"
) => {
  try {
    const response = await fetch(
      `/api/gps/activity/${activityId}/geojson?simplificationLevel=${simplificationLevel}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching GeoJSON:", error);
    return {
      success: false,
      message: "Failed to fetch GPS data",
      error: error instanceof Error ? error.message : "Unknown error fetching GPS data",
    };
  }
};

/**
 * Get statistics for an activity
 * @param activityId The activity ID
 * @returns API response with statistics data
 */
export const getActivityStats = async (activityId: string) => {
  try {
    const response = await fetch(`/api/gps/activity/${activityId}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching activity statistics:", error);
    return {
      success: false,
      message: "Failed to fetch activity statistics",
      error: error instanceof Error ? error.message : "Unknown error fetching activity statistics",
    };
  }
};

/**
 * Get trackpoints for an activity
 * @param activityId The activity ID
 * @param options Optional parameters (limit, page, timeRange)
 * @returns API response with trackpoints data
 */
export const getActivityTrackpoints = async (
  activityId: string,
  options: {
    limit?: number;
    page?: number;
    timeRange?: { start: string; end: string };
  } = {}
) => {
  try {
    const { limit = 1000, page = 1, timeRange } = options;

    let url = `/api/gps/activity/${activityId}/trackpoints?limit=${limit}&page=${page}`;

    if (timeRange) {
      url += `&timeRange=${timeRange.start},${timeRange.end}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching activity trackpoints:", error);
    return {
      success: false,
      message: "Failed to fetch activity trackpoints",
      error: error instanceof Error ? error.message : "Unknown error fetching activity trackpoints",
    };
  }
};
