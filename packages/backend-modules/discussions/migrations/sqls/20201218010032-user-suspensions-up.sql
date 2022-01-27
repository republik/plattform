CREATE TABLE "discussionSuspensions" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "userId" uuid,
  "beginAt" timestamp with time zone NOT NULL DEFAULT now(),
  "endAt" timestamp with time zone NOT NULL DEFAULT now() + '1 week'::interval,
  "reason" text,
  "issuerUserId" uuid,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("issuerUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
