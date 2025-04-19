import { relations } from "drizzle-orm";
import { athleteProfiles } from "./athlete-schema";
import { users } from "./auth-schema";

// Define relations for users table
export const usersRelations = relations(users, ({ one }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));
