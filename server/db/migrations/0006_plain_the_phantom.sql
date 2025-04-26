CREATE TYPE "public"."activity_type" AS ENUM('hikeing', 'running', 'cycling', 'driving', 'flying', 'boating', 'rest', 'camping', 'climbing', 'mountaineer', 'sightseeing', 'travel', 'other');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"activity_unique_id" text NOT NULL,
	"title" text NOT NULL,
	"start_date" text NOT NULL,
	"day_number" integer,
	"order_within_day" integer DEFAULT 0 NOT NULL,
	"activity_type" "activity_type",
	"content" text,
	"distance_km" real,
	"elevation_gain_m" real,
	"elevation_loss_m" real,
	"moving_time_seconds" integer,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_activity_unique_id_unique" UNIQUE("activity_unique_id")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_unique_id_idx" ON "activities" USING btree ("activity_unique_id");--> statement-breakpoint
CREATE INDEX "activities_date_idx" ON "activities" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "activities_order_idx" ON "activities" USING btree ("journey_id","start_date","order_within_day");--> statement-breakpoint
CREATE INDEX "activities_type_idx" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "activities_journey_date_order_idx" ON "activities" USING btree ("journey_id","start_date","order_within_day");--> statement-breakpoint
CREATE INDEX "activities_journey_type_idx" ON "activities" USING btree ("journey_id","activity_type");