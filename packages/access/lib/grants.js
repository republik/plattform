const debug = require('debug')('access:lib:grants')
const moment = require('moment')
const validator = require('validator')
const Promise = require('bluebird')

const { Roles } = require('@orbiting/backend-modules-auth')
const {
  applyPgInterval: { add: addInterval },
  hasUserActiveMembership
} = require('@orbiting/backend-modules-utils')

const campaignsLib = require('./campaigns')
const constraints = require('./constraints')
const eventsLib = require('./events')
const mailLib = require('./mail')
const membershipsLib = require('./memberships')

const VOUCHER_CODE_LENGTH = 5

const evaluateConstraints = async (granter, campaign, email, t, pgdb) => {
  const errors = []

  for (const constraint of campaign.constraints) {
    const name = Object.keys(constraint).shift()
    const settings = constraint[name]

    if (!constraints[name]) {
      throw new Error(`Unable to evalute contraint "${name}"`)
    }

    const valid = await constraints[name].isGrantable(
      { settings, granter, email, campaign },
      { pgdb }
    )

    debug('evaluateConstraints', {
      name: campaign.name,
      constraint: name,
      settings,
      valid
    })

    if (!valid) {
      errors.push(t(
        `api/access/constraint/${name}/error`,
        { ...settings, email }
      ))
    }
  }

  debug({ errors })

  return { errors }
}

const insert = async (granter, campaignId, grants = [], pgdb) => {
  const campaign = await campaignsLib.findOne(campaignId, pgdb)

  if (!campaign) {
    throw new Error('Campaign not found.')
  }

  const grantRecords = grants.map(grant => ({
    ...grant,
    granterUserId: granter.id,
    accessCampaignId: campaign.id,
    beginBefore: addInterval(moment(), campaign.grantClaimableInterval)
  }))

  const results = await pgdb.public.accessGrants.insertAndGet(grantRecords)

  await Promise.map(
    results,
    grant => eventsLib.log(grant, 'insert', pgdb),
    { concurrency: 10 }
  )
}

const grant = async (granter, campaignId, email, message, t, pgdb, mail) => {
  if (!validator.isEmail(email)) {
    throw new Error(t(
      'api/access/grant/email/error',
      { email }
    ))
  }

  const campaign = await campaignsLib.findOne(campaignId, pgdb)

  if (!campaign) {
    throw new Error(t(
      'api/access/grant/campaign/error',
      { campaignId }
    ))
  }

  const result = await evaluateConstraints(granter, campaign, email, t, pgdb)

  if (result.errors.length > 0) {
    const error = result.errors.shift()
    console.error(
      error,
      { granter: granter.id, campaign: campaign.id, email }
    )
    throw new Error(error)
  }

  if (message && message.length > 255) {
    throw new Error(t(
      'api/access/grant/message/error/tooLong',
      { maxLength: 255 }
    ))
  }

  const grant = await pgdb.public.accessGrants.insertAndGet({
    granterUserId: granter.id,
    email,
    message,
    accessCampaignId: campaign.id,
    beginBefore: addInterval(moment(), campaign.grantClaimableInterval)
  })

  await eventsLib.log(grant, 'invite', pgdb)

  debug('invite, row inserted', { grant })

  await mailLib.sendRecipientInvitation(granter, campaign, grant, t, pgdb)

  return grant
}

const claim = async (voucherCode, payload, user, t, pgdb, mail) => {
  const sanatizedVoucherCode = voucherCode.trim().toUpperCase()

  const grantByVoucherCode = await findByVoucherCode(
    sanatizedVoucherCode,
    { pgdb }
  )

  if (!grantByVoucherCode) {
    throw new Error(t('api/access/claim/404'))
  }

  const grant = await beginGrant(grantByVoucherCode, payload, user, pgdb)
  await eventsLib.log(grant, 'grant', pgdb)

  const campaign = await pgdb.public.accessCampaigns
    .findOne({ id: grant.accessCampaignId })
  const { subscribeToEditorialNewsletters = true } = campaign.config

  const hasRoleChanged =
    await membershipsLib.addMemberRole(grant, user, pgdb)

  if (hasRoleChanged) {
    await mail.enforceSubscriptions({
      userId: user.id,
      pgdb,
      subscribeToEditorialNewsletters
    })
  }

  if (!(await hasUserActiveMembership(user, pgdb))) {
    const granter = await pgdb.public.users
      .findOne({ id: grant.granterUserId })

    await mailLib.sendRecipientOnboarding(granter, campaign, user, grant, t, pgdb)
  }

  debug('grant', { grant })

  return grant
}

