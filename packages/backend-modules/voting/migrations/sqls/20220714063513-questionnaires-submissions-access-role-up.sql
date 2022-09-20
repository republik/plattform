CREATE DOMAIN "submissionsAccessRole" AS TEXT
  CONSTRAINT "submissionsAccessRoleCheck"
    CHECK(
      VALUE IN ('NONE', 'ADMIN', 'MEMBER', 'PUBLIC')
    );

ALTER TABLE "public"."questionnaires"
  ADD COLUMN "submissionsAccessRole" "submissionsAccessRole" NOT NULL DEFAULT 'NONE';
