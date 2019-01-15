// Amount of days before a cancelled membership (renew=false) is deactivated
// after last membership periods end
const CANCELLED_GRACE_PERIOD_DAYS = 0

// Amount of days before an uncancelled membership (renew=true) is deactivated
// after last membership periods end
const UNCANCELLED_GRACE_PERIOD_DAYS = 14

const setAutoPay = async ({ membershipId, userId, autoPay, pgdb }) => {
  const rowsAffected = await pgdb.public.memberships.update({
    id: membershipId,
    userId,
    active: true
  }, {
    autoPay
  })

  if (rowsAffected < 1) {
    throw new Error('Unable to set autoPay flag.')
  }

  return rowsAffected
}

module.exports = {
  CANCELLED_GRACE_PERIOD_DAYS,
  UNCANCELLED_GRACE_PERIOD_DAYS,
  enableAutoPay: (args) => setAutoPay({ ...args, autoPay: true }),
  disableAutoPay: (args) => setAutoPay({ ...args, autoPay: false })
}
