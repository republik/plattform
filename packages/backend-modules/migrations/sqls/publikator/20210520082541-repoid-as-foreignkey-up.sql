DELETE FROM discussions
WHERE id IN (
    SELECT
      d.id
    FROM
      discussions d
    LEFT JOIN publikator.repos r ON r.id = d."repoId"
  WHERE
    d."repoId" IS NOT NULL
    AND r.id IS NULL);

ALTER TABLE discussions
  ADD FOREIGN KEY ("repoId") REFERENCES publikator.repos (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "collectionDocumentItems"
  ADD FOREIGN KEY ("repoId") REFERENCES publikator.repos (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "statisticsMatomo"
  ADD FOREIGN KEY ("repoId") REFERENCES publikator.repos (id) ON DELETE SET NULL ON UPDATE CASCADE;

