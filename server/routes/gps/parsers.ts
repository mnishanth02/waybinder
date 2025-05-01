import type {
  EnhancedFeature,
  EnhancedGeoJSON,
  GpsFileType,
  GpsParsingResult,
  TrackStatistics,
} from "@/types/geo";
import { gpx, kml } from "@tmcw/togeojson";
import * as turf from "@turf/turf";
import FitParser from "fit-file-parser";
import GpxParser from "gpxparser";
import { DOMParser } from "jsdom";
import { Parser as TcxParser } from "tcx-js";

/**
 * Parse a GPS file and convert it to GeoJSON with statistics
 * @param fileBuffer The file buffer to parse
 * @param fileType The file type (gpx, kml, fit, tcx)
 * @returns GeoJSON and statistics
 */
export const parseGpsFile = async (
  fileBuffer: ArrayBuffer,
  fileType: string
): Promise<GpsParsingResult> => {
  try {
    let geoJson: EnhancedGeoJSON | undefined;

    // Parse the file based on its type
    switch (fileType.toLowerCase() as GpsFileType) {
      case "gpx": {
        const result = await parseGpx(fileBuffer);
        geoJson = result.geoJson;
        break;
      }
      case "kml": {
        const result = await parseKml(fileBuffer);
        geoJson = result.geoJson;
        break;
      }
      case "fit": {
        const result = await parseFit(fileBuffer);
        geoJson = result.geoJson;
        break;
      }
      case "tcx": {
        const result = await parseTcx(fileBuffer);
        geoJson = result.geoJson;
        break;
      }
      default:
        return {
          success: false,
          error: `Unsupported file type: ${fileType}`,
        };
    }

    if (!geoJson) {
      return {
        success: false,
        error: "Failed to parse GPS file: No valid data found",
      };
    }

    // Calculate statistics from the GeoJSON
    const stats = calculateStatistics(geoJson);

    // Create a simplified version for faster rendering
    const simplifiedGeoJson = simplifyGeoJson(geoJson);

    // Add the simplified version to the stats
    stats.simplifiedGeoJson = simplifiedGeoJson;

    return {
      success: true,
      data: {
        geoJson,
        stats,
      },
    };
  } catch (error) {
    console.error("Error parsing GPS file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error parsing GPS file",
    };
  }
};

/**
 * Parse a GPX file
 * @param fileBuffer The GPX file buffer
 * @returns Parsed GPX data and GeoJSON
 */
const parseGpx = async (
  fileBuffer: ArrayBuffer
): Promise<{ geoJson: EnhancedGeoJSON; rawData: Record<string, unknown> }> => {
  // Convert ArrayBuffer to string
  const decoder = new TextDecoder("utf-8");
  const gpxString = decoder.decode(fileBuffer);

  // Parse GPX using gpxparser
  const gpxParser = new GpxParser();
  gpxParser.parse(gpxString);

  // Extract track data
  const tracks = gpxParser.tracks || [];
  const waypoints = gpxParser.waypoints || [];

  // Convert to GeoJSON using toGeoJSON
  const parser = new DOMParser();
  const gpxDoc = parser.parseFromString(gpxString, "text/xml");
  const geoJsonBase = gpx(gpxDoc);

  // Convert to our enhanced GeoJSON type
  const geoJson = geoJsonBase as unknown as EnhancedGeoJSON;

  // Add time data to GeoJSON if available
  if (tracks && tracks.length > 0 && tracks[0]?.points && tracks[0].points.length > 0) {
    const coordTimes = tracks.flatMap((track) =>
      track.points.map((point) => (point.time ? point.time.toISOString() : null))
    );

    // Add time data to the first LineString feature (assuming it's the track)
    if (geoJson.features && geoJson.features.length > 0) {
      const trackFeature = geoJson.features.find((f) => f.geometry.type === "LineString") as
        | EnhancedFeature
        | undefined;

      if (trackFeature) {
        trackFeature.properties = trackFeature.properties || {};
        trackFeature.properties.coordTimes = coordTimes;
      }
    }
  }

  return {
    geoJson,
    rawData: {
      tracks,
      waypoints,
    },
  };
};

/**
 * Parse a KML file
 * @param fileBuffer The KML file buffer
 * @returns Parsed KML data and GeoJSON
 */
const parseKml = async (
  fileBuffer: ArrayBuffer
): Promise<{ geoJson: EnhancedGeoJSON; rawData: Record<string, unknown> }> => {
  // Convert ArrayBuffer to string
  const decoder = new TextDecoder("utf-8");
  const kmlString = decoder.decode(fileBuffer);

  // Parse KML using toGeoJSON
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlString, "text/xml");
  const geoJsonBase = kml(kmlDoc);

  // Convert to our enhanced GeoJSON type
  const geoJson = geoJsonBase as unknown as EnhancedGeoJSON;

  // Extract time data if available
  const timeData = extractTimeDataFromKml(geoJson);

  return {
    geoJson,
    rawData: {
      // KML doesn't have a standardized way to store time data like GPX
      // We'll extract what we can from the GeoJSON properties
      timeData,
    },
  };
};

/**
 * Parse a FIT file
 * @param fileBuffer The FIT file buffer
 * @returns Parsed FIT data and GeoJSON
 */
const parseFit = async (
  fileBuffer: ArrayBuffer
): Promise<{ geoJson: EnhancedGeoJSON; rawData: Record<string, unknown> }> => {
  // Parse FIT file
  const fitParser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "list",
  });

  // Convert the FIT file to records
  const fitData = await new Promise<Record<string, unknown>>((resolve, reject) => {
    fitParser.parse(fileBuffer, (error: Error | null, data: Record<string, unknown>) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

  // Extract records with position data
  const records = (fitData.records as Record<string, unknown>[]) || [];
  const positionRecords = records.filter(
    (record) => record.position_lat !== undefined && record.position_long !== undefined
  );

  // Convert to GeoJSON
  const coordinates = positionRecords.map((record) => {
    // FIT files store lat/long as semicircles, convert to degrees
    const lat = (record.position_lat as number) * (180 / 2 ** 31);
    const lng = (record.position_long as number) * (180 / 2 ** 31);
    const alt = record.altitude !== undefined ? (record.altitude as number) : null;
    return [lng, lat, alt];
  });

  // Create GeoJSON LineString
  const geoJson: EnhancedGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name:
            ((fitData.sessions as Record<string, unknown>[] | undefined)?.[0]?.sport as string) ||
            "Activity",
          coordTimes: positionRecords.map((record) =>
            record.timestamp ? new Date(record.timestamp as string | number).toISOString() : null
          ),
        },
        geometry: {
          type: "LineString",
          coordinates,
        },
      } as EnhancedFeature,
    ],
  };

  return {
    geoJson,
    rawData: {
      sessions: fitData.sessions || [],
      records: positionRecords,
    },
  };
};

/**
 * Parse a TCX file
 * @param fileBuffer The TCX file buffer
 * @returns Parsed TCX data and GeoJSON
 */
