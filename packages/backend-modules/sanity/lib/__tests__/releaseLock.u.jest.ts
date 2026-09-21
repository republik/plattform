import { withReleaseUnlock } from '../releaseLock'

function fakeClient(overrides: {
  get?: jest.Mock
  unschedule?: jest.Mock
  schedule?: jest.Mock
}) {
  return {
    releases: {
      get: overrides.get ?? jest.fn(),
      unschedule: overrides.unschedule ?? jest.fn(),
      schedule: overrides.schedule ?? jest.fn(),
    },
  } as never
}

describe('withReleaseUnlock', () => {
  it('runs the mutation directly for a non-version id, never touching releases', async () => {
    const get = jest.fn()
    const client = fakeClient({ get })
    const mutate = jest.fn().mockResolvedValue('done')

    const result = await withReleaseUnlock(client, 'drafts.abc123', mutate)

    expect(result).toBe('done')
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(get).not.toHaveBeenCalled()
  })

  it('runs the mutation directly when the release is not locked (already paused)', async () => {
    const get = jest.fn().mockResolvedValue({ state: 'active' })
    const unschedule = jest.fn()
    const schedule = jest.fn()
    const client = fakeClient({ get, unschedule, schedule })
    const mutate = jest.fn().mockResolvedValue('done')

    const result = await withReleaseUnlock(
      client,
      'versions.r1.abc123',
      mutate,
    )

    expect(result).toBe('done')
    expect(mutate).toHaveBeenCalledTimes(1)
    // The already-paused case: must never schedule a release that wasn't
    // already scheduled.
    expect(unschedule).not.toHaveBeenCalled()
    expect(schedule).not.toHaveBeenCalled()
  })

  it('unschedules, mutates, then re-schedules to the same publishAt when locked', async () => {
    const get = jest.fn().mockResolvedValue({
      state: 'scheduled',
      publishAt: '2026-09-22T03:00:00.000Z',
      metadata: {},
    })
    const unschedule = jest.fn().mockResolvedValue(undefined)
    const schedule = jest.fn().mockResolvedValue(undefined)
    const client = fakeClient({ get, unschedule, schedule })
    const mutate = jest.fn().mockResolvedValue('done')

    const result = await withReleaseUnlock(
      client,
      'versions.r1.abc123',
      mutate,
    )

    expect(result).toBe('done')
    expect(unschedule).toHaveBeenCalledWith({ releaseId: 'r1' })
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(schedule).toHaveBeenCalledWith({
      releaseId: 'r1',
      publishAt: '2026-09-22T03:00:00.000Z',
    })
    // unschedule must happen before mutate, and mutate before schedule.
    const unscheduleOrder = unschedule.mock.invocationCallOrder[0]
    const mutateOrder = mutate.mock.invocationCallOrder[0]
    const scheduleOrder = schedule.mock.invocationCallOrder[0]
    expect(unscheduleOrder).toBeLessThan(mutateOrder)
    expect(mutateOrder).toBeLessThan(scheduleOrder)
  })

  it('falls back to metadata.intendedPublishAt when publishAt is absent', async () => {
    const get = jest.fn().mockResolvedValue({
      state: 'scheduling',
      metadata: { intendedPublishAt: '2026-09-22T03:00:00.000Z' },
    })
    const schedule = jest.fn().mockResolvedValue(undefined)
    const client = fakeClient({ get, schedule })
    const mutate = jest.fn().mockResolvedValue('done')

    await withReleaseUnlock(client, 'versions.r1.abc123', mutate)

    expect(schedule).toHaveBeenCalledWith({
      releaseId: 'r1',
      publishAt: '2026-09-22T03:00:00.000Z',
    })
  })

  it('still re-locks when the mutation itself throws, and rethrows the original error', async () => {
    const get = jest.fn().mockResolvedValue({
      state: 'scheduled',
      publishAt: '2026-09-22T03:00:00.000Z',
      metadata: {},
    })
    const schedule = jest.fn().mockResolvedValue(undefined)
    const client = fakeClient({ get, schedule })
    const mutate = jest.fn().mockRejectedValue(new Error('mutation failed'))

    await expect(
      withReleaseUnlock(client, 'versions.r1.abc123', mutate),
    ).rejects.toThrow('mutation failed')

    expect(schedule).toHaveBeenCalledWith({
      releaseId: 'r1',
      publishAt: '2026-09-22T03:00:00.000Z',
    })
  })

  it('does not mask the mutation result when the relock itself fails', async () => {
    const get = jest.fn().mockResolvedValue({
      state: 'scheduled',
      publishAt: '2026-09-22T03:00:00.000Z',
      metadata: {},
    })
    const schedule = jest.fn().mockRejectedValue(new Error('relock failed'))
    const client = fakeClient({ get, schedule })
    const mutate = jest.fn().mockResolvedValue('done')
    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    const result = await withReleaseUnlock(
      client,
      'versions.r1.abc123',
      mutate,
    )

    expect(result).toBe('done')
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('RELEASE STUCK UNSCHEDULED'),
      expect.any(Error),
    )
    consoleError.mockRestore()
  })
})
