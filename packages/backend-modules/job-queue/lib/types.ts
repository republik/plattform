import PgBoss, { Job, ScheduleOptions, SendOptions, WorkOptions } from 'pg-boss'

export type JobState =
  | 'created'
  | 'retry'
  | 'active'
  | 'completed'
  | 'expired'
  | 'cancelled'
  | 'failed'

export type WorkerQueue = string

export interface Worker<T extends BasePayload> {
  readonly queue: WorkerQueue
  readonly options: SendOptions
  readonly performOptions?: WorkOptions
  readonly queueOptions?: PgBoss.Queue
  perform: (jobs: Job<T>[]) => Promise<void>
  schedule: (cron: string, data?: T, options?: ScheduleOptions) => Promise<void>
  send: (data: T) => Promise<string | null>
}

export type BasePayload = {
  $version?: string
}

export type WorkerQueueName<T extends Worker<any>> = T['queue']
export type WorkerJobArgs<T extends Worker<any>> = Parameters<T['send']>[0]
