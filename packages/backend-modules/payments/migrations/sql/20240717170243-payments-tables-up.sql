-- migrate up here: CREATE TABLE...

CREATE SCHEMA IF NOT EXISTS payments;

CREATE TYPE payments.company as ENUM (
    'REPUBLIK_AG',
    'PROJECT_R'
);

CREATE TYPE payments.subscription_type as ENUM (
    'YEARLY_SUBSCRIPTION',
    'MONTHLY_SUBSCRIPTION'
);

CREATE TYPE payments.subscription_status as ENUM (
    'trialing',
    'incomplete',
    'paused',
    'active',
    'canceld',
    'unpaid',
    'past_due',
    'ended' -- not part of stripe
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
    CONSTRAINT fk_stripe_customer_user FOREIGN KEY("userId")
      REFERENCES public.users("id")
);

CREATE INDEX stripe_customer_id_idx ON payments."stripeCustomers" ("customerId");

CREATE TABLE IF NOT EXISTS payments.subscriptions (
    "id" uuid default uuid_generate_v4() PRIMARY KEY,
    "userId" uuid NOT NULL,
    "company" payments.company NOT NULL,
    "gatewayId" text NOT NULL,
    "type" payments.subscription_type NOT NULL,
    "status" payments.subscription_status NOT NULL,
    "currentPeriodStart" timestamptz,
    "currentPeriodEnd" timestamptz,
    "cancelAt" timestamptz,
    "canceledAt" timestamptz,
    "endedAt" timestamptz,
    "createdAt" timestamptz DEFAULT now(),
    "updatedAt" timestamptz DEFAULT now(),
    CONSTRAINT fk_subscription_user FOREIGN KEY("userId")
      REFERENCES public.users("id")
);

CREATE INDEX subscription_gateway_id_idx ON payments.subscriptions ("gatewayId");

CREATE TABLE IF NOT EXISTS payments.invoices (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL,
  "hrId" text NOT NULL,
  "company" payments.company NOT NULL,
  "gatewayId" text NOT NULL,
  "total" integer NOT NULL,
  "totalBeforeDiscount" integer NOT NULL,
  "status" payments.invoice_status NOT NULL,
  "items" jsonb NOT NULL,
  "discountCode" text,
  "subscriptionId" uuid,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  CONSTRAINT fk_invoice_for_subscription FOREIGN KEY("subscriptionId")
    REFERENCES payments.subscriptions("id"),
  CONSTRAINT fk_invoice_for_user FOREIGN KEY("userId")
    REFERENCES public.users("id")
);

CREATE INDEX invoices_subscription_id_idx ON payments.invoices ("subscriptionId");
CREATE INDEX invoices_hr_id_idx ON payments.invoices ("hrId");

CREATE TABLE IF NOT EXISTS payments.orders (
   "id" uuid default uuid_generate_v4() PRIMARY KEY,
   "gatewayId" text NOT NULL,
   "company" payments.company NOT NULL,
   "userId" uuid NOT NULL,
   "total" integer NOT NULL,
   "totalBeforeDiscount" integer NOT NULL,
   "payementStatus" payments.order_status NOT NULL,
   "dscountAmount" integer,
   "discountCode" text,
   "invoiceId"  uuid,
   "items" jsonb NOT NULL,
   "createdAt" timestamptz DEFAULT now(),
   "updatedAt" timestamptz DEFAULT now(),
   CONSTRAINT fk_order_user FOREIGN KEY("userId")
      REFERENCES public.users("id"),
   CONSTRAINT fk_order_invoice FOREIGN KEY("invoiceId")
      REFERENCES payments.invoices("id")
);

CREATE INDEX order_gateway_id_idx ON payments.orders ("gatewayId");

CREATE TABLE IF NOT EXISTS payments.webhooks (
  "id" uuid default uuid_generate_v4() PRIMARY KEY,
  "source" text NOT NULL,
  "sourceId" text NOT NULL,
  "payload" jsonb,
  "processed" boolean NOT NULL DEFAULT FALSE,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE INDEX webhook_source_id_idx ON payments.webhooks ("sourceId");
