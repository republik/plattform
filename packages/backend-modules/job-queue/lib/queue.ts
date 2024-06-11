import PgBoss from 'pg-boss'
import { Worker, WorkerJobArgMap, WorkerQueues } from './types'

export class Queue<T extends Worker<any>[]> {
  protected readonly pgBoss: PgBoss
  protected workers = new Map<WorkerQueues<T>, Worker<any>>()

  constructor(options: PgBoss.ConstructorOptions) {
    this.pgBoss = new PgBoss(options)

    this.pgBoss.on('error', (error) => {
      console.error('[JobQueue]: %s', error)
    })
  }

  registerWorker(worker: new (pgBoss: PgBoss) => Worker<any>): Queue<T> {
    const workerInstance = new worker(this.pgBoss)
    this.workers.set(workerInstance.queue, workerInstance)
    return this
  }

  async start() {
    await this.pgBoss.start()
  }

  async stop() {
    await this.pgBoss.stop({
      timeout: 20000,
    })

    await new Promise((resolve) => {
      this.pgBoss.once('stopped', () => resolve(null))
    })
  }

  async getJobById(id: string) {
    return this.pgBoss.getJobById(id)
  }

  async clearStorage() {
    return this.pgBoss.clearStorage()
  }

  async startWorkers() {
    const workers: Promise<string>[] = []

    for (const worker of this.workers.values()) {
      workers.push(this.pgBoss.work(worker.queue, worker.perform))
    }

    return Promise.all(workers)
  }

  async getQueueSize<K extends WorkerQueues<T>>(queue: K, options?: object) {
    return this.pgBoss.getQueueSize(queue, options)
  }

  async send<K extends WorkerQueues<T>>(
    queue: K,
    data: WorkerJobArgMap<T>[K],
    options?: PgBoss.SendOptions,
  ): Promise<string | null> {
    const worker = this.workers.get(queue)
    if (!worker) {
      throw new Error(`no worker registered for [${queue}]`)
    }
    const opts = options ?? worker.options

    return this.pgBoss.send(worker.queue, data, opts)
  }

  async schedule<K extends WorkerQueues<T>>(
    queue: K,
    cron: string,
    data?: WorkerJobArgMap<T>[K],
    options?: PgBoss.ScheduleOptions,
  ): Promise<void> {
    const worker = this.workers.get(queue)
    if (!worker) {
      throw new Error(`no worker registered for [${queue}]`)
    }
    return this.pgBoss.schedule(queue, cron, data, options)
  }

  async unschedule<k extends WorkerQueues<T>>(queue: k) {
    return this.pgBoss.unschedule(queue)
  }

  async getSchedules() {
    return this.pgBoss.getSchedules()
  }
}
