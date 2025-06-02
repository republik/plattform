import PgBoss, { Job, ScheduleOptions, SendOptions } from 'pg-boss'
import { BasePayload, Worker, WorkerQueue } from '../types'
import { ConnectionContext } from '@orbiting/backend-modules-types'

export abstract class BaseWorker<T extends Omit<BasePayload, '$version'>>
  implements Worker<T>
{
  protected pgBoss: PgBoss
  protected readonly context: ConnectionContext
  abstract readonly queue: WorkerQueue
  readonly options: SendOptions = { retryLimit: 3, retryDelay: 1000 }
  // abstract performOptions?: PgBoss.WorkOptions | undefined

  constructor(pgBoss: PgBoss, context: ConnectionContext) {
    this.pgBoss = pgBoss
    this.context = context
  }

  abstract perform(jobs: Job<T>[]): Promise<void>

  async send(data: T, options?: SendOptions) {
    const opts = options ?? this.options
    return this.pgBoss.send(this.queue, data, opts)
  }

  async schedule(cron: string, data?: T, options?: ScheduleOptions) {
    this.pgBoss.schedule(this.queue, cron, data, options)
  }
}
