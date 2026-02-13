import PgBoss, { Job, ScheduleOptions, SendOptions, WorkOptions } from 'pg-boss'
import { BasePayload, Worker, WorkerQueue } from '../types'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { Logger } from '@orbiting/backend-modules-logger'

export abstract class BaseWorker<T extends Omit<BasePayload, '$version'>>
  implements Worker<T>
{
  protected pgBoss: PgBoss
  protected readonly logger: Logger
  protected readonly context: ConnectionContext
  abstract readonly queue: WorkerQueue
  readonly options: SendOptions = { retryLimit: 3, retryDelay: 1000 }
  readonly performOptions?: WorkOptions
  readonly queueOptions?: PgBoss.Queue

  constructor(pgBoss: PgBoss, logger: Logger, context: ConnectionContext) {
    this.pgBoss = pgBoss
    this.context = context
    this.logger = logger
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
