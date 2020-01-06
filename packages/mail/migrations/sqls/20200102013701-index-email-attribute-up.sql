ALTER TABLE "public"."mailLog" ADD COLUMN "mandrillLastEvent" jsonb;
CREATE INDEX "mailLog_email_idx" ON "public"."mailLog"("email");
CREATE INDEX "mailLog_createdAt_idx" ON "public"."mailLog"("createdAt" DESC);
CREATE INDEX "mailLog_userId_createdAt_idx" ON "public"."mailLog"("userId","createdAt" DESC);
CREATE INDEX "mailLog_email_createdAt_idx" ON "public"."mailLog"("email","createdAt" DESC);
CREATE INDEX "mailLog_result__id_idx" ON "public"."mailLog"((result->>'_id'));
