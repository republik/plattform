const setAutoPay = async ({ membershipId, userId, autoPay, pgdb }) => {
  const rowsAffected = await pgdb.public.memberships.update({
    id: membershipId,
    userId,
    active: true
  }, {
    autoPay
  })

  if (rowsAffected !== 1) {
    throw new Error('Unable to set autoPay flag.')
  }

  return rowsAffected
}

module.exports = {
  enableAutoPay: (args) => setAutoPay({ ...args, autoPay: true }),
  disableAutoPay: (args) => setAutoPay({ ...args, autoPay: false })
}
