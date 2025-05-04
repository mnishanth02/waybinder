import { type ParsedGPSData, parseGPSFile } from "@/lib/utils/gps-file-parser";
import { useCallback, useState } from "react";
import useFileUpload, {
  type FileUploadConfig,
  type UploadResult,
  type FileUploadOptions,
} from "./use-file-upload";

export type GPSFileUploadOptions = FileUploadOptions & {
  /** Whether to extract and save GPS data */
  extractData?: boolean;
  /** Whether to simplify the GPS track for better performance */
  simplifyTrack?: boolean;
  /** Tolerance for track simplification (higher = more simplification) */
  simplifyTolerance?: number;
};

export type GPSUploadResult = UploadResult & {
  gpsData: ParsedGPSData;
};

/**
 * Custom hook for uploading GPS files (GPX, KML, FIT, etc.) to S3-compatible storage
 */
export function useGPSFileUpload(config: FileUploadConfig) {
  const [gpsData, setGpsData] = useState<Record<string, ParsedGPSData>>({});

  const { uploadFile, isUploading, progress, error, resetError } = useFileUpload(config);

  // Process GPS file to extract data
  const processGPSFile = useCallback(async (file: File): Promise<ParsedGPSData> => {
    try {
      // Use the existing GPS file parser from your codebase
      return await parseGPSFile(file);
    } catch (err) {
      console.error("Error processing GPS file:", err);
      throw new Error(
        `Failed to process GPS file: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, []);

  // Upload a single GPS file
  const uploadGPSFile = useCallback(
    async (file: File, options?: GPSFileUploadOptions): Promise<GPSUploadResult> => {
      try {
        // Validate file extension
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        const validExtensions = ["gpx", "kml", "fit", "tcx"];

        if (!fileExtension || !validExtensions.includes(fileExtension)) {
          throw new Error(
            `Unsupported file type: ${fileExtension}. Supported types: ${validExtensions.join(", ")}`
          );
        }

        // Process GPS file to extract data if requested
        let parsedData: ParsedGPSData | undefined = undefined;

        if (options?.extractData !== false) {
          parsedData = await processGPSFile(file);

          // Store GPS data for later use
          if (parsedData) {
            setGpsData((prev) => ({
              ...prev,
              [file.name]: parsedData as ParsedGPSData,
            }));
          }
        }

        // Upload the file
        const uploadResult = await uploadFile(file, {
          maxSize: options?.maxSize || 50 * 1024 * 1024, // Default 50MB
          keyPrefix: options?.keyPrefix || "gps/",
          acceptedFileTypes: [".gpx", ".kml", ".fit", ".tcx"],
          public: options?.public !== false,
          metadata: parsedData
            ? {
                "gps-distance": parsedData.stats.distance.toString(),
                "gps-duration": parsedData.stats.duration.toString(),
                "gps-elevation-gain": parsedData.stats.elevation.gain.toString(),
                "gps-elevation-loss": parsedData.stats.elevation.loss.toString(),
                "gps-start-time": parsedData.stats.startTime?.toISOString() || "",
                "gps-end-time": parsedData.stats.endTime?.toISOString() || "",
              }
            : undefined,
        });

        // Return combined result with default GPS data if none was extracted
        return {
          ...uploadResult,
          gpsData: parsedData || {
            geoJSON: { type: "FeatureCollection", features: [] },
            stats: {
              distance: 0,
              duration: 0,
              elevation: { gain: 0, loss: 0, max: 0, min: 0 },
              startTime: null,
              endTime: null,
              pace: 0,
            },
          },
        };
      } catch (err) {
        console.error("GPS file upload error:", err);
        throw err;
      }
    },
    [uploadFile, processGPSFile]
  );

  // Upload multiple GPS files
  const uploadGPSFiles = useCallback(
    async (files: File[], options?: GPSFileUploadOptions): Promise<GPSUploadResult[]> => {
      const results: GPSUploadResult[] = [];

      for (const file of files) {
        try {
          const result = await uploadGPSFile(file, options);
          results.push(result);
        } catch (err) {
          console.error(`Error uploading GPS file ${file.name}:`, err);
          // Continue with other files even if one fails
        }
      }

      return results;
    },
    [uploadGPSFile]
  );

  // Handle file input change event
  const handleGPSFileInputChange = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      options?: GPSFileUploadOptions
    ): Promise<GPSUploadResult | GPSUploadResult[] | null> => {
      const files = event.target.files;
      if (!files || files.length === 0) return null;

      try {
        if (files.length === 1 && files[0]) {
          return await uploadGPSFile(files[0], options);
        }
        return await uploadGPSFiles(Array.from(files), options);
      } catch (error) {
        console.error("GPS file upload error:", error);
        return null;
      }
    },
    [uploadGPSFile, uploadGPSFiles]
  );

  return {
    uploadGPSFile,
    uploadGPSFiles,
    handleGPSFileInputChange,
    isUploading,
    progress,
    error,
    resetError,
    gpsData,
  };
}

export default useGPSFileUpload;
