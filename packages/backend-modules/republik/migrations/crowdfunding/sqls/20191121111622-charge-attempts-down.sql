UPDATE "mailLog"
SET type = 'membership_owner_autopay_notice_5'
WHERE type = 'membership_owner_autopay_notice' ;

DROP TABLE "public"."chargeAttempts" ;