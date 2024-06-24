import PgBoss, { Job, ScheduleOptions, SendOptions } from 'pg-boss'
import { Worker, WorkerQueue } from '../types'

export abstract class BaseWorker<T extends object> implements Worker<T> {
  protected pgBoss: PgBoss
  abstract readonly queue: WorkerQueue
  readonly options: SendOptions = { retryLimit: 3, retryDelay: 1000 }

  constructor(pgBoss: PgBoss) {
    this.pgBoss = pgBoss
  }

  abstract perform(job: Job<T>): Promise<void>

  async send(data: T, options?: SendOptions) {
    const opts = options ?? this.options
    return this.pgBoss.send(this.queue, data, opts)
  }

  async schedule(cron: string, data?: T, options?: ScheduleOptions) {
    this.pgBoss.schedule(this.queue, cron, data, options)
  }
}
