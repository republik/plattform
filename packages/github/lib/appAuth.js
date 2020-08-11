const jwt = require('jsonwebtoken')
const fetch = require('isomorphic-unfetch')
const checkEnv = require('check-env')

const {
  GITHUB_APP_ID,
  GITHUB_APP_KEY,
  GITHUB_INSTALLATION_ID
} = process.env

const getAppJWT = () => {
  const now = Math.floor(Date.now() / 1000)

  const payload = {
    // issued at time
    iat: now,
    // JWT expiration time (10 minute maximum, 5 for inaccurate times)
    exp: now + (5 * 60),
    // GitHub App's identifier
    iss: GITHUB_APP_ID
  }

  const key = Buffer.from(
    GITHUB_APP_KEY
      .replace(/@/g, '\n')
      .replace(/\\\s/g, ' ')
    , 'utf-8'
  )

  const token = jwt.sign(
    payload,
    key,
    { algorithm: 'RS256' }
  )

  return token
}

const getInstallationToken = async () => {
  checkEnv([
    'GITHUB_APP_ID',
    'GITHUB_APP_KEY',
    'GITHUB_INSTALLATION_ID'
  ])

  const response = await fetch(
    `https://api.github.com/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAppJWT()}`,
        Accept: 'application/vnd.github.machine-man-preview+json'
      }
    }
  )
    .then(response => response.json())
    .catch(error => {
      return error
    })

  if (!response.token) {
    console.error('Error getting installation token:', response)
    throw new Error('Error getting installation token', response)
  }

  const {
    token
  } = response
  const expiresAt = new Date(response.expires_at)

  console.log(`new GitHub installation token expires at: ${expiresAt}`)

  return {
    token,
    expiresAt
  }
}

module.exports = {
  getInstallationToken
}
