-- Add requireAddress flag to goodies and set it to TRUE for existing goodies.
ALTER TABLE "public"."goodies" ADD COLUMN "requireAddress" boolean NOT NULL DEFAULT FALSE;
UPDATE "public"."goodies" SET "requireAddress" = TRUE;

-- Add requireAddress flag to membershipTypes
ALTER TABLE "public"."membershipTypes" ADD COLUMN "requireAddress" boolean NOT NULL DEFAULT FALSE;
