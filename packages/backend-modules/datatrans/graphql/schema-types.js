module.exports = `

enum DatatransService {
  CREDITCARD
  POSTFINANCE
  PAYPAL
  TWINT
}

type DatatransAuthorizeResponse {
  paymentId: ID!
}

type DatatransInitResponse {
  authorizeUrl: String!
}

type DatatansRegistrationResponse {
  registrationUrl: String!
}

`
