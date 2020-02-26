const debug = require('debug')('access:lib:perks:giftMembership')

const memberships = require('../memberships')
const activateMembership = require('../../../../servers/republik/modules/crowdfundings/lib/activateMembership')

const give = async (campaign, grant, recipient, settings, t, pgdb) => {
  const unpromisedMemberships = await memberships.findUnpromisedMemberships(pgdb)

  if (unpromisedMemberships.length === 0) {
    throw new Error(t('Unable to find an unpromised membership'))
  }

  // @TODO: Nur wenn nicht schon ein nadere MItgliedschaft da ist,
  // die aber kein Monatsabonnement ist.

  // @TODO: More logic here, to sort anonymous memberships at end of line.
  const electedMembership = unpromisedMemberships.shift()

  await activateMembership(electedMembership, recipient, t, pgdb)

  debug('give', {
    electedMembership: electedMembership.id,
    recipient: recipient.id
  })
}

module.exports = {
  give
}
