-- migrate up here: CREATE TABLE...
CREATE TABLE IF NOT EXISTS "leadTracking" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "email" citext NOT NULL,
  "leadTag" citext NOT NULL,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

CREATE UNIQUE INDEX "email_lead_tag_idx" on "leadTracking" ("email", "leadTag");
