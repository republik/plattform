CREATE DOMAIN event_object_type AS TEXT
CHECK(
  VALUE IN ('Comment', 'Document')
);

CREATE TABLE "events" (
  "id"              uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "objectType"      event_object_type NOT NULL,
  "objectId"        text NOT NULL,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE TABLE "notifications" (
  "id"              uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "eventId"         uuid NOT NULL references "events",
  "userId"          uuid NOT NULL references "users",

  "subscriptionId"  uuid references "subscriptions",

  "channels"        jsonb,

  "content"         jsonb,
  "readAt"          timestamptz,
  "mailLogId"       uuid references "mailLog",

  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
