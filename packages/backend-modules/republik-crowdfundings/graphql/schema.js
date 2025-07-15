module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  crowdfundings: [Crowdfunding]
  crowdfunding(name: String!): Crowdfunding!
  pledges: [Pledge!]!
  pledge(id: ID!): Pledge
  draftPledge(id: ID!): Pledge!

  # required role: supporter
  adminUsers(
    limit: Int!,
    offset: Int,
    search: String,
  ): Users!

  # required role: supporter
  payments(
    limit: Int!,
    offset: Int, orderBy: OrderBy,
    search: String,
    dateRangeFilter: DateRangeFilter,
    stringArrayFilter: StringArrayFilter,
    booleanFilter: BooleanFilter
  ): PledgePayments!

  # required role: supporter
  postfinancePayments(
    limit: Int!,
    offset: Int,
    orderBy: OrderBy,
    search: String,
    dateRangeFilter: DateRangeFilter,
    stringArrayFilter: StringArrayFilter,
    booleanFilter: BooleanFilter
  ): PostfinancePayments!

  # This exports a CSV containing all payments IN paymentIds
  # required role: accountant
  paymentsCSV(companyName: String!, paymentIds: [ID!]): String!

  cancellationCategories(showMore: Boolean): [CancellationCategory!]!

  membershipPotStats: MembershipPotStats!
}

type mutations {
  submitPledge(pledge: PledgeInput, consents: [String!]): PledgeResponse!
  payPledge(pledgePayment: PledgePaymentInput): PledgeResponse!
  reclaimPledge(pledgeId: ID!): Boolean!
  claimMembership(voucherCode: String!): Boolean!
  # adds a new paymentSource and makes it the default
  addPaymentSource(sourceId: String!, pspPayload: JSON!): [PaymentSource!]!
  # Adds a new paymentSource without making it the default.
  # Call setDefaultPaymentMethod after a successful confirmCardSetup.
  # SetupIntent is created on the specified company
  addPaymentMethod(stripePlatformPaymentMethodId: ID!, companyId: ID!): AddPaymentMethodResponse!
  setDefaultPaymentMethod(stripePlatformPaymentMethodId: ID!): [PaymentSource!]!

  # sync the status of a paymentIntent
  syncPaymentIntent(stripePaymentIntentId: ID!, companyId: ID!): SyncPledgeResponse!

  # Activate an existing membership.
  # required role: supporter
  activateMembership(id: ID!): Membership!

  cancelMembership(
    id: ID!
    immediately: Boolean
    details: CancellationInput!
  ): Membership!

  updateMembershipCancellation(
    id: ID!
    details: CancellationInput!
  ): Cancellation!

  # MONTHLY_ABO: if cancelled immediately a new subscription is created
  # if canceled !immediately and subscription is still running, it is
  # reactivated.
  # YEARLYs are activated and a new membershipPeriod is inserted
  reactivateMembership(id: ID!): Membership!

  # Reset a membership
  resetMembership(id: ID!): Membership!

  # merges the belongings from source to target
  # required role: admin
  mergeUsers(targetUserId: ID!, sourceUserId: ID!): User!

  # required role: supporter
  # only in case of status === 'DRAFT' the pledge is deleted
  # and nothing is returned
  cancelPledge(pledgeId: ID!): Pledge

  # Tries to resolve the amount of a pledge to the total of it's PAID payment.
  # This comes handy if e.g. the payment is off by some cents (foreign wire transfer)
  # and the backoffice decides to not demand an additional wire transfer.
  # Required role: supporter
  resolvePledgeToPayment(pledgeId: ID!, reason: String!): Pledge!

  # required role: supporter
  updatePayment(paymentId: ID!, status: PaymentStatus!, reason: String): PledgePayment!

  # required role: supporter
  updatePostfinancePayment(pfpId: ID!, mitteilung: String!): PostfinancePayment!

  # This imports a CSV exported by PostFinance
  # required role: accountant
  importPostfinanceCSV(csv: String!): String!

  # required role: supporter
  rematchPayments: String!

  # required role: supporter
  sendPaymentReminders(dryRun: Boolean!): String!

  # required role: supporter
  hidePostfinancePayment(id: ID!): PostfinancePayment!

  # required role: supporter
  manuallyMatchPostfinancePayment(id: ID!): PostfinancePayment!

  # Moves the pledge and accompanying (unclaimed) memberships from one user to another
  # required role: supporter
  movePledge(pledgeId: ID!, userId: ID!): Pledge!

  # Moves a memberships from one user to another, like it was claimed
  # except it doesn't get activated if it isn't
  # required role: supporter
  moveMembership(membershipId: ID!, userId: ID!): Membership!

  # updates notes to a user
  # required role: supporter
  updateAdminNotes(userId: ID!, notes: String): User!

  # generates a pledge (payment method: PAYMENTSLIP) with one membership (type: ABO)
  # for the specified user.
  # required role: supporter
  generateMembership(userId: ID!): Membership!

  # if the user never bought something from us, he/she is deleted completely
  # if there was a purchase, everything except what we legally must store is deleted
  # required role: admin
  deleteUser(userId: ID!, unpublishComments: Boolean): User

  # required role: supporter
  setMembershipAutoPay(id: ID!, autoPay: Boolean!): Membership!

  # required role: supporter
  appendPeriod(id: ID!, duration: Int!, durationUnit: MembershipTypeInterval!): Membership!
}
`
