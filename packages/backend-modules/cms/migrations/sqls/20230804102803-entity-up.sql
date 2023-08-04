-- migrate up here: CREATE TABLE...
CREATE TABLE "cms_entity" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
);

CREATE TABLE "cms_data" (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_entity_id uuid NOT NULL REFERENCES cms_entity(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
)
