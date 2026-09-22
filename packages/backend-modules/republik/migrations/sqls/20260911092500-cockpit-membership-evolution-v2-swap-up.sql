-- migrate up here: CREATE TABLE...
-- Cut over to the optimized cockpit_membership_evolution_v2 view.
-- Only apply this migration after diffing cockpit_membership_evolution_v2
-- against the original cockpit_membership_evolution for every "key" and
-- confirming zero differences (see migration 20260911092413).
DROP MATERIALIZED VIEW IF EXISTS cockpit_membership_evolution;

ALTER MATERIALIZED VIEW cockpit_membership_evolution_v2 RENAME TO cockpit_membership_evolution;
ALTER INDEX cockpit_membership_evolution_v2_idx RENAME TO cockpit_membership_evolution_idx;
