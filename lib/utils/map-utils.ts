import type { StyleSpecification } from "react-map-gl/maplibre";

/**
 * Creates a MapLibre style configuration for OpenStreetMap tiles
 * @returns A StyleSpecification object for MapLibre GL
 */
export function createOSMStyle(): StyleSpecification {
  return {
    version: 8 as const,
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: [
          process.env.NEXT_PUBLIC_MAP_STYLE || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}
