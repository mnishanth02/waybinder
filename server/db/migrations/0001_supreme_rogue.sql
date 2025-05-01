ALTER TABLE "activities" ADD COLUMN "geo_json_data" jsonb;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "original_file_name" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "original_file_type" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "processed_stats" jsonb;