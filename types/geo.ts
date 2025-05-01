import type { GeoJSON } from "geojson";

/**
 * GeoJSON Feature Collection with additional properties
 */
export interface EnhancedGeoJSON extends GeoJSON.FeatureCollection {
  features: EnhancedFeature[];
}

/**
 * GeoJSON Feature with additional properties
 */
export interface EnhancedFeature extends GeoJSON.Feature {
  properties: EnhancedProperties;
  geometry: EnhancedGeometry;
}

/**
 * Enhanced geometry with specific types
 */
export type EnhancedGeometry =
  | GeoJSON.Point
  | GeoJSON.MultiPoint
  | GeoJSON.LineString
  | GeoJSON.MultiLineString
  | GeoJSON.Polygon
  | GeoJSON.MultiPolygon
  | GeoJSON.GeometryCollection;

/**
 * Enhanced properties for GeoJSON features
 */
export interface EnhancedProperties {
  name?: string;
  coordTimes?: (string | null)[];
  [key: string]: unknown;
}

/**
 * GPS Track Statistics
 */
export interface TrackStatistics {
  totalDistance: number;
  elevationGain: number;
  elevationLoss: number;
  maxElevation: number;
  minElevation: number;
  startTime: string;
  endTime: string;
  movingTime: number;
  totalTime: number;
  averageSpeed: number;
  maxSpeed: number;
  simplifiedGeoJson?: EnhancedGeoJSON;
}

/**
 * GPS Trackpoint
 */
export interface Trackpoint {
  index: number;
  longitude: number;
  latitude: number;
  elevation: number | null;
  time: string | null;
}

/**
 * GPS File Parsing Result
 */
export interface GpsParsingResult {
  success: boolean;
  data?: {
    geoJson: EnhancedGeoJSON;
    stats: TrackStatistics;
  };
  error?: string;
}

/**
 * GPS File Types
 */
export type GpsFileType = "gpx" | "kml" | "fit" | "tcx";

/**
 * Simplification Level
 */
export type SimplificationLevel = "high" | "medium" | "low" | "none";
