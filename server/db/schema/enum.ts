import { pgEnum } from "drizzle-orm/pg-core";

// Define enums for structured data
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "athlete"]);
export const genderEnum = pgEnum("gender", ["male", "female", "non-binary", "prefer-not-to-say"]);
export const fitnessLevelEnum = pgEnum("fitness_level", ["beginner", "intermediate", "advanced"]);
export const experienceLevelEnum = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
]);
export const bloodGroupEnum = pgEnum("blood_group", [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
]);

//
export const journeyTypeEnum = pgEnum("journey_type", [
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
]);

export const privacyStatusEnum = pgEnum("privacy_status", ["private", "public"]);
