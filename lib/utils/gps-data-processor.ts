import type { ActivityGPSData } from "./activity-data-mapper";
import { type ParsedGPSData, parseGPSFile } from "./gps-file-parser";

/**
 * Unified interface for GPS data that combines both ParsedGPSData and ActivityGPSData
 */
export interface UnifiedGPSData {
  // GeoJSON data for map display
  geoJSON: GeoJSON.FeatureCollection;

  // Stats for display and database storage
  stats: {
    // Display stats (formatted)
    distance: number; // in meters
    distanceKm: number; // in kilometers
    duration: number; // in seconds
    movingTimeSeconds: number; // same as duration for now
    elevation: {
      gain: number; // in meters
      loss: number; // in meters
      max: number; // in meters
      min: number; // in meters
    };
    startTime: Date | null;
    endTime: Date | null;
    pace: number; // in seconds per kilometer
  };

  // Original parsed data (optional)
  rawData?: unknown;
}

/**
 * Process a GPS file and return unified GPS data along with backward compatible formats
 * @param file The file to process
 * @returns A promise that resolves to an object containing unified data and backward compatible formats
 */
export async function processGPSFile(file: File): Promise<{
  unifiedData: UnifiedGPSData;
  parsedData: ParsedGPSData;
  activityData: ActivityGPSData;
}> {
  // Parse the GPS file
  const parsedData = await parseGPSFile(file);

  // Create unified format
  const unifiedData: UnifiedGPSData = {
    geoJSON: parsedData.geoJSON,
    stats: {
      distance: parsedData.stats.distance,
      distanceKm: parsedData.stats.distance / 1000,
      duration: parsedData.stats.duration,
      movingTimeSeconds: parsedData.stats.duration,
      elevation: parsedData.stats.elevation,
      startTime: parsedData.stats.startTime,
      endTime: parsedData.stats.endTime,
      pace: parsedData.stats.pace,
    },
    rawData: parsedData.rawData,
  };

  // Create activity data format
  const activityData: ActivityGPSData = {
    distanceKm: unifiedData.stats.distanceKm,
    elevationGainM: unifiedData.stats.elevation.gain,
    elevationLossM: unifiedData.stats.elevation.loss,
    movingTimeSeconds: unifiedData.stats.movingTimeSeconds,
    startTime: unifiedData.stats.startTime,
    endTime: unifiedData.stats.endTime,
  };

  // Return all formats
  return {
    unifiedData,
    parsedData, // Original parsed data
    activityData,
  };
}
