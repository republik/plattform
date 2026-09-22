const deleteMock = jest.fn().mockResolvedValue(undefined)
const upsertMock = jest.fn().mockResolvedValue(undefined)
const documentsMock = jest.fn((documentId?: string) =>
  documentId ? { delete: deleteMock } : { upsert: upsertMock },
)

jest.mock('../client', () => ({
  getClient: () => ({ collections: () => ({ documents: documentsMock }) }),
}))

jest.mock('@orbiting/backend-modules-logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}))

// Cuts an import chain unrelated to what's under test here: the comment
// transform pulls in documents -> auth -> mail -> mailchimp, whose config
// validates a long list of env vars at import time.
jest.mock('../transform/comment', () => ({
  transformComment: jest.fn(),
  makeCommentDeps: jest.fn(),
}))

import { parsePollInterval, upsertOrDeleteUser } from '../listener'

const publicRow = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada',
  biography: null,
  statement: null,
  portraitUrl: null,
  hasPublicProfile: true,
  createdAt: new Date('2020-01-01T00:00:00.000Z'),
}

const pgdbReturning = (row: unknown) =>
  ({
    public: {
      users: { findOne: jest.fn().mockResolvedValue(row) },
      credentials: { findOne: jest.fn().mockResolvedValue(null) },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

describe('upsertOrDeleteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Without this, a profile switched to non-public would keep a searchable
  // document forever -- there is no query-time filter behind it any more.
  it('deletes the document when the profile is no longer public', async () => {
    await upsertOrDeleteUser(
      pgdbReturning({ ...publicRow, hasPublicProfile: false }),
      'user-1',
    )

    expect(documentsMock).toHaveBeenCalledWith('user-1')
    expect(deleteMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('deletes the document when the row is gone', async () => {
    await upsertOrDeleteUser(pgdbReturning(null), 'user-1')

    expect(documentsMock).toHaveBeenCalledWith('user-1')
    expect(deleteMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('upserts the document for a public profile', async () => {
    await upsertOrDeleteUser(pgdbReturning(publicRow), 'user-1')

    expect(upsertMock).toHaveBeenCalledTimes(1)
    expect(upsertMock.mock.calls[0][0]).toMatchObject({
      id: 'user-1',
      name: 'Ada Lovelace',
    })
    expect(deleteMock).not.toHaveBeenCalled()
  })
})

describe('parsePollInterval', () => {
  it('falls back to the default for unset, unparseable or non-positive values', () => {
    expect(parsePollInterval(undefined)).toBe(60_000)
    expect(parsePollInterval('')).toBe(60_000)
    expect(parsePollInterval('not-a-number')).toBe(60_000)
    expect(parsePollInterval('0')).toBe(60_000)
    expect(parsePollInterval('-5')).toBe(60_000)
  })

  it('uses a positive numeric value', () => {
    expect(parsePollInterval('15000')).toBe(15_000)
  })
})
