CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId");
CREATE INDEX IF NOT EXISTS "ballots_userId_idx" ON "ballots"("userId");
CREATE INDEX IF NOT EXISTS "discussionPreferences_userId_idx" ON "discussionPreferences"("userId");
CREATE INDEX IF NOT EXISTS "paymentSources_userId_idx" ON "paymentSources"("userId");
CREATE INDEX IF NOT EXISTS "stripeCustomers_userId_idx" ON "stripeCustomers"("userId");

CREATE INDEX IF NOT EXISTS "consents_userId_idx" ON "consents"("userId");
CREATE INDEX IF NOT EXISTS "consents_policy_idx" ON "consents"("policy");
CREATE INDEX IF NOT EXISTS "consents_record_idx" ON "consents"("record");

CREATE INDEX IF NOT EXISTS "comments_discussionId_idx" ON "comments"("discussionId");

CREATE INDEX IF NOT EXISTS "membershipPeriods_membershipId_idx" ON "membershipPeriods"("membershipId");
