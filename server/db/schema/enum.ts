import { pgEnum } from "drizzle-orm/pg-core";

// Define enums for structured data
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
