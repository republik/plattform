-- migrate up here: CREATE TABLE...

CREATE TABLE campaigns (
  id uuid NOT NULL,
  name text NOT NULL UNIQUE,
  description text NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE referrals (
  id uuid NOT NULL,
  campaign_id uuid NULL,
  referrer_id uuid NOT NULL,
  pledge_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY 
    (campaign_id) REFERENCES campaigns (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    (referrer_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY 
    (pledge_id) REFERENCES pledges (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
