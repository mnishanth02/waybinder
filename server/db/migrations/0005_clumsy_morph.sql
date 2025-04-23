ALTER TABLE "journeys" DROP CONSTRAINT "journeys_buddy_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "journeys_buddy_id_idx";--> statement-breakpoint
ALTER TABLE "journeys" ADD COLUMN "buddy_ids" text[];--> statement-breakpoint
ALTER TABLE "journeys" ADD COLUMN "member_names" text[];--> statement-breakpoint
ALTER TABLE "journeys" DROP COLUMN "buddy_id";--> statement-breakpoint
ALTER TABLE "journeys" DROP COLUMN "member_name";