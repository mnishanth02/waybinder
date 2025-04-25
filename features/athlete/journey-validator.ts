import { JOURNEY_TYPES, PRIVACY_STATUSES, createEnumSchema } from "@/types/enums";
import { z } from "zod";

export const journeySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  // Use createEnumSchema to make journeyType mandatory with a custom error message
  journeyType: createEnumSchema(JOURNEY_TYPES, "Please select a journey type"),
  description: z.string(),
  startDate: z.date({ invalid_type_error: "Invalid date format" }),
  endDate: z.date({ invalid_type_error: "Invalid date format" }),
  location: z.string().optional(),
  // privacyStatus: privacyStatusSchema.default("private"),
  privacyStatus: createEnumSchema(PRIVACY_STATUSES, "Please select a privacy status").default(
    "private"
  ),
  tags: z.array(z.string()).optional(),
  buddyIds: z.array(z.string()).optional(),
  memberNames: z.array(z.string()).optional(),
  coverImageUrl: z.string().url().optional(),
});

export type JourneyCreationFormValues = z.infer<typeof journeySchema>;
