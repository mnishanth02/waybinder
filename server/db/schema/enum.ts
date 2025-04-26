import {
  ACTIVITY_TYPES,
  BLOOD_GROUPS,
  EXPERIENCE_LEVELS,
  FITNESS_LEVELS,
  GENDERS,
  JOURNEY_TYPES,
  PRIVACY_STATUSES,
  USER_ROLES,
} from "@/types/enums";
import { pgEnum } from "drizzle-orm/pg-core";

// Define enums for structured data using shared enum values
export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const genderEnum = pgEnum("gender", GENDERS);
export const fitnessLevelEnum = pgEnum("fitness_level", FITNESS_LEVELS);
export const experienceLevelEnum = pgEnum("experience_level", EXPERIENCE_LEVELS);
export const bloodGroupEnum = pgEnum("blood_group", BLOOD_GROUPS);
export const journeyTypeEnum = pgEnum("journey_type", JOURNEY_TYPES);
export const privacyStatusEnum = pgEnum("privacy_status", PRIVACY_STATUSES);
export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPES);
