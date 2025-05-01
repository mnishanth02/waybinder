/**
 * GPS Web Worker
 *
 * This worker handles CPU-intensive GPS file processing on a separate thread
 * to prevent blocking the main UI thread.
 */

import type { TrackStatistics } from "@/types/geo";

// Define message types
interface WorkerMessage {
  type: string;
  payload: {
    file?: File;
    [key: string]: unknown;
  };
}

interface ValidationResult {
  valid: boolean;
  fileType?: string;
  fileSize?: number;
  error?: string;
}

interface PreviewResult {
  points: number;
  distance: number;
  duration: number;
  hasElevation: boolean;
  hasTimeData: boolean;
}

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case "VALIDATE_FILE": {
        if (!payload.file) {
          throw new Error("No file provided for validation");
        }
        await validateFile(payload.file);
        break;
      }
      case "GENERATE_PREVIEW": {
        if (!payload.file) {
          throw new Error("No file provided for preview generation");
        }
        await generatePreview();
        break;
      }
      case "CALCULATE_STATISTICS": {
        if (!payload.file) {
          throw new Error("No file provided for statistics calculation");
        }
        await calculateStatistics();
        break;
      }
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: {
        error: error instanceof Error ? error.message : "Unknown error in worker",
        originalType: type,
      },
    });
  }
};

/**
 * Validate a GPS file
 * @param file The file to validate
 */
async function validateFile(file: File): Promise<void> {
  try {
    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!fileType || !["gpx", "kml", "fit", "tcx"].includes(fileType)) {
      throw new Error("Invalid file type. Please upload a GPX, KML, FIT, or TCX file.");
    }

    // Check file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds the maximum limit of 50MB.");
    }

    // Basic content validation
    const buffer = await file.arrayBuffer();
    const isValid = await validateFileContent(buffer, fileType);
    if (!isValid) {
      throw new Error("Invalid file content. The file appears to be corrupted or malformed.");
    }

    // Send success message
    const result: ValidationResult = {
      valid: true,
      fileType,
      fileSize: file.size,
    };

    self.postMessage({
      type: "VALIDATION_COMPLETE",
      payload: result,
    });
  } catch (error) {
    const result: ValidationResult = {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };

    self.postMessage({
      type: "VALIDATION_COMPLETE",
      payload: result,
    });
  }
}

/**
 * Validate file content based on file type
 * @param buffer File buffer
 * @param fileType File type
 * @returns Whether the file content is valid
 */
async function validateFileContent(buffer: ArrayBuffer, fileType: string): Promise<boolean> {
  try {
    // This is a simplified implementation
    // In a real app, we would do more thorough validation

    // Convert buffer to text for XML-based formats
    if (["gpx", "kml", "tcx"].includes(fileType)) {
      const text = new TextDecoder().decode(buffer);

      // Check for XML declaration or root elements
      if (fileType === "gpx" && !text.includes("<gpx")) {
        return false;
      }
      if (fileType === "kml" && !text.includes("<kml")) {
        return false;
      }
      if (fileType === "tcx" && !text.includes("<TrainingCenterDatabase")) {
        return false;
      }

      // Check for basic XML structure
      return text.includes("<?xml") || text.includes("<");
    }

    // For binary formats like FIT, we would need more specific validation
    // This is a placeholder
    if (fileType === "fit") {
      // Check for FIT file header (simplified)
      const header = new Uint8Array(buffer.slice(0, 12));
      // FIT files typically start with a header containing the file size
      // This is a very simplified check
      return header.length >= 12;
    }

    return true;
  } catch (error) {
    console.error("Error validating file content:", error);
    return false;
  }
}

/**
 * Generate a preview of a GPS file
 */
async function generatePreview(): Promise<void> {
  try {
    // This is a placeholder implementation
    // In a real app, we would parse the file and extract a simplified preview

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send progress updates
    for (let progress = 0; progress <= 100; progress += 20) {
      self.postMessage({
        type: "PREVIEW_PROGRESS",
        payload: { progress },
      });

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Send success message with mock preview data
    const previewData: PreviewResult = {
      points: 1000, // Mock number of points
      distance: 10.5, // Mock distance in km
      duration: 3600, // Mock duration in seconds
      hasElevation: true,
      hasTimeData: true,
    };

    self.postMessage({
      type: "PREVIEW_COMPLETE",
      payload: {
        preview: previewData,
      },
    });
  } catch (error) {
    self.postMessage({
      type: "PREVIEW_COMPLETE",
      payload: {
        error: error instanceof Error ? error.message : "Unknown preview generation error",
      },
    });
  }
}

/**
 * Calculate statistics from a GPS file
 */
async function calculateStatistics(): Promise<void> {
  try {
    // This is a placeholder implementation
    // In a real app, we would parse the file and calculate actual statistics

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      self.postMessage({
        type: "STATISTICS_PROGRESS",
        payload: { progress },
      });

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Send success message with mock statistics
    const statistics: TrackStatistics = {
      totalDistance: 10.5, // km
      elevationGain: 350, // m
      elevationLoss: 320, // m
      maxElevation: 1200, // m
      minElevation: 850, // m
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      movingTime: 3200, // seconds
      totalTime: 3600, // seconds
      averageSpeed: 10.5, // km/h
      maxSpeed: 15.2, // km/h
    };

    self.postMessage({
      type: "STATISTICS_COMPLETE",
      payload: {
        statistics,
      },
    });
  } catch (error) {
    self.postMessage({
      type: "STATISTICS_COMPLETE",
      payload: {
        error: error instanceof Error ? error.message : "Unknown statistics calculation error",
      },
    });
  }
}
