const debug = require('debug')('access:lib:perks:giftMembership')

const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const memberships = require('../memberships')
const activateMembership = require('../../../../servers/republik/modules/crowdfundings/lib/activateMembership')

const give = async (campaign, grant, recipient, settings, t, pgdb) => {
  const hasActiveMembership = await hasUserActiveMembership(recipient, pgdb)

  if (hasActiveMembership) {
    throw new Error(t('api/access/perk/giftMembership/hasActiveMembership/error'))
  }

  const giftableMemberships = await memberships.findGiftableMemberships(pgdb)

  if (giftableMemberships.length === 0) {
    throw new Error(t('api/access/perk/giftMembership/noGiftableMemberships/error'))
  }

  // @TODO: More logic here, to sort anonymous memberships at end of line.
  const electedMembership = giftableMemberships.shift()

  await activateMembership(electedMembership, recipient, t, pgdb)

  debug('give', {
    electedMembership: electedMembership.id,
    recipient: recipient.id
  })
}

module.exports = {
  give
}
