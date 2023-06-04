UPDATE "questions"
SET type = 'Choice'
WHERE status = 'ImageChoice'
;

ALTER DOMAIN question_type
  DROP CONSTRAINT question_type_check
;

ALTER DOMAIN question_type
  ADD CONSTRAINT question_type_check
  CHECK(
    VALUE IN ('Text', 'Choice', 'Range', 'Document')
  )
;