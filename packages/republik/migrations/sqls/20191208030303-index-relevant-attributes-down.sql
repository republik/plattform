DROP INDEX IF EXISTS "membershipPeriods_beginDate_idx";
DROP INDEX IF EXISTS "membershipPeriods_endDate_idx";

DROP INDEX IF EXISTS "packageOptions_packageId_idx";
DROP INDEX IF EXISTS "packageOptions_rewardId_idx";

DROP INDEX IF EXISTS "pledgeOptions_templateId_idx";
DROP INDEX IF EXISTS "pledgeOptions_membershipId_idx";
DROP INDEX IF EXISTS "pledgeOptions_amount_idx";

DROP INDEX IF EXISTS "pledges_donation_idx";

DROP INDEX IF EXISTS "payments_status_idx";
DROP INDEX IF EXISTS "payments_total_idx";
DROP INDEX IF EXISTS "payments_createdAt_idx";
