jest.mock('check-env')
const {
  findClaimableRewards,
} = require('@orbiting/backend-modules-referral-campaigns')

const mockUserUUID = '0000-0000-0000-0001'
const mockCampaignUUID = '1000-0000-0000-0001'

describe('rewardsHandler', () => {
  describe('findClaimableRewards', () => {
    test('NoOps if referralCount is undefined or 0', async () => {
      /** @type any */
      const pgdb = {
        public: {
          campaignRewards: {
            find: jest.fn(() => {}),
          },
        },
      }

      const input1 = { userId: mockUserUUID, campaign: {}, referralCount: 0 }

      await expect(findClaimableRewards(input1, pgdb)).resolves.toBeUndefined()
      expect(pgdb.public.campaignRewards.find).toBeCalledTimes(0)

      const input2 = { userId: mockUserUUID, campaign: {} }

      await expect(findClaimableRewards(input2, pgdb)).resolves.toBeUndefined()
      expect(pgdb.public.campaignRewards.find).toBeCalledTimes(0)
    })

    test('NoOps if no rewards were found', async () => {
      /** @type any */
      const pgdb = {
        public: {
          campaignRewards: {
            find: jest.fn(() => []),
          },
        },
      }

      const input = {
        userId: mockUserUUID,
        campaign: { id: mockCampaignUUID },
        referralCount: 1,
      }

      await expect(findClaimableRewards(input, pgdb)).resolves.toBeUndefined()
      expect(pgdb.public.campaignRewards.find).toBeCalledTimes(1)
    })

    test('filters out claimed rewards', async () => {
      const claimedID = 'AAAA-BBBB-CCCC-CLAIMED'
      const unClaimedID = 'AAAA-BBBB-NOT-CLAIMED'

      /** @type any */
      const pgdb = {
        public: {
          campaignRewards: {
            find: jest.fn(() => [{ id: claimedID }, { id: unClaimedID }]),
          },
          userCampaignRewards: {
            find: jest.fn(() => [{ id: claimedID }]),
          },
        },
      }

      const input = {
        userId: mockUserUUID,
        campaign: { id: mockCampaignUUID },
        referralCount: 1,
      }

      await expect(findClaimableRewards(input, pgdb)).resolves.toEqual([
        { id: unClaimedID },
      ])

      expect(pgdb.public.campaignRewards.find).toBeCalledTimes(1)
      expect(pgdb.public.userCampaignRewards.find).toBeCalledTimes(1)
    })
  })
})
