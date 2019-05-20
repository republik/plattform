const debug = require('debug')('access:lib:campaigns')
const moment = require('moment')
const Promise = require('bluebird')

const constraints = require('./constraints')

const findAvailable = async (pgdb) => {
  debug('findAvailable')
  const now = moment()
  const campaigns = await pgdb.public.accessCampaigns.find({
    'beginAt <=': now,
    'endAt >': now
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
  const now = moment()
  return pgdb.public.accessCampaigns.findOne({
    id,
    'beginAt <=': now
  })
}

const findForGranter = async (granter, { withPast, pgdb }) => {
  debug('findForGranter', { granter: granter.id, withPast })
  const campaigns =
    await Promise.map(
      withPast ? await findAll(pgdb) : await findAvailable(pgdb),
      getContraintMeta.bind(null, granter, pgdb)
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
  findForGranter
}

/**
 * Not exposed functions
 */

const getContraintMeta = async (granter, pgdb, campaign) => {
  const constraintMeta = []

  for (const constraint of campaign.constraints) {
    const name = Object.keys(constraint).shift() // Name of constraint
    const settings = constraint[name] // Settings of constraint
    const meta = await constraints[name].getMeta(
      { settings, granter, campaign },
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
    const payload = {
      slots: {
        total: 0,
        used: 0,
        free: 0
      }
    }

    campaign.constraintMeta.forEach(meta => {
      Object.assign(payload, meta.payload)
    })

    return {...campaign, ...payload}
  })
