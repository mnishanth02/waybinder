import type { ParsedGPSData } from "./gps-file-parser";

/**
 * Interface for GPS activity data that can be saved to the database
 */
export interface ActivityGPSData {
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  movingTimeSeconds: number;
  startTime: Date | null;
  endTime: Date | null;
}

/**
 * Maps parsed GPS data to activity data format for database storage
 * @param parsedData The parsed GPS data from a GPS file
 * @returns Activity data ready for database storage
 */
export function mapGPSDataToActivityData(parsedData: ParsedGPSData): ActivityGPSData {
  return {
    // Convert distance from meters to kilometers
    distanceKm: parsedData.stats.distance / 1000,

    // Elevation gain in meters
    elevationGainM: parsedData.stats.elevation.gain,

    // Elevation loss in meters
    elevationLossM: parsedData.stats.elevation.loss,

    // Moving time in seconds
    movingTimeSeconds: parsedData.stats.duration,

    // Start and end times
    startTime: parsedData.stats.startTime,
    endTime: parsedData.stats.endTime,
  };
}
