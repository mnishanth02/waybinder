CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced', 'professional');--> statement-breakpoint
CREATE TYPE "public"."fitness_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary', 'prefer-not-to-say');--> statement-breakpoint
CREATE TABLE "athlete_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"athlete_unique_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"date_of_birth" date,
	"gender" "gender",
	"display_name" text,
	"profile_image_url" text,
	"cover_photo_url" text,
	"location" text,
	"primary_activity1" jsonb,
	"primary_activity2" jsonb,
	"primary_activity3" jsonb,
	"fitness_level" "fitness_level",
	"height" text,
	"weight" text,
	"bio" text,
	"goals" text,
	"sponsors" text,
	"website_urls" jsonb,
	"strava_links" jsonb,
	"instagram_links" jsonb,
	"facebook_links" jsonb,
	"twitter_links" jsonb,
	"other_social_links" jsonb,
	"youtube_urls" jsonb,
	"emergency_contact" jsonb,
	"allergies" text,
	"medical_conditions" text,
	"medications" text,
	"blood_group" "blood_group",
	"privacy_settings" jsonb,
	"communication_preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "athlete_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "athlete_profiles_athlete_unique_id_unique" UNIQUE("athlete_unique_id")
);
--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "athlete_profiles_athlete_unique_id_idx" ON "athlete_profiles" USING btree ("athlete_unique_id");--> statement-breakpoint
CREATE INDEX "athlete_profiles_primary_activity1_idx" ON "athlete_profiles" USING btree ("primary_activity1");--> statement-breakpoint
CREATE INDEX "athlete_profiles_primary_activity2_idx" ON "athlete_profiles" USING btree ("primary_activity2");