-- migrate up here: CREATE TABLE...

CREATE TABLE IF NOT EXISTS payments."subscriptionCancellations" (
    "id" uuid primary key default uuid_generate_v4(),
    "subscriptionId" uuid not null references payments.subscriptions(id),
    "category" text not null,
    "reason" text,
    "suppressConfirmation" boolean not null default false,
    "suppressWinback" boolean not null default false,
    "cancelledViaSupport" boolean not null default false,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "revokedAt" timestamp with time zone
);
