UPDATE subscriptions s SET filters = NULL
WHERE s."objectType" = 'Document'
  AND s.active = TRUE
  AND s.filters ? 'Document'
;

UPDATE subscriptions s SET filters = NULL
WHERE s."objectType" = 'User'
  AND s.active = TRUE
  AND s.filters ? 'Comment'
  AND s.filters ? 'Document'
;
