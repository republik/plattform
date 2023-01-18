DELETE FROM "questionnaireSubmissions"
WHERE pseudonym IS NOT NULL;

DROP INDEX public."questionnaireSubmissions_questionnaireId_pseudonym_idx";

ALTER TABLE "public"."questionnaireSubmissions"
  DROP COLUMN "pseudonym",
  DROP COLUMN "anonymized",
  ALTER COLUMN "userId" SET NOT NULL;

DELETE FROM "notifyTableChangeQueue"
WHERE "table" = 'questionnaireSubmissions'
  AND op = 'DELETE'
;
