const debug = require('debug')('access:lib:campaigns')
const moment = require('moment')
const Promise = require('bluebird')

const constraints = require('./constraints')

const findAvailable = async (pgdb) => {
  debug('findAvailable')
  const campaigns = await pgdb.public.accessCampaigns.find({
    'beginAt <=': moment(),
    'endAt >': moment()
  })

  return campaigns
}

const findAll = async (pgdb) => {
  debug('findAll')
  const campaigns = await pgdb.public.accessCampaigns.find({
    'beginAt <=': moment()
  })

  return campaigns
}

const findByGrant = (grant, pgdb) => {
  debug('findByGrant', { grant: grant.id })
  return pgdb.public.accessCampaigns.findOne({
    id: grant.accessCampaignId
  })
}

const findOne = (id, pgdb) => {
  debug('findOne', { id })
  return pgdb.public.accessCampaigns.findOne({
    id,
    'beginAt <=': moment(),
    'endAt >': moment()
  })
}

const findForGrantee = async (grantee, { withPast, pgdb }) => {
  debug('findForGrantee', { grantee: grantee.id, withPast })
  const campaigns =
    await Promise.map(
      withPast ? await findAll(pgdb) : await findAvailable(pgdb),
      getContraintMeta.bind(null, grantee, pgdb)
    )
      .then(filterInvisibleCampaigns)
      .then(mergeConstraintPayloads)

  return campaigns
}

module.exports = {
  findAvailable,
  findAll,
  findByGrant,
  findOne,
  findForGrantee
}

/**
 * Not exposed functions
 */

const getContraintMeta = async (grantee, pgdb, campaign) => {
  const constraintMeta = []

  for (const constraint of campaign.constraints) {
    const name = Object.keys(constraint).shift() // Name of constraint
    const settings = constraint[name] // Settings of constraint
    const meta = await constraints[name].getMeta(
      { settings, grantee, campaign },
      { pgdb }
    )

    constraintMeta.push(meta)
  }

  return {...campaign, constraintMeta}
}

const filterInvisibleCampaigns = campaigns =>
  campaigns.filter(campaign => {
    return campaign.constraintMeta.every(meta => meta.visible !== false)
  })

const mergeConstraintPayloads = campaigns =>
  campaigns.map(campaign => {
    const payload = {}

    campaign.constraintMeta.forEach(meta => {
      Object.assign(payload, meta.payload)
    })

    return {...campaign, ...payload}
  })
