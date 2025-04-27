import { insertActivitySchema } from "@/server/db/schema";
import { z } from "zod";

// Create specific validation schemas for different operations
// For create, we expect journeyUniqueId instead of journeyId
export const CreateActivitySchema = insertActivitySchema
  .omit({
    id: true,
    activityUniqueId: true,
    createdAt: true,
    updatedAt: true,
    journeyId: true, // Remove the journeyId field
  })
  .extend({
    journeyId: z.string().min(1, { message: "Journey ID is required" }), // Add journeyId as string (will be journeyUniqueId)
  });

// For update, we don't allow changing the journeyId
export const UpdateActivitySchema = insertActivitySchema.partial().omit({
  id: true,
  journeyId: true, // Cannot update journeyId
  activityUniqueId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateActivityType = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityType = z.infer<typeof UpdateActivitySchema>;
