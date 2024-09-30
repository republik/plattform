-- migrate down here: DROP TABLE...
--

CREATE TYPE payments.carge_status as ENUM (
    'succeeded',
    'pending',
    'failed',
);

CREATE TABLE IF NOT EXIST payments."charges" (
    "id" uuid default uuid_generate_v4() PRIMARY KEY,
    "company" payments.company NOT NULL,
    "userId" uuid NOT NULL, -- invoice that is being refunded
    "invoiceId" uuid, -- invoice that is being refunded
    "paid" boolean NOT NULL,
    "amount" int NOT NULL,
    "amount_captured" int,
    "amount_refunded" int,
    "refunded" boolean NOT NULL default false,
    "status" payments.carge_status NOT NULL,
    "provider" payments.payment_provider default 'STRIPE',
    "externalId" text NOT NULL,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    "paidAt" timestamptz,
    "refundedAt" timestamptz,
    CONSTRAINT fk_charge_user_id FOREIGN KEY("userId")
       REFERENCES public.users("id"),
    CONSTRAINT fk_charge_invoice_id FOREIGN KEY("invoiceId")
       REFERENCES payments.invoices("id")
)
