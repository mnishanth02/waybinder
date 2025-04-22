CREATE TYPE "public"."journey_type" AS ENUM('trekking', 'trail_running', 'mountaineering', 'cycling_touring', 'cycling_road', 'cycling_mountain', 'climbing_expedition', 'road_trip', 'travel', 'weekend_getaway', 'single_day_outing', 'other');--> statement-breakpoint
CREATE TYPE "public"."privacy_status" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"journey_unique_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"journey_type" "journey_type" NOT NULL,
	"tags" text[],
	"privacy_status" "privacy_status" DEFAULT 'private' NOT NULL,
	"cover_image_url" text,
	"location" text,
	"total_distance_km" text,
	"total_elevation_gain_m" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "journeys_journey_unique_id_unique" UNIQUE("journey_unique_id"),
	CONSTRAINT "journeys_title_unique" UNIQUE("title"),
	CONSTRAINT "journeys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journeys_creator_id_idx" ON "journeys" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_slug_idx" ON "journeys" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_title_idx" ON "journeys" USING btree ("title");--> statement-breakpoint
CREATE INDEX "journeys_start_end_date_idx" ON "journeys" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "journeys_privacy_status_idx" ON "journeys" USING btree ("privacy_status");--> statement-breakpoint
CREATE INDEX "journeys_type_idx" ON "journeys" USING btree ("journey_type");--> statement-breakpoint
CREATE INDEX "journeys_created_at_idx" ON "journeys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "journeys_updated_at_idx" ON "journeys" USING btree ("updated_at");