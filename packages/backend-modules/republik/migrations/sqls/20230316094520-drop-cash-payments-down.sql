CREATE TABLE "cashPayments" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "hrid"            text not null,
  "matched"         boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  unique ("hrid")
) ;