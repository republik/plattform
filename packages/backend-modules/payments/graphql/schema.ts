export = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  getOffers: [Offer!]!
  getOffer(offerId: ID!): Offer
}

type mutations {
  createCheckoutSession(args: CheckoutSessionArgs!): String
  cancelMagazineSubscription(args: CancelSubscription): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
