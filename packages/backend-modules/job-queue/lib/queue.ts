import PgBoss from 'pg-boss'
import { Worker, WorkerJobArgs, WorkerQueueName } from './types'
import { getConfig } from './config'

export class Queue {
  static instance: Queue

  protected readonly pgBoss: PgBoss
  protected workers = new Map<WorkerQueueName<Worker<any>>, Worker<any>>()

  static getInstance(): Queue {
    if (!this.instance) {
      const config = getConfig()
      this.instance = new Queue({
        application_name: config.queueApplicationName,
        connectionString: config.connectionString,
      })
    }

    return this.instance
  }

  constructor(options: PgBoss.ConstructorOptions) {
    this.pgBoss = new PgBoss(options)

    this.pgBoss.on('error', (error) => {
      console.error('[JobQueue]: %s', error)
    })
    this.pgBoss.on('monitor-states', (stats) => {
      console.log('[JobQueue]: %v', stats)
    })
  }

  registerWorker(worker: new (pgBoss: PgBoss) => Worker<any>): Queue {
    const workerInstance = new worker(this.pgBoss)
    this.workers.set(workerInstance.queue, workerInstance)
    return this
  }

  async start() {
    await this.pgBoss.start()

    for (const queue of this.workers.keys()) {
      await this.pgBoss.createQueue(queue)
    }

    return
  }

  stop() {
    return this.pgBoss.stop({
      wait: true,
      timeout: 20000,
    })
  }

  createQueue(queueName: string) {
    return this.pgBoss.createQueue(queueName)
  }

  getJobById(name: string, id: string) {
    return this.pgBoss.getJobById(name, id, {
      includeArchive: true,
    })
  }

  getQueues() {
    return this.pgBoss.getQueues()
  }

  clearStorage() {
    return this.pgBoss.clearStorage()
  }

  startWorkers() {
    const workers: Promise<string>[] = []

    for (const worker of this.workers.values()) {
      workers.push(this.pgBoss.work(worker.queue, worker.perform.bind(worker)))
    }

    return Promise.all(workers)
  }

  getQueueSize<K extends Worker<any>>(
    queue: WorkerQueueName<K>,
    options?: {
      before: 'retry' | 'active' | 'completed' | 'cancelled' | 'failed'
    },
  ) {
    return this.pgBoss.getQueueSize(queue, options)
  }

  send<T extends Worker<any>>(
    queue: WorkerQueueName<T>,
    data: WorkerJobArgs<T>,
    options?: PgBoss.SendOptions,
  ): Promise<string | null> {
    const worker = this.workers.get(queue)
    if (!worker) {
      throw new Error(`no worker registered for [${queue}]`)
    }
    const opts = options ?? worker.options

    return this.pgBoss.send(worker.queue, data, opts)
  }

  schedule<T extends Worker<any>>(
    queue: WorkerQueueName<T>,
    cron: string,
    data?: WorkerJobArgs<T>,
    options?: PgBoss.ScheduleOptions,
  ): Promise<void> {
    const worker = this.workers.get(queue)
    if (!worker) {
      throw new Error(`no worker registered for [${queue}]`)
    }
    return this.pgBoss.schedule(queue, cron, data, options)
  }

  unschedule<T extends WorkerQueueName<Worker<any>>>(queue: T) {
    return this.pgBoss.unschedule(queue)
  }

  getSchedules() {
    return this.pgBoss.getSchedules()
  }
}
