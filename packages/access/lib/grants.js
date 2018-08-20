const debug = require('debug')('access:lib:grants')
const moment = require('moment')
const validator = require('validator')
const Promise = require('bluebird')

const campaignsLib = require('./campaigns')
const constraints = require('./constraints')
const mailLib = require('./mail')

const isGrantable = async (grantee, campaign, email, pgdb) => {
  let granted = true

  for (const constraint of campaign.constraints) {
    const name = Object.keys(constraint).shift()
    const settings = constraint[name]

    if (!constraints[name]) {
      throw new Error(`Unable to evalute contraint "${name}"`)
    }

    const result = await constraints[name].isGrantable(
      { settings, grantee, email, campaign },
      { pgdb }
    )

    debug('isGrantable', {
      name: campaign.name,
      constraint: name,
      settings,
      result
    })

    if (!result) {
      granted = false
      break
    }
  }

  debug('granted', granted)

  return granted
}

const grant = async (grantee, campaignId, email, t, pgdb) => {
  if (!validator.isEmail(email)) {
    throw new Error(`Email address "${email}" is invalid`)
  }

  const campaign = await campaignsLib.findOne(campaignId, pgdb)

  if (campaign === undefined) {
    throw new Error(`campaign "${campaignId}" not found`)
  }

  if (!await isGrantable(grantee, campaign, email, pgdb)) {
    throw new Error('Unable to grant membership')
  }

  const endAt = moment()

  Object.keys(campaign.periodInterval).forEach(key => {
    endAt.add(campaign.periodInterval[key], key)
  })

  const grant = await pgdb.public.accessGrants.insertAndGet({
    granteeUserId: grantee.id,
    email,
    accessCampaignId: campaign.id,
    beginAt: moment(),
    endAt
  })

  debug('grant, row inserted', { grant })

  await Promise.all([
    mailLib.sendRecipientOnboarding(grantee, campaign, grant, t),
    mailLib.sendGranteeConfirmation(grantee, campaign, grant, t)
  ])

  return grant
}

const revoke = async (id, grantee, t, pgdb) => {
  const rowsAffected = await pgdb.public.accessGrants.update(
    { id, revokedAt: null },
    { revokedAt: moment(), updatedAt: moment() }
  )

  if (rowsAffected > 0) {
    const grant = await pgdb.public.accessGrants.findOne({ id })
    const campaign = await campaignsLib.findByGrant(grant, pgdb)

    await Promise.all([
      mailLib.sendRecipientRevoked(grantee, campaign, grant, t),
      mailLib.sendGranteeRevoked(grantee, campaign, grant, t)
    ])
  }

  return rowsAffected > 0
}

const findByGrantee = async (grantee, campaign, pgdb) => {
  const grants =
    await pgdb.public.accessGrants.find({
      granteeUserId: grantee.id,
      accessCampaignId: campaign.id,
      revokedAt: null,
      'beginAt <=': moment(),
      'endAt >': moment()
    })

  return grants
}

const findByRecipient = async (recipient, pgdb) => {
  const grants =
    await pgdb.public.accessGrants.find({
      recipientUserId: recipient.id,
      revokedAt: null,
      'beginAt <=': moment(),
      'endAt >': moment()
    })

  return grants
}

const findUnassigned = async (pgdb) => pgdb.public.accessGrants.find({
  recipientUserId: null,
  'beginAt <=': moment(),
  'endAt >': moment()
})

const findCurrent = async (pgdb) => pgdb.public.accessGrants.find({
  'recipientUserId !=': null,
  'beginAt <=': moment(),
  'endAt >': moment(),
  and: {
    or: [
      { revokedAt: null },
      { 'revokedAt >': moment() }
    ]
  }
}, { orderBy: 'createdAt' })

const findInvalid = async (pgdb) => pgdb.public.accessGrants.find({
  'recipientUserId !=': null,
  and: {
    or: [
      { 'beginAt >': moment() },
      { 'endAt <': moment() },
      { 'revokedAt <': moment() }
    ]
  }
})

const findRevoked = async (pgdb) => pgdb.public.accessGrants.find({
  'recipientUserId !=': null,
  'revokedAt <': moment()
})

const findExpired = async (pgdb) => pgdb.public.accessGrants.find({
  'recipientUserId !=': null,
  'endAt <': moment()
})

const setRecipient = async (grant, recipient, pgdb) => {
  const result = await pgdb.public.accessGrants.update(
    { id: grant.id },
    { recipientUserId: recipient.id, updatedAt: moment() }
  )

  debug('setRecipient', {
    id: grant.id,
    recipientUserId: recipient.id,
    updatedAt: moment(),
    result
  })

  return result > 0
}

module.exports = {
  isGrantable,
  grant,
  revoke,
  findByGrantee,
  findByRecipient,
  findUnassigned,
  findInvalid,
  findRevoked,
  findExpired,
  findCurrent,
  setRecipient
}
