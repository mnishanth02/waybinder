import { insertAthleteSchema } from "@/server/db/schema";

// Create specific validation schemas for different operations
export const CreateAthleteSchema = insertAthleteSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateAthleteSchema = insertAthleteSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateAthleteType = typeof CreateAthleteSchema;
export type UpdateAthleteType = typeof UpdateAthleteSchema;
