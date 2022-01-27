CREATE TABLE "accessCampaigns" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    "periodInterval" interval NOT NULL DEFAULT '1 mon'::interval,
    "emailExpirationNotice" interval NOT NULL DEFAULT '7 days'::interval,
    "emailFollowup" interval NOT NULL DEFAULT '14 days'::interval,
    "beginAt" timestamp with time zone NOT NULL DEFAULT now() + '1 mon'::interval,
    "endAt" timestamp with time zone NOT NULL DEFAULT now() + '2 mons'::interval,
    constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "endAt_after_beginAt" CHECK ("endAt" > "beginAt")
);

CREATE TABLE "accessGrants" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "accessCampaignId" uuid REFERENCES "accessCampaigns"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "granteeUserId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    email citext,
    "recipientUserId" uuid REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "beginAt" timestamp with time zone NOT NULL,
    "endAt" timestamp with time zone NOT NULL,
    "revokedAt" timestamp with time zone,
    "invalidatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "endAt_after_beginAt" CHECK ("endAt" > "beginAt")
);

CREATE TABLE "accessEvents" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "accessGrantId" uuid REFERENCES "accessGrants"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    event text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now()
);
