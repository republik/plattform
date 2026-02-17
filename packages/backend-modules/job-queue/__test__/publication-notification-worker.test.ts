import { Queue } from '../lib/queue'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { logger } from '@orbiting/backend-modules-logger'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock notifyPublish before importing the worker
const mockNotifyPublish = jest.fn()
jest.mock('@orbiting/backend-modules-publikator/lib/Notifications', () => ({
  notifyPublish: mockNotifyPublish,
}))

import { PublicationNotificationWorker } from '@orbiting/backend-modules-publikator/lib/workers/PublicationNotificationWorker'

describe('PublicationNotificationWorker', () => {
  let queue: Queue
  let postgresContainer: StartedPostgreSqlContainer

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start()

    queue = new Queue(
      {
        application_name: 'publication-notification-test',
        connectionString: postgresContainer.getConnectionUri(),
      },
      { logger } as ConnectionContext,
    )

    queue.registerWorker(PublicationNotificationWorker)

    await queue.start()
    await queue.startWorkers()
  }, 60000)

  afterAll(async () => {
    await queue.stop()
  }, 30000)

  beforeEach(() => {
    mockNotifyPublish.mockReset()
  })

  it('processes a notification job and calls notifyPublish', async () => {
    mockNotifyPublish.mockResolvedValue(undefined)

    const jobId = await queue.send('scheduler:publication:notify', {
      repoId: 'repo/test-article',
      notifyFilters: ['Document'],
    })

    expect(jobId).toBeTruthy()

    await wait(3000)

    const job = await queue.getJobById('scheduler:publication:notify', jobId!)
    expect(job?.state).toBe('completed')

    expect(mockNotifyPublish).toHaveBeenCalledTimes(1)
    expect(mockNotifyPublish).toHaveBeenCalledWith(
      'repo/test-article',
      ['Document'],
      expect.objectContaining({ logger }),
    )
  }, 60000)

  it('does not retry on failure (retryLimit: 0)', async () => {
    mockNotifyPublish.mockRejectedValue(new Error('Notification send failed'))

    const jobId = await queue.send('scheduler:publication:notify', {
      repoId: 'repo/failing-article',
      notifyFilters: ['Document'],
    })

    expect(jobId).toBeTruthy()

    await wait(3000)

    const job = await queue.getJobById('scheduler:publication:notify', jobId!)
    expect(job?.state).toBe('failed')

    // notifyPublish should have been called exactly once — no retries
    expect(mockNotifyPublish).toHaveBeenCalledTimes(1)
  }, 60000)
})
