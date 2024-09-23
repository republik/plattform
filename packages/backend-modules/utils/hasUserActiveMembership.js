module.exports = async (user, pgdb) => {
  // handle pledge based memberships
  const hasActiveMembership = !!(await pgdb.public.memberships.count({
    userId: user.id,
    active: true,
  }))

  if (hasActiveMembership) {
    return true
  }

  // stripe subscriptions
  const hasActiveSubscription = !!(await pgdb.payments.subscriptions.count({
    userId: user.id,
    and: [{ 'status !=': 'paused' }, { 'status !=': 'canceled' }],
  }))

  return hasActiveSubscription
}
