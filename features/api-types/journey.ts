import { insertJourneySchema } from "@/server/db/schema";
import type { z } from "zod";

// Create specific validation schemas for different operations
export const CreateJourneySchema = insertJourneySchema.omit({
  id: true,
  creatorId: true,
  journeyUniqueId: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const UpdateJourneySchema = insertJourneySchema.partial().omit({
  id: true,
  creatorId: true,
  journeyUniqueId: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type CreateJourneyType = z.infer<typeof CreateJourneySchema>;
export type UpdateJourneyType = z.infer<typeof UpdateJourneySchema>;
