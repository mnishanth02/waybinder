import { insertActivitySchema } from "@/server/db/schema";
import type { z } from "zod";

// Create specific validation schemas for different operations
export const CreateActivitySchema = insertActivitySchema.omit({
  id: true,
  activityUniqueId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateActivitySchema = insertActivitySchema.partial().omit({
  id: true,
  journeyId: true,
  activityUniqueId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateActivityType = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityType = z.infer<typeof UpdateActivitySchema>;
