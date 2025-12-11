-- migrate down here: DROP TABLE...
DROP MATERIALIZED VIEW IF EXISTS cockpit_membership_evolution;
DROP MATERIALIZED VIEW IF EXISTS cockpit_membership_last_seen;
DROP MATERIALIZED VIEW IF EXISTS cockpit_discussions_evolution;
DROP MATERIALIZED VIEW IF EXISTS cockpit_collections_evolution;
