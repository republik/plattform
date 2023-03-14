CREATE TABLE "public"."callToActions" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "payload" jsonb,
  "response" jsonb,
  "beginAt" timestamp with time zone NOT NULL DEFAULT now(),
  "endAt" timestamp with time zone NOT NULL DEFAULT now(),
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "acknowledgedAt" timestamp with time zone,
  "userId" uuid NOT NULL,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

CREATE INDEX "callToActions_userId_idx" ON "public"."callToActions"("userId");
