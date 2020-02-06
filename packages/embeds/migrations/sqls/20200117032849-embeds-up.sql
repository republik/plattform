CREATE TABLE "embeds" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "url"         citext not null unique,
  "host"        text not null,
  "type"        text not null,
  "contentId"   text,
  "content"     jsonb not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

CREATE INDEX "embeds_urls_idx" ON embeds("url");
CREATE INDEX "embeds_type_idx" ON embeds("type");
CREATE INDEX "embeds_content_id_idx" ON embeds("contentId");
