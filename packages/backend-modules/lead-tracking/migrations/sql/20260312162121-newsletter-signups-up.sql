-- migrate up here: CREATE TABLE...
--
CREATE TABlE newsletter_signups (
	id uuid PRIMARY KEY default uuid_generate_v4(),
	user_id uuid REFERENCES users(id),
	newsletter text not null,
	requested_at timestamptz,
	confirmed_at timestamptz,
	meta jsonb, -- metadata like utm_source, utm_campaign, etc
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

CREATE INDEX newsletter_signups_newsletter_name_idx on newsletter_signups (newsletter);
