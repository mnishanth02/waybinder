import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ParsedGPSData,
  formatDistance,
  formatDuration,
  formatElevation,
  formatPace,
  parseGPSFile,
} from "@/lib/utils/gps-file-parser";
import { FileUp, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import RouteMap from "../map/route-map";

interface GPSFileUploadProps {
  onFileProcessed: (data: ParsedGPSData) => void;
  className?: string;
}

const GPSFileUpload: React.FC<GPSFileUploadProps> = ({ onFileProcessed, className = "" }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedGPSData | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);

    try {
      const data = await parseGPSFile(selectedFile);
      setParsedData(data);
      onFileProcessed(data);
    } catch (err) {
      console.error("Error parsing GPS file:", err);
      setError(err instanceof Error ? err.message : "Error parsing file");
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById("gps-file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className={className}>
      <Card className="border border-dashed bg-background">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            {file ? (
              <div className="flex w-full items-center justify-between rounded border bg-muted/30 p-3">
                <div className="flex items-center">
                  <FileUp className="mr-2 h-5 w-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={removeFile}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-medium text-base">
                  Drop your GPX, FIT, or KML file here or click to upload
                </h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Supported formats: .gpx, .fit, .kml
                </p>
                <Label
                  htmlFor="gps-file-upload"
                  className="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Choose File
                  <Input
                    id="gps-file-upload"
                    type="file"
                    accept=".gpx,.fit,.kml"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </Label>
              </>
            )}

            {isProcessing && <div className="mt-4 text-muted-foreground">Processing file...</div>}

            {error && <div className="mt-4 text-destructive">Error: {error}</div>}
          </div>

          {/* Map preview */}
          {parsedData && (
            <div className="mt-6">
              <RouteMap geoJSON={parsedData.geoJSON} height="300px" />
            </div>
          )}

          {/* Activity stats from GPS */}
          {parsedData && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-md border border-border bg-card p-3 text-center shadow-sm transition-all hover:shadow-md">
                <p className="mb-1 font-medium text-muted-foreground text-xs">Distance</p>
                <p className="font-semibold text-card-foreground">
                  {formatDistance(parsedData.stats.distance)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3 text-center shadow-sm transition-all hover:shadow-md">
                <p className="mb-1 font-medium text-muted-foreground text-xs">Duration</p>
                <p className="font-semibold text-card-foreground">
                  {formatDuration(parsedData.stats.duration)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3 text-center shadow-sm transition-all hover:shadow-md">
                <p className="mb-1 font-medium text-muted-foreground text-xs">Elevation</p>
                <p className="font-semibold text-card-foreground">
                  {formatElevation(parsedData.stats.elevation.gain)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3 text-center shadow-sm transition-all hover:shadow-md">
                <p className="mb-1 font-medium text-muted-foreground text-xs">Pace</p>
                <p className="font-semibold text-card-foreground">
                  {formatPace(parsedData.stats.pace)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GPSFileUpload;
