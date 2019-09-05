CREATE DOMAIN subscription_object_type AS TEXT
CHECK(
  VALUE IN ('User', 'Document', 'Discussion')
);


CREATE TABLE subscriptions (
  "id"                 uuid primary key not null default uuid_generate_v4(),
  "userId"             uuid not null references "users" on update cascade on delete cascade,
  "filters"            jsonb,
  "objectType"         subscription_object_type not null,
  "objectUserId"       uuid references "users",
  "objectDocumentId"   text,
  "objectDiscussionId" uuid references "discussions",
  "createdAt"          timestamptz default now(),
  "updatedAt"          timestamptz default now(),
  unique("userId", "objectUserId"),
  unique("userId", "objectDocumentId"),
  unique("userId", "objectDiscussionId")
);

CREATE INDEX IF NOT EXISTS "subscription_user_id" ON "subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "subscription_filters" ON "subscriptions" USING gin ("filters");
CREATE INDEX IF NOT EXISTS "subscription_object_type" ON "subscriptions"("objectType");
CREATE INDEX IF NOT EXISTS "subscription_object_user_id" ON "subscriptions"("objectUserId");
CREATE INDEX IF NOT EXISTS "subscription_object_document_id" ON "subscriptions"("objectDocumentId");
CREATE INDEX IF NOT EXISTS "subscription_object_discussion_id" ON "subscriptions"("objectDiscussionId");

CREATE FUNCTION check_subscription_trg() RETURNS trigger AS $$
BEGIN
  CASE NEW."objectType"
    WHEN 'User' THEN
      IF
        NEW."objectUserId" IS NULL OR
        NEW."objectDocumentId" IS NOT NULL OR
        NEW."objectDiscussionId" IS NOT NULL OR
        NEW."userId" = NEW."objectUserId"
      THEN
        RAISE EXCEPTION 'PSQL EXCEPTION: wrong object arguments combination';
      END IF;
    WHEN 'Document' THEN
      IF
        NEW."objectUserId" IS NOT NULL OR
        NEW."objectDocumentId" IS NULL OR
        NEW."objectDiscussionId" IS NOT NULL
      THEN
        RAISE EXCEPTION 'PSQL EXCEPTION: wrong object arguments combination';
      END IF;
    WHEN 'Discussion' THEN
      IF
        NEW."objectUserId" IS NOT NULL OR
        NEW."objectDocumentId" IS NOT NULL OR
        NEW."objectDiscussionId" IS NULL
      THEN
        RAISE EXCEPTION 'PSQL EXCEPTION: wrong object arguments combination';
      END IF;
  END CASE;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_subscription
BEFORE INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE check_subscription_trg();
