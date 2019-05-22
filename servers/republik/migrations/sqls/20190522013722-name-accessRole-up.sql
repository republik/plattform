ALTER TABLE users
  ADD COLUMN "nameAccessRole" "accessRole" NOT NULL DEFAULT 'MEMBER' CHECK ("nameAccessRole" IN ('MEMBER', 'PUBLIC'))
;

UPDATE users
SET "nameAccessRole" = 'PUBLIC'
WHERE roles @> '[ "editor" ]' OR roles @> '[ "admin" ]' OR roles @> '[ "supporter" ]';
