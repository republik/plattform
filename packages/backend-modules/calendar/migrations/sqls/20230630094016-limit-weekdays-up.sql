ALTER TABLE "public"."calendars" ADD COLUMN "limitWeekdays" integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';
