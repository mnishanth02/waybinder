CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'gpx', 'document', 'audio', 'other');--> statement-breakpoint
CREATE TABLE "gpx_files" (
	"id" text PRIMARY KEY NOT NULL,
	"media_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"processed_stats" jsonb,
	"geo_json_data" jsonb,
	"original_filename" text,
	"is_merged" boolean DEFAULT false,
	"source_gpx_ids" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gpx_files_media_id_unique" UNIQUE("media_id")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"uploader_id" text NOT NULL,
	"journey_id" text,
	"activity_id" text,
	"media_type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"filename" text,
	"size_bytes" integer,
	"mime_type" varchar(100),
	"metadata" jsonb,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_target_check" CHECK (num_nonnulls(journey_id, activity_id) = 1)
);
--> statement-breakpoint
ALTER TABLE "gpx_files" ADD CONSTRAINT "gpx_files_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gpx_files" ADD CONSTRAINT "gpx_files_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gpx_files_activity_idx" ON "gpx_files" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "media_uploader_idx" ON "media" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "media_journey_idx" ON "media" USING btree ("journey_id");--> statement-breakpoint
CREATE INDEX "media_activity_idx" ON "media" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "media_journey_type_idx" ON "media" USING btree ("journey_id","media_type");--> statement-breakpoint
CREATE INDEX "media_activity_type_idx" ON "media" USING btree ("activity_id","media_type");