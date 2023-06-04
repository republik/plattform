ALTER TABLE "discussions"
  ADD COLUMN "allowedRoles" jsonb NOT NULL DEFAULT '["member"]'::jsonb
;
