ALTER TABLE "public"."pledges"
  ADD COLUMN "shippingAddressId" uuid,
  ADD FOREIGN KEY ("shippingAddressId")
    REFERENCES "public"."addresses"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
;