const parseTcx = async (
  fileBuffer: ArrayBuffer
): Promise<{ geoJson: EnhancedGeoJSON; rawData: Record<string, unknown> }> => {
  // Convert ArrayBuffer to string
  const decoder = new TextDecoder("utf-8");
  const tcxString = decoder.decode(fileBuffer);

  // Parse TCX using tcx-js
  const parser = new TcxParser();
  const tcxData = parser.parse(tcxString);

  // Extract trackpoints
  const activities = tcxData.activities || [];
  const trackpoints =
    activities && activities.length > 0 && activities[0]?.laps
      ? activities[0].laps.flatMap((lap: Record<string, unknown>) =>
          ((lap.tracks as Record<string, unknown>[]) || []).flatMap(
            (track: Record<string, unknown>) =>
              (track.trackpoints as Record<string, unknown>[]) || []
          )
        )
      : [];

  // Convert to GeoJSON
  const coordinates = trackpoints
    .filter((tp) => {
      const position = tp.position as { latitude?: number; longitude?: number } | undefined;
      return position?.latitude !== undefined && position?.longitude !== undefined;
    })
    .map((tp) => {
      const position = tp.position as { latitude: number; longitude: number };
      const lat = position.latitude;
      const lng = position.longitude;
      const alt = tp.altitude !== undefined ? (tp.altitude as number) : null;
      return [lng, lat, alt];
    });

  // Create GeoJSON LineString
  const geoJson: EnhancedGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: (activities[0]?.sport as string) || "Activity",
          coordTimes: trackpoints.map((tp) => (tp.time as string) || null),
        },
        geometry: {
          type: "LineString",
          coordinates,
        },
      } as EnhancedFeature,
    ],
  };

  return {
    geoJson,
    rawData: {
      activities,
      trackpoints,
    },
  };
};

/**
 * Extract time data from KML GeoJSON
 * @param geoJson GeoJSON converted from KML
 * @returns Array of timestamps
 */
const extractTimeDataFromKml = (geoJson: EnhancedGeoJSON): string[] | null => {
  // KML doesn't have a standardized way to store time data
  // Some KML files might store time in ExtendedData or other properties
  // This is a simplified implementation
  if (geoJson.features && geoJson.features.length > 0) {
    const timeData: string[] = [];
    for (const feature of geoJson.features) {
      if (feature.properties?.timeStamp) {
        timeData.push(feature.properties.timeStamp as string);
      } else if (feature.properties?.Time) {
        timeData.push(feature.properties.Time as string);
      } else if (feature.properties?.when) {
        timeData.push(feature.properties.when as string);
      }
    }
    return timeData.length > 0 ? timeData : null;
  }
  return null;
};

/**
 * Calculate statistics from GeoJSON
 * @param geoJson GeoJSON data
 * @returns Statistics object
 */
