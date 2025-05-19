-- migrate up here: CREATE TABLE...
CREATE TABLE "publikator"."authors" (
    "id" uuid DEFAULT uuid_generate_v4(),
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "bio" text,
    "publicUrls" jsonb,
    "userId" uuid,
    "gender" text,
    "prolitterisId" text,
    "portraitUrl" text,
    "slug" citext,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id"),
    UNIQUE ("slug")
);
