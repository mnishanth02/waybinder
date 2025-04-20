import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Enums
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
export const activityTypeEnum = pgEnum("activity_type", [
  "hiking",
  "trail_running",
  "mountaineering",
  "cycling",
  "climbing",
  "kayaking",
  "skiing",
  "other",
]);
export const mediaTypeEnum = pgEnum("media_type", ["photo", "video", "gpx", "other"]);

// Tables
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    phone: text("phone"),
    isAdmin: boolean("is_admin"),
  },
  (t) => [index("email_verified_index").on(t.emailVerified)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (t) => [index("sessions_user_id_index").on(t.userId)]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (t) => [index("accounts_user_id_index").on(t.userId)]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [index("identifier_index").on(t.identifier)]
);

export const athleteProfiles = pgTable(
  "athlete_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
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
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("athlete_profiles_athlete_unique_id_idx").on(t.athleteUniqueId),
    index("athlete_profiles_user_id_idx").on(t.userId),
  ]
);

export const journeys = pgTable(
  "journeys",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journeyUniqueId: text("journey_unique_id").notNull().unique(),
    title: text("title").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    journeyType: journeyTypeEnum("journey_type").notNull(),
    tags: text("tags").array(),
    privacyStatus: privacyStatusEnum("privacy_status").default("private").notNull(),
    coverImageUrl: text("cover_image_url"),
    location: text("location"),
    totalDistanceKm: text("total_distance_km"),
    totalElevationGainM: text("total_elevation_gain_m"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("journeys_creator_id_idx").on(t.creatorId),
    uniqueIndex("journeys_slug_idx").on(t.slug),
    uniqueIndex("journeys_title_idx").on(t.title),
  ]
);

export const journeyDays = pgTable(
  "journey_days",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    dayIndex: integer("day_index").notNull(),
    date: date("date").notNull(),
    title: text("title"),
    description: text("description"),
    plannedRoute: jsonb("planned_route").$type<string>(),
    permits: jsonb("permits").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("journey_days_journey_id_idx").on(t.journeyId),
    index("journey_days_day_index_idx").on(t.dayIndex),
  ]
);

export const journeyActivities = pgTable(
  "journey_activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    dayId: text("day_id")
      .notNull()
      .references(() => journeyDays.id, { onDelete: "cascade" }),
    activityType: activityTypeEnum("activity_type").notNull(),
    duration: text("duration"),
    distanceKm: text("distance_km"),
    elevationGainM: text("elevation_gain_m"),
    notes: text("notes"),
    gpxUrl: text("gpx_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("journey_activities_day_id_idx").on(t.dayId),
    index("journey_activities_activity_type_idx").on(t.activityType),
  ]
);

export const journeyMedia = pgTable(
  "journey_media",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    parentType: text("parent_type").notNull(),
    parentId: text("parent_id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    url: text("url").notNull(),
    caption: text("caption"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("journey_media_parent_idx").on(t.parentType, t.parentId),
    index("journey_media_media_type_idx").on(t.mediaType),
  ]
);

export const journeyContributors = pgTable(
  "journey_contributors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    athleteProfileId: text("athlete_profile_id")
      .notNull()
      .references(() => athleteProfiles.id, { onDelete: "cascade" }),
    role: text("role"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("journey_contributors_journey_id_idx").on(t.journeyId),
    index("journey_contributors_athlete_profile_id_idx").on(t.athleteProfileId),
  ]
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
  createdJourneys: many(journeys, { relationName: "createdJourneys" }),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one, many }) => ({
  user: one(users, { fields: [athleteProfiles.userId], references: [users.id] }),
  ownedJourneys: many(journeys, { relationName: "ownedJourneys" }),
  contributions: many(journeyContributors, { relationName: "contributions" }),
}));

export const journeysRelations = relations(journeys, ({ one, many }) => ({
  creator: one(users, {
    fields: [journeys.creatorId],
    references: [users.id],
    relationName: "createdJourneys",
  }),
  days: many(journeyDays, { relationName: "days" }),
  contributors: many(journeyContributors, { relationName: "contributors" }),
}));

export const journeyDaysRelations = relations(journeyDays, ({ one, many }) => ({
  journey: one(journeys, { fields: [journeyDays.journeyId], references: [journeys.id] }),
  activities: many(journeyActivities, { relationName: "activities" }),
}));

export const journeyActivitiesRelations = relations(journeyActivities, ({ one, many }) => ({
  day: one(journeyDays, { fields: [journeyActivities.dayId], references: [journeyDays.id] }),
  media: many(journeyMedia, { relationName: "media" }),
}));

export const journeyContributorsRelations = relations(journeyContributors, ({ one }) => ({
  journey: one(journeys, { fields: [journeyContributors.journeyId], references: [journeys.id] }),
  athleteProfile: one(athleteProfiles, {
    fields: [journeyContributors.athleteProfileId],
    references: [athleteProfiles.id],
  }),
}));

// Zod schemas & TS types
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const selectSessionSchema = createSelectSchema(sessions);
export const insertSessionSchema = createInsertSchema(sessions);
export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export const selectAccountSchema = createSelectSchema(accounts);
export const insertAccountSchema = createInsertSchema(accounts);
export type AccountSelect = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

export const selectVerificationSchema = createSelectSchema(verifications);
export const insertVerificationSchema = createInsertSchema(verifications);
export type VerificationSelect = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;

export const selectAthleteSchema = createSelectSchema(athleteProfiles);
export const insertAthleteSchema = createInsertSchema(athleteProfiles);
export type AthleteSelect = typeof athleteProfiles.$inferSelect;
export type AthleteInsert = typeof athleteProfiles.$inferInsert;

export const selectJourneySchema = createSelectSchema(journeys);
export const insertJourneySchema = createInsertSchema(journeys);
export type JourneySelect = typeof journeys.$inferSelect;
export type JourneyInsert = typeof journeys.$inferInsert;

export const selectDaySchema = createSelectSchema(journeyDays);
export const insertDaySchema = createInsertSchema(journeyDays);
export type DaySelect = typeof journeyDays.$inferSelect;
export type DayInsert = typeof journeyDays.$inferInsert;

export const selectActivitySchema = createSelectSchema(journeyActivities);
export const insertActivitySchema = createInsertSchema(journeyActivities);
export type ActivitySelect = typeof journeyActivities.$inferSelect;
export type ActivityInsert = typeof journeyActivities.$inferInsert;

export const selectMediaSchema = createSelectSchema(journeyMedia);
export const insertMediaSchema = createInsertSchema(journeyMedia);
export type MediaSelect = typeof journeyMedia.$inferSelect;
export type MediaInsert = typeof journeyMedia.$inferInsert;

export const selectContributorSchema = createSelectSchema(journeyContributors);
export const insertContributorSchema = createInsertSchema(journeyContributors);
export type ContributorSelect = typeof journeyContributors.$inferSelect;
export type ContributorInsert = typeof journeyContributors.$inferInsert;
