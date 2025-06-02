import { BaseWorker } from '../lib/workers/base'
import { Queue } from '../lib/queue'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { JobState } from '../lib/types'
import { Job, SendOptions } from 'pg-boss'
import { ConnectionContext } from '@orbiting/backend-modules-types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type DemoWorkerArgs = { recipientEmail: string }

class DemoWorker extends BaseWorker<DemoWorkerArgs> {
  readonly queue = 'queue:demo'

  async perform([job]: Job<DemoWorkerArgs>[]): Promise<void> {
    // do some processing of the job data
    console.log(job.data)
  }
}

class DemoErrorWorker extends BaseWorker<DemoWorkerArgs> {
  readonly queue = 'queue:demo:error'
  readonly options: SendOptions = {
    retryLimit: 0,
  }

  async perform([job]: Job<DemoWorkerArgs>[]): Promise<void> {
    // if an error courses it gets stored into the output column
    console.log(job.data)
    throw new Error('Processing error')
  }
}

describe('pg-boss worker test', () => {
  let queue: Queue
  let postgresContainer: StartedPostgreSqlContainer

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start()

    queue = new Queue(
      {
        application_name: 'job-queue',
        connectionString: postgresContainer.getConnectionUri(),
      },
      // mock connection context because we dont use it in this test
      {} as ConnectionContext,
    )
    queue.registerWorker(DemoWorker).registerWorker(DemoErrorWorker)

    await queue.start()
    await queue.startWorkers()
  }, 60000)

  afterAll(async () => {
    await queue.stop()
  }, 30000)

  it('processes send jobs', async () => {
    const jobID = await queue.send<DemoWorker>('queue:demo', {
      recipientEmail: 'example@republik.ch',
    })

    if (!jobID) {
      throw Error('Job no queued')
    }

    const size = await queue.getQueueSize<DemoWorker>('queue:demo', {
      before: 'completed',
    })
    expect(size).toBe(1)

    let job = await queue.getJobById('queue:demo', jobID)

    expect(job?.data).toStrictEqual<DemoWorkerArgs>({
      recipientEmail: 'example@republik.ch',
    })
    expect(job?.state).toBe<JobState>('created')

    await wait(3000)

    job = await queue.getJobById('queue:demo', jobID)
    expect(job?.state).toBe<JobState>('completed')
  }, 60000)

  it('saves errors to the job error column', async () => {
    const jobID = await queue.send<DemoErrorWorker>('queue:demo:error', {
      recipientEmail: 'example@republik.ch',
    })

    if (!jobID) {
      throw Error('Job no queued')
    }

    const size = await queue.getQueueSize<DemoErrorWorker>('queue:demo:error', {
      before: 'failed',
    })
    expect(size).toBe(1)

    let job = await queue.getJobById('queue:demo:error', jobID)

    expect(job?.data).toStrictEqual<DemoWorkerArgs>({
      recipientEmail: 'example@republik.ch',
    })
    expect(job?.state).toBe<JobState>('created')

    await wait(3000)

    job = await queue.getJobById('queue:demo:error', jobID)
    expect(job?.state).toBe<JobState>('failed')
    expect((job?.output as any).name).toBe('Error')
    expect((job?.output as any).message).toBe('Processing error')
  }, 60000)
})
