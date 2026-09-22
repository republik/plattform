import { transformUser, UserRow, UserTransformDeps } from '../user'

const noCredential: UserTransformDeps = {
  getListedCredential: jest.fn().mockResolvedValue(null),
}

const row = (overrides: Partial<UserRow> = {}): UserRow => ({
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada',
  biography: 'Mathematician',
  statement: 'Numbers are fun',
  portraitUrl: 'https://example.org/portrait.jpg',
  hasPublicProfile: true,
  createdAt: new Date('2020-01-02T03:04:05.000Z'),
  ...overrides,
})

describe('transformUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // This null is the entire privacy mechanism for user search: the scoped
  // search key handed to browsers carries no document filter, so a
  // non-public profile must simply never be indexed.
  it('returns null for a non-public profile', async () => {
    const result = await transformUser(
      row({ hasPublicProfile: false }),
      noCredential,
    )

    expect(result).toBeNull()
  })

  it('does not even look up credentials for a non-public profile', async () => {
    await transformUser(row({ hasPublicProfile: false }), noCredential)

    expect(noCredential.getListedCredential).not.toHaveBeenCalled()
  })

  it('builds a document for a public profile', async () => {
    const result = await transformUser(row(), noCredential)

    expect(result).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      username: 'ada',
      biography: 'Mathematician',
      statement: 'Numbers are fun',
      portrait:
        'https://example.org/portrait.jpg?resize=384x384&bw=1&format=auto',
      createdAt: new Date('2020-01-02T03:04:05.000Z').getTime(),
    })
  })

  it('carries no searchScope or hasPublicProfile field any more', async () => {
    const result = await transformUser(row(), noCredential)

    expect(result).not.toHaveProperty('searchScope')
    expect(result).not.toHaveProperty('hasPublicProfile')
  })

  it('includes a listed credential and its verified flag', async () => {
    const result = await transformUser(row(), {
      getListedCredential: jest
        .fn()
        .mockResolvedValue({ description: '  Autorin  ', verified: true }),
    })

    expect(result).toMatchObject({
      credential: 'Autorin',
      credentialVerified: true,
    })
  })

  it('omits optional fields that are empty', async () => {
    const result = await transformUser(
      row({
        username: null,
        biography: null,
        statement: null,
        portraitUrl: null,
      }),
      noCredential,
    )

    expect(result).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      createdAt: new Date('2020-01-02T03:04:05.000Z').getTime(),
    })
  })
})
