-- migrate up here: CREATE TABLE...

CREATE TABLE IF NOT EXISTS campaigns (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL UNIQUE,
  "description" text NULL,
  "beginDate" timestamptz NOT NULL,
  "endDate" timestamptz NOT NULL,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "campaignId" uuid NULL,
  "referrerId" uuid NOT NULL,
  "pledgeId" uuid NOT NULL UNIQUE,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now(),
  FOREIGN KEY 
    ("campaignId") REFERENCES campaigns (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY 
    ("referrerId") REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    ("pledgeId") REFERENCES pledges (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "public"."campaignRewards" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    "campaignId" uuid,
    "referralCountThreshold" int NOT NULL DEFAULT '1',
    "name" text,
    "description" text,
    "type" text NOT NULL DEFAULT 'bonus_month',
    "amount" int NOT NULL DEFAULT '1',
    "createdAt"   timestamptz DEFAULT now(),
    "updatedAt"   timestamptz DEFAULT now(),
    FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "public"."userCampaignRewards" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid,
    "campaignRewardId" uuid,
    "claimedAt" timestamptz DEFAULT now(),
    "createdAt"   timestamptz DEFAULT now(),
    "updatedAt"   timestamptz DEFAULT now(),
    FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("campaignRewardId") REFERENCES "public"."rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

