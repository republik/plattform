-- migrate up here: CREATE TABLE...

ALTER TABLE users
ADD COLUMN "profileUrls" JSONB;

UPDATE users
SET "profileUrls" = (
  SELECT jsonb_agg(url)
  FROM (
    SELECT 'https://x.com/' || TRIM(LEADING '@' FROM "twitterHandle") AS url
    WHERE "twitterHandle" IS NOT NULL AND "twitterHandle" != ''
    UNION ALL
    SELECT 'https://facebook.com/' || "facebookId" AS url
    WHERE "facebookId" IS NOT NULL AND "facebookId" != ''
    UNION ALL
    SELECT "publicUrl" AS url
    WHERE "publicUrl" IS NOT NULL AND "publicUrl" != ''
  ) urls
  WHERE url IS NOT NULL
);