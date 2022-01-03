ALTER TABLE "public"."votings" ADD COLUMN "requireAddress" boolean NOT NULL DEFAULT true ;
ALTER TABLE "public"."elections" ADD COLUMN "requireAddress" boolean NOT NULL DEFAULT true ;
