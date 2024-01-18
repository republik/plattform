-- migrate up here: CREATE TABLE...

CREATE TABLE campaigns (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL UNIQUE,
  "description" text NULL,
  "beginDate" timestamptz NOT NULL,
  "endDate" timestamptz NOT NULL,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now()
);

CREATE TABLE referrals (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "campaignId" uuid NULL,
  "referrerId" uuid NOT NULL,
  "pledgeId" uuid NOT NULL UNIQUE,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now(),
  FOREIGN KEY 
    ("campaignId") REFERENCES campaigns (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    ("referrerId") REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    ("pledgeId") REFERENCES pledges (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
