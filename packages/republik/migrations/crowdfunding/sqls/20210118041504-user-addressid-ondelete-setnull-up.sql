ALTER TABLE "public"."users"
  DROP CONSTRAINT "users_addressId_fkey",
  ADD CONSTRAINT "users_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
