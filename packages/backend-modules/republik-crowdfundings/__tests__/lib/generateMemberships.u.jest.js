jest.mock('check-env')
jest.mock('../../lib/Pledge')
const generateMemberships = require('../../lib/generateMemberships')

describe('generateMemberships', () => {
  const t = jest.fn((translationString) => translationString)
  const userId = '00000-00001'
  const pledgeId = '10000-00001'
  const user = { id: userId }
  const pledge = { id: pledgeId, userId: userId }
  const pkg = { name: 'PACKAGE_NAME' }
  test('pledge does not exist', async () => {
    const pgdb = {
      public: {
        pledges: {
          findOne: jest.fn(() => Promise.resolve(null)),
        },
      },
    }
    await expect(generateMemberships(pledgeId, pgdb, t)).rejects.toThrowError(
      'api/unexpected',
    )
    expect(pgdb.public.pledges.findOne).toBeCalledTimes(1)
    expect(pgdb.public.pledges.findOne).lastCalledWith({ id: pledgeId })
  })
  test('user does not exist', async () => {
    const pgdb = {
      public: {
        pledges: {
          findOne: jest.fn(() => Promise.resolve(pledge)),
        },
        users: {
          findOne: jest.fn(() => Promise.resolve(null)),
        },
      },
    }
    await expect(generateMemberships(pledgeId, pgdb, t)).rejects.toThrowError(
      'api/unexpected',
    )
    expect(pgdb.public.pledges.findOne).toBeCalledTimes(1)
    expect(pgdb.public.pledges.findOne).lastCalledWith({ id: pledgeId })
    expect(pgdb.public.users.findOne).toBeCalledTimes(1)
    expect(pgdb.public.users.findOne).lastCalledWith({ id: pledge.userId })
  })
  test('pledge already has memberships', async () => {
    const pgdb = {
      public: {
        pledges: {
          findOne: jest.fn(() => Promise.resolve(pledge)),
        },
        users: {
          findOne: jest.fn(() => Promise.resolve(user)),
        },
        memberships: {
          count: jest.fn(() => 1),
        },
      },
    }
    await expect(generateMemberships(pledgeId, pgdb, t)).rejects.toThrowError(
      'api/unexpected',
    )
    expect(pgdb.public.memberships.count).toBeCalledTimes(1)
    expect(pgdb.public.memberships.count).lastCalledWith({
      pledgeId: pledge.id,
    })
  })
  test('donation only pledge, no rewards', async () => {
    const pgdb = {
      public: {
        pledges: {
          findOne: jest.fn(() => Promise.resolve(pledge)),
        },
        users: {
          findOne: jest.fn(() => Promise.resolve(user)),
        },
        memberships: {
          count: jest.fn(() => Promise.resolve(0)),
        },
        pledgeOptions: {
          find: jest.fn(() => Promise.resolve([])),
        },
        packages: {
          findOne: jest.fn(() => Promise.resolve(pkg)),
        },
      },
    }
    const pledgeOption = {
      packageOption: { reward: undefined },
    }
    const pledgeOptions = [pledgeOption]
    const { getPledgeOptionsTree } = require('../../lib/Pledge')
    getPledgeOptionsTree.mockReturnValue(pledgeOptions)

    // pledgeOption, but reward is undefined
    await expect(
      generateMemberships(pledgeId, pgdb, t),
    ).resolves.toBeUndefined()

    // no pledgeOptions at all
    getPledgeOptionsTree.mockReturnValue([])
    await expect(
      generateMemberships(pledgeId, pgdb, t),
    ).resolves.toBeUndefined()
  })
})
