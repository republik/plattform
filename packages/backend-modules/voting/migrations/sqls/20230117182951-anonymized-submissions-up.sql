ALTER TABLE "public"."questionnaireSubmissions"
  ALTER COLUMN "userId" DROP NOT NULL,
  ADD COLUMN "anonymized" boolean DEFAULT 'FALSE',
  ADD COLUMN "pseudonym" uuid;

CREATE UNIQUE INDEX "questionnaireSubmissions_questionnaireId_pseudonym_idx"
  ON "public"."questionnaireSubmissions" ("questionnaireId","pseudonym");

WITH submissions AS (
  SELECT qs.id, qs.anonymized, COUNT(a.id)
  
  FROM "questionnaireSubmissions" qs
  
  LEFT JOIN answers a
         ON a."userId" = qs."userId"
        AND a."questionnaireId" = qs."questionnaireId"
  
  WHERE qs."userId" IS NOT NULL
  
  GROUP BY 1
)

UPDATE "questionnaireSubmissions" qs
   SET anonymized = TRUE
FROM submissions s
WHERE qs.id = s.id
  AND s.count = 0
  AND s.anonymized = FALSE
;

INSERT INTO "questionnaireSubmissions" ("questionnaireId", pseudonym, "createdAt", "updatedAt")
(
  SELECT "questionnaireId", pseudonym, MAX("createdAt") "createdAt", MAX("updatedAt") "updatedAt"
  FROM answers 
  WHERE pseudonym IS NOT NULL
  GROUP BY 1, 2
);

DELETE FROM "notifyTableChangeQueue"
WHERE "table" = 'questionnaireSubmissions'
  AND op = 'INSERT'
;
