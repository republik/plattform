-- Gift article links: a member hands out a token that unlocks one article for
-- a non-member for 14 days.
--
-- "documentId" is the bare, published Sanity `_id` — the same form
-- "collectionDocumentItems"."sanityId" stores, and for the same reason: it is
-- the one id an article has regardless of whether the granter was reading the
-- draft or the published version. No FK: Sanity documents don't live in this
-- database.
--
-- "documentPath" is a snapshot of the slug at hand-out time, kept only to
-- build the link's URL. It is deliberately NOT the identity of the article —
-- a slug can change, "documentId" cannot.
CREATE TABLE "public"."giftArticleLinks" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "granterUserId" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "documentId" text NOT NULL,
  "documentPath" text NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "expiresAt" timestamp with time zone NOT NULL
);

-- Redeeming a link is a lookup by token; the UNIQUE above already covers it.
-- This one serves createGiftArticleLink's "do they already have a live link
-- for this article?" check.
CREATE INDEX "giftArticleLinks_granter_document_idx"
  ON "public"."giftArticleLinks" ("granterUserId", "documentId");
