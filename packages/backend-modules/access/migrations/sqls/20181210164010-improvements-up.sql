-- Function Update: Handle camel-cased table names e.g. "accessGrants".
--
-- First argument _tbl accepts of type regclass and requires a table class
-- either passed with single quotes ('payments'), or double quotes if table name
-- is camel cased ("accessGrants"). SELECT query in functon later wrapped
-- _tbl again in double quotes which led to an error.
--
CREATE OR REPLACE FUNCTION make_hrid(IN _tbl regclass, IN _column text, IN digits bigint) RETURNS text AS $$
DECLARE
chars char[];
new_hrid text;
done bool;
BEGIN
  chars := ARRAY['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','K','L','M','R','S','T','U','W','X','Y','Z'];
  done := false;
  <<doneloop>>
  WHILE NOT done LOOP
    new_hrid := '';
    <<hridloop>>
    WHILE char_length(new_hrid) < digits LOOP
      new_hrid := new_hrid || chars[floor(random()*(array_length(chars, 1)-1+1))+1];
    END LOOP hridloop;
    EXECUTE format('SELECT (NOT EXISTS (SELECT 1 FROM %s WHERE "%s" = %L))::bool', _tbl, _column, new_hrid) INTO done;
  END LOOP doneloop;
  RETURN new_hrid;
END;
$$ LANGUAGE PLPGSQL VOLATILE;

ALTER TABLE "accessGrants"
  ALTER COLUMN "beginAt" DROP NOT NULL,
  ALTER COLUMN "endAt" DROP NOT NULL,
  ADD COLUMN "beginBefore" timestamp with time zone,
  ADD COLUMN "voucherCode" text UNIQUE,
  ADD COLUMN "message" text
;

ALTER TABLE "accessGrants"
  RENAME COLUMN "granteeUserId" TO "granterUserId"
;

-- Set voucherCode to unclaimed but still valid grants.
UPDATE "accessGrants"
SET "voucherCode" = make_hrid('"accessGrants"', 'voucherCode', 5)
WHERE "recipientUserId" IS NULL AND "invalidatedAt" IS NULL ;

ALTER TABLE "accessGrants"
  ALTER COLUMN "voucherCode"
    SET DEFAULT make_hrid('"accessGrants"', 'voucherCode', 5)
;

ALTER TABLE "accessCampaigns"
  ADD COLUMN "grantClaimableInterval" interval NOT NULL DEFAULT '30 days'::interval,
  DROP COLUMN IF EXISTS "emailExpirationNotice"
;

ALTER TABLE "accessCampaigns"
  RENAME COLUMN "periodInterval" TO "grantPeriodInterval"
;

-- Set beginBefore date on each grant according grantPeriodInterval
UPDATE "accessGrants"
SET
  "beginBefore" = "accessGrants"."createdAt" + "accessCampaigns"."grantPeriodInterval"
FROM "accessCampaigns"
WHERE "accessGrants"."accessCampaignId" = "accessCampaigns"."id" ;

-- Set beginBefore to NOT NULL now that all data is migrated
ALTER TABLE "accessGrants"
  ALTER COLUMN "beginBefore" SET NOT NULL
;
