"use client";

import type { TrackStatistics } from "@/types/geo";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface UseGpsWorkerOptions {
  onValidationComplete?: (result: ValidationResult) => void;
  onPreviewProgress?: (progress: number) => void;
  onPreviewComplete?: (result: { preview?: PreviewResult; error?: string }) => void;
  onStatisticsProgress?: (progress: number) => void;
  onStatisticsComplete?: (result: { statistics?: TrackStatistics; error?: string }) => void;
  onError?: (error: string, type: string) => void;
}

export const useGpsWorker = (options: UseGpsWorkerOptions = {}) => {
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize worker
  useEffect(() => {
    // Create worker
    if (typeof window !== "undefined" && window.Worker) {
      try {
        // In a real implementation, we would use a proper worker setup
        // For now, we'll create a URL from a blob
        const workerCode = `
          self.onmessage = function(e) {
            const { type, payload } = e.data;

            if (type === "VALIDATE_FILE") {
              // Simulate validation
              setTimeout(() => {
                self.postMessage({
                  type: "VALIDATION_COMPLETE",
                  payload: { valid: true, fileType: payload.file.name.split(".").pop() }
                });
              }, 500);
            }
            else if (type === "GENERATE_PREVIEW") {
              // Simulate preview generation with progress
              let progress = 0;
              const interval = setInterval(() => {
                progress += 20;
                self.postMessage({
                  type: "PREVIEW_PROGRESS",
                  payload: { progress }
                });

                if (progress >= 100) {
                  clearInterval(interval);
                  self.postMessage({
                    type: "PREVIEW_COMPLETE",
                    payload: {
                      preview: {
                        points: 1000,
                        distance: 10.5,
                        duration: 3600,
                        hasElevation: true,
                        hasTimeData: true
                      }
                    }
                  });
                }
              }, 200);
            }
            else if (type === "CALCULATE_STATISTICS") {
              // Simulate statistics calculation with progress
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                self.postMessage({
                  type: "STATISTICS_PROGRESS",
                  payload: { progress }
                });

                if (progress >= 100) {
                  clearInterval(interval);
                  self.postMessage({
                    type: "STATISTICS_COMPLETE",
                    payload: {
                      statistics: {
                        totalDistance: 10.5,
                        elevationGain: 350,
                        elevationLoss: 320,
                        maxElevation: 1200,
                        minElevation: 850,
                        startTime: new Date().toISOString(),
                        endTime: new Date(Date.now() + 3600000).toISOString(),
                        movingTime: 3200,
                        totalTime: 3600,
                        averageSpeed: 10.5,
                        maxSpeed: 15.2
                      }
                    }
                  });
                }
              }, 200);
            }
          };
        `;

        const blob = new Blob([workerCode], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl);

        // Set up message handler
        workerRef.current.onmessage = (event) => {
          const { type, payload } = event.data;

          switch (type) {
            case "VALIDATION_COMPLETE":
              optionsRef.current.onValidationComplete?.(payload);
              break;
            case "PREVIEW_PROGRESS":
              optionsRef.current.onPreviewProgress?.(payload.progress);
              break;
            case "PREVIEW_COMPLETE":
              optionsRef.current.onPreviewComplete?.(payload);
              break;
            case "STATISTICS_PROGRESS":
              optionsRef.current.onStatisticsProgress?.(payload.progress);
              break;
            case "STATISTICS_COMPLETE":
              optionsRef.current.onStatisticsComplete?.(payload);
              break;
            case "ERROR":
              optionsRef.current.onError?.(payload.error, payload.originalType);
              break;
          }
        };

        setIsWorkerReady(true);

        // Clean up
        return () => {
          if (workerRef.current) {
            workerRef.current.terminate();
            URL.revokeObjectURL(workerUrl);
          }
        };
      } catch (error) {
        console.error("Error creating worker:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize worker";
        optionsRef.current.onError?.(errorMessage, "INIT");
      }
    } else {
      console.warn("Web Workers are not supported in this environment");
      optionsRef.current.onError?.("Web Workers are not supported in this environment", "INIT");
    }
  }, []);

  // Validate file
  const validateFile = useCallback(
    (file: File) => {
      if (!isWorkerReady || !workerRef.current) {
        optionsRef.current.onError?.("Worker is not ready", "VALIDATE_FILE");
        return;
      }

      workerRef.current.postMessage({
        type: "VALIDATE_FILE",
        payload: { file },
      });
    },
    [isWorkerReady]
  );

  // Generate preview
  const generatePreview = useCallback(() => {
    if (!isWorkerReady || !workerRef.current) {
      optionsRef.current.onError?.("Worker is not ready", "GENERATE_PREVIEW");
      return;
    }

    workerRef.current.postMessage({
      type: "GENERATE_PREVIEW",
      payload: {},
    });
  }, [isWorkerReady]);

  // Calculate statistics
  const calculateStatistics = useCallback(() => {
    if (!isWorkerReady || !workerRef.current) {
      optionsRef.current.onError?.("Worker is not ready", "CALCULATE_STATISTICS");
      return;
    }

    workerRef.current.postMessage({
      type: "CALCULATE_STATISTICS",
      payload: {},
    });
  }, [isWorkerReady]);

  return {
    isWorkerReady,
    validateFile,
    generatePreview,
    calculateStatistics,
  };
};
