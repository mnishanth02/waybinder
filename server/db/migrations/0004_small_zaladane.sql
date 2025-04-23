ALTER TABLE "journeys" ADD COLUMN "buddy_id" text;--> statement-breakpoint
ALTER TABLE "journeys" ADD COLUMN "member_name" text;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_buddy_id_users_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journeys_buddy_id_idx" ON "journeys" USING btree ("buddy_id");