ALTER TABLE "cards"
  ADD COLUMN "commentId" uuid,
  ADD FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE SET NULL ON UPDATE CASCADE ;
