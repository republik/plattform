module.exports = async (membershipId, pgdb) => {
  // Find membership
  const membership = await pgdb.public.memberships.findOne({ id: membershipId })

  if (!membership) {
    return false
  }

  // Find pledgeOptions, in which autoPay-flag is set
  const relatedPledgeOptions = await pgdb.public.pledgeOptions.find(
    {
      or: [
        { membershipId },
        { pledgeId: membership.pledgeId }
      ]
    }
  )

  if (relatedPledgeOptions.length < 1) {
    return false
  }

  // Find latest pledge
  const pledge = await pgdb.public.pledges.findOne(
    { id: relatedPledgeOptions.map(po => po.pledgeId), status: 'SUCCESSFUL' },
    { orderBy: { createdAt: 'DESC' }, limit: 1 }
  )

  // Find latest pledge payments
  const pledgePayments = await pgdb.public.pledgePayments.find({ pledgeId: pledge.id })

  // Find latest pledge payment
  const payment = await pgdb.public.payments.findOne(
    { id: pledgePayments.map(p => p.paymentId) },
    { orderBy: { createdAt: 'DESC' }, limit: 1 }
  )

  // Used card in payment (if available)
  const card =
    payment.pspPayload &&
    payment.pspPayload.source &&
    payment.pspPayload.source.card

  return {
    ...pledge,
    card
  }
}
