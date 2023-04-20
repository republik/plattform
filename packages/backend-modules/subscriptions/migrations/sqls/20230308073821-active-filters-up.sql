UPDATE subscriptions s SET filters = '["Comment", "Document"]'
WHERE s."objectType" = 'User'
  AND s.active = TRUE
  AND s.filters IS NULL
;

UPDATE subscriptions s SET filters = '["Document"]'
WHERE s."objectType" = 'Document'
  AND s.active = TRUE
  AND s.filters IS NULL
;
