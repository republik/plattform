ALTER DOMAIN cancel_category DROP CONSTRAINT cancel_category_check

ALTER DOMAIN cancel_category ADD CONSTRAINT cancel_category_check
  CHECK(
    VALUE IN ('EDITORIAL', 'NO_TIME', 'TOO_EXPENSIVE', 'OTHER', 'VOID', 'SYSTEM')
  );
