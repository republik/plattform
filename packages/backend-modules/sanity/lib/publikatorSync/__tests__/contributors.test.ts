const fetchMock = jest.fn()
const createIfNotExists = jest.fn().mockResolvedValue(undefined)

jest.mock('../../client', () => ({
  sanityClient: () => ({ fetch: fetchMock, createIfNotExists }),
}))

import { resolveContributorRefs } from '../contributors'
import { contributorToSanityUUID } from '../mdastToPortableText'

const USER_ID = 'b4c26f2e-6c1f-4f00-8d1f-b1b4a3e1a697'
const DETERMINISTIC_ID = contributorToSanityUUID(USER_ID)

describe('publikatorSync/contributors resolveContributorRefs', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    createIfNotExists.mockClear()
  })

  it('rewrites the ref to an existing contributor found by userId, without creating one', async () => {
    fetchMock.mockResolvedValue('studio-created-random-id')
    const doc = {
      contributor: {
        _type: 'reference',
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID, title: 'Nina Schick' },
      },
    }

    const result = await resolveContributorRefs(doc)

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      userId: USER_ID,
    })
    expect(createIfNotExists).not.toHaveBeenCalled()
    expect(result.contributor._ref).toBe('studio-created-random-id')
    expect(result.contributor._sanityContributor).toBeUndefined()
  })

  it('creates a stub at the deterministic id when no contributor is found', async () => {
    fetchMock.mockResolvedValue(null)
    const doc = {
      contributor: {
        _type: 'reference',
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID, title: 'Nina Schick' },
      },
    }

    const result = await resolveContributorRefs(doc)

    expect(createIfNotExists).toHaveBeenCalledWith({
      _id: DETERMINISTIC_ID,
      _type: 'contributor',
      userId: USER_ID,
      title: 'Nina Schick',
    })
    expect(result.contributor._ref).toBe(DETERMINISTIC_ID)
  })

  it('omits title when no hint was provided', async () => {
    fetchMock.mockResolvedValue(null)
    const doc = {
      contributor: {
        _type: 'reference',
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID },
      },
    }

    await resolveContributorRefs(doc)

    expect(createIfNotExists).toHaveBeenCalledWith({
      _id: DETERMINISTIC_ID,
      _type: 'contributor',
      userId: USER_ID,
    })
  })

  it('resolves the same userId only once across the document', async () => {
    fetchMock.mockResolvedValue(null)
    const doc = {
      a: {
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID },
      },
      b: {
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID },
      },
    }

    await resolveContributorRefs(doc)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(createIfNotExists).toHaveBeenCalledTimes(1)
  })

  it('falls back to the deterministic id without throwing when the lookup fails', async () => {
    fetchMock.mockRejectedValue(new Error('network error'))
    const doc = {
      contributor: {
        _ref: DETERMINISTIC_ID,
        _sanityContributor: { userId: USER_ID },
      },
    }

    const result = await resolveContributorRefs(doc)

    expect(result.contributor._ref).toBe(DETERMINISTIC_ID)
    expect(createIfNotExists).not.toHaveBeenCalled()
  })
})
