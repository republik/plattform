module.exports = `

schema {
  mutation: mutations
}

type mutations {
  datatransAuthorize(
    pledgeId: ID!
    sourceId: ID!
    accessToken: ID
  ): DatatransAuthorizeResponse!
  datatransInit(
    pledgeId: ID!
    method: PaymentMethod!
    accessToken: ID
  ): DatatransInitResponse!
  datatransRegistration(
    method: PaymentMethod!
    companyId: ID!
  ): DatatansRegistrationResponse!
}

`
