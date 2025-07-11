import { date, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./auth-schema";
import { journeyTypeEnum, privacyStatusEnum } from "./enum";

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
    title: text("title").unique().notNull(),
    slug: text("slug").unique().notNull(),
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
    buddyIds: text("buddy_ids").array(),
    memberNames: text("member_names").array(),
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
    index("journeys_start_end_date_idx").on(t.startDate, t.endDate),
    index("journeys_privacy_status_idx").on(t.privacyStatus),
    index("journeys_type_idx").on(t.journeyType),
    index("journeys_created_at_idx").on(t.createdAt),
    index("journeys_updated_at_idx").on(t.updatedAt),
  ]
);

// Create base Zod validation schemas from Drizzle schema
export const selectJourneySchema = createSelectSchema(journeys);
export const insertJourneySchema = createInsertSchema(journeys);

// Define a type for easier usage in your application

export type JourneyTypeSelect = typeof journeys.$inferSelect;
export type NewJourneyType = typeof journeys.$inferInsert;
