import { relations } from "drizzle-orm";
import { athleteProfiles } from "./athlete-schema";
import { users } from "./auth-schema";
import { journeys } from "./journey-schema";

// Define relations for users table
export const usersRelations = relations(users, ({ one, many }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
  createdJourneys: many(journeys, { relationName: "createdJourneys" }),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));

export const journeysRelations = relations(journeys, ({ one }) => ({
  creator: one(users, {
    fields: [journeys.creatorId],
    references: [users.id],
    relationName: "createdJourneys",
  }),
}));
