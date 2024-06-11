import { Job, ScheduleOptions, SendOptions, WorkOptions } from 'pg-boss'

export type JobState =
  | 'created'
  | 'retry'
  | 'active'
  | 'completed'
  | 'expired'
  | 'cancelled'
  | 'failed'

export type WorkerQueue = string

export interface Worker<T extends object> {
  readonly queue: WorkerQueue
  readonly options: SendOptions
  readonly performOptions?: WorkOptions
  perform: (job: Job<T>) => Promise<void>
  schedule: (cron: string, data?: T, options?: ScheduleOptions) => Promise<void>
  send: (data: T) => Promise<string | null>
}

export type WorkerJobArgs<T extends Worker<any>> = Parameters<T['send']>[0]

// check if K is in the array of Worker and returns the worker name
export type WorkerQueues<T extends Worker<any>[]> = {
  [K in keyof T]: T[K] extends Worker<any> ? T[K] : never
}[number]['queue']

export type WorkerJobArgMap<T extends Worker<any>[]> = {
  [K in WorkerQueues<T>]: WorkerJobArgs<Extract<T[number], { queue: K }>>
}
