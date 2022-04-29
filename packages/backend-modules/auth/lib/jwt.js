const jwt = require('jsonwebtoken')

let privateKey = null

function getJWTForUser(user, sessionId) {
  if (!privateKey && process.env.JWT_PRIVATE_KEY) {
    if (!process.env.JWT_PRIVATE_KEY) {
      throw new Error('env variableJWT_PRIVATE_KEY is missing')
    }

    privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString()
  }

  const userToken = jwt.sign(
    {
      email: user.email,
      roles: user.roles,
    },
    {
      key: privateKey,
      passphrase: 'secret',
    },
    {
      jwtid: sessionId,
      algorithm: 'RS256',
    },
  )

  return userToken
}

exports.getJWTForUser = getJWTForUser
