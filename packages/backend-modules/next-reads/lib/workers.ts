import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'

export class ReadingPositionRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads:reading_position'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.reading_progress_last_6_months;
    `)

    return
  }
}

export class NextReadsFeedRefreshWorker extends BaseWorker<object> {
  readonly queue = 'next_reads:feed:refresh'

  async perform(_jobs: Job<unknown>[]): Promise<void> {
    await this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.readings_in_the_last_7_days;
      REFRESH MATERIALIZED VIEW CONCURRENTLY next_reads.readings_and_comments_20_days;
    `)

    return
  }
}
