import { kml } from "@tmcw/togeojson";
import { parseGPX } from "@we-gold/gpxjs";
import { DOMParser } from "xmldom-qsa";

// Define the return type for parsed GPS data
export interface ParsedGPSData {
  geoJSON: GeoJSON.FeatureCollection;
  stats: {
    distance: number; // in meters
    duration: number; // in seconds
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
  rawData?: unknown; // Original parsed data
}

/**
 * Parse a GPS file (GPX, FIT, KML) and return GeoJSON and statistics
 * @param file The file to parse
 * @returns A promise that resolves to the parsed data
 */
export async function parseGPSFile(file: File): Promise<ParsedGPSData> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const fileContent = await readFileAsText(file);

  switch (fileExtension) {
    case "gpx":
      return parseGPXFile(fileContent);
    case "kml":
      return parseKMLFile(fileContent);
    case "fit":
    case "tcx":
      // For now, we'll throw an error for unsupported file types
      // In a future implementation, we would add support for these formats
      throw new Error(`${fileExtension.toUpperCase()} file parsing is not yet implemented`);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

/**
 * Parse a GPX file and return GeoJSON and statistics
 * @param fileContent The GPX file content as a string
 * @returns The parsed data
 */
function parseGPXFile(fileContent: string): ParsedGPSData {
  // Parse the GPX file using @we-gold/gpxjs
  const [parsedGPX, error] = parseGPX(fileContent);

  if (error) {
    throw new Error(`Error parsing GPX file: ${error.message}`);
  }

  // Convert to GeoJSON
  const geoJSON = parsedGPX.toGeoJSON();

  // Extract statistics from the first track
  // If there are multiple tracks, we could combine them or handle them separately
  if (!parsedGPX.tracks || parsedGPX.tracks.length === 0) {
    throw new Error("No tracks found in GPX file");
  }

  // We've already checked that tracks exists and has at least one element
  const track = parsedGPX.tracks[0] as NonNullable<(typeof parsedGPX.tracks)[0]>;

  // Calculate pace (seconds per kilometer)
  const pace =
    track.duration.movingDuration > 0 && track.distance.total > 0
      ? track.duration.movingDuration / (track.distance.total / 1000)
      : 0;

  // Ensure elevation values are numbers, not null
  const elevPositive = track.elevation.positive ?? 0;
  const elevNegative = track.elevation.negative ?? 0;
  const elevMaximum = track.elevation.maximum ?? 0;
  const elevMinimum = track.elevation.minimum ?? 0;

  return {
    geoJSON: geoJSON as GeoJSON.FeatureCollection,
    stats: {
      distance: track.distance.total, // in meters
      duration: track.duration.movingDuration, // in seconds
      elevation: {
        gain: elevPositive,
        loss: Math.abs(elevNegative),
        max: elevMaximum,
        min: elevMinimum,
      },
      startTime: track.duration.startTime,
      endTime: track.duration.endTime,
      pace,
    },
    rawData: parsedGPX,
  };
}

/**
 * Parse a KML file and return GeoJSON and statistics
 * @param fileContent The KML file content as a string
 * @returns The parsed data
 */
function parseKMLFile(fileContent: string): ParsedGPSData {
  // Parse the KML file using @tmcw/togeojson
  const kmlDoc = new DOMParser().parseFromString(fileContent, "text/xml");
  const geoJSON = kml(kmlDoc) as GeoJSON.FeatureCollection;

  // Extract coordinates from the GeoJSON to calculate statistics
  const coordinates: [number, number, number?][] = [];

  for (const feature of geoJSON.features) {
    if (feature.geometry.type === "LineString") {
      coordinates.push(...(feature.geometry.coordinates as [number, number, number?][]));
    } else if (feature.geometry.type === "MultiLineString") {
      for (const line of feature.geometry.coordinates as [number, number, number?][][]) {
        coordinates.push(...(line as [number, number, number?][]));
      }
    }
  }

  if (coordinates.length === 0) {
    throw new Error("No coordinates found in KML file");
  }

  // Calculate statistics
  const stats = calculateStatsFromCoordinates(coordinates);

  return {
    geoJSON,
    stats,
    rawData: kmlDoc,
  };
}

/**
 * Calculate statistics from an array of coordinates
 * @param coordinates Array of [longitude, latitude, elevation?] coordinates
 * @returns Statistics calculated from the coordinates
 */
function calculateStatsFromCoordinates(
  coordinates: [number, number, number?][]
): ParsedGPSData["stats"] {
  let distance = 0;
  let elevGain = 0;
  let elevLoss = 0;
  let maxElev = Number.NEGATIVE_INFINITY;
  let minElev = Number.POSITIVE_INFINITY;

  // Calculate distance and elevation changes
  for (let i = 1; i < coordinates.length; i++) {
    const coord1 = coordinates[i - 1];
    const coord2 = coordinates[i];

    if (!coord1 || !coord2) continue;

    const lon1 = coord1[0];
    const lat1 = coord1[1];
    const elev1 = coord1[2] ?? 0;

    const lon2 = coord2[0];
    const lat2 = coord2[1];
    const elev2 = coord2[2] ?? 0;

    // Calculate distance between points using Haversine formula
    distance += calculateDistance(lat1, lon1, lat2, lon2);

    // Calculate elevation changes
    const elevDiff = elev2 - elev1;
    if (elevDiff > 0) {
      elevGain += elevDiff;
    } else {
      elevLoss += Math.abs(elevDiff);
    }

    // Update max and min elevation
    maxElev = Math.max(maxElev, elev2);
    minElev = Math.min(minElev, elev2);
  }

  // Set min/max elevation if we have valid values
  if (maxElev === Number.NEGATIVE_INFINITY) maxElev = 0;
  if (minElev === Number.POSITIVE_INFINITY) minElev = 0;

  // Estimate duration based on distance (assuming average pace of 15 min/km)
  const estimatedDuration = (distance / 1000) * 15 * 60; // seconds

  // Estimate pace (seconds per kilometer)
  const pace = estimatedDuration > 0 && distance > 0 ? estimatedDuration / (distance / 1000) : 0;

  return {
    distance, // in meters
    duration: estimatedDuration, // in seconds
    elevation: {
      gain: elevGain,
      loss: elevLoss,
      max: maxElev,
      min: minElev,
    },
    startTime: null, // KML doesn't typically include timestamps
    endTime: null,
    pace,
  };
}

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Read a file as text
 * @param file The file to read
 * @returns A promise that resolves to the file content as a string
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
}

/**
 * Format a duration in seconds to a human-readable string (HH:MM:SS)
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
}

/**
 * Format a distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format a pace in seconds per kilometer to a human-readable string (MM:SS/km)
 * @param secondsPerKm Pace in seconds per kilometer
 * @returns Formatted pace string
 */
export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || Number.isNaN(secondsPerKm)) return "-";

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

/**
 * Format elevation in meters to a human-readable string
 * @param meters Elevation in meters
 * @returns Formatted elevation string
 */
export function formatElevation(meters: number): string {
  return `${meters.toFixed(0)} m`;
}
