CREATE TYPE "public"."activity_type" AS ENUM('hikeing', 'running', 'cycling', 'driving', 'flying', 'boating', 'rest', 'camping', 'climbing', 'mountaineer', 'sightseeing', 'travel', 'other');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced', 'professional');--> statement-breakpoint
CREATE TYPE "public"."fitness_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary', 'prefer-not-to-say');--> statement-breakpoint
CREATE TYPE "public"."journey_type" AS ENUM('trekking', 'trail_running', 'mountaineering', 'cycling_touring', 'cycling_road', 'cycling_mountain', 'climbing_expedition', 'road_trip', 'travel', 'weekend_getaway', 'single_day_outing', 'other');--> statement-breakpoint
CREATE TYPE "public"."privacy_status" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'athlete');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"activity_unique_id" text NOT NULL,
	"title" text NOT NULL,
	"activity_date" date NOT NULL,
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
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"phone" text,
	"is_admin" boolean,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"journey_unique_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"journey_type" "journey_type" NOT NULL,
	"tags" text[],
	"privacy_status" "privacy_status" DEFAULT 'private' NOT NULL,
	"cover_image_url" text,
	"location" text,
	"total_distance_km" text,
	"total_elevation_gain_m" text,
	"buddy_ids" text[],
	"member_names" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "journeys_journey_unique_id_unique" UNIQUE("journey_unique_id"),
	CONSTRAINT "journeys_title_unique" UNIQUE("title"),
	CONSTRAINT "journeys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_unique_id_idx" ON "activities" USING btree ("activity_unique_id");--> statement-breakpoint
CREATE INDEX "activities_date_idx" ON "activities" USING btree ("activity_date");--> statement-breakpoint
CREATE INDEX "activities_day_number_idx" ON "activities" USING btree ("day_number");--> statement-breakpoint
CREATE INDEX "activities_order_idx" ON "activities" USING btree ("journey_id","day_number","order_within_day");--> statement-breakpoint
CREATE INDEX "activities_type_idx" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "activities_journey_date_order_idx" ON "activities" USING btree ("journey_id","activity_date","order_within_day");--> statement-breakpoint
CREATE INDEX "activities_journey_day_order_idx" ON "activities" USING btree ("journey_id","day_number","order_within_day");--> statement-breakpoint
CREATE INDEX "activities_journey_type_idx" ON "activities" USING btree ("journey_id","activity_type");--> statement-breakpoint
CREATE INDEX "athlete_profiles_athlete_unique_id_idx" ON "athlete_profiles" USING btree ("athlete_unique_id");--> statement-breakpoint
CREATE INDEX "athlete_profiles_primary_activity1_idx" ON "athlete_profiles" USING btree ("primary_activity1");--> statement-breakpoint
CREATE INDEX "athlete_profiles_primary_activity2_idx" ON "athlete_profiles" USING btree ("primary_activity2");--> statement-breakpoint
CREATE INDEX "accounts_user_id_index" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verified_index" ON "users" USING btree ("email_verified");--> statement-breakpoint
CREATE INDEX "identifier_index" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "journeys_creator_id_idx" ON "journeys" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_slug_idx" ON "journeys" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_title_idx" ON "journeys" USING btree ("title");--> statement-breakpoint
CREATE INDEX "journeys_start_end_date_idx" ON "journeys" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "journeys_privacy_status_idx" ON "journeys" USING btree ("privacy_status");--> statement-breakpoint
CREATE INDEX "journeys_type_idx" ON "journeys" USING btree ("journey_type");--> statement-breakpoint
CREATE INDEX "journeys_created_at_idx" ON "journeys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "journeys_updated_at_idx" ON "journeys" USING btree ("updated_at");