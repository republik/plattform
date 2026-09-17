const create = jest.fn()
const update = jest.fn()

class DiscussionNotFoundError extends Error {}

jest.mock('@orbiting/backend-modules-discussions', () => ({
  Discussion: {
    create: (...args: unknown[]) => create(...args),
    update: (...args: unknown[]) => update(...args),
  },
  DiscussionNotFoundError,
}))

import { discussionsHandler } from '../discussions'

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

const fullSettings = {
  title: 'Hello',
  maxLength: 500,
  anonymity: 'ALLOWED',
  tags: ['tag1'],
  tagRequired: false,
  closed: false,
  path: '/2026/01/01/hello',
  hidden: false,
  disableTopLevelComments: false,
  collapsable: true,
  defaultOrder: 'DATE',
  allowedRoles: ['member'],
}

describe('discussionsHandler', () => {
  const t = (key: string) => key
  const OLD_ENV = process.env

  beforeEach(() => {
    create.mockReset()
    update.mockReset()
    // SANITY_DISCUSSIONS_ENABLED defaults to disabled (pre-launch
    // kill-switch, see ../killSwitch.ts) -- these tests exercise the real
    // create/update path, so enable it here; the dedicated test below covers
    // the disabled path.
    process.env = { ...OLD_ENV, SANITY_DISCUSSIONS_ENABLED: 'true' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('rejects while SANITY_DISCUSSIONS_ENABLED is disabled', async () => {
    process.env.SANITY_DISCUSSIONS_ENABLED = 'false'
    const pgdb = { public: { discussions: { findOne: jest.fn() } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes(fullSettings)

    await handler(req, res)

    expect(res.statusCode).toBe(503)
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('updates by id, forwarding the full field set, when id is present', async () => {
    update.mockResolvedValue({ id: 'pg-id-1' })
    const findOne = jest.fn()
    const pgdb = { public: { discussions: { findOne } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes({ id: 'pg-id-1', ...fullSettings })

    await handler(req, res)

    expect(findOne).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      { id: 'pg-id-1', ...fullSettings },
      { pgdb, t },
    )
    expect(create).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ id: 'pg-id-1' })
  })

  it('creates a new discussion when id is absent and no existing row matches path', async () => {
    create.mockResolvedValue({ id: 'pg-id-new' })
    const findOne = jest.fn().mockResolvedValue(undefined)
    const pgdb = { public: { discussions: { findOne } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes(fullSettings)

    await handler(req, res)

    expect(findOne).toHaveBeenCalledWith({ path: fullSettings.path })
    expect(create).toHaveBeenCalledWith(fullSettings, { pgdb, t })
    expect(update).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ id: 'pg-id-new' })
  })

  it('links (updates) the existing discussion found by path instead of creating a duplicate', async () => {
    update.mockResolvedValue({ id: 'pg-id-legacy' })
    const findOne = jest.fn().mockResolvedValue({ id: 'pg-id-legacy' })
    const pgdb = { public: { discussions: { findOne } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes(fullSettings)

    await handler(req, res)

    expect(findOne).toHaveBeenCalledWith({ path: fullSettings.path })
    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      { id: 'pg-id-legacy', ...fullSettings },
      { pgdb, t },
    )
    expect(res.json).toHaveBeenCalledWith({ id: 'pg-id-legacy' })
  })

  it('maps a DiscussionNotFoundError to a 404', async () => {
    update.mockRejectedValue(new DiscussionNotFoundError('not found'))
    const pgdb = { public: { discussions: { findOne: jest.fn() } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes({ id: 'missing', ...fullSettings })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'not found' }),
    )
  })

  it('maps a generic failure to a 400', async () => {
    create.mockRejectedValue(new Error('tagRequired but no tags'))
    const findOne = jest.fn().mockResolvedValue(undefined)
    const pgdb = { public: { discussions: { findOne } } }
    const handler = discussionsHandler(pgdb, t)
    const { req, res } = mockReqRes(fullSettings)

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'tagRequired but no tags' }),
    )
  })
})
