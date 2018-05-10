const { apolloFetch, pgDatabase } = require('./helpers')

const LOGIN_USER_MUTATION = `
  mutation signIn($email: String!, $context: String) {
    signIn(email: $email, context: $context) {
      phrase
    }
  }
`

const AUTHORIZE_SESSION_MUTATION = `
  mutation authorizeSession($email: String!, $token: String!, $type: SignInTokenType!) {
    authorizeSession(email: $email, tokens: [{ type: $type, payload: $token }])
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

const signIn = async ({ user, context, skipAuthorization = false }) => {
  const { email } = user
  if (!email) return null
  await pgDatabase().public.sessions.truncate({ cascade: true })
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
  const { payload } = await pgDatabase().public.tokens.findOne({
    email: email
  })

  // authorize session by token
  if (!skipAuthorization) {
    await authorizeSession({
      email,
      tokens: [{ type: 'EMAIL_TOKEN', payload }]
    })
  }

  // resolve userId
  const userObject = await pgDatabase().public.users.findOne({ email })
  return {
    userId: userObject && userObject.id,
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

const signOut = async ({ skipTruncation = false }) => {
  await apolloFetch({
    query: LOGOUT_USER_MUTATION
  })
  if (!skipTruncation) {
    await pgDatabase().public.sessions.truncate({ cascade: true })
  }
  return true
}

const Unverified = {
  id: 'a0000000-0000-0000-0001-000000000001',
  firstName: 'willhelm tell',
  lastName: 'unverified',
  email: 'willhelmtell@project-r.construction',
  roles: ['member'],
  verified: false
}

const Member = {
  id: 'a0000000-0000-0000-0001-000000000002',
  firstName: 'willhelm tell',
  lastName: 'member',
  email: 'willhelmtell_member@project-r.construction',
  roles: ['member'],
  verified: true
}

const Supporter = {
  id: 'a0000000-0000-0000-0001-000000000003',
  firstName: 'willhelm tell',
  lastName: 'supporter',
  email: 'willhelmtell_supporter@project-r.construction',
  roles: ['supporter'],
  verified: true
}

const Admin = {
  id: 'a0000000-0000-0000-0001-000000000004',
  firstName: 'willhelm tell',
  lastName: 'admin',
  email: 'willhelmtell_admin@project-r.construction',
  roles: ['admin'],
  verified: true
}

const TwoFactorMember = {
  id: 'a0000000-0000-0000-0001-000000000005',
  firstName: 'willhelm tell with 2fa',
  lastName: 'member',
  email: 'willhelmtell_2fa_member@project-r.construction',
  roles: ['member'],
  phoneNumber: '+41770000000',
  phoneNumberVerificationCode: 'GUGUS',
  isPhoneNumberVerified: false,
  TOTPChallengeSecret: 'JVJTCLCFOQTDMZBSHQSHQ3B2MESXOO2WPF2HCYJEJB5TCRRMII7A',
  isTOTPChallengeSecretVerified: false,
  verified: true,
  enabledSecondFactors: []
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
  Users: {
    Supporter,
    Unverified,
    Anonymous,
    Member,
    TwoFactorMember,
    Admin
  }
}
