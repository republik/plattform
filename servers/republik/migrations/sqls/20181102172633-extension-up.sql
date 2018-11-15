ALTER TABLE "packages"
  ADD COLUMN "custom" boolean NOT NULL DEFAULT false,
  ADD COLUMN "rules" jsonb NOT NULL DEFAULT '[]'::jsonb ;

ALTER TABLE "membershipPeriods"
  ADD COLUMN "kind" character varying
    NOT NULL
    DEFAULT 'REGULAR'::character varying ;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "customization" jsonb
  NOT NULL
  DEFAULT '{}' ;
