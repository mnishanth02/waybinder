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
  activityDate: z
    .date({ invalid_type_error: "Invalid date format" })
    .refine((date) => date instanceof Date && !Number.isNaN(date.getTime()), {
      message: "Please select a valid date",
    }),
  // dayNumber is removed from the form schema but will be calculated internally
  orderWithinDay: z
    .union([
      z
        .number()
        .min(1, { message: "Order must be at least 1" })
        .max(10, { message: "Order cannot exceed 10" }),
      z.string().transform((val) => Number.parseInt(val, 10)),
    ])
    .refine((val) => typeof val === "number" && !Number.isNaN(val), {
      message: "Order must be a valid number",
    }),
  activityType: createEnumSchema(ACTIVITY_TYPES, "Please select an activity type").default("other"),
  content: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

// Base form values from the schema
export type ActivitySchemaValues = z.infer<typeof activitySchema>;

// Extended type that includes dayNumber for internal use
export type ActivityCreationFormValues = ActivitySchemaValues & {
  dayNumber?: number;
};
