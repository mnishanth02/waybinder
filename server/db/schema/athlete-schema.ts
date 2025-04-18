import { relations } from "drizzle-orm";
import { date, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./auth-schema";
import { bloodGroupEnum, fitnessLevelEnum, genderEnum } from "./enum";

export const athleteProfiles = pgTable(
  "athlete_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique() // Enforce one-to-one relationship
      .references(() => users.id, { onDelete: "cascade" }), // Link to users table
    // Basic Info
    athleteUniqueId: text("athlete_unique_id").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender"),
    displayName: text("display_name"),
    profileImageUrl: text("profile_image_url"),
    coverPhotoUrl: text("cover_photo_url"),
    location: text("location"),
    // Sports & Activity
    primaryActivity1: jsonb("primary_activity1").$type<{
      activity: string;
      experienceLevel: string;
    }>(),
    primaryActivity2: jsonb("primary_activity2").$type<{
      activity: string;
      experienceLevel: string;
    }>(),
    primaryActivity3: jsonb("primary_activity3").$type<{
      activity: string;
      experienceLevel: string;
    }>(),
    fitnessLevel: fitnessLevelEnum("fitness_level"),
    height: text("height"),
    weight: text("weight"),
    // Additional Info
    bio: text("bio"),
    goals: text("goals"),
    sponsors: text("sponsors"),
    websiteURLs: jsonb("website_urls").$type<string[]>(),
    stravaLinks: jsonb("strava_links").$type<string[]>(),
    instagramLinks: jsonb("instagram_links").$type<string[]>(),
    facebookLinks: jsonb("facebook_links").$type<string[]>(),
    twitterLinks: jsonb("twitter_links").$type<string[]>(),
    otherSocialLinks: jsonb("other_social_links").$type<{ label: string; url: string }[]>(),
    youtubeURLs: jsonb("youtube_urls").$type<string[]>(),
    emergencyContact: jsonb("emergency_contact").$type<{
      name: string;
      phoneNumber: string;
      relationship: string;
    }>(),
    allergies: text("allergies"),
    medicalConditions: text("medical_conditions"),
    medications: text("medications"),
    bloodGroup: bloodGroupEnum("blood_group"),
    privacySettings: jsonb("privacy_settings").$type<Record<string, boolean>>(),
    communicationPreferences: jsonb("communication_preferences").$type<Record<string, boolean>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Automatically update timestamp on modification
  },
  (t) => [
    index("athlete_profiles_athlete_unique_id_idx").on(t.athleteUniqueId), // Index for faster athlete unique id lookups
    index("athlete_profiles_primary_activity1_idx").on(t.primaryActivity1), // Index for faster primary activity lookups
    index("athlete_profiles_primary_activity2_idx").on(t.primaryActivity2), // Index for faster primary activity lookups
  ]
);

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));

// Create base Zod validation schemas from Drizzle schema
export const selectAthleteSchema = createSelectSchema(athleteProfiles);
export const insertAthleteSchema = createInsertSchema(athleteProfiles);

// Define a type for easier usage in your application
export type AthleteProfileType = typeof athleteProfiles.$inferSelect;
export type NewAthleteProfileType = typeof athleteProfiles.$inferInsert;
