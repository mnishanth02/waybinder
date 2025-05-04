import { relations } from "drizzle-orm";
import { activities } from "./activity-schema";
import { athleteProfiles } from "./athlete-schema";
import { users } from "./auth-schema";
import { journeys } from "./journey-schema";
import { gpxFiles, media } from "./media-schema";

// Define relations for users table
export const usersRelations = relations(users, ({ one, many }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
  createdJourneys: many(journeys, { relationName: "createdJourneys" }),
  uploadedMedia: many(media, { relationName: "uploadedMedia" }),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));

export const journeysRelations = relations(journeys, ({ one, many }) => ({
  creator: one(users, {
    fields: [journeys.creatorId],
    references: [users.id],
    relationName: "createdJourneys",
  }),
  activities: many(activities),
  media: many(media, { relationName: "journeyMedia" }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  journey: one(journeys, { fields: [activities.journeyId], references: [journeys.id] }),
  media: many(media, { relationName: "activityMedia" }), // Media attached to this activity
  gpxFiles: many(gpxFiles), // Direct access to GPX data linked to this activity
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.uploaderId],
    references: [users.id],
    relationName: "uploadedMedia",
  }),
  journey: one(journeys, {
    fields: [media.journeyId],
    references: [journeys.id],
    relationName: "journeyMedia",
  }),
  activity: one(activities, {
    fields: [media.activityId],
    references: [activities.id],
    relationName: "activityMedia",
  }),
  gpxFile: one(gpxFiles, { fields: [media.id], references: [gpxFiles.mediaId] }), // Link to specific GPX details
}));

export const gpxFilesRelations = relations(gpxFiles, ({ one }) => ({
  media: one(media, { fields: [gpxFiles.mediaId], references: [media.id] }),
  activity: one(activities, { fields: [gpxFiles.activityId], references: [activities.id] }),
}));
