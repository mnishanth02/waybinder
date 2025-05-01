"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TrackStatistics } from "@/types/geo";
import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface GpsFileUploadProps {
  acceptedFormats?: string[];
  maxFileSize?: string;
  dragAndDrop?: boolean;
  showPreview?: boolean;
  previewType?: "map" | "stats" | "both";
  onProgress?: (progress: number) => void;
  onFileProcessed?: (stats: TrackStatistics) => void;
  onError?: (error: string) => void;
  journeyId: string;
  activityId?: string;
}

export const GpsFileUpload = ({
  acceptedFormats = ["gpx", "kml", "fit", "tcx"],
  maxFileSize = "50MB",
  dragAndDrop = true,
  showPreview = true,
  previewType = "both",
  onProgress,
  onFileProcessed,
  onError,
  journeyId,
  activityId,
}: GpsFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState<TrackStatistics | null>(null);

  // Convert accepted formats to the format required by react-dropzone
  const acceptedMimeTypes: Record<string, string[]> = {
    gpx: [".gpx", "application/gpx+xml"],
    kml: [".kml", "application/vnd.google-earth.kml+xml"],
    fit: [".fit", "application/octet-stream"],
    tcx: [".tcx", "application/vnd.garmin.tcx+xml", "application/xml"],
  };

  const accept = acceptedFormats.reduce(
    (acc, format) => {
      if (acceptedMimeTypes[format]) {
        for (const mime of acceptedMimeTypes[format]) {
          acc[mime] = [];
        }
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Upload file to server
  const uploadFile = async (uploadFile: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("journeyId", journeyId);
      if (activityId) {
        formData.append("activityId", activityId);
      }

      // Simulate progress updates (in a real app, you would use a proper upload progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + 5, 90);
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      // Upload file
      const response = await fetch("/api/gps/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload GPS file");
      }

      // Complete progress
      setUploadProgress(100);
      onProgress?.(100);

      // Process response
      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data.stats);
        onFileProcessed?.(data.data.stats);
        toast.success("GPS file uploaded and processed successfully");
      } else {
        throw new Error(data.error || "Failed to process GPS file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error uploading file";
      onError?.(errorMessage);

      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);

        try {
          await uploadFile(selectedFile);
        } catch (error) {
          console.error("Error uploading file:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error uploading file";
          onError?.(errorMessage);

          toast.error(errorMessage);
        }
      }
    },
    [toast, onError, uploadFile, setFile, onFileProcessed]
  );

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize: Number.parseInt(maxFileSize) * 1024 * 1024, // Convert MB to bytes
  });

  // Remove file
  const removeFile = () => {
    setFile(null);
    setStats(null);
    setUploadProgress(0);
  };

  // Format distance
  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`;
  };

  // Format elevation
  const formatElevation = (elevation: number) => {
    return `${Math.round(elevation)} m`;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* File Upload Area */}
      <div
        {...(dragAndDrop ? getRootProps() : {})}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        } ${file ? "bg-muted/30" : ""}`}
      >
        {file ? (
          <div className="flex w-full flex-col items-center">
            <div className="mb-4 flex w-full items-center justify-between rounded-md bg-muted p-3">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 truncate">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {uploading && (
              <div className="mb-4 w-full">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="mt-1 text-center text-muted-foreground text-xs">
                  {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : "Processing file..."}
                </p>
              </div>
            )}

            {stats && showPreview && (
              <div className="mt-4 w-full">
                <h3 className="mb-2 font-semibold">Activity Statistics</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Card className="p-3">
                    <p className="text-muted-foreground text-xs">Distance</p>
                    <p className="font-medium">{formatDistance(stats.totalDistance)}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-muted-foreground text-xs">Elevation Gain</p>
                    <p className="font-medium">{formatElevation(stats.elevationGain)}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-muted-foreground text-xs">Moving Time</p>
                    <p className="font-medium">{formatTime(stats.movingTime)}</p>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <input {...getInputProps()} />
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 font-medium text-base">
              {isDragActive ? "Drop your file here" : "Drop your GPS file here or click to upload"}
            </h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              Supported formats: {acceptedFormats.map((f) => `.${f}`).join(", ")}
            </p>
            <Button size="sm" variant="secondary">
              Select File
            </Button>
          </>
        )}
      </div>

      {/* Map Preview Placeholder */}
      {file && stats && showPreview && previewType !== "stats" && (
        <div className="mt-6 flex h-48 items-center justify-center overflow-hidden rounded-md border border-border bg-muted shadow-sm">
          <p className="text-muted-foreground">Map preview will be implemented in Phase 2</p>
        </div>
      )}
    </div>
  );
};
