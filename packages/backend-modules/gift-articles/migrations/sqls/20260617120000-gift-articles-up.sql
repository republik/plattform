CREATE TABLE "public"."giftArticleLinks" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "granterUserId" uuid NOT NULL,
  "documentPath" text NOT NULL,
  "token" text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "expiresAt" timestamp with time zone NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("token"),
  FOREIGN KEY ("granterUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

CREATE INDEX "giftArticleLinks_granterUserId_idx" ON "public"."giftArticleLinks"("granterUserId");
CREATE INDEX "giftArticleLinks_granter_doc_idx" ON "public"."giftArticleLinks"("granterUserId", "documentPath");

CREATE TABLE "public"."giftArticleConversions" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "giftArticleLinkId" uuid NOT NULL,
  "convertedUserId" uuid NOT NULL,
  "conversionType" text NOT NULL CHECK ("conversionType" IN ('trial', 'pledge')),
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("giftArticleLinkId") REFERENCES "public"."giftArticleLinks"("id") ON DELETE CASCADE,
  FOREIGN KEY ("convertedUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

CREATE INDEX "giftArticleConversions_link_user_idx" ON "public"."giftArticleConversions"("giftArticleLinkId", "convertedUserId");
