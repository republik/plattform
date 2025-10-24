-- migrate up here: CREATE TABLE...

CREATE TABLE payments.subscription_upgrades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  subscription_id uuid REFERENCES payments.subscriptions(id),
  external_id text,
  status text,
  scheduled_start timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
