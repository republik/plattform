-- migrate up here: CREATE TABLE...

CREATE SCHEMA IF NOT EXISTS payments;

CREATE TYPE payments.company as ENUM (
    'REPUBLIK',
    'PROJECT_R'
);

CREATE TYPE payments.subscription_type as ENUM (
    'YEARLY_SUBSCRIPTION',
    'MONTHLY_SUBSCRIPTION'
);

CREATE TYPE payments.payment_provider as ENUM (
    'STRIPE'
);

CREATE TYPE payments.subscription_status as ENUM (
    'trialing',
    'incomplete',
    'paused',
    'active',
    'canceled',
    'unpaid',
    'past_due'
);

CREATE TYPE payments.order_status as ENUM (
    'paid',
    'unpaid'
);

CREATE TYPE payments.invoice_status as ENUM (
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible'
);

CREATE TABLE IF NOT EXISTS payments."stripeCustomers" (
    "id" uuid default uuid_generate_v4() PRIMARY KEY,
    "userId" uuid NOT NULL,
    "company" payments.company NOT NULL,
    "customerId" text NOT NULL,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    CONSTRAINT fk_stripe_customer_user FOREIGN KEY("userId")
      REFERENCES public.users("id"),
    CONSTRAINT stripe_customers_for_company UNIQUE ("userId", "company")
);

CREATE INDEX stripe_customer_id_idx ON payments."stripeCustomers" ("customerId");

CREATE TABLE IF NOT EXISTS payments.subscriptions (
    "id" uuid default uuid_generate_v4() PRIMARY KEY,
    "userId" uuid NOT NULL,
    "company" payments.company NOT NULL,
    "provider" payments.payment_provider default 'STRIPE',
    "externalId" text NOT NULL,
    "type" payments.subscription_type NOT NULL,
    "status" payments.subscription_status NOT NULL,
    "metadata" jsonb,
    "currentPeriodStart" timestamptz,
    "currentPeriodEnd" timestamptz,
    "cancelAtPeriodEnd" boolean,
    "cancelAt" timestamptz,
    "canceledAt" timestamptz,
    "endedAt" timestamptz,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    CONSTRAINT fk_subscription_user FOREIGN KEY("userId")
      REFERENCES public.users("id")
);



CREATE UNIQUE INDEX subscription_external_id_idx ON payments.subscriptions ("externalId");

CREATE TABLE IF NOT EXISTS payments.invoices (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL,
  "subscriptionId" uuid,
  "company" payments.company NOT NULL,
  "provider" payments.payment_provider default 'STRIPE',
  "externalId" text NOT NULL,
  "hrId" text NOT NULL default public.make_hrid('payments.invoices'::regclass, 'hrId'::text, (6)::bigint),
  "total" integer NOT NULL,
  "totalBeforeDiscount" integer NOT NULL,
  "status" payments.invoice_status NOT NULL,
  "items" jsonb NOT NULL,
  "discounts" jsonb,
  "metadata" jsonb,
  "periodStart" timestamptz,
  "periodEnd" timestamptz,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  CONSTRAINT fk_invoice_for_subscription FOREIGN KEY("subscriptionId")
    REFERENCES payments.subscriptions("id"),
  CONSTRAINT fk_invoice_for_user FOREIGN KEY("userId")
    REFERENCES public.users("id")
);

CREATE INDEX invoices_subscription_id_idx ON payments.invoices ("subscriptionId");
CREATE UNIQUE INDEX invoices_hr_id_idx ON payments.invoices ("hrId");

CREATE TABLE IF NOT EXISTS payments.orders (
   "id" uuid default uuid_generate_v4() PRIMARY KEY,
   "provider" payments.payment_provider default 'STRIPE',
   "externalId" text NOT NULL,
   "company" payments.company NOT NULL,
   "userId" uuid NOT NULL,
   "total" integer NOT NULL,
   "totalBeforeDiscount" integer NOT NULL,
   "paymentStatus" payments.order_status NOT NULL,
   "discountAmount" integer,
   "discounts" jsonb,
   "invoiceId"  uuid,
   "subscriptionId" uuid,
   "items" jsonb NOT NULL,
   "createdAt" timestamptz DEFAULT now(),
   "updatedAt" timestamptz DEFAULT now(),
   CONSTRAINT fk_order_user FOREIGN KEY("userId")
      REFERENCES public.users("id"),
   CONSTRAINT fk_order_subscription FOREIGN KEY("subscriptionId")
      REFERENCES payments.subscriptions("id"),
   CONSTRAINT fk_order_invoice FOREIGN KEY("invoiceId")
      REFERENCES payments.invoices("id")
);

CREATE UNIQUE INDEX order_external_id_idx ON payments.orders ("externalId");
CREATE UNIQUE INDEX order_subscription_id_idx ON payments.orders ("subscriptionId");

CREATE TABLE IF NOT EXISTS payments.webhooks (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "source" text NOT NULL,
  "sourceId" text NOT NULL,
  "payload" jsonb,
  "company" payments.company NOT NULL,
  "processed" boolean NOT NULL DEFAULT FALSE,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX webhook_source_id_idx ON payments.webhooks ("sourceId");
