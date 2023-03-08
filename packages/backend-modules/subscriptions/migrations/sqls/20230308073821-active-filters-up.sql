UPDATE subscriptions s SET filters = '["Comment", "Document"]'
WHERE s."objectType" = 'User'
  AND s.active = TRUE
  AND s.filters IS NULL
;
