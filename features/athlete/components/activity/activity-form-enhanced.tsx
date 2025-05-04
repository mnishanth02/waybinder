"use client";

import { DatePickerWithLabel } from "@/components/custom/date-picker-with-label";
import { InputWithLabel } from "@/components/custom/input-with-label";
import { SelectWithLabel } from "@/components/custom/select-with-label";
import { TextareaWithLabel } from "@/components/custom/textarea-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env/client-env";
import { useGPSFileUpload } from "@/lib/hooks";
import type { ParsedGPSData } from "@/lib/utils/gps-file-parser";
import type { JourneyTypeSelect } from "@/server/db/schema";
import { ACTIVITY_TYPES, createSelectOptions } from "@/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type ActivitySchemaValues, activitySchema } from "../../athlete-validator";
import GPSFileUpload from "./gps-file-upload";

// Create select options for activity types
const activityTypeOptions = createSelectOptions(ACTIVITY_TYPES);

// R2 storage configuration
const r2Config = {
  endpoint: env.NEXT_PUBLIC_R2_ENDPOINT || "",
  accessKeyId: env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || "",
  secretAccessKey: env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || "",
  bucket: env.NEXT_PUBLIC_R2_BUCKET_NAME || "",
  publicUrl: env.NEXT_PUBLIC_R2_PUBLIC_URL,
};

interface ActivityFormProps {
  onSubmit: (data: ActivitySchemaValues) => Promise<void> | void;
  defaultValues?: Partial<ActivitySchemaValues>;
  isSubmitting?: boolean;
  journey?: JourneyTypeSelect;
}

