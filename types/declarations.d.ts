declare module "fit-file-parser" {
  interface FitParserOptions {
    force?: boolean;
    speedUnit?: string;
    lengthUnit?: string;
    temperatureUnit?: string;
    elapsedRecordField?: boolean;
    mode?: string;
  }

  interface FitRecord {
    timestamp?: string | number;
    position_lat?: number;
    position_long?: number;
    altitude?: number;
    heart_rate?: number;
    cadence?: number;
    distance?: number;
    speed?: number;
    [key: string]: unknown;
  }

  interface FitSession {
    sport?: string;
    start_time?: string | number;
    total_elapsed_time?: number;
    total_distance?: number;
    [key: string]: unknown;
  }

  interface FitLap {
    start_time?: string | number;
    total_elapsed_time?: number;
    total_distance?: number;
    [key: string]: unknown;
  }

  interface FitData {
    records?: FitRecord[];
    sessions?: FitSession[];
    laps?: FitLap[];
    [key: string]: unknown;
  }

  class FitParser {
    constructor(options?: FitParserOptions);
    parse(content: ArrayBuffer, callback: (error: Error | null, data: FitData) => void): void;
  }

  export default FitParser;
}

declare module "gpxparser" {
  interface GpxPoint {
    lat: number;
    lon: number;
    ele?: number;
    time?: Date;
    [key: string]: unknown;
  }

  interface GpxTrack {
    name?: string;
    points: GpxPoint[];
    distance: {
      total: number;
      cumulative: number[];
    };
    elevation: {
      max: number;
      min: number;
      gain: number;
      loss: number;
    };
    [key: string]: unknown;
  }

  interface GpxRoute {
    name?: string;
    points: GpxPoint[];
    distance?: number;
    [key: string]: unknown;
  }

  class GpxParser {
    tracks: GpxTrack[];
    waypoints: GpxPoint[];
    routes: GpxRoute[];
    parse(gpxString: string): void;
    [key: string]: unknown;
  }

  export default GpxParser;
}

declare module "tcx-js" {
  interface TcxTrackpoint {
    position?: {
      latitude: number;
      longitude: number;
    };
    altitude?: number;
    time?: string;
    heartRate?: number;
    cadence?: number;
    distance?: number;
    speed?: number;
    [key: string]: unknown;
  }

  interface TcxTrack {
    trackpoints?: TcxTrackpoint[];
    name?: string;
    notes?: string;
    [key: string]: unknown;
  }

  interface TcxLap {
    tracks?: TcxTrack[];
    startTime?: string;
    totalTimeSeconds?: number;
    distanceMeters?: number;
    maximumSpeed?: number;
    calories?: number;
    [key: string]: unknown;
  }

  interface TcxActivity {
    sport?: string;
    laps?: TcxLap[];
    id?: string;
    notes?: string;
    [key: string]: unknown;
  }

  interface TcxData {
    activities?: TcxActivity[];
    author?: string;
    creator?: string;
    [key: string]: unknown;
  }

  class Parser {
    constructor();
    parse(tcxString: string): TcxData;
  }

  export { Parser };
}

declare module "jsdom" {
  class DOMParser {
    parseFromString(str: string, type: string): Document;
  }
}

declare module "react-map-gl" {
  import type { ReactNode } from "react";
  import type { Map as MaplibreMap } from "maplibre-gl";
  import type { GeoJSON } from "geojson";

  interface MapProps {
    ref?: React.RefObject<MaplibreMap> | ((instance: { getMap(): MaplibreMap } | null) => void);
    mapLib?: unknown;
    mapStyle?: string;
    style?: React.CSSProperties;
    interactive?: boolean;
    attributionControl?: boolean;
    onLoad?: (event: { target: MaplibreMap }) => void;
    children?: ReactNode;
    [key: string]: unknown;
  }

  interface PaintProps {
    "line-color"?: string | string[] | object;
    "line-width"?: number;
    "line-opacity"?: number;
    "fill-color"?: string | string[] | object;
    "fill-opacity"?: number;
    "circle-radius"?: number;
    "circle-color"?: string | string[] | object;
    [key: string]: unknown;
  }

  interface LayerProps {
    id: string;
    type: string;
    paint?: PaintProps;
    layout?: Record<string, unknown>;
    source?: string;
    filter?: unknown[];
    [key: string]: unknown;
  }

  interface SourceProps {
    id: string;
    type: string;
    data: GeoJSON | string | object;
    children?: ReactNode;
    cluster?: boolean;
    clusterRadius?: number;
    [key: string]: unknown;
  }

  interface NavigationControlProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    showCompass?: boolean;
    showZoom?: boolean;
    [key: string]: unknown;
  }

  export function Layer(props: LayerProps): JSX.Element;
  export function Source(props: SourceProps): JSX.Element;
  export function NavigationControl(props: NavigationControlProps): JSX.Element;
  export default function MapGL(props: MapProps): JSX.Element;
}
