CREATE DOMAIN event_object_type AS TEXT
CHECK(
  VALUE IN ('Comment', 'Document')
);

ALTER TABLE "subscriptions"
  ADD COLUMN "active" boolean NOT NULL DEFAULT true
;

CREATE INDEX IF NOT EXISTS "subscription_active_idx" ON "subscriptions"("active");

CREATE TABLE "events" (
  "id"              uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "objectType"      event_object_type NOT NULL,
  "objectId"        text NOT NULL,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

--CREATE INDEX IF NOT EXISTS "events_object_type_idx" ON "events"("objectType");
--CREATE INDEX IF NOT EXISTS "events_object_id_idx" ON "events"("objectId");

CREATE TABLE "notifications" (
  "id"              uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "eventId"         uuid NOT NULL references "events",
  -- denormalized
  "eventObjectType" event_object_type NOT NULL,
  "eventObjectId"   text NOT NULL,

  "userId"          uuid NOT NULL references "users",

  "subscriptionId"  uuid references "subscriptions",

  "channels"        jsonb,

  "content"         jsonb,
  "readAt"          timestamptz,
  "mailLogId"       uuid references "mailLog",

  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE INDEX IF NOT EXISTS "notifications_event_id_idx" ON "notifications"("eventId");
CREATE INDEX IF NOT EXISTS "notifications_event_object_type_idx" ON "notifications"("eventObjectType");
CREATE INDEX IF NOT EXISTS "notifications_event_object_id_idx" ON "notifications"("eventObjectId");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_read_at_idx" ON "notifications"("readAt");
