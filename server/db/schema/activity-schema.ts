import { index, integer, pgTable, real, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { activityTypeEnum } from "./enum";
import { journeys } from "./journey-schema";

// --- Activities within a Journey ---
export const activities = pgTable(
  "activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    activityUniqueId: text("activity_unique_id").notNull().unique(),
    title: text("title").notNull(),
    activityDate: text("start_date").notNull(),
    dayNumber: integer("day_number"),
    orderWithinDay: integer("order_within_day").default(0).notNull(),
    activityType: activityTypeEnum("activity_type"),
    content: text("content"),
    distanceKm: real("distance_km"),
    elevationGainM: real("elevation_gain_m"),
    elevationLossM: real("elevation_loss_m"),
    movingTimeSeconds: integer("moving_time_seconds"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("activities_unique_id_idx").on(table.activityUniqueId),
    index("activities_date_idx").on(table.activityDate),
    index("activities_order_idx").on(table.journeyId, table.activityDate, table.orderWithinDay),
    index("activities_type_idx").on(table.activityType),
    index("activities_journey_date_order_idx").on(
      table.journeyId,
      table.activityDate,
      table.orderWithinDay
    ),
    index("activities_journey_type_idx").on(table.journeyId, table.activityType),
  ]
);

export const selectActivitySchema = createSelectSchema(activities);
export const insertActivitySchema = createInsertSchema(activities);

export type ActivityTypeSelect = typeof activities.$inferSelect;
export type ActivityTypeInsert = typeof activities.$inferInsert;
