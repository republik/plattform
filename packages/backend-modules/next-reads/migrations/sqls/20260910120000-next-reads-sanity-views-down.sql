-- migrate down here: DROP TABLE...
DROP MATERIALIZED VIEW next_reads_sanity.readings_and_comments_20_days;
DROP MATERIALIZED VIEW next_reads_sanity.readings_in_the_last_7_days;
DROP TABLE next_reads_sanity.discussion_refs;
DROP MATERIALIZED VIEW next_reads_sanity.reading_progress_last_6_months;
DROP SCHEMA next_reads_sanity;
