export = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  getOffers(promoCode: String): [Offer!]!
  getOffer(offerId: ID!, promoCode: String): Offer
  validateGiftVoucher(voucherCode: String!): GiftVoucherValidationResult
}

type mutations {
  redeemGiftVoucher(voucherCode: String): RedeemGiftResult
  createCheckoutSession(
    offerId: ID!,
    promoCode: String,
    withDonation: ID
    withCustomDonation: CustomDonation
    withSelectedDiscount: ID
    complimentaryItems: [ComplimentaryItemOrder]
    options: CheckoutSessionOptions
  ): CheckoutSession
  cancelMagazineSubscription(subscriptionId: String!, cancelimmediately: Boolean, feedback: String): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
