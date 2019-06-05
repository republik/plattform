ALTER TABLE "redirections"
  ADD COLUMN "keepQuery" boolean NOT NULL DEFAULT 'false'
;

UPDATE "redirections"
  SET "keepQuery"=TRUE
  WHERE "source" IN ('/pledge', '/notifications', '/merci')
;