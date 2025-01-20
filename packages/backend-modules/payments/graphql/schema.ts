export = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  getOffers(promoCode: String): [Offer!]!
  getOffer(offerId: ID!, promoCode: String): Offer
}

type mutations {
  createCheckoutSession(offerId: ID!, promoCode: String options: CheckoutSessionOptions): CheckoutSession
  cancelMagazineSubscription(args: CancelSubscription): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
