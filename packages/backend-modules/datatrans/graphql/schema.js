module.exports = `

schema {
  mutation: mutations
}

type mutations {
  datatransAuthorize(
    pledgeId: ID!
    sourceId: ID!
  ): DatatransAuthorizeResponse!
  datatransInit(
    pledgeId: ID!
    service: DatatransService!
  ): DatatransInitResponse!
  datatransRegistration(
    service: DatatransService!
    companyId: ID!
  ): DatatansRegistrationResponse!
}

`
