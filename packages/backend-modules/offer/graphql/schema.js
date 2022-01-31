module.exports = `

schema {
  query: queries
}

type queries {
  offer(accessToken: ID): Offer!
}

`
