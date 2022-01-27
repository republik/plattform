ALTER TABLE "discussionPreferences"
  ADD COLUMN "anonymousDifferentiator" integer,
  -- multiple null values for not anonymous are allowed
  -- > Two null values are never considered equal in this comparison.
  -- > https://www.postgresql.org/docs/12/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS
  ADD CONSTRAINT "discussionPreferences_anonymousDifferentiator_key" UNIQUE ("discussionId", "anonymousDifferentiator")
;
