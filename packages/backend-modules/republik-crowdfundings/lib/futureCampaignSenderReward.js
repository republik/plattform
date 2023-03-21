const debug = require('debug')('crowdfundings:lib:futureCampaignSenderReward')

const { Consents } = require('@orbiting/backend-modules-auth')

const dayjs = require('dayjs')
const isUUID = require('is-uuid')

const createCache = require('./cache')
const { getPeriodEndingLast } = require('./utils')

const DONATE_POLICY_NAME = '5YEAR_DONATE_MONTHS'

const rewardSender = async (pledge, context) => {
  const { pgdb } = context

  if (pledge?.payload?.utm_campaign !== 'mitstreiter') {
    debug('no utm_campaign "mitstreiter" found')
    return
  }

  const { payload } = pledge
  const { utm_content: senderUserId } = payload

  if (!senderUserId || !isUUID.v4(senderUserId)) {
    debug('utm_content does not contain an UUID')
    return
  }

  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })
  if (!['ABO', 'BENEFACTOR', 'YEARLY_ABO'].includes(pkg?.name)) {
    debug('package "%s" wont reward anything', pkg?.name)
    return
  }

  const transaction = await pgdb.transactionBegin()

  try {
    const activeMembership = await transaction.public.memberships.findOne({
      userId: senderUserId,
      active: true,
    })

    if (!activeMembership) {
      debug('sender has no more active membership')
      return
    }

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: activeMembership.membershipTypeId,
    })
    if (membershipType?.name === 'MONTHLY_ABO') {
      debug('sender has an activeMembership type which can not be extended')
      return
    }

    // update count of subscribers
    const lastCount = await transaction.public.userAttributes.findFirst(
      { userId: senderUserId, name: 'futureCampaignAboCount' },
      { orderBy: { createdAt: 'desc' } },
    )

    const newCount = lastCount ? parseInt(lastCount.value, 10) + 1 : 1

    if (newCount <= 5) {
      await transaction.public.userAttributes.insert({
        userId: senderUserId,
        name: 'futureCampaignAboCount',
        value: newCount,
      })

      // fetch consent of campaign sender if month should be donated
      const hasDonateConsent = await Consents.statusForPolicyForUser({
        userId: senderUserId,
        policy: DONATE_POLICY_NAME,
        pgdb,
      })

      const rewardMailData = {
        senderUserId,
        pledgeUserId: pledge.userId,
        count: newCount,
        hasSenderConsentedToDonate: hasDonateConsent,
      }

      // if month should not be donated, add to current membership period
      if (!hasDonateConsent) {
        const membershipPeriods =
          await transaction.public.membershipPeriods.find({
            membershipId: activeMembership.id,
          })

        const lastPeriod = getPeriodEndingLast(membershipPeriods)
        const endDate = dayjs(lastPeriod.endDate)

        const newMembershipPeriod =
          await transaction.public.membershipPeriods.insertAndGet({
            membershipId: activeMembership.id,
            beginDate: endDate,
            endDate: endDate.add(1, 'month'),
            kind: 'BONUS',
          })

        rewardMailData.membershipPeriodEndDate = newMembershipPeriod?.endDate
      }

      // send email to campaign sender without new membership period end date
      /*
      await mail.sendFutureCampaignSenderRewardMail(
        { ...rewardMailData },
        { pgdb, t },
      )
      */

      await transaction.transactionCommit()
    }
  } catch (e) {
    await transaction.transactionRollback()
    console.error('transaction rollback', e)
    throw e
  }

  const cache = createCache(
    {
      prefix: `User:${senderUserId}`,
      key: 'futureCampaignAboCount',
    },
    context,
  )
  await cache.invalidate()
}

module.exports = { rewardSender }
