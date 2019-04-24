const LOGIN_USER_MUTATION = `
  mutation signIn($email: String!, $context: String, $tokenType: SignInTokenType) {
    signIn(email: $email, context: $context, consents: ["PRIVACY"], tokenType: $tokenType) {
      phrase
      tokenType
    }
  }
`

const AUTHORIZE_SESSION_MUTATION = `
  mutation authorizeSession($email: String!, $tokens: [SignInToken!]!) {
    authorizeSession(email: $email, tokens: $tokens)
  }
`

const PREFERED_FIRST_FACTOR_MUTATION = `
  mutation preferredFirstFactor($tokenType: SignInTokenType!) {
    preferredFirstFactor(tokenType: $tokenType) {
      id
      preferredFirstFactor
    }
  }
`

const LOGOUT_USER_MUTATION = `
  mutation signOut {
    signOut
  }
`

const authorizeSession = async ({ email, tokens, apolloFetch = global.instance.apolloFetch }) => {
  return apolloFetch({
    query: AUTHORIZE_SESSION_MUTATION,
    variables: {
      email,
      tokens
    }
  })
}

const preferredFirstFactor = async ({ tokenType, apolloFetch = global.instance.apolloFetch }) => {
  return apolloFetch({
    query: PREFERED_FIRST_FACTOR_MUTATION,
    variables: {
      tokenType
    }
  })
}

const signIn = async ({
  apolloFetch,
  user,
  context,
  skipAuthorization = false,
  simulate2FAAuth = false,
  tokenType = null,
  newCookieStore = false
}) => {
  const { pgdb } = global.instance.context

  const { email } = user
  if (!email) {
    return null
  }

  apolloFetch = apolloFetch || newCookieStore
    ? global.instance.createApolloFetch()
    : global.instance.apolloFetch

  try {
    await pgdb.public.users.insert(user)
  } catch (e) {
    const { id, ...userData } = user
    await pgdb.public.users.updateOne({ id }, userData)
  }

  // start login process
  const signInResult = await apolloFetch({
    query: LOGIN_USER_MUTATION,
    variables: {
      email,
      context,
      tokenType
    }
  })

  const tokens = await pgdb.public.tokens.find({ email: email }, { limit: 1 })

  const { payload, sessionId, type: tokenTypeResult } = tokens.shift() || {}

  if (simulate2FAAuth) {
    const session = await pgdb.public.sessions.findOne({
      id: sessionId
    })
    await pgdb.public.sessions.updateOne({
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
      tokens: [{ type: tokenTypeResult, payload }],
      apolloFetch
    })
  }

  // resolve userId
  const dbUser = await pgdb.public.users.findOne({ email })
  return {
    userId: dbUser && dbUser.id,
    dbUser,
    payload,
    email,
    signInResult,
    apolloFetch
  }
}

const unauthorizedSession = async ({ user, type, payload, apolloFetch = global.instance.apolloFetch }) => {
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

const denySession = async ({ user, type, payload, apolloFetch = global.instance.apolloFetch }) => {
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

const updateTwoFactorAuthentication = async ({ enabled, type, apolloFetch = global.instance.apolloFetch }) => {
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

const sendPhoneNumberVerificationCode = async ({ apolloFetch = global.instance.apolloFetch } = {}) => {
  const result = await apolloFetch({
    query: `
      mutation sendPhoneNumberVerificationCode {
        sendPhoneNumberVerificationCode
      }
    `
  })
  return result && result.data && result.data.sendPhoneNumberVerificationCode
}

const verifyPhoneNumber = async ({ verificationCode, apolloFetch = global.instance.apolloFetch }) => {
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

const signOut = async ({ apolloFetch = global.instance.apolloFetch } = {}) => {
  await apolloFetch({
    query: LOGOUT_USER_MUTATION
  })
  const result = await me({ apolloFetch })
  expect(result).toBeTruthy()
  expect(result.data).toBeTruthy()
  expect(result.data.me).toBeFalsy()
}

const initTOTPSharedSecret = async ({ apolloFetch = global.instance.apolloFetch } = {}) => {
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

const validateTOTPSharedSecret = async ({ totp, apolloFetch = global.instance.apolloFetch }) => {
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

const updateEmail = async ({ email, apolloFetch = global.instance.apolloFetch }) => {
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

const startChallenge = async ({ sessionId, type, apolloFetch = global.instance.apolloFetch }) => {
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

const me = async ({ apolloFetch = global.instance.apolloFetch } = {}) => {
  return apolloFetch({
    query: `
      query me {
        me {
          id
          email
          sessions {
            id
            isCurrent
            device {
              id
            }
          }
        }
      }
    `
  })
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

const Editor = {
  id: 'a0000000-0000-4000-8001-000000000010',
  email: 'alice.smith@test.project-r.construction',
  roles: [ 'editor' ],
  firstName: 'Alice',
  lastName: 'Smith'
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
  me,
  preferredFirstFactor,
  Users: {
    Supporter,
    Unverified,
    Anonymous,
    Member,
    TwoFactorMember,
    Admin,
    Editor
  }
}
