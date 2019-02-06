ALTER DOMAIN cancel_category DROP CONSTRAINT cancel_category_check

ALTER DOMAIN cancel_category ADD CONSTRAINT cancel_category_check
  CHECK(
    VALUE IN (
      'EDITORIAL',
      'NO_TIME',
      'TOO_EXPENSIVE',
      'OTHER',
      'VOID',
      'SYSTEM',
      'LOGIN_TECH'
      'NO_MONEY',
      'PAPER',
      'EDITORIAL',
      'EXPECTIONS',
      'RARELY_READ',
      'TOO_MUCH_TO_READ',
      'EDITORAL_NARCISSISTIC',
      'CROWFUNDING_ONLY',
      'SEVERAL_REASONS'
    )
  );


