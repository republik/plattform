import PgBoss from 'pg-boss'
import { Worker, WorkerJobArgs, WorkerQueueName } from './types'
import { ConnectionContext } from '@orbiting/backend-modules-types'

export const GlobalQueue = Symbol('Global PGBoss queue')

type WorkerConstructor = new (
  pgBoss: PgBoss,
  context: ConnectionContext,
) => Worker<any>

export class Queue {
  static instances: Record<symbol, Queue> = {}

  protected readonly pgBoss: PgBoss
  protected readonly context: ConnectionContext
  protected workers = new Map<WorkerQueueName<Worker<any>>, Worker<any>>()

  static createInstance(
    id: symbol = GlobalQueue,
    config: {
      connectionString: string
      monitorStateIntervalSeconds?: number
      context: ConnectionContext
    },
  ) {
    this.instances[id] = new Queue(
      {
        application_name: id.description,
        connectionString: config.connectionString,
        monitorStateIntervalSeconds: config.monitorStateIntervalSeconds,
      },
      config.context,
    )

    return this.instances[id]
  }

  static getInstance(id: symbol = GlobalQueue): Queue {
    if (!this.instances[id]) {
      throw new Error('Unknown queue instance')
    }

    return this.instances[id]
  }

  constructor(options: PgBoss.ConstructorOptions, context: ConnectionContext) {
    if (typeof options.monitorStateIntervalSeconds === 'undefined') {
      delete options.monitorStateIntervalSeconds
    }

    this.pgBoss = new PgBoss(options)
    this.context = context

    this.pgBoss.on('error', (error) => {
      console.error('[JobQueue]: %s', error)
    })
    this.pgBoss.on('monitor-states', (stats) => {
      console.log('[JobQueue]: ', stats)
    })
  }

  registerWorker(worker: WorkerConstructor): Queue {
    const workerInstance = new worker(this.pgBoss, this.context)
    this.workers.set(workerInstance.queue, workerInstance)
    return this
  }

  registerWorkers(workers: WorkerConstructor[]): Queue {
    for (const worker of workers) {
      this.registerWorker(worker)
    }
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
