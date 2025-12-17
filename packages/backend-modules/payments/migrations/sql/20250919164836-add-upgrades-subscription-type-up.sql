-- migrate up here: CREATE TABLE...

ALTER TABLE payments.subscription_upgrades ADD COLUMN
  subscription_type payments.subscription_type;
