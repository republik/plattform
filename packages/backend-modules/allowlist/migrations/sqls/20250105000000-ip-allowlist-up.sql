-- Create ipAllowlist table with CIDR array for IP range matching
CREATE TABLE IF NOT EXISTS "ipAllowlist" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "ipRanges" cidr[] NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

-- Create index on active column for faster queries
CREATE INDEX "ipAllowlist_active_idx" ON "ipAllowlist" ("active") WHERE "active" = true;

