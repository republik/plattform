UPDATE "accessGrants"
SET
  "beginAt" = "accessGrants"."createdAt",
  "endAt" = "accessGrants"."createdAt" + "accessCampaigns"."grantPeriodInterval"
FROM "accessCampaigns"
WHERE "accessGrants"."accessCampaignId" = "accessCampaigns"."id" ;

ALTER TABLE "accessGrants"
  ALTER COLUMN "beginAt" SET NOT NULL,
  ALTER COLUMN "endAt" SET NOT NULL,
  DROP COLUMN IF EXISTS "beginBefore",
  DROP COLUMN IF EXISTS "voucherCode",
  DROP COLUMN IF EXISTS "message"
;

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
    EXECUTE format('SELECT (NOT EXISTS (SELECT 1 FROM "%s" WHERE "%s" = %L))::bool', _tbl, _column, new_hrid) INTO done;
  END LOOP doneloop;
  RETURN new_hrid;
END;
$$ LANGUAGE PLPGSQL VOLATILE;

ALTER TABLE "accessGrants"
  RENAME COLUMN "granterUserId" TO "granteeUserId" ;

ALTER TABLE "accessCampaigns"
  DROP COLUMN IF EXISTS "grantClaimableInterval",
  ADD COLUMN "emailExpirationNotice"
    interval NOT NULL DEFAULT '7 days'::interval
;

ALTER TABLE "accessCampaigns"
  RENAME COLUMN "grantPeriodInterval" TO "periodInterval"
;
