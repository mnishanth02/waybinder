import { ACTIVITY_TYPES, JOURNEY_TYPES, PRIVACY_STATUSES, createEnumSchema } from "@/types/enums";
import { z } from "zod";

export const journeySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  // Use createEnumSchema to make journeyType mandatory with a custom error message
  journeyType: createEnumSchema(JOURNEY_TYPES, "Please select a journey type").default("other"),
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

export const activitySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  activityDate: z.date({ invalid_type_error: "Invalid date format" }),
  dayNumber: z.number().optional(),
  orderWithinDay: z.number().optional(),
  activityType: createEnumSchema(ACTIVITY_TYPES, "Please select an activity type").default("other"),
  content: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

export type ActivityCreationFormValues = z.infer<typeof activitySchema>;
