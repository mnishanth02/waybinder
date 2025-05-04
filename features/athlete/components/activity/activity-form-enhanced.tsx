"use client";

import { DatePickerWithLabel } from "@/components/custom/date-picker-with-label";
import { InputWithLabel } from "@/components/custom/input-with-label";
import { SelectWithLabel } from "@/components/custom/select-with-label";
import { TextareaWithLabel } from "@/components/custom/textarea-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Define a form values type that matches ActivitySchemaValues

interface ActivityFormProps {
  onSubmit: (data: ActivitySchemaValues) => void;
  defaultValues?: Partial<ActivitySchemaValues>;
  isSubmitting?: boolean; // Kept for API compatibility but not used internally
  journey?: JourneyTypeSelect;
}

export function ActivityForm({ onSubmit, defaultValues, journey }: ActivityFormProps) {
  // State for file uploads
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

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

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && Object.keys(errors).length > 0) {
      // Silent in production, log only in development
      console.log("Form errors:", errors);
    }
  }, [errors]);

  // Handle GPS file processing
  const handleGPSFileProcessed = (data: ParsedGPSData) => {
    console.log("GPS file processed:", data);

    // Here we could set form values based on parsed data:
    // form.setValue("distanceKm", data.stats.distance / 1000);
    // form.setValue("elevationGainM", data.stats.elevation.gain);
    // form.setValue("movingTimeSeconds", data.stats.duration);

    // If the file contains timestamps, we could also set the activity date:
    if (data.stats.startTime) {
      form.setValue("activityDate", data.stats.startTime);
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

  const handleSubmit = (values: ActivitySchemaValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form id="activity-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 font-semibold text-card-foreground text-lg">Basic Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2 md:col-span-1">
              <DatePickerWithLabel
                nameInSchema={"activityDate"}
                fieldTitle={"Date & Time"}
                placeholder={"Select activity date"}
                startDate={journey?.startDate ? new Date(journey.startDate) : undefined}
                endDate={journey?.endDate ? new Date(journey.endDate) : undefined}
              />
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
          <h2 className="mb-6 font-semibold text-card-foreground text-lg">Activity Data</h2>
          <GPSFileUpload onFileProcessed={handleGPSFileProcessed} />
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
      </form>
    </Form>
  );
}
