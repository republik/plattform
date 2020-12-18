CREATE TABLE "discussionSuspensions" (
  "id" uuid,
  "userId" uuid,
  "beginAt" timestamp with time zone NOT NULL DEFAULT now(),
  "endAt" timestamp with time zone NOT NULL DEFAULT now() + '1 week'::interval,
  "reason" text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
