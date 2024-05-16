const logger = console
const postfinanceSHA = require('../../../lib/payments/postfinance/sha')
const { v4: uuid } = require('uuid')
const validator = require('validator')
const {
  minTotal,
  regularTotal,
  getPledgeOptionsTree,
} = require('../../../lib/Pledge')
const {
  resolvePackages,
  getCustomOptions,
} = require('../../../lib/CustomPackages')
const debug = require('debug')('crowdfundings:pledge')
const {
  Consents: { ensureAllRequiredConsents, saveConsents },
  AccessToken: { getUserByAccessToken, ensureCanPledgePackage },
} = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')
const {
  insertAddress,
  upsertAddress,
} = require('@orbiting/backend-modules-republik/lib/address')

module.exports = async (_, args, context) => {
  const { pgdb, req, t } = context
  const transaction = await pgdb.transactionBegin()
  try {
    const { pledge, consents } = args
    debug('submitPledge %O', pledge)

    const pledgeOptions = pledge.options.filter(
      (o) => o.amount > 0 && o.templateId,
    )

    // Check if there are any options left viable to process
    if (pledgeOptions.length === 0) {
      logger.error('at least one option required w/ amount > 0', {
        req: req._log(),
        args,
        options: pledge.options,
      })
      throw new Error(t('api/pledge/empty'))
    }

    // load original of chosen packageOptions
    const packageOptions = await transaction.public.packageOptions.find({
      id: pledgeOptions.map((plo) => plo.templateId),
    })

    const rewardIds = packageOptions.map((option) => option.rewardId)
    const rewards =
      rewardIds.length > 0
        ? await pgdb.public.rewards.find({
            id: rewardIds,
          })
        : []

    const goodies =
      rewards.length > 0
        ? await pgdb.public.goodies.find({
            rewardId: rewards.map((reward) => reward.id),
          })
        : []

    const membershipTypes =
      rewards.length > 0
        ? await pgdb.public.membershipTypes.find({
            rewardId: rewards.map((reward) => reward.id),
          })
        : []

    rewards.forEach((reward, index, rewards) => {
      const goodie = goodies.find((g) => g.rewardId === reward.id)
      const membershipType = membershipTypes.find(
        (m) => m.rewardId === reward.id,
      )

      rewards[index] = Object.assign({}, reward, membershipType, goodie)
    })

    packageOptions.forEach((packageOption, index, packageOptions) => {
      packageOptions[index].reward = rewards.find(
        (reward) => packageOption.rewardId === reward.rewardId,
      )
    })

    const packageId = packageOptions[0].packageId
    const pkg = await pgdb.public.packages.findOne({ id: packageId })

    // wrong tokens are just ignored
    const accessTokenUser =
      pledge.accessToken &&
      (await getUserByAccessToken(pledge.accessToken, context))

    if (accessTokenUser) {
      ensureCanPledgePackage(accessTokenUser, pkg.name)
    }

    const resolvedPackage = (
      await resolvePackages({
        packages: [pkg],
        pledger: accessTokenUser || req.user,
        pgdb: transaction,
      })
    ).shift()

    const customOptions =
      resolvedPackage.custom && (await getCustomOptions(resolvedPackage))
    const resolvedOptions = customOptions ? customOptions.options : []

    // check if packageOptions are all from the same package
    // check if minAmount <= amount <= maxAmount
    // we don't check the pledgeOption price here, because the frontend always
    // sends whats in the templating packageOption, so we always copy the price
    // into the pledgeOption (for record keeping)
    pledgeOptions.forEach((plo) => {
      // Mutually exclusive membership options: Can only be requested once
      // within all options.
      if (
        plo.membershipId &&
        pledgeOptions.filter(
          (o) => o.membershipId === plo.membershipId && o.amount > 0,
        ).length > 1
      ) {
        logger.error('options w/ membershipIds must be mutually exclusive!', {
          req: req._log(),
          args,
          plo,
        })
        throw new Error(t('api/unexpected'))
      }

      // Check if passed options are valid custom package options.
      if (
        plo.membershipId &&
        !resolvedOptions.find(
          (option) =>
            option.templateId === plo.templateId &&
            option.membership.id === plo.membershipId,
        )
      ) {
        logger.error(
          'options must be valid combination of templateId and membershipId',
          { req: req._log(), args, plo },
        )
        throw new Error(t('api/unexpected'))
      }

      const pko = packageOptions.find((pko) => pko.id === plo.templateId)

      if (packageId !== pko.packageId) {
        logger.error('options must all be part of the same package!', {
          req: req._log(),
          args,
          plo,
          pko,
        })
        throw new Error(t('api/unexpected'))
      }

      if (pko.disabledAt && pko.disabledAt <= new Date()) {
        logger.error(
          `option must be enabled (disabledAt: ${pko.disabledAt.toISOString()})`,
          { req: req._log(), args, plo, pko },
        )
        throw new Error(t('api/unexpected'))
      }

      if (!(pko.minAmount <= plo.amount && plo.amount <= pko.maxAmount)) {
        logger.error(
          `amount in option (templateId: ${plo.templateId}) out of range`,
          { req: req._log(), args, pko, plo },
        )
        throw new Error(t('api/unexpected'))
      }

      if (!pko.userPrice && plo.price !== pko.price) {
        logger.error(
          `price in option (templateId: ${plo.templateId}) is invalid`,
          { req: req._log(), args, pko, plo },
        )
        throw new Error(t('api/unexpected'))
      }

      if (
        pko.reward &&
        pko.reward.rewardType === 'MembershipType' &&
        (pko.reward.maxPeriods - pko.reward.minPeriods > 0 || plo.periods)
      ) {
        if (!plo.periods) {
          logger.error(
            `periods in option (templateId: ${plo.templateId}) is missing`,
            { req: req._log(), args, pko, plo },
          )
          throw new Error(t('api/unexpected'))
        }

        if (
          plo.periods > pko.reward.maxPeriods ||
          plo.periods < pko.reward.minPeriods
        ) {
          logger.error(
            `periods in option (templateId: ${plo.templateId}) out of range`,
            { req: req._log(), args, pko, plo },
          )
          throw new Error(t('api/unexpected'))
        }
      }
    })

    // check if crowdfunding is still open
    const crowdfunding = await pgdb.public.crowdfundings.findOne({
      id: pkg.crowdfundingId,
    })
    const now = new Date()
    const gracefullEnd = new Date(crowdfunding.endDate)
    gracefullEnd.setMinutes(now.getMinutes() + 20)
    if (gracefullEnd < now) {
      logger.error('crowdfunding already closed', { req: req._log(), args })
      throw new Error(t('api/crowdfunding/tooLate'))
    }

    // check total
    const pledgeMinTotal = minTotal(pledgeOptions, packageOptions)
    if (pledge.total < pledgeMinTotal) {
      logger.error(
        `pledge.total (${pledge.total}) must be >= (${pledgeMinTotal})`,
        { req: req._log(), args, pledgeMinTotal },
      )
      throw new Error(t('api/unexpected'))
    }

    // calculate donation
    const pledgeRegularTotal = regularTotal(pledgeOptions, packageOptions)
    const donation = pledge.total - pledgeRegularTotal

    // email address check if pledge.user is provided
    if (pledge.user && !validator.isEmail(pledge.user.email)) {
      logger.error('pledge.user.email is invalid.', { req: req._log(), args })
      throw new Error(t('api/email/invalid'))
    }

    // check user
    let user = null
    let pfAliasId = null
    if (req.user) {
      // user logged in
      if (
        (pledge.user && req.user.email !== pledge.user.email) ||
        (accessTokenUser && req.user.email !== accessTokenUser.email)
      ) {
        logger.error(
          'req.user.email does not match, signout or remove access token first.',
          { req: req._log(), args },
        )
        throw new Error(t('api/unexpected'))
      }
      user = req.user._raw

      // load possible exising PF alias, only exists if the user is logged in,
      // otherwise he can't have an alias already
      const paymentSource = await transaction.public.paymentSources.findFirst(
        {
          userId: user.id,
          method: 'POSTFINANCECARD',
        },
        { orderBy: ['createdAt desc'] },
      )

      if (paymentSource) {
        pfAliasId = paymentSource.pspId
      }
    } else {
      if (accessTokenUser) {
        if (pledge.user && pledge.user.email !== accessTokenUser.email) {
          await transaction.transactionRollback()
          return {
            // user must logout before he can submitPledge
            emailVerify: true,
          }
        }
        user = accessTokenUser._raw
      } else {
        if (!pledge.user) {
          throw new Error(t('api/signIn'))
        }
        user = await transaction.public.users.findOne({
          email: pledge.user.email,
        }) // try to load existing user by email
        if (
          user &&
          !!(await transaction.public.pledges.count({
            userId: user.id,
            'status !=': 'DRAFT',
          }))
        ) {
          // user has pledges
          await transaction.transactionRollback()
          return {
            // user must login before he can submitPledge
            emailVerify: true,
          }
        } else if (!user) {
          // create user
          user = await transaction.public.users.insertAndGet({
            email: pledge.user.email,
          })
        }
      }
    }

    // update user details
    if (
      (pledge.user &&
        (user.firstName !== pledge.user.firstName ||
          user.lastName !== pledge.user.lastName ||
          user.birthday !== pledge.user.birthday ||
          user.phoneNumber !== pledge.user.phoneNumber)) ||
      pledge.address
    ) {
      const address =
        pledge.address &&
        (await upsertAddress(
          { ...pledge.address, id: user.addressId },
          transaction,
          t,
        ))

      user = await transaction.public.users.updateAndGetOne(
        { id: user.id },
        {
          ...(pledge.user && {
            ...(pledge.user.firstName && { firstName: pledge.user.firstName }),
            ...(pledge.user.lastName && { lastName: pledge.user.lastName }),
            ...(pledge.user.birthday && { birthday: pledge.user.birthday }),
            ...(pledge.user.phoneNumber && {
              phoneNumber: pledge.user.phoneNumber,
            }),
          }),
          ...(address?.id && { addressId: address?.id }),
        },
      )
    }

    // consents
    await ensureAllRequiredConsents({
      userId: user.id,
      consents,
      pgdb: transaction,
    })
    await saveConsents({
      userId: user.id,
      consents,
      req,
      pgdb: transaction,
    })

    // if we didn't load a alias, generate one
    if (!pfAliasId) {
      pfAliasId = uuid()
    }

    // MONTHLY_ABO can only be bought if user has no active membership
    // and if user did not buy a MONTHLY already (then he has to reactivateMembership)
    const userHasActiveMembership = await hasUserActiveMembership(
      user,
      transaction,
    )
    const userHasMonthlyMembership = await transaction.queryOneField(
      `
      SELECT COUNT(*)
      FROM memberships m
      JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      WHERE
        m."userId" = :userId AND
        mt.name = :membershipTypeName
    `,
      {
        userId: user.id,
        membershipTypeName: 'MONTHLY_ABO',
      },
    )
    if (userHasActiveMembership || userHasMonthlyMembership) {
      const pledgeOptionsTree = await getPledgeOptionsTree(
        pledge.options,
        transaction,
      )
      for (const plo of pledgeOptionsTree) {
        if (
          plo.packageOption.reward &&
          plo.packageOption.reward.membershipType &&
          plo.packageOption.reward.membershipType.name === 'MONTHLY_ABO'
        ) {
          if (userHasActiveMembership) {
            throw new Error(t('api/membership/monthly/hasActive'))
          } else if (userHasMonthlyMembership) {
            // TODO: throw error again after starter price test
            // throw new Error(t('api/membership/monthly/reactivate'))
          }
        }
      }
    }

    const shippingAddress = await insertAddress(
      pledge.shippingAddress,
      transaction,
      t,
    )

    // insert pledge
    let newPledge = {
      userId: user.id,
      packageId,
      total: pledge.total,
      donation: donation,
      reason: pledge.reason,
      payload: pledge.payload,
      messageToClaimers: pledge.messageToClaimers,
      status: 'DRAFT',
      shippingAddressId: shippingAddress?.id,
    }
    newPledge = await transaction.public.pledges.insertAndGet(newPledge)

    // insert pledgeOptions
    const newPledgeOptions = await Promise.all(
      pledgeOptions.map((plo) => {
        plo.pledgeId = newPledge.id

        const pko = packageOptions.find((pko) => pko.id === plo.templateId)
        plo.vat = pko.vat
        plo.potPledgeOptionId = pko.potPledgeOptionId
        plo.accessGranted = pko.accessGranted

        if (
          pko.reward &&
          pko.reward.rewardType === 'MembershipType' &&
          !plo.periods
        ) {
          plo.periods = pko.reward.defaultPeriods
        }

        // the FE doesn't distribute the surplus / donation amout to pledgeOptions
        // DONATE* packages always only have one packageOption
        if (pledgeOptions.length === 1) {
          plo.total = newPledge.total
        }

        return transaction.public.pledgeOptions.insertAndGet(plo)
      }),
    )
    newPledge.packageOptions = newPledgeOptions

    // commit transaction
    await transaction.transactionCommit()

    // generate PF SHA
    const pfSHA = postfinanceSHA({
      orderId: newPledge.id,
      amount: newPledge.total,
      alias: pfAliasId,
      userId: user.id,
    })

    return {
      pledgeId: newPledge.id,
      userId: user.id,
      pfSHA,
      pfAliasId,
    }
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