const revoke = async (id, user, t, pgdb) => {
  const grant = await pgdb.public.accessGrants.findOne({ id })
  const granter = await pgdb.public.users.findOne({ id: grant.granterUserId })

  if (!Roles.userIsMeOrInRoles(granter, user, ['admin', 'supporter'])) {
    throw new Error(t('api/access/revoke/role/error'))
  }

  const now = moment()
  const updateFields = { revokedAt: now, updatedAt: now }
  const result = await pgdb.public.accessGrants.update(
    { id: grant.id, revokedAt: null, invalidatedAt: null },
    updateFields
  )

  await eventsLib.log(
    grant,
    granter.id !== user.id ? 'revoked.admin' : 'revoked.user',
    pgdb
  )

  debug('revoke', {
    id: grant.id,
    ...updateFields
  })

  return result
}

const request = async (granter, campaignId, payload, t, pgdb, mail) => {
  const campaign = await campaignsLib.findOne(campaignId, pgdb)

  if (!campaign) {
    throw new Error(t(
      'api/access/request/campaign/error',
      { campaignId }
    ))
  }

  const result = await evaluateConstraints(granter, campaign, granter.email, t, pgdb)

  if (result.errors.length > 0) {
    const error = result.errors.shift()
    console.error(
      error,
      { granter: granter.id, campaign: campaign.id, email: granter.email }
    )
    throw new Error(error)
  }

  const grant = await beginGrant(
    await pgdb.public.accessGrants.insertAndGet({
      granterUserId: granter.id,
      accessCampaignId: campaign.id,
      voucherCode: null,
      beginBefore: addInterval(moment(), campaign.grantClaimableInterval)
    }),
    payload,
    granter,
    pgdb
  )

  await eventsLib.log(grant, 'request', pgdb)

  const { subscribeToEditorialNewsletters = true } = campaign.config

  const hasRoleChanged =
    await membershipsLib.addMemberRole(grant, granter, pgdb)

  if (hasRoleChanged) {
    await mail.enforceSubscriptions({
      userId: granter.id,
      pgdb,
      subscribeToEditorialNewsletters
    })
  }

  if (!(await hasUserActiveMembership(granter, pgdb))) {
    await mailLib.sendRecipientOnboarding(granter, campaign, granter, grant, t, pgdb)
  }

  debug('request', { grant })

  return grant
}

const invalidate = async (grant, reason, t, pgdb, mail) => {
  const now = moment()
  const updateFields = {
    voucherCode: null,
    invalidatedAt: now,
    updatedAt: now
  }

  const result = await pgdb.public.accessGrants.update(
    { id: grant.id, invalidatedAt: null },
    updateFields
  )

  await eventsLib.log(grant, `invalidated.${reason}`, pgdb)

  if (grant.recipientUserId) {
    const recipient =
      await pgdb.public.users.findOne({ id: grant.recipientUserId })

    if (recipient) {
      const hasRoleChanged = await membershipsLib.removeMemberRole(
        grant,
        recipient,
        findByRecipient,
        pgdb
      )

      if (hasRoleChanged) {
        await mail.enforceSubscriptions({
          userId: recipient.id,
          pgdb
        })
      }

      if (!(await hasUserActiveMembership(recipient, pgdb))) {
        const granter = await pgdb.public.users
          .findOne({ id: grant.granterUserId })
        const campaign = await pgdb.public.accessCampaigns
          .findOne({ id: grant.accessCampaignId })

        await mailLib.sendRecipientExpired(
          granter, campaign, recipient, grant, t, pgdb
        )
      }
    }
  }

  debug('invalidate', {
    id: grant.id,
    reason,
    hasRecipient: !!grant.recipientUserId,
    ...updateFields,
    result
  })

  return result > 0
}

const followUp = async (campaign, grant, t, pgdb, mail) => {
  const now = moment()
  const updateFields = { followupAt: now, updatedAt: now }
  const result = await pgdb.public.accessGrants.update(
    { id: grant.id, followupAt: null },
    updateFields
  )

  const recipient =
    await pgdb.public.users.findOne({ id: grant.recipientUserId })

  if (recipient && !(await hasUserActiveMembership(recipient, pgdb))) {
    const granter = await pgdb.public.users
      .findOne({ id: grant.granterUserId })

    await mailLib.sendRecipientFollowup(
      granter, campaign, recipient, grant, t, pgdb
    )
  }

  debug('followUp', {
    id: grant.id,
    hasRecipient: !!grant.recipientUserId,
    ...updateFields,
    result
  })

  return result > 0
}

const findByGranter = async (
  granter,
  campaign,
  withRevoked,
  withInvalidated,
  pgdb
) => {
  debug(
    'findByGranter', {
      granter: granter.id,
      campaign: campaign.id,
      withRevoked,
      withInvalidated
    }
  )

  const query = {
    granterUserId: granter.id,
    accessCampaignId: campaign.id,
    revokedAt: null,
    invalidatedAt: null
  }

  if (withRevoked) {
    delete query.revokedAt
  }

  if (withInvalidated) {
    delete query.invalidatedAt
  }

  return pgdb.public.accessGrants.find(
    query,
    { orderBy: { createdAt: 'desc' } }
  )
}

const findByRecipient = async (recipient, { withPast, pgdb }) => {
  debug('findByRecipient', { recipient: recipient.id, withPast })

  const now = moment()
  const query = {
    or: [
      { recipientUserId: recipient.id },
      { recipientUserId: null, email: recipient.email }
    ],
    'beginAt <=': now,
    'endAt >': now,
    invalidatedAt: null
  }

  if (withPast) {
    delete query['beginAt <=']
    delete query['endAt >']
    delete query.invalidatedAt
  }

  const grants =
    await pgdb.public.accessGrants.find(
      query,
      { orderBy: { createdAt: 'desc' } }
    )

  return grants
}

const findByVoucherCode = async (voucherCode, { pgdb }) => {
  debug('findByVoucherCode', { voucherCode })

  return pgdb.public.accessGrants.findOne({
    voucherCode,
    recipientUserId: null,
    'beginBefore >=': moment(),
    invalidatedAt: null
  })
}

const findUnassignedByEmail = async (email, pgdb) => {
  debug('findUnassignedByEmail', { email })
  return pgdb.public.accessGrants.find({
    email,
    recipientUserId: null,
    'beginBefore >=': moment(),
    beginAt: null,
    endAt: null,
    invalidatedAt: null
  })
}

const findInvalid = async (pgdb) => {
  debug('findInvalid')
  const now = moment()
  return pgdb.public.accessGrants.find({
    or: [
      { and: [{ endAt: null }, { 'beginBefore <': now }] },
      { 'endAt <': now }
    ],
    invalidatedAt: null
  })
}

const beginGrant = async (grant, payload, recipient, pgdb) => {
  const campaign = await campaignsLib.findOne(grant.accessCampaignId, pgdb)
  const now = moment()
  const beginAt = now.clone()
  const endAt = addInterval(beginAt, campaign.grantPeriodInterval)

  const updateFields = {
    recipientUserId: recipient.id,
    beginAt,
    endAt,
    payload: { ...grant.payload, ...payload },
    updatedAt: now
  }
  const result = await pgdb.public.accessGrants.updateAndGetOne(
    { id: grant.id },
    updateFields
  )

  debug('beginGrant', {
    id: grant.id,
    ...updateFields,
    result
  })

  return result
}

const findEmptyFollowup = async (campaign, pgdb) => {
  const invalidateBefore = moment()

  Object
    .keys(campaign.emailFollowup)
    .forEach(
      unit => invalidateBefore.subtract(campaign.emailFollowup[unit], unit)
    )

  debug('findEmptyFollowup', { campaign: campaign.id, invalidateBefore })

  return pgdb.public.accessGrants.find({
    accessCampaignId: campaign.id,
    'invalidatedAt <': invalidateBefore,
    followupAt: null
  })
}

module.exports = {
  VOUCHER_CODE_LENGTH,

  insert,
  grant,
  claim,
  request,
  revoke,
  invalidate,
  followUp,

  findByGranter,
  findByRecipient,
  findByVoucherCode,

  findUnassignedByEmail,
  findInvalid,
  findEmptyFollowup
}
