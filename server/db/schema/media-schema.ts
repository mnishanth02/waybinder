import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { activities } from "./activity-schema";
import { users } from "./auth-schema";
import { mediaTypeEnum } from "./enum";
import { journeys } from "./journey-schema";

export const media = pgTable(
  "media",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    uploaderId: text("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Link EITHER to journey OR activity (Schema 2 flexibility)
    journeyId: text("journey_id").references(() => journeys.id, { onDelete: "cascade" }),
    activityId: text("activity_id").references(() => activities.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    url: text("url").notNull(), // URL from storage
    filename: text("filename"),
    sizeBytes: integer("size_bytes"),
    mimeType: varchar("mime_type", { length: 100 }),
    metadata: jsonb("metadata"), // image dimensions, video duration, basic GPX stats, exif?
    order: integer("order").default(0), // Order within activity/journey gallery
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("media_uploader_idx").on(table.uploaderId),
    index("media_journey_idx").on(table.journeyId), // Index even if nullable
    index("media_activity_idx").on(table.activityId), // Index even if nullable
    index("media_journey_type_idx").on(table.journeyId, table.mediaType),
    index("media_activity_type_idx").on(table.activityId, table.mediaType),
    // Ensure media belongs to something
    check("media_target_check", sql`num_nonnulls(journey_id, activity_id) = 1`), // Ensure attached to exactly one context
  ]
);

// --- GPX File Specific Details (Retained from Schema 1 for structure) ---
export const gpxFiles = pgTable(
  "gpx_files",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()), // Can potentially reuse mediaId if 1:1 enforced strictly
    mediaId: text("media_id")
      .notNull()
      .unique() // Ensure 1:1 with media entry of type 'gpx'
      .references(() => media.id, { onDelete: "cascade" }),
    activityId: text("activity_id") // Denormalized for direct activity link, ensure matches media.activityId
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    processedStats: jsonb("processed_stats"), // distance, elevation arrays, time stats etc.
    geoJsonData: jsonb("geo_json_data"), // Linestring/MultiLinestring for map rendering
    originalFilename: text("original_filename"),
    isMerged: boolean("is_merged").default(false),
    sourceGpxIds: text("source_gpx_ids").array(), // References other gpxFiles.id if merged
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("gpx_files_activity_idx").on(table.activityId)]
);

export const selectMediaSchema = createSelectSchema(media);
export const insertMediaSchema = createInsertSchema(media);
export const selectGpsFilesSchema = createSelectSchema(gpxFiles);
export const insertGpsFilesSchema = createInsertSchema(gpxFiles);

export type MediaTypeSelect = typeof media.$inferSelect;
export type MediaTypeInsert = typeof media.$inferInsert;
export type GpxFilesTypeSelect = typeof gpxFiles.$inferSelect;
export type GpxFilesTypeInsert = typeof gpxFiles.$inferInsert;
