-- migrate up here: CREATE TABLE...

CREATE TYPE payments.charge_status as ENUM (
    'succeeded',
    'pending',
    'failed'
);

CREATE TYPE payments.payment_method_type as ENUM (
    'CARD',
    'TWINT',
    'PAYPAL'
);

CREATE TABLE IF NOT EXISTS payments."charges" (
    "id" uuid default uuid_generate_v4() PRIMARY KEY,
    "company" payments.company NOT NULL,
    "provider" payments.payment_provider default 'STRIPE',
    "externalId" text NOT NULL,
    "invoiceId" uuid, -- invoice that is being charged
    "paid" boolean NOT NULL,
    "amount" int NOT NULL,
    "amountCaptured" int,
    "amountRefunded" int,
    "status" payments.charge_status NOT NULL,
    "paymentMethodType" payments.payment_method_type,
    "fullyRefunded" boolean NOT NULL default false,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    CONSTRAINT fk_charge_invoice_id FOREIGN KEY("invoiceId")
       REFERENCES payments.invoices("id")
);

CREATE UNIQUE INDEX charge_external_id_idx ON payments.charges ("externalId");
