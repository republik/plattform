-- migrate up here: CREATE TABLE...

CREATE TABLE campaigns (
  id uuid NOT NULL,
  name text NOT NULL UNIQUE,
  description text NULL,
  beginDate timestamp with time zone NOT NULL,
  endDate timestamp with time zone NOT NULL,
  createdAt timestamp with time zone NOT NULL,
  updatedAt timestamp with time zone NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE referrals (
  id uuid NOT NULL,
  campaignId uuid NULL,
  referrerId uuid NOT NULL,
  pledgeId uuid NOT NULL,
  createdAt timestamp with time zone NOT NULL,
  updatedAt timestamp with time zone NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY 
    (campaignId) REFERENCES campaigns (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    (referrerId) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    (pledgeId) REFERENCES pledges (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
