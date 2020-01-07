ALTER DOMAIN cancel_category DROP CONSTRAINT cancel_category_check;

ALTER DOMAIN cancel_category ADD CONSTRAINT cancel_category_check
  CHECK(
    VALUE IN (
      'EDITORIAL',
      'EDITORAL_NARCISSISTIC',
      'NO_TIME',
      'UNCERTAIN_FUTURE',
      'TOO_EXPENSIVE',
      'NO_MONEY',
      'LOGIN_TECH',
      'PAPER',
      'EXPECTIONS',
      'RARELY_READ',
      'TOO_MUCH_TO_READ',
      'CROWFUNDING_ONLY',
      'SEVERAL_REASONS',
      'OTHER',
      'VOID',
      'SYSTEM'
    )
  );
