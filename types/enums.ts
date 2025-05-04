import { z } from "zod";

// User Role
export const USER_ROLES = ["admin", "user", "athlete"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const userRoleSchema = z.enum(USER_ROLES);

// Gender
export const GENDERS = ["male", "female", "non-binary", "prefer-not-to-say"] as const;
export type Gender = (typeof GENDERS)[number];
export const genderSchema = z.enum(GENDERS);

// Fitness Level
export const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type FitnessLevel = (typeof FITNESS_LEVELS)[number];
export const fitnessLevelSchema = z.enum(FITNESS_LEVELS);

// Experience Level
export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced", "professional"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);

// Blood Group
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];
export const bloodGroupSchema = z.enum(BLOOD_GROUPS);

// Journey Type
export const JOURNEY_TYPES = [
  "trekking",
  "trail_running",
  "mountaineering",
  "cycling_touring",
  "cycling_road",
  "cycling_mountain",
  "climbing_expedition",
  "road_trip",
  "travel",
  "weekend_getaway",
  "single_day_outing",
  "other",
] as const;
export type JourneyType = (typeof JOURNEY_TYPES)[number];
export const journeyTypeSchema = z.enum(JOURNEY_TYPES);

//  Activity Type
// TODO: Fix typos in enum values in a future update:
// - "hikeing" should be "hiking"
// - "mountaineer" should be "mountaineering"
// This will require a database migration and code updates
export const ACTIVITY_TYPES = [
  "hikeing", // Typo: should be "hiking"
  "running",
  "cycling",
  "driving",
  "flying",
  "boating",
  "rest",
  "camping",
  "climbing",
  "mountaineer", // Typo: should be "mountaineering"
  "sightseeing",
  "travel",
  "other",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

export const MEDIA_TYPES = ["image", "video", "gpx", "document", "audio", "other"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
export const mediaTypeSchema = z.enum(MEDIA_TYPES);

// Privacy Status
export const PRIVACY_STATUSES = ["private", "public"] as const;
export type PrivacyStatus = (typeof PRIVACY_STATUSES)[number];
export const privacyStatusSchema = z.enum(PRIVACY_STATUSES);

// Helper function to create a Zod schema with a required error message
export const createEnumSchema = <T extends readonly string[]>(values: T, errorMessage: string) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return z.enum(values as any, {
    required_error: errorMessage,
  });
};

// Helper function to create a select options array for UI components
export const createSelectOptions = <T extends readonly string[]>(values: T) => {
  return values.map((value) => ({
    label: _formatEnumValue(value),
    value,
  }));
};

// Helper function to format enum values for display (e.g., 'non_binary' -> 'Non Binary')
const _formatEnumValue = (value: string): string => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
