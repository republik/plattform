const { apolloFetch, pgDatabase } = require('./helpers')

const LOGIN_USER_MUTATION = `
  mutation signIn($email: String!, $context: String) {
    signIn(email: $email, context: $context) {
      phrase
    }
  }
`

const AUTHORIZE_SESSION_MUTATION = `
  mutation authorizeSession($email: String!, $tokens: [SignInToken!]!) {
    authorizeSession(email: $email, tokens: $tokens)
  }
`

const LOGOUT_USER_MUTATION = `
  mutation signOut {
    signOut
  }
`

const authorizeSession = async ({ email, tokens }) => {
  return apolloFetch({
    query: AUTHORIZE_SESSION_MUTATION,
    variables: {
      email,
      tokens
    }
  })
}

const signIn = async ({
  user,
  context,
  skipAuthorization = false,
  simulate2FAAuth = false,
  skipTruncate = false
}) => {
  const { email } = user

  if (!email) {
    return null
  }

  if (!skipTruncate) {
    await pgDatabase().public.sessions.truncate({ cascade: true })
  }

  try {
    await pgDatabase().public.users.insert(user)
  } catch (e) {
    const { id, ...userData } = user
    await pgDatabase().public.users.updateOne({ id }, userData)
  }

  // start login process
  await apolloFetch({
    query: LOGIN_USER_MUTATION,
    variables: {
      email,
      context
    }
  })

  const tokens = await pgDatabase().public
    .tokens.find({ email: email }, { limit: 1 })

  const { payload, sessionId } = tokens.shift()

  if (simulate2FAAuth) {
    const session = await pgDatabase().public.sessions.findOne({
      id: sessionId
    })
    await pgDatabase().public.sessions.updateOne({
      id: sessionId
    }, {
      'sess': {
        ...session.sess,
        passport: {
          user: user.id
        }
      }
    })
  } else if (!skipAuthorization) {
    await authorizeSession({
      email,
      tokens: [{ type: 'EMAIL_TOKEN', payload }]
    })
  }

  // resolve userId
  const users = await pgDatabase().public
    .users.find({ email }, { limit: 1 })

  return {
    userId: users.length > 0 && users[0].id,
    payload,
    email
  }
}

const unauthorizedSession = async ({ user, type, payload }) => {
  const result = await apolloFetch({
    query: `
      query unauthorizedSession($email: String!, $type: SignInTokenType!, $payload: String!) {
        unauthorizedSession(email: $email, token: { type: $type, payload: $payload }) {
          session {
            id
            email
            ipAddress
            isCurrent
          }
          enabledSecondFactors
        }
      }
    `,
    variables: {
      email: user.email,
      type,
      payload
    }
  })
  return (result && result.data && result.data.unauthorizedSession) || {}
}

const denySession = async ({ user, type, payload }) => {
  const result = await apolloFetch({
    query: `
      mutation denySession($email: String!, $type: SignInTokenType!, $payload: String!) {
        denySession(email: $email, token: { type: $type, payload: $payload })
      }
    `,
    variables: {
      email: user.email,
      type,
      payload
    }
  })
  return result && result.data && result.data.denySession
}

const updateTwoFactorAuthentication = async ({ enabled, type }) => {
  const result = await apolloFetch({
    query: `
      mutation updateTwoFactorAuthentication($enabled: Boolean!, $type: SignInTokenType!) {
        updateTwoFactorAuthentication(enabled: $enabled, type: $type)
      }
    `,
    variables: {
      enabled,
      type
    }
  })
  return result && result.data && result.data.updateTwoFactorAuthentication
}

const sendPhoneNumberVerificationCode = async () => {
  const result = await apolloFetch({
    query: `
      mutation sendPhoneNumberVerificationCode {
        sendPhoneNumberVerificationCode
      }
    `
  })
  return result && result.data && result.data.sendPhoneNumberVerificationCode
}

const verifyPhoneNumber = async ({ verificationCode }) => {
  const result = await apolloFetch({
    query: `
      mutation verifyPhoneNumber($verificationCode: String!) {
        verifyPhoneNumber(verificationCode: $verificationCode)
      }
    `,
    variables: {
      verificationCode
    }
  })
  return result && result.data && result.data.verifyPhoneNumber
}

const signOut = async (options) => {
  const { skipTruncation = false } = options || {}
  await apolloFetch({
    query: LOGOUT_USER_MUTATION
  })
  if (!skipTruncation) {
    await pgDatabase().public.sessions.truncate({ cascade: true })
  }
  return true
}

