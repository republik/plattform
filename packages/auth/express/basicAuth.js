const basicAuth = require('express-basic-auth')

const {
  BASIC_AUTH_PASS,
  BASIC_AUTH_USER,
  BASIC_AUTH_REALM
} = process.env

module.exports = (server) => {
  if (BASIC_AUTH_PASS) {
    server.use(
      basicAuth({
        users: {
          [BASIC_AUTH_USER]: BASIC_AUTH_PASS
        },
        challenge: true,
        realm: BASIC_AUTH_REALM
      })
    )
  }
}
