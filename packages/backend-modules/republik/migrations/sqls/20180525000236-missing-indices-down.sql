DROP INDEX IF EXISTS "comments_userId_idx";
DROP INDEX IF EXISTS "ballots_userId_idx";
DROP INDEX IF EXISTS "discussionPreferences_userId_idx";
DROP INDEX IF EXISTS "paymentSources_userId_idx";
DROP INDEX IF EXISTS "stripeCustomers_userId_idx";

DROP INDEX IF EXISTS "consents_userId_idx";
DROP INDEX IF EXISTS "consents_policy_idx";
DROP INDEX IF EXISTS "consents_record_idx";

DROP INDEX IF EXISTS "comments_discussionId_idx";

DROP INDEX IF EXISTS "membershipPeriods_membershipId_idx";