export function ActivityForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  journey,
}: ActivityFormProps) {
  // State for file uploads
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  // State for GPS data
  const [parsedGPSData, setParsedGPSData] = useState<ParsedGPSData | null>(null);

  // State for GPS file
  const [gpsFile, setGpsFile] = useState<File | null>(null);
  const [_gpsFileUrl, setGpsFileUrl] = useState<string | null>(null);

  // Initialize the GPS file upload hook
  const {
    uploadGPSFile,
    isUploading: isUploadingGPS,
    progress: gpsUploadProgress,
    error: gpsUploadError,
  } = useGPSFileUpload(r2Config);

  // State for loading and error handling
  const [isProcessingGPS, setIsProcessingGPS] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(isSubmitting);
  const [formError, setFormError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Define the form with proper typing
  const form = useForm<ActivitySchemaValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues
      ? defaultValues
      : {
          title: "",
          activityDate: new Date(),
          activityType: "other",
          content: "",
        },
    mode: "onBlur",
  });

  const {
    formState: { errors },
  } = form;

  // Update internal submitting state when prop changes
  useEffect(() => {
    setIsSubmittingForm(isSubmitting);
  }, [isSubmitting]);

  useEffect(() => {
    console.log("gpsFileUrl", _gpsFileUrl);
  }, [_gpsFileUrl]);

  // Log form errors in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && Object.keys(errors).length > 0) {
      console.log("Form errors:", errors);
    }
  }, [errors]);

  // Handle GPS file processing
  const handleGPSFileProcessed = (data: ParsedGPSData) => {
    try {
      // Clear any previous errors
      setGpsError(null);

      // Store the parsed GPS data for later use
      setParsedGPSData(data);

      // Set the activity date from the GPS file's start time
      // If no start time is available, use the current date
      if (data.stats.startTime) {
        form.setValue("activityDate", data.stats.startTime);
      } else {
        // If no start time in GPS file, use current date
        form.setValue("activityDate", new Date());
      }

      // Suggest a title if none exists yet
      const currentTitle = form.getValues("title");
      if (!currentTitle || currentTitle.trim() === "") {
        const suggestedTitle = `${form.getValues("activityType") || "Activity"} on ${
          data.stats.startTime
            ? data.stats.startTime.toLocaleDateString()
            : new Date().toLocaleDateString()
        }`;
        form.setValue("title", suggestedTitle);
      }
    } catch (error) {
      console.error("Error processing GPS data:", error);
      setGpsError(error instanceof Error ? error.message : "Failed to process GPS data");
    }
  };

  // Handle photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotos = Array.from(files);

      // Create previews
      const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
      setPhotosPreviews((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  // Remove a photo
  const removePhoto = (index: number) => {
    // Revoke the URL to prevent memory leaks
    const previewUrl = photosPreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhotosPreviews((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  };

  // Clean up URL objects on unmount
  useEffect(() => {
    return () => {
      for (const url of photosPreviews) {
        if (url) URL.revokeObjectURL(url);
      }
    };
  }, [photosPreviews]);

  // Save the GPS file when it's processed
  const handleGPSFileSelected = (file: File) => {
    setGpsFile(file);
  };

  const handleSubmit = async (values: ActivitySchemaValues) => {
    try {
      // Clear any previous errors
      setFormError(null);

      // Set submitting state
      setIsSubmittingForm(true);

      // Create a copy of the form values
      const formData = { ...values };

      // If we have a GPS file, upload it to R2 storage
      if (gpsFile && parsedGPSData) {
        try {
          // Upload the GPS file to R2 storage
          const uploadResult = await uploadGPSFile(gpsFile, {
            keyPrefix: "gpx/",
            public: true,
            extractData: true,
          });

          // Store the uploaded file URL
          setGpsFileUrl(uploadResult.url);

          // Add the GPS data and file URL to the form values
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (formData as any).gpsData = {
            distanceKm: parsedGPSData.stats.distance / 1000,
            elevationGainM: parsedGPSData.stats.elevation.gain,
            elevationLossM: parsedGPSData.stats.elevation.loss,
            movingTimeSeconds: parsedGPSData.stats.duration,
            startTime: parsedGPSData.stats.startTime,
            endTime: parsedGPSData.stats.endTime,
            geoJSON: parsedGPSData.geoJSON,
            fileUrl: uploadResult.url,
            fileName: gpsFile.name,
          };
        } catch (uploadError) {
          console.error("Error uploading GPS file:", uploadError);
          setFormError(
            uploadError instanceof Error ? uploadError.message : "Failed to upload GPS file"
          );
          return;
        }
      } else if (parsedGPSData) {
        // If we have GPS data but no file (shouldn't happen), add the GPS data without the file URL
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (formData as any).gpsData = {
          distanceKm: parsedGPSData.stats.distance / 1000,
          elevationGainM: parsedGPSData.stats.elevation.gain,
          elevationLossM: parsedGPSData.stats.elevation.loss,
          movingTimeSeconds: parsedGPSData.stats.duration,
          startTime: parsedGPSData.stats.startTime,
          endTime: parsedGPSData.stats.endTime,
          geoJSON: parsedGPSData.geoJSON,
        };
      }

      // Submit the form data with the GPS data included
      await Promise.resolve(onSubmit(formData));
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(error instanceof Error ? error.message : "Failed to submit activity");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Form {...form}>
      <form id="activity-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Display form error if any */}
        {formError && (
          <div className="rounded-md bg-destructive/10 p-3 text-destructive">
            <p className="font-medium">Error submitting form</p>
            <p className="text-sm">{formError}</p>
          </div>
        )}
        {/* Basic Information Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 font-semibold text-card-foreground text-lg">Basic Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2 md:col-span-1">
              <DatePickerWithLabel
                nameInSchema={"activityDate"}
                fieldTitle={"Date & Time"}
                placeholder={"Date from GPS file"}
                startDate={journey?.startDate ? new Date(journey.startDate) : undefined}
                endDate={journey?.endDate ? new Date(journey.endDate) : undefined}
                disabled={true}
              />
              <p className="mt-1 text-muted-foreground text-xs">
                {parsedGPSData
                  ? "Date automatically set from GPS file"
                  : "Upload a GPS file to set the date"}
              </p>
            </div>

            <div className="col-span-2 md:col-span-1">
              <SelectWithLabel
                nameInSchema={"activityType"}
                fieldTitle={"Activity Type"}
                options={activityTypeOptions}
                placeholder={"Select activity type"}
              />
            </div>

            <div className="col-span-2">
              <InputWithLabel
                nameInSchema={"title"}
                fieldTitle={"Activity Title"}
                placeholder={"Enter activity title"}
              />
            </div>

            {/* Day number is calculated internally based on the activity date */}
          </div>
        </div>

        {/* Activity Data Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground text-lg">Activity Data</h2>
            {!parsedGPSData && !isProcessingGPS && (
              <div className="rounded-md bg-amber-50 px-3 py-1 text-amber-800 text-xs dark:bg-amber-950/30 dark:text-amber-300">
                Please upload a GPS file first
              </div>
            )}
            {isProcessingGPS && (
              <div className="rounded-md bg-blue-50 px-3 py-1 text-blue-800 text-xs dark:bg-blue-950/30 dark:text-blue-300">
                Processing GPS file...
              </div>
            )}
            {isUploadingGPS && gpsUploadProgress && (
              <div className="rounded-md bg-blue-50 px-3 py-1 text-blue-800 text-xs dark:bg-blue-950/30 dark:text-blue-300">
                Uploading: {gpsUploadProgress.percentage.toFixed(0)}%
              </div>
            )}
          </div>

          {/* Display GPS error if any */}
          {(gpsError || gpsUploadError) && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive">
              <p className="font-medium">Error processing GPS file</p>
              <p className="text-sm">{gpsError || gpsUploadError?.message}</p>
            </div>
          )}

          {/* Show skeletons when processing */}
          {isProcessingGPS && (
            <div className="mb-6 space-y-6">
              {/* Skeleton for map */}
              <Skeleton className="h-[420px] w-full rounded-md" />

              {/* Skeleton for stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {/* Distance */}
                <div className="rounded-md border border-border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-4 w-16" />
                  <Skeleton className="mx-auto h-6 w-20" />
                </div>
                {/* Duration */}
                <div className="rounded-md border border-border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-4 w-16" />
                  <Skeleton className="mx-auto h-6 w-20" />
                </div>
                {/* Elevation */}
                <div className="rounded-md border border-border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-4 w-16" />
                  <Skeleton className="mx-auto h-6 w-20" />
                </div>
                {/* Pace */}
                <div className="rounded-md border border-border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-4 w-16" />
                  <Skeleton className="mx-auto h-6 w-20" />
                </div>
                {/* Time */}
                <div className="rounded-md border border-border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-4 w-16" />
                  <Skeleton className="mx-auto h-6 w-20" />
                  <Skeleton className="mx-auto mt-1 h-6 w-20" />
                </div>
              </div>
            </div>
          )}

          {/* Always show the GPS file upload component */}
          <GPSFileUpload
            onFileProcessed={handleGPSFileProcessed}
            onProcessingStateChange={setIsProcessingGPS}
            onFileSelected={handleGPSFileSelected}
          />
        </div>

        {/* Photos Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 font-semibold text-card-foreground text-lg">Photos</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {/* Photo previews */}
            {photosPreviews.map((preview, index) => (
              <div
                key={`photo-${preview.substring(0, 8)}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-md border border-border shadow-sm transition-all hover:shadow-md"
              >
                <Image src={preview} alt={`Photo ${index + 1}`} fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-70 transition-opacity hover:bg-destructive hover:text-destructive-foreground hover:opacity-100"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Upload button */}
            <div className="flex aspect-square items-center justify-center rounded-md border border-primary/20 border-dashed bg-primary/5 transition-colors hover:border-primary/30 hover:bg-primary/10">
              <Label
                htmlFor="photo-upload"
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
              >
                <div className="mb-2 rounded-full bg-primary/10 p-2">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-primary text-sm">Add Photo</span>
                <span className="mt-1 text-muted-foreground text-xs">Click to browse</span>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  multiple
                />
              </Label>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 font-semibold text-card-foreground text-lg">Notes</h2>
          <div className="overflow-hidden rounded-md border shadow-sm">
            {/* Simple toolbar placeholder */}
            <div className="flex items-center gap-2 border-b bg-muted/30 p-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <span className="font-bold">B</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <span className="italic">I</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <span className="underline">U</span>
              </Button>
              <div className="mx-1 h-5 w-px bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <span className="text-lg">•</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <span className="text-lg">1.</span>
              </Button>
            </div>

            {/* Text area for notes */}
            <div className="bg-background p-2">
              <TextareaWithLabel
                nameInSchema={"content"}
                fieldTitle={""}
                placeholder={"Write your activity notes here..."}
                rows={8}
                className="border-none p-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="px-8"
            disabled={isSubmittingForm || isProcessingGPS || isUploadingGPS}
          >
            {isSubmittingForm || isUploadingGPS ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isUploadingGPS ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Activity"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
