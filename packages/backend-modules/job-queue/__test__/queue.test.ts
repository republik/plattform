import { BaseWorker } from '../lib/workers/base'
import { Queue } from '../lib/queue'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { JobState } from '../lib/types'
import { Job } from 'pg-boss'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type DemoWorkerArgs = { recipientEmail: string }

class DemoWorker extends BaseWorker<DemoWorkerArgs> {
  readonly queue = 'queue:demo'

  async perform(job: Job<DemoWorkerArgs>): Promise<void> {
    job.data
    console.log(job.data)
  }
}

describe('pg-boss worker test', () => {
  let queue: Queue<[DemoWorker]>
  let postgresContainer: StartedPostgreSqlContainer

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start()

    queue = new Queue<[DemoWorker]>({
      application_name: 'job-queue',
      connectionString: postgresContainer.getConnectionUri(),
    })
    queue.registerWorker(DemoWorker)
    await queue.startWorkers()
  }, 60000)

  beforeEach(async () => {
    await queue.clearStorage()
  })

  afterAll(async () => {
    await queue.stop()
  })

  test('queue class interface test', async () => {
    const jobID = await queue.send('queue:demo', {
      recipientEmail: 'example@republik.ch',
    })

    if (!jobID) {
      throw Error('Job no queued')
    }

    const size = await queue.getQueueSize('queue:demo')
    expect(size).toBe(1)

    let job = await queue.getJobById(jobID)

    expect(job?.data).toStrictEqual<DemoWorkerArgs>({
      recipientEmail: 'example@republik.ch',
    })
    expect(job?.state).toBe<JobState>('created')

    await wait(3000)

    job = await queue.getJobById(jobID)
    expect(job?.state).toBe<JobState>('completed')
  }, 60000)
})
