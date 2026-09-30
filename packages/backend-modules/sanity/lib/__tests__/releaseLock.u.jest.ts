import { ReleaseNotMutableError, withReleaseUnlock } from '../releaseLock'

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

  it.each(['published', 'publishing', 'archived', 'archiving', 'unarchiving'])(
    'throws ReleaseNotMutableError for a %s release, without attempting to mutate/unschedule/schedule',
    async (state) => {
      const get = jest.fn().mockResolvedValue({ state })
      const unschedule = jest.fn()
      const schedule = jest.fn()
      const client = fakeClient({ get, unschedule, schedule })
      const mutate = jest.fn().mockResolvedValue('done')

      const error = (await withReleaseUnlock(
        client,
        'versions.r1.abc123',
        mutate,
      ).catch((e) => e)) as ReleaseNotMutableError

      expect(error).toBeInstanceOf(ReleaseNotMutableError)
      expect(error.releaseId).toBe('r1')
      expect(error.state).toBe(state)
      expect(mutate).not.toHaveBeenCalled()
      expect(unschedule).not.toHaveBeenCalled()
      expect(schedule).not.toHaveBeenCalled()
    },
  )

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

  it('retries the relock a few times before giving up, without masking the mutation result', async () => {
    jest.useFakeTimers()
    try {
      const get = jest.fn().mockResolvedValue({
        state: 'scheduled',
        publishAt: '2026-09-22T03:00:00.000Z',
        metadata: {},
      })
      const schedule = jest.fn().mockRejectedValue(new Error('relock failed'))
      const client = fakeClient({ get, schedule })
      const mutate = jest.fn().mockResolvedValue('done')
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const promise = withReleaseUnlock(client, 'versions.r1.abc123', mutate)
      await jest.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('done')
      expect(schedule).toHaveBeenCalledTimes(3)
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('RELEASE STUCK UNSCHEDULED'),
        expect.any(Error),
      )
      consoleError.mockRestore()
    } finally {
      jest.useRealTimers()
    }
  })

  it('succeeds on a later attempt after an earlier relock attempt fails', async () => {
    jest.useFakeTimers()
    try {
      const get = jest.fn().mockResolvedValue({
        state: 'scheduled',
        publishAt: '2026-09-22T03:00:00.000Z',
        metadata: {},
      })
      const schedule = jest
        .fn()
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValueOnce(undefined)
      const client = fakeClient({ get, schedule })
      const mutate = jest.fn().mockResolvedValue('done')
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const promise = withReleaseUnlock(client, 'versions.r1.abc123', mutate)
      await jest.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('done')
      expect(schedule).toHaveBeenCalledTimes(2)
      expect(consoleError).not.toHaveBeenCalled()
      consoleError.mockRestore()
    } finally {
      jest.useRealTimers()
    }
  })

  it('retries the unschedule a few times before giving up, and rethrows (mutate never runs)', async () => {
    jest.useFakeTimers()
    try {
      const get = jest.fn().mockResolvedValue({
        state: 'scheduling',
        publishAt: '2026-09-22T03:00:00.000Z',
        metadata: {},
      })
      // Mirrors the real error: "is not permitted to transition from state
      // 'scheduling' to 'unscheduling'" — a release still settling into
      // "scheduling" rejects unschedule() outright.
      const unschedule = jest
        .fn()
        .mockRejectedValue(
          new Error(
            "is not permitted to transition from state 'scheduling' to 'unscheduling'",
          ),
        )
      const client = fakeClient({ get, unschedule })
      const mutate = jest.fn().mockResolvedValue('done')

      const promise = withReleaseUnlock(client, 'versions.r1.abc123', mutate)
      const assertion = expect(promise).rejects.toThrow(
        'is not permitted to transition',
      )
      await jest.runAllTimersAsync()
      await assertion

      expect(unschedule).toHaveBeenCalledTimes(3)
      // Unlike the relock, an unschedule that never succeeds means we never
      // got access to the document at all — mutate must not run.
      expect(mutate).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })

  it("succeeds on a later attempt after an earlier unschedule attempt hits the transient 'scheduling' rejection", async () => {
    jest.useFakeTimers()
    try {
      const get = jest.fn().mockResolvedValue({
        state: 'scheduling',
        publishAt: '2026-09-22T03:00:00.000Z',
        metadata: {},
      })
      const unschedule = jest
        .fn()
        .mockRejectedValueOnce(new Error('scheduling -> unscheduling'))
        .mockResolvedValueOnce(undefined)
      const schedule = jest.fn().mockResolvedValue(undefined)
      const client = fakeClient({ get, unschedule, schedule })
      const mutate = jest.fn().mockResolvedValue('done')

      const promise = withReleaseUnlock(client, 'versions.r1.abc123', mutate)
      await jest.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('done')
      expect(unschedule).toHaveBeenCalledTimes(2)
      expect(mutate).toHaveBeenCalledTimes(1)
      expect(schedule).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('relocks only once nested calls have all completed, not after the inner one', async () => {
    const get = jest.fn().mockResolvedValue({
      state: 'scheduled',
      publishAt: '2026-09-22T03:00:00.000Z',
      metadata: {},
    })
    const unschedule = jest.fn().mockResolvedValue(undefined)
    const schedule = jest.fn().mockResolvedValue(undefined)
    const client = fakeClient({ get, unschedule, schedule })

    await withReleaseUnlock(client, 'versions.r1.abc123', async () => {
      // A second, nested call for the same release while the outer one is
      // still "open" — must reuse the session, not relock early. Mirrors
      // generateAudioHandler's real shape: claimAudioGeneration, then later
      // (after the Huebsch request) reportAudioGenerationError/Success on the
      // same documentId.
      await withReleaseUnlock(client, 'versions.r1.abc123', async () => 'inner')
      expect(schedule).not.toHaveBeenCalled()
      return 'outer'
    })

    expect(unschedule).toHaveBeenCalledTimes(1)
    expect(schedule).toHaveBeenCalledTimes(1)
  })
})
