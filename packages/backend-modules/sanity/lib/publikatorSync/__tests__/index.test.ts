const send = jest.fn()

jest.mock('@orbiting/backend-modules-job-queue', () => ({
  ...jest.requireActual('@orbiting/backend-modules-job-queue'),
  Queue: { getInstance: () => ({ send }) },
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { enqueueSyncFromPublikator } = require('../index')

describe('publikatorSync enqueueSyncFromPublikator', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    send.mockReset()
    process.env = { ...OLD_ENV, SANITY_SYNC_FROM_PUBLIKATOR_ENABLED: 'true' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('does nothing when the feature flag is off', async () => {
    process.env.SANITY_SYNC_FROM_PUBLIKATOR_ENABLED = 'false'
    await enqueueSyncFromPublikator({ repoId: 'republik/foo', action: 'commit' })
    expect(send).not.toHaveBeenCalled()
  })

  it('debounces commit jobs per repo with a singleton key, without dropping the retry policy', async () => {
    await enqueueSyncFromPublikator({ repoId: 'republik/foo', action: 'commit' })
    expect(send).toHaveBeenCalledWith(
      'sanity:sync-from-publikator',
      expect.objectContaining({ repoId: 'republik/foo', action: 'commit' }),
      expect.objectContaining({
        singletonKey: 'commit:republik/foo',
        singletonSeconds: 15,
        // Queue.send does `options ?? worker.options` — an explicit options
        // object here must still carry the worker's retry policy, or it
        // silently replaces (not merges with) worker.options.
        retryLimit: 3,
        retryDelay: 5,
      }),
    )
  })

  it('does not debounce publish/unpublish jobs', async () => {
    await enqueueSyncFromPublikator({
      repoId: 'republik/foo',
      commitId: 'c1',
      action: 'publish',
    })
    expect(send).toHaveBeenCalledWith(
      'sanity:sync-from-publikator',
      expect.objectContaining({ action: 'publish' }),
      undefined,
    )
  })

  it('never throws when the queue send fails', async () => {
    send.mockRejectedValueOnce(new Error('queue is down'))
    await expect(
      enqueueSyncFromPublikator({ repoId: 'republik/foo', action: 'commit' }),
    ).resolves.toBeUndefined()
  })
})
