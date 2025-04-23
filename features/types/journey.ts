import { insertJourneySchema } from "@/server/db/schema";

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

export type CreateJourneyType = typeof CreateJourneySchema;
export type UpdateJourneyType = typeof UpdateJourneySchema;