const initTOTPSharedSecret = async () => {
  const result = await apolloFetch({
    query: `
      mutation initTOTPSharedSecret {
        initTOTPSharedSecret {
          secret
        }
      }
    `
  })
  return (result && result.data && result.data.initTOTPSharedSecret) || {}
}

const validateTOTPSharedSecret = async ({ totp }) => {
  const result = await apolloFetch({
    query: `
      mutation validateTOTPSharedSecret($totp: String!) {
        validateTOTPSharedSecret(totp: $totp)
      }
    `,
    variables: {
      totp
    }
  })
  return result && result.data && result.data.validateTOTPSharedSecret
}

const updateEmail = async ({ email }) => {
  const result = await apolloFetch({
    query: `
      mutation updateEmail($email: String!) {
        updateEmail(email: $email) {
          email
        }
      }
    `,
    variables: {
      email
    }
  })
  return (result && result.data && result.data.updateEmail) || {}
}

const startChallenge = async ({ sessionId, type }) => {
  const result = await apolloFetch({
    query: `
      mutation startChallenge($sessionId: ID!, $type: SignInTokenType!) {
        startChallenge(sessionId: $sessionId, type: $type)
      }
    `,
    variables: {
      sessionId,
      type
    }
  })
  return (result && result.data && result.data.updateEmail) || {}
}

const Unverified = {
  id: 'a0000000-0000-4000-8001-000000000001',
  firstName: 'willhelm tell',
  lastName: 'unverified',
  email: 'willhelmtell@project-r.construction',
  roles: ['member'],
  phoneNumber: null,
  phoneNumberVerificationCode: null,
  isPhoneNumberVerified: false,
  TOTPChallengeSecret: null,
  isTOTPChallengeSecretVerified: false,
  enabledSecondFactors: [],
  verified: false
}

const Member = {
  id: 'a0000000-0000-4000-9001-000000000002',
  firstName: 'willhelm tell',
  lastName: 'member',
  email: 'willhelmtell_member@project-r.construction',
  roles: ['member'],
  phoneNumber: '+41770000000',
  phoneNumberVerificationCode: null,
  isPhoneNumberVerified: false,
  TOTPChallengeSecret: null,
  isTOTPChallengeSecretVerified: false,
  enabledSecondFactors: [],
  verified: true
}

const Supporter = {
  id: 'a0000000-0000-4000-a001-000000000003',
  firstName: 'willhelm tell',
  lastName: 'supporter',
  email: 'willhelmtell_supporter@project-r.construction',
  roles: ['supporter'],
  phoneNumber: '+41770000000',
  phoneNumberVerificationCode: null,
  isPhoneNumberVerified: false,
  TOTPChallengeSecret: null,
  isTOTPChallengeSecretVerified: false,
  enabledSecondFactors: [],
  verified: true
}

const Admin = {
  id: 'a0000000-0000-4000-b001-000000000004',
  firstName: 'willhelm tell',
  lastName: 'admin',
  email: 'willhelmtell_admin@project-r.construction',
  roles: ['admin'],
  phoneNumber: '+41770000000',
  phoneNumberVerificationCode: null,
  isPhoneNumberVerified: false,
  TOTPChallengeSecret: null,
  isTOTPChallengeSecretVerified: false,
  enabledSecondFactors: [],
  verified: true
}

const TwoFactorMember = {
  id: 'a0000000-0000-4000-8001-000000000005',
  firstName: 'willhelm tell with 2fa',
  lastName: 'member',
  email: 'willhelmtell_2fa_member@project-r.construction',
  roles: ['member'],
  phoneNumber: '+41770000000',
  phoneNumberVerificationCode: 'GUGUS',
  isPhoneNumberVerified: true,
  TOTPChallengeSecret: 'JVJTCLCFOQTDMZBSHQSHQ3B2MESXOO2WPF2HCYJEJB5TCRRMII7A',
  isTOTPChallengeSecretVerified: true,
  enabledSecondFactors: [],
  verified: true
}

const Anonymous = {
  firstName: null,
  lastName: null,
  email: null
}

module.exports = {
  signIn,
  signOut,
  unauthorizedSession,
  denySession,
  authorizeSession,
  updateTwoFactorAuthentication,
  sendPhoneNumberVerificationCode,
  verifyPhoneNumber,
  initTOTPSharedSecret,
  validateTOTPSharedSecret,
  updateEmail,
  startChallenge,
  Users: {
    Supporter,
    Unverified,
    Anonymous,
    Member,
    TwoFactorMember,
    Admin
  }
}
