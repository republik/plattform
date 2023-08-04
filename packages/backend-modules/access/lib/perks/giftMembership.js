const debug = require('debug')('access:lib:perks:giftMembership')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const memberships = require('../memberships')
const activateMembership = require('@orbiting/backend-modules-republik-crowdfundings/lib/activateMembership')
const createCache = require('@orbiting/backend-modules-republik-crowdfundings/lib/cache')

const give = async (
  campaign,
  grant,
  recipient,
  settings,
  t,
  pgdb,
  redis,
  mail,
) => {
  if (grant.revokedAt) {
    throw new Error(t('api/access/perk/giftMembership/grantRevoked/error'))
  }

  if (grant.granter.id === recipient.id) {
    throw new Error(t('api/access/perk/giftMembership/selfClaim/error'))
  }

  const hasActiveMembership = await hasUserActiveMembership(recipient, pgdb)

  if (hasActiveMembership) {
    throw new Error(
      t('api/access/perk/giftMembership/hasActiveMembership/error'),
    )
  }

  const giftableMemberships = await memberships.findGiftableMemberships(pgdb)

  if (giftableMemberships.length === 0) {
    throw new Error(
      t('api/access/perk/giftMembership/noGiftableMemberships/error'),
    )
  }

  const electedMembership = giftableMemberships.shift()

  const { updatedMembership: membership } = await activateMembership(
    electedMembership,
    recipient,
    t,
    pgdb,
  )

  createCache({ prefix: `User:${recipient.id}` }, { redis }).invalidate()

  debug('give', {
    electedMembership: membership.id,
    pledger: electedMembership.pledgeUserId,
    recipient: recipient.id,
  })

  // @TODO: Render anon if pledger is from pod-thingy.
  const pledger = await pgdb.public.users
    .findOne({ id: electedMembership.pledgeUserId })
    .then(transformUser)

  await mail.sendMembershipClaimNotice({ membership }, { pgdb, t })
  await mail.sendMembershipClaimerOnboarding(
    { claimedMembership: membership },
    { pgdb, t },
  )

  return {
    ...electedMembership,
    ...membership,
    pledger,
  }
}

const revoke = async () => {} // do nothing

module.exports = {
  give,
  revoke,
}
