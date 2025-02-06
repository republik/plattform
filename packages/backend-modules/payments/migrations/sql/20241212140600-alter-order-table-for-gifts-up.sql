-- migrate up here: CREATE TABLE...
ALTER TABLE payments.orders ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE payments.orders ALTER COLUMN "invoiceId" DROP NOT NULL;
ALTER TABLE payments.orders ADD "metadata" jsonb;
ALTER TABLE payments.orders ADD "customerEmail" text;
ALTER TABLE payments.orders ADD "shippingAddressId" uuid;

CREATE TABLE IF NOT EXISTS payments."orderLineItems" (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "orderId" uuid not null,
  "lineItemId" text,
  "externalPriceId" text,
  "priceLookupKey" text,
  "description" text,
  "quantity" int not null,
  "price" int not null,
  "priceSubtotal" int,
  "taxAmount" int,
  "discountAmount" int,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  CONSTRAINT fk_order_line_item FOREIGN KEY("orderId") REFERENCES payments.orders("id")
);
