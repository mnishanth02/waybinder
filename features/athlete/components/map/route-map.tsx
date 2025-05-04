import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Map as LibreMap, NavigationControl, Source } from "react-map-gl/maplibre";
import type { LineLayerSpecification, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { createOSMStyle } from "@/lib/utils/map-utils";

interface RouteMapProps {
  geoJSON?: GeoJSON.FeatureCollection;
  height?: string;
  width?: string;
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({
  geoJSON,
  height = "300px",
  width = "100%",
  className = "",
}) => {
  const mapRef = useRef<MapRef>(null);
  // Set a default view that will be immediately overridden if geoJSON is provided
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1,
  });

  // Define the line layer style
  const lineLayer: LineLayerSpecification = {
    id: "route",
    type: "line",
    source: "route-source",
    paint: {
      "line-color": "#4E3FC8",
      "line-width": 3,
      "line-opacity": 0.8,
    },
  };

  // Extract coordinates from GeoJSON - memoized with useCallback
  const extractCoordinates = useCallback(
    (geoJSON: GeoJSON.FeatureCollection): [number, number][] => {
      const coordinates: [number, number][] = [];

      for (const feature of geoJSON.features) {
        if (feature.geometry.type === "LineString") {
          coordinates.push(...(feature.geometry.coordinates as [number, number][]));
        } else if (feature.geometry.type === "MultiLineString") {
          for (const line of feature.geometry.coordinates) {
            coordinates.push(...(line as [number, number][]));
          }
        } else if (feature.geometry.type === "Point") {
          coordinates.push(feature.geometry.coordinates as [number, number]);
        }
      }

      return coordinates;
    },
    []
  );

  // Calculate bounds from coordinates - memoized with useCallback
  const calculateBounds = useCallback((coordinates: [number, number][]) => {
    return coordinates.reduce(
      (bounds, coord) => {
        return {
          minLng: Math.min(bounds.minLng, coord[0]),
          minLat: Math.min(bounds.minLat, coord[1]),
          maxLng: Math.max(bounds.maxLng, coord[0]),
          maxLat: Math.max(bounds.maxLat, coord[1]),
        };
      },
      {
        minLng: Number.POSITIVE_INFINITY,
        minLat: Number.POSITIVE_INFINITY,
        maxLng: Number.NEGATIVE_INFINITY,
        maxLat: Number.NEGATIVE_INFINITY,
      }
    );
  }, []);

  // Fit the map to the route bounds when geoJSON changes or when the map is loaded
  useEffect(() => {
    if (!geoJSON || !mapRef.current) return;

    // Extract coordinates and calculate bounds
    const coordinates = extractCoordinates(geoJSON);
    if (coordinates.length === 0) return;

    const bounds = calculateBounds(coordinates);

    // Ensure bounds are valid
    if (
      bounds.minLng === Number.POSITIVE_INFINITY ||
      bounds.minLat === Number.POSITIVE_INFINITY ||
      bounds.maxLng === Number.NEGATIVE_INFINITY ||
      bounds.maxLat === Number.NEGATIVE_INFINITY
    ) {
      return;
    }

    // Calculate center point for initial view
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;

    // Update view state with calculated center
    setViewState({
      longitude: centerLng,
      latitude: centerLat,
      zoom: 12, // Start with a reasonable zoom level
    });

    // Fit map to bounds with padding
    const padding = { top: 50, bottom: 50, left: 50, right: 50 };
    const map = mapRef.current.getMap();

    // Use a short timeout to ensure the map is fully loaded
    setTimeout(() => {
      map.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding,
          duration: 1000,
          maxZoom: 16, // Prevent zooming in too far on small routes
        }
      );
    }, 100);
  }, [geoJSON, extractCoordinates, calculateBounds]);

  // Reference to the custom control container for cleanup
  const customControlRef = useRef<HTMLDivElement | null>(null);

  // Handle map load event to fit bounds and add custom controls
  const onMapLoad = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    // Add reset view control
    const resetViewControl = document.createElement("button");
    resetViewControl.className = "maplibregl-ctrl-icon maplibregl-ctrl-reset";
    resetViewControl.type = "button";
    resetViewControl.setAttribute("aria-label", "Reset View");
    resetViewControl.innerHTML = `
      <span style="font-size: 18px; display: flex; justify-content: center; align-items: center; height: 100%;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
          <path d="M3 12h2"></path>
          <path d="M19 12h2"></path>
          <path d="M12 3v2"></path>
          <path d="M12 19v2"></path>
        </svg>
      </span>
    `;

    resetViewControl.addEventListener("click", () => {
      if (!geoJSON || !mapRef.current) return;

      const coordinates = extractCoordinates(geoJSON);
      if (coordinates.length === 0) return;

      const bounds = calculateBounds(coordinates);
      const map = mapRef.current.getMap();

      map.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 50,
          duration: 1000,
          maxZoom: 16, // Prevent zooming in too far on small routes
        }
      );
    });

    // Create a custom control container
    const customControlContainer = document.createElement("div");
    customControlContainer.className = "maplibregl-ctrl maplibregl-ctrl-group";
    customControlContainer.appendChild(resetViewControl);
    customControlRef.current = customControlContainer;

    // Add the custom control to the map
    const controlContainer = map
      .getContainer()
      .querySelector(".maplibregl-control-container .maplibregl-ctrl-top-right");

    if (controlContainer) {
      controlContainer.appendChild(customControlContainer);
    }

    // Fit to bounds if geoJSON is available
    if (geoJSON) {
      const coordinates = extractCoordinates(geoJSON);
      if (coordinates.length === 0) return;

      const bounds = calculateBounds(coordinates);

      map.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 50,
          duration: 1000,
          maxZoom: 16, // Prevent zooming in too far on small routes
        }
      );
    }
  }, [geoJSON, extractCoordinates, calculateBounds]);

  // Cleanup custom controls when component unmounts
  useEffect(() => {
    return () => {
      if (customControlRef.current && mapRef.current) {
        try {
          const controlContainer = mapRef.current
            .getMap()
            .getContainer()
            .querySelector(".maplibregl-control-container .maplibregl-ctrl-top-right");

          if (controlContainer && customControlRef.current.parentNode === controlContainer) {
            controlContainer.removeChild(customControlRef.current);
          }
        } catch (e) {
          console.error("Error removing custom control:", e);
        }
      }
    };
  }, []);

  return (
    <div style={{ height, width }} className={className}>
      <LibreMap
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        mapStyle={createOSMStyle()}
        style={{ width: "100%", height: "100%", borderRadius: "0.375rem" }}
      >
        {/* Navigation controls with zoom in/out and compass */}
        <NavigationControl position="top-right" />

        {geoJSON && (
          <Source id="route-source" type="geojson" data={geoJSON}>
            <Layer {...lineLayer} />
          </Source>
        )}
      </LibreMap>
    </div>
  );
};

export default RouteMap;
