import { ACTIVITY_TYPES, JOURNEY_TYPES, PRIVACY_STATUSES, createEnumSchema } from "@/types/enums";
import { z } from "zod";

export const journeySchema = z
  .object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    // Use createEnumSchema to make journeyType mandatory with a custom error message
    journeyType: createEnumSchema(JOURNEY_TYPES, "Please select a journey type").default("other"),
    description: z.string(),
    startDate: z
      .date({ invalid_type_error: "Invalid date format" })
      .refine((date) => date instanceof Date && !Number.isNaN(date.getTime()), {
        message: "Please select a valid start date",
      }),
    endDate: z
      .date({ invalid_type_error: "Invalid date format" })
      .refine((date) => date instanceof Date && !Number.isNaN(date.getTime()), {
        message: "Please select a valid end date",
      }),
    location: z.string().optional(),
    // privacyStatus: privacyStatusSchema.default("private"),
    privacyStatus: createEnumSchema(PRIVACY_STATUSES, "Please select a privacy status").default(
      "private"
    ),
    tags: z.array(z.string()).optional(),
    buddyIds: z.array(z.string()).optional(),
    memberNames: z.array(z.string()).optional(),
    coverImageUrl: z.string().url().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export type JourneyCreationFormValues = z.infer<typeof journeySchema>;

export const activitySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  activityDate: z
    .date({ invalid_type_error: "Invalid date format" })
    .refine((date) => date instanceof Date && !Number.isNaN(date.getTime()), {
      message: "Please select a valid date",
    }),
  // Activity date will be used to determine the day number for display
  // orderWithinDay removed - will be calculated based on startTime and endTime from GPX file
  activityType: createEnumSchema(ACTIVITY_TYPES, "Please select an activity type").default("other"),
  content: z.string().optional(),
});

// Base form values from the schema
export type ActivitySchemaValues = z.infer<typeof activitySchema>;
