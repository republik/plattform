const upsert = jest.fn()

jest.mock('@orbiting/backend-modules-redirections', () => ({
  Redirections: {
    upsert: (...args: unknown[]) => upsert(...args),
  },
}))

import { createRedirectHandler } from '../createRedirect'

function mockReqRes(body: Record<string, unknown>) {
  const req: any = { body }
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json: jest.fn(function (this: any, body: unknown) {
      this.body = body
      return this
    }),
  }
  return { req, res }
}

describe('createRedirectHandler', () => {
  const pgdb = { fake: true }
  const handler = createRedirectHandler(pgdb)
  const OLD_ENV = process.env

  beforeEach(() => {
    upsert.mockReset()
    // SANITY_REDIRECTS_ENABLED defaults to disabled (pre-launch kill-switch,
    // see ../killSwitch.ts) -- these tests exercise the real upsert path, so
    // enable it here; the dedicated test below covers the disabled path.
    process.env = { ...OLD_ENV, SANITY_REDIRECTS_ENABLED: 'true' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('rejects a missing documentId', async () => {
    const { req, res } = mockReqRes({
      previousPath: '/2026/01/01/old',
      newPath: '/2026/01/01/new',
    })
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('rejects a missing previousPath/newPath', async () => {
    const { req, res } = mockReqRes({ documentId: 'article-1' })
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('upserts a 301 redirect tagged with the source document', async () => {
    upsert.mockResolvedValue({})
    const { req, res } = mockReqRes({
      documentId: 'article-1',
      documentType: 'article',
      previousPath: '/2026/01/01/old',
      newPath: '/2026/01/01/new',
    })
    await handler(req, res)

    expect(upsert).toHaveBeenCalledWith(
      {
        source: '/2026/01/01/old',
        target: '/2026/01/01/new',
        status: 301,
        resource: { sanity: { id: 'article-1', type: 'article' } },
      },
      { pgdb },
    )
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('surfaces an upsert failure as a 400', async () => {
    upsert.mockRejectedValue(new Error('neither redirection source nor target must be null'))
    const { req, res } = mockReqRes({
      documentId: 'article-1',
      previousPath: '/2026/01/01/old',
      newPath: '/2026/01/01/new',
    })
    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'neither redirection source nor target must be null',
      }),
    )
  })

  it('skips the upsert and reports success while SANITY_REDIRECTS_ENABLED is disabled', async () => {
    process.env.SANITY_REDIRECTS_ENABLED = 'false'
    const { req, res } = mockReqRes({
      documentId: 'article-1',
      documentType: 'article',
      previousPath: '/2026/01/01/old',
      newPath: '/2026/01/01/new',
    })
    await handler(req, res)

    expect(upsert).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
