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
  createCheckoutSession(offerId: ID!, promoCode: String, complimentaryItems: [ComplimentaryItemOrder] options: CheckoutSessionOptions): CheckoutSession
  cancelMagazineSubscription(args: CancelSubscription): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
