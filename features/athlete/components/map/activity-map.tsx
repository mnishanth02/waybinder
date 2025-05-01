"use client";

import type { EnhancedGeoJSON, SimplificationLevel } from "@/types/geo";
import { useEffect, useRef, useState } from "react";
import MapGL, { Layer, NavigationControl, Source } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MaplibreMap } from "maplibre-gl";
import { toast } from "sonner";

interface ActivityMapProps {
  activityId: string;
  height?: string;
  width?: string;
  interactive?: boolean;
  accessibilityFeatures?: boolean;
  renderOptions?: {
    simplificationLevel?: SimplificationLevel;
    colorScheme?: "elevation" | "speed" | "gradient" | "custom";
    lineOptions?: {
      width?: number;
      opacity?: number;
    };
  };
  onMapLoad?: (map: MaplibreMap) => void;
}

export const ActivityMap = ({
  activityId,
  height = "400px",
  width = "100%",
  interactive = true,
  accessibilityFeatures = true,
  renderOptions = {
    simplificationLevel: "medium",
    colorScheme: "elevation",
    lineOptions: { width: 3, opacity: 0.8 },
  },
  onMapLoad,
}: ActivityMapProps) => {
  const mapRef = useRef<MaplibreMap | null>(null);
  const [geoJson, setGeoJson] = useState<EnhancedGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GeoJSON data for the activity
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/gps/activity/${activityId}/geojson?simplificationLevel=${renderOptions.simplificationLevel}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch GPS data");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setGeoJson(data.data as EnhancedGeoJSON);
        } else {
          throw new Error(data.error || "Failed to fetch GPS data");
        }
      } catch (error) {
        console.error("Error fetching GeoJSON:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error fetching GPS data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchGeoJson();
    }
  }, [activityId, renderOptions.simplificationLevel]);

  // Fit map to bounds when GeoJSON is loaded
  useEffect(() => {
    if (geoJson && mapRef.current) {
      try {
        // Find the LineString feature
        const trackFeature = geoJson.features?.find((f) => f.geometry?.type === "LineString");

        if (
          trackFeature &&
          trackFeature.geometry.type === "LineString" &&
          trackFeature.geometry.coordinates.length > 0
        ) {
          // Calculate bounds
          const coordinates = trackFeature.geometry.coordinates;
          let minLng = Number.POSITIVE_INFINITY;
          let maxLng = Number.NEGATIVE_INFINITY;
          let minLat = Number.POSITIVE_INFINITY;
          let maxLat = Number.NEGATIVE_INFINITY;

          for (const coord of coordinates) {
            const [lng, lat] = coord as [number, number];
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          }

          // Add padding
          const padding = 50;
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding, duration: 1000 }
          );
        }
      } catch (error) {
        console.error("Error fitting map to bounds:", error);
      }
    }
  }, [geoJson]);

  // Get line color based on color scheme
  const getLineColor = () => {
    switch (renderOptions.colorScheme) {
      case "elevation":
        return "#FF5500";
      case "speed":
        return "#0088FF";
      case "gradient":
        return ["interpolate", ["linear"], ["line-progress"], 0, "#FF0000", 1, "#0000FF"];
      case "custom":
        return "#FF00FF";
      default:
        return "#FF5500";
    }
  };

  // Get line width
  const getLineWidth = () => {
    return renderOptions.lineOptions?.width || 3;
  };

  // Get line opacity
  const getLineOpacity = () => {
    return renderOptions.lineOptions?.opacity || 0.8;
  };

  return (
    <div
      style={{
        height,
        width,
        position: "relative",
        borderRadius: "0.375rem",
        overflow: "hidden",
      }}
      aria-label={`Map showing GPS track for activity ${activityId}`}
      role="figure"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
          <div className="rounded-md bg-background p-4 shadow-md">
            <p className="text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
          <div className="rounded-md bg-background p-4 shadow-md">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      )}

      <MapGL
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
        mapLib={import("maplibre-gl")}
        mapStyle={process.env.NEXT_PUBLIC_MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactive={interactive}
        attributionControl={true}
        onLoad={() => {
          if (onMapLoad && mapRef.current) {
            onMapLoad(mapRef.current);
          }
        }}
      >
        {/* Navigation Controls */}
        {interactive && <NavigationControl position="top-right" />}

        {/* GPS Track */}
        {geoJson && (
          <Source id="activity-track" type="geojson" data={geoJson}>
            <Layer
              id="track-line"
              type="line"
              paint={{
                "line-color": getLineColor(),
                "line-width": getLineWidth(),
                "line-opacity": getLineOpacity(),
              }}
            />
          </Source>
        )}
      </MapGL>

      {/* Accessibility description for screen readers */}
      {accessibilityFeatures && (
        <div className="sr-only">
          <p>
            This map displays the GPS track for the activity. The track is shown as a colored line
            representing the path taken during the activity.
          </p>
        </div>
      )}
    </div>
  );
};