const calculateStatistics = (geoJson: EnhancedGeoJSON): TrackStatistics => {
  // Find the track feature (LineString)
  const trackFeature = geoJson.features?.find((f) => f.geometry?.type === "LineString") as
    | EnhancedFeature
    | undefined;

  // Default statistics for empty or invalid data
  const defaultStats: TrackStatistics = {
    totalDistance: 0,
    elevationGain: 0,
    elevationLoss: 0,
    maxElevation: 0,
    minElevation: 0,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    movingTime: 0,
    totalTime: 0,
    averageSpeed: 0,
    maxSpeed: 0,
  };

  if (!trackFeature || trackFeature.geometry.type !== "LineString") {
    return defaultStats;
  }

  // Now we know it's a LineString, we can safely access coordinates
  const coordinates = trackFeature.geometry.coordinates;
  if (!coordinates || coordinates.length === 0) {
    return defaultStats;
  }

  // Calculate distance using Turf.js
  const line = turf.lineString(coordinates);
  const totalDistance = turf.length(line, { units: "kilometers" });

  // Calculate elevation statistics
  const elevations: number[] = [];
  for (const coord of coordinates) {
    if (coord.length > 2 && typeof coord[2] === "number") {
      elevations.push(coord[2]);
    }
  }

  let elevationGain = 0;
  let elevationLoss = 0;
  const maxElevation = elevations.length > 0 ? Math.max(...elevations) : 0;
  const minElevation = elevations.length > 0 ? Math.min(...elevations) : 0;

  // Calculate elevation gain/loss
  for (let i = 1; i < elevations.length; i++) {
    // TypeScript should know these are numbers because of the filter above,
    // but we'll add an extra check to be safe
    const current = elevations[i];
    const previous = elevations[i - 1];

    if (typeof current === "number" && typeof previous === "number") {
      const diff = current - previous;
      if (diff > 0) {
        elevationGain += diff;
      } else {
        elevationLoss += Math.abs(diff);
      }
    }
  }

  // Extract time data
  const times = trackFeature.properties?.coordTimes || [];
  const defaultTime = new Date().toISOString();
  const startTimeStr = times.length > 0 && times[0] ? String(times[0]) : defaultTime;
  const endTimeStr =
    times.length > 0 && times[times.length - 1] ? String(times[times.length - 1]) : defaultTime;

  // Calculate time statistics
  let movingTime = 0;
  let totalTime = 0;
  let maxSpeed = 0;

  if (times.length > 1) {
    // We've already checked that startTimeStr and endTimeStr are strings
    const start = new Date(startTimeStr).getTime();
    const end = new Date(endTimeStr).getTime();
    totalTime = (end - start) / 1000; // in seconds

    // Calculate moving time and max speed
    let movingSeconds = 0;
    let maxSpeedValue = 0;

    for (let i = 1; i < times.length; i++) {
      // Skip if either time is missing
      if (!times[i - 1] || !times[i]) continue;

      // We've already checked that these times exist
      const t1 = new Date(times[i - 1] as string).getTime();
      const t2 = new Date(times[i] as string).getTime();
      const timeDiff = (t2 - t1) / 1000; // in seconds

      if (timeDiff > 0) {
        // Calculate distance between points
        const p1 = coordinates[i - 1];
        const p2 = coordinates[i];
        if (!p1 || !p2) continue; // Skip if points are missing

        const segment = turf.lineString([p1, p2]);
        const segmentDistance = turf.length(segment, { units: "kilometers" });

        // Calculate speed in km/h
        const speed = (segmentDistance / timeDiff) * 3600;

        // Update max speed
        if (speed > maxSpeedValue) {
          maxSpeedValue = speed;
        }

        // If speed is above threshold, consider it moving time
        if (speed > 0.5) {
          // 0.5 km/h threshold
          movingSeconds += timeDiff;
        }
      }
    }

    movingTime = movingSeconds;
    maxSpeed = maxSpeedValue;
  }

  // Calculate average speed
  const averageSpeed = movingTime > 0 ? totalDistance / (movingTime / 3600) : 0;

  return {
    totalDistance,
    elevationGain,
    elevationLoss,
    maxElevation,
    minElevation,
    startTime: startTimeStr,
    endTime: endTimeStr,
    movingTime,
    totalTime,
    averageSpeed,
    maxSpeed,
  };
};

/**
 * Simplify GeoJSON for faster rendering
 * @param geoJson GeoJSON to simplify
 * @returns Simplified GeoJSON
 */
const simplifyGeoJson = (geoJson: EnhancedGeoJSON): EnhancedGeoJSON => {
  // Create a deep copy of the GeoJSON
  const simplifiedGeoJson = JSON.parse(JSON.stringify(geoJson)) as EnhancedGeoJSON;

  // Find LineString features and simplify them
  if (simplifiedGeoJson.features && simplifiedGeoJson.features.length > 0) {
    for (let i = 0; i < simplifiedGeoJson.features.length; i++) {
      const feature = simplifiedGeoJson.features[i];
      if (feature?.geometry?.type === "LineString") {
        try {
          // Use Turf.js to simplify the LineString
          const simplified = turf.simplify(
            {
              type: "Feature",
              properties: feature.properties,
              geometry: feature.geometry,
            },
            {
              tolerance: 0.0001, // Adjust tolerance as needed
              highQuality: true,
            }
          );

          // Replace the feature with the simplified version
          simplifiedGeoJson.features[i] = simplified as unknown as EnhancedFeature;
        } catch (error) {
          console.error("Error simplifying GeoJSON:", error);
          // Keep the original feature if simplification fails
        }
      }
    }
  }

  return simplifiedGeoJson;
};
