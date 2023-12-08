module.exports = `

enum DatatransService {
  CREDITCARD
  POSTFINANCE
  PAYPAL
  TWINT
}

type DatatransInitResponse {
  authorizeUrl: String!
}

`
