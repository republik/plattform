-- migrate down here: DROP TABLE...
DROP MATERIALIZED VIEW next_reads.reading_progress_last_6_months;
DROP MATERIALIZED VIEW next_reads.readings_in_the_last_7_days;
DROP SCHEMA next_reads;
