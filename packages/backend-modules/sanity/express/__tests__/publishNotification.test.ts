const send = jest.fn()

jest.mock('@orbiting/backend-modules-job-queue', () => ({
  ...jest.requireActual('@orbiting/backend-modules-job-queue'),
  Queue: { getInstance: () => ({ send }) },
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { publishNotificationHandler } = require('../publishNotification')

const mockRes = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('publishNotificationHandler', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    send.mockReset()
    process.env = {
      ...OLD_ENV,
      SANITY_PUBLISH_NOTIFICATIONS_ENABLED: 'true',
    }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('400s when documentId is missing', async () => {
    const res = mockRes()
    await publishNotificationHandler(
      { body: { notificationTrigger: '2026-09-25T02:45:00.000Z' } } as any,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'missing documentId',
    })
    expect(send).not.toHaveBeenCalled()
  })

  it('400s when notificationTrigger is missing', async () => {
    const res = mockRes()
    await publishNotificationHandler(
      { body: { documentId: 'doc-1' } } as any,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'missing notificationTrigger',
    })
    expect(send).not.toHaveBeenCalled()
  })

  it('enqueues a job keyed on documentId + notificationTrigger', async () => {
    const res = mockRes()
    await publishNotificationHandler(
      {
        body: {
          documentId: 'doc-1',
          notificationTrigger: '2026-09-25T02:45:00.000Z',
        },
      } as any,
      res,
    )
    expect(send).toHaveBeenCalledWith(
      'sanity:publish-notification',
      expect.objectContaining({
        documentId: 'doc-1',
        notificationTrigger: '2026-09-25T02:45:00.000Z',
      }),
      expect.objectContaining({
        singletonKey: 'doc-1:2026-09-25T02:45:00.000Z',
        // Queue.send does `options ?? worker.options` — an explicit options
        // object here must still carry the worker's retry policy, or it
        // silently replaces (not merges with) worker.options.
        retryLimit: 0,
      }),
    )
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('dedupes redelivered (documentId, notificationTrigger) pairs via the same singletonKey', async () => {
    const body = {
      documentId: 'doc-1',
      notificationTrigger: '2026-09-25T02:45:00.000Z',
    }
    await publishNotificationHandler({ body } as any, mockRes())
    await publishNotificationHandler({ body } as any, mockRes())

    expect(send).toHaveBeenCalledTimes(2)
    const [firstOptions] = send.mock.calls[0].slice(2)
    const [secondOptions] = send.mock.calls[1].slice(2)
    expect(firstOptions.singletonKey).toBe(secondOptions.singletonKey)
  })

  it('does not enqueue while disabled by the kill switch', async () => {
    process.env.SANITY_PUBLISH_NOTIFICATIONS_ENABLED = 'false'
    const res = mockRes()
    await publishNotificationHandler(
      {
        body: {
          documentId: 'doc-1',
          notificationTrigger: '2026-09-25T02:45:00.000Z',
        },
      } as any,
      res,
    )
    expect(send).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
