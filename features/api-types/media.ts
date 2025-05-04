import { insertGpsFilesSchema, insertMediaSchema } from "@/server/db/schema";
import { z } from "zod";

// Create specific validation schemas for different operations
export const CreateMediaSchema = insertMediaSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Allow either journeyId or activityId, but not both
    journeyId: z.string().optional(),
    activityId: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure exactly one of journeyId or activityId is provided
      return (data.journeyId && !data.activityId) || (!data.journeyId && data.activityId);
    },
    {
      message: "Either journeyId or activityId must be provided, but not both",
      path: ["journeyId", "activityId"],
    }
  );

export const UpdateMediaSchema = insertMediaSchema.partial().omit({
  id: true,
  uploaderId: true, // Cannot change uploader
  journeyId: true, // Cannot change parent
  activityId: true, // Cannot change parent
  createdAt: true,
  updatedAt: true,
});

// GPX Files schemas
export const CreateGpxFileSchema = insertGpsFilesSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Ensure mediaId is provided and is of type 'gpx'
    mediaId: z.string().min(1, { message: "Media ID is required" }),
  });

export const UpdateGpxFileSchema = insertGpsFilesSchema.partial().omit({
  id: true,
  mediaId: true, // Cannot change associated media
  activityId: true, // Cannot change associated activity
  createdAt: true,
  updatedAt: true,
});

export type CreateMediaType = z.infer<typeof CreateMediaSchema>;
export type UpdateMediaType = z.infer<typeof UpdateMediaSchema>;
export type CreateGpxFileType = z.infer<typeof CreateGpxFileSchema>;
export type UpdateGpxFileType = z.infer<typeof UpdateGpxFileSchema>;
