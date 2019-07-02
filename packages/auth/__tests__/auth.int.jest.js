const { Instance } = require('@orbiting/backend-modules-test')
const OTP = require('otp')
const {
  signIn,
  signOut,
  unauthorizedSession,
  authorizeSession,
  denySession,
  sendPhoneNumberVerificationCode,
  verifyPhoneNumber,
  initTOTPSharedSecret,
  validateTOTPSharedSecret,
  updateTwoFactorAuthentication,
  updateEmail,
  startChallenge,
  Users,
  me: meQuery,
  preferredFirstFactor
} = require('./auth.js')

beforeAll(async () => {
  await Instance.init({ serverName: 'republik' })
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  const { pgdb } = global.instance.context
  await pgdb.public.users.truncate({ cascade: true })
  await pgdb.public.sessions.truncate({ cascade: true })
  global.instance.apolloFetch = global.instance.createApolloFetch()
})

// syntax "helper"
const pgDatabase = () =>
  global.instance.context.pgdb

test('sign in', async () => {
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const { userId } = result
  expect(userId).toBeTruthy()
  expect(userId).toEqual(Users.Unverified.id)
  expect(result.signInResult.data.signIn.tokenType).toBe('EMAIL_TOKEN')
  const tokens = await pgDatabase().public.tokens.find({ 'expiresAt >': new Date(), 'email': Users.Unverified.email })
  const sessions = await pgDatabase().public.sessions.find({ 'sess @>': { 'email': Users.Unverified.email } })
  expect(tokens.length).toBe(1)
  expect(sessions.length).toBe(1)
})

test('sign out', async () => {
  await signIn({ user: Users.Unverified, skipAuthorization: true })
  await signOut()
  const tokens = await pgDatabase().public.tokens.find({ sessionId: null, email: Users.Unverified.email })
  const sessions = await pgDatabase().public.sessions.find()
  expect(tokens.length).toBe(1)
  expect(sessions.length).toBe(0)
})

test('get unauthorized session data via email token', async () => {
  // as Unverified User
  const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const a = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload })
  expect(a.session).toBeFalsy()
  const b = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload: payload + '01' })
  expect(b.session).toBeFalsy()
  const c = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
  expect(c.session).toBeTruthy()
  expect(c.enabledSecondFactors.length).toBe(0)
  await signOut()

  // as TwoFactor User
  const { payload: payload2f } = await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS', 'TOTP']
    },
    skipAuthorization: true
  })
  const aa = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload: payload2f })
  expect(aa.session).toBeFalsy()
  const bb = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload2f + '01' })
  expect(bb.session).toBeFalsy()
  const cc = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload2f })
  expect(cc.session).toBeTruthy()
  expect(cc.enabledSecondFactors.length).toBe(2)
  await signOut()
})

test('deny a session', async () => {
  const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const a = await denySession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
  expect(a).toBeTruthy()
  const tokens = await pgDatabase().public.tokens.find({ 'expiresAt >': new Date() })
  const sessions = await pgDatabase().public.sessions.find({ 'sess @>': { 'expire >': new Date() } })
  expect(tokens.length).toBe(0)
  expect(sessions.length).toBe(0)
})

test('sign in with tokenType APP without devices', async () => {
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true, tokenType: 'APP' })
  expect(result.signInResult.data).toBeFalsy()
  console.log(result.signInResult.errors)
  expect(result.signInResult.errors).toBeTruthy()
})

test('sign in with tokenType APP', async () => {
  // sign in device
  const resultDevice = await signIn({ user: Users.Unverified, skipAuthorization: false, tokenType: 'EMAIL_TOKEN' })
  expect(resultDevice && resultDevice.userId).toBeTruthy()
  const meDevice = await meQuery()
  expect(meDevice && meDevice.data && meDevice.data.me).toBeTruthy()
  expect(meDevice.data.me.id).toBe(Users.Unverified.id)

  let sessions = await pgDatabase().public.sessions.find({ 'sess @>': { 'email': Users.Unverified.email } })
  expect(sessions.length).toBe(1)
  await pgDatabase().public.devices.insert({
    userId: Users.Unverified.id,
    sessionId: sessions[0].id,
    token: 'testtoken',
    information: { os: 'ios', test: true }
  })

  const meDevice2 = await meQuery()
  expect(meDevice2 && meDevice2.data && meDevice2.data.me).toBeTruthy()
  expect(meDevice2.data.me.sessions.find(s => s.isCurrent && s.device)).toBeTruthy()

  // in separate session
  const resultBrowser = await signIn({ user: Users.Unverified, skipAuthorization: true, tokenType: 'APP', newCookieStore: true })
  expect(resultBrowser.signInResult.data.signIn.phrase).toBeTruthy()
  expect(resultBrowser.signInResult.errors).toBeFalsy()

  sessions = await pgDatabase().public.sessions.find({ 'sess @>': { 'email': Users.Unverified.email } })
  expect(sessions.length).toBe(2)

  const tokens = await pgDatabase().public.tokens.find({ email: Users.Unverified.email, type: 'APP' }, { limit: 1 })
  const { payload } = tokens.shift() || {}
  expect(payload).toBeTruthy()

  // authorize APP token in non authorized session must fail
  const resultBrowserAuthorize = await authorizeSession({
    email: Users.Unverified.email,
    tokens: [{ type: 'APP', payload }],
    apolloFetch: resultBrowser.apolloFetch
  })
  expect(resultBrowserAuthorize && resultBrowserAuthorize.errors).toBeTruthy()
  expect(resultBrowserAuthorize.data).toBeFalsy()

  // back in device's session
  const resultDeviceAuthorize = await authorizeSession({
    email: Users.Unverified.email,
    tokens: [{ type: 'APP', payload }]
  })
  expect(resultDeviceAuthorize && resultDeviceAuthorize.data).toBeTruthy()
  expect(resultDeviceAuthorize.errors).toBeFalsy()

  const meBrowser = await meQuery({ apolloFetch: resultBrowser.apolloFetch })
  expect(meBrowser && meBrowser.data && meBrowser.data.me).toBeTruthy()
  expect(meBrowser.data.me.id).toBe(Users.Unverified.id)
  expect(meBrowser.data.me.sessions.length).toBe(2)
})

test('sign in with tokenType APP default tokenType', async () => {
  // sign in device
  const resultDevice = await signIn({ user: Users.Unverified, skipAuthorization: false, tokenType: 'EMAIL_TOKEN' })
  expect(resultDevice && resultDevice.userId).toBeTruthy()
  const meDevice = await meQuery()
  expect(meDevice && meDevice.data && meDevice.data.me).toBeTruthy()
  expect(meDevice.data.me.id).toBe(Users.Unverified.id)

  let sessions = await pgDatabase().public.sessions.find({ 'sess @>': { 'email': Users.Unverified.email } })
  expect(sessions.length).toBe(1)
  await pgDatabase().public.devices.insert({
    userId: Users.Unverified.id,
    sessionId: sessions[0].id,
    token: 'testtoken',
    information: { os: 'ios', test: true }
  })

  const meDevice2 = await meQuery()
  expect(meDevice2 && meDevice2.data && meDevice2.data.me).toBeTruthy()
  expect(meDevice2.data.me.sessions.find(s => s.isCurrent && s.device)).toBeTruthy()

  // in separate session
  const resultSession1 = await signIn({ user: Users.Unverified, skipAuthorization: true, newCookieStore: true })
  expect(
    resultSession1.signInResult.data && resultSession1.signInResult.data.signIn.phrase
  ).toBeTruthy()
  expect(resultSession1.signInResult.errors).toBeFalsy()
  expect(resultSession1.signInResult.data.signIn.tokenType).toBe('APP')

  // change default tokenType
  const resultPreferredFirstFactor = await preferredFirstFactor({ tokenType: 'EMAIL_TOKEN', apolloFetch: resultDevice.apolloFetch })
  expect(resultPreferredFirstFactor && resultPreferredFirstFactor.data).toBeTruthy()
  expect(resultPreferredFirstFactor.errors).toBeFalsy()
  expect(resultPreferredFirstFactor.data.preferredFirstFactor.preferredFirstFactor).toBe('EMAIL_TOKEN')

  // in separate session
  const resultSession2 = await signIn({ user: Users.Unverified, skipAuthorization: true, newCookieStore: true })
  expect(
    resultSession2.signInResult.data && resultSession2.signInResult.data.signIn.phrase
  ).toBeTruthy()
  expect(resultSession2.signInResult.errors).toBeFalsy()
  expect(resultSession2.signInResult.data.signIn.tokenType).toBe('EMAIL_TOKEN')
})

describe('sign in with tokenType EMAIL_CODE', () => {
  const tokenType = 'EMAIL_CODE'
  const MAX_VALID_TOKENS = 5

  test('authorize within same session', async () => {
    const resultSignIn = await signIn({ user: Users.Unverified, tokenType, skipAuthorization: true })
    expect(resultSignIn.signInResult.data.signIn.phrase).toBeTruthy()
    expect(resultSignIn.signInResult.errors).toBeFalsy()

    const resultAuthorize = await authorizeSession({
      email: Users.Unverified.email,
      tokens: [{ type: tokenType, payload: resultSignIn.payload }],
      apolloFetch: resultSignIn.apolloFetch
    })

    expect(resultAuthorize.data && resultAuthorize.data.authorizeSession).toBeTruthy()
  })

  test('denies authorization with different session', async () => {
    const resultSignIn = await signIn({ user: Users.Unverified, tokenType, skipAuthorization: true })
    expect(resultSignIn.signInResult.data.signIn.phrase).toBeTruthy()
    expect(resultSignIn.signInResult.errors).toBeFalsy()

    const resultAuthorize = await authorizeSession({
      email: Users.Unverified.email,
      tokens: [{ type: tokenType, payload: resultSignIn.payload }],
      apolloFetch: global.instance.createApolloFetch()
    })

    expect(resultAuthorize.data).toBeFalsy()
  })

  test('fails if amount of simultaniously valid tokens is exceeded', async () => {
    for (let i = 0; i < MAX_VALID_TOKENS; i++) {
      await signIn({
        user: Users.Unverified,
        tokenType,
        skipAuthorization: true
      })
    }

    const resultSignIn = await signIn({ user: Users.Unverified, tokenType, skipAuthorization: true })
    expect(resultSignIn.signInResult.errors).toBeTruthy()
  })

  test('fails if amount of simultaniously valid tokens in multiple sessions is exceeded', async () => {
    for (let i = 0; i < MAX_VALID_TOKENS; i++) {
      await signIn({
        user: Users.Unverified,
        tokenType,
        skipAuthorization: true,
        newCookieStore: true
      })
    }

    const resultSignIn = await signIn({
      user: Users.Unverified,
      tokenType,
      skipAuthorization: true,
      apolloFetch: global.instance.createApolloFetch()
    })
    expect(resultSignIn.signInResult.errors).toBeTruthy()
  })

  test('authorize after some valid tokens expired', async () => {
    for (let i = 0; i < 5; i++) {
      await signIn({
        user: Users.Unverified,
        tokenType,
        skipAuthorization: true
      })
    }

    const tokens = (await pgDatabase().public.tokens.find(
      { email: Users.Unverified.email }
    ))

    await pgDatabase().public.tokens.update(
      { id: tokens.map(token => token.id)[0] },
      { expiresAt: new Date() }
    )

    const resultSignIn = await signIn({ user: Users.Unverified, tokenType, skipAuthorization: true })
    expect(resultSignIn.signInResult.data.signIn.phrase).toBeTruthy()
    expect(resultSignIn.signInResult.errors).toBeFalsy()
  })
})

describe.only('authorizeSession', () => {
  test('rate limit attempts within session', async () => {
    const resultSignIn = await signIn({
      user: Users.Unverified,
      tokenType: 'EMAIL_TOKEN',
      skipAuthorization: true
    })

    const { apolloFetch } = resultSignIn

    for (let i = 0; i < 10; i++) {
      const resultAuthorize = await authorizeSession({
        email: Users.Unverified.email,
        tokens: [{ type: 'EMAIL_TOKEN', payload: `attempt-${i}` }],
        apolloFetch
      })

      expect(resultAuthorize.data).toBeFalsy()
    }

    const rateLimitedAuthorize = await authorizeSession({
      email: Users.Unverified.email,
      tokens: [{ type: 'EMAIL_TOKEN', payload: resultSignIn.payload }],
      apolloFetch
    })

    expect(rateLimitedAuthorize.data).toBeFalsy()
    expect(rateLimitedAuthorize.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/^Zu viele Anmeldeversuche/)
        })
      ])
    )
  })

  test('rate limit attempts in multiple sessions', async () => {
    const resultSignIn = await signIn({
      user: Users.Unverified,
      tokenType: 'EMAIL_TOKEN',
      skipAuthorization: true,
      newCookieStore: true
    })

    for (let i = 0; i < 10; i++) {
      const resultAuthorize = await authorizeSession({
        email: Users.Unverified.email,
        tokens: [{ type: 'EMAIL_TOKEN', payload: `attempt-${i}` }],
        apolloFetch: global.instance.createApolloFetch()
      })

      expect(resultAuthorize.data).toBeFalsy()
    }

    const rateLimitedAuthorize = await authorizeSession({
      email: Users.Unverified.email,
      tokens: [{ type: 'EMAIL_TOKEN', payload: resultSignIn.payload }],
      apolloFetch: global.instance.createApolloFetch()
    })

    expect(rateLimitedAuthorize.data).toBeFalsy()
    expect(rateLimitedAuthorize.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/^Zu viele Anmeldeversuche/)
        })
      ])
    )
  })
})

test.skip('verify phoneNumber', async () => {
  // without phoneNumber
  await signIn({
    user: {
      ...Users.Member,
      phoneNumber: null
    }
  })
  const a = await sendPhoneNumberVerificationCode()
  expect(a).toBeFalsy()
  await signOut()

  // with SMS 2FA enabled
  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS']
    },
    simulate2FAAuth: true
  })
  const aa = await sendPhoneNumberVerificationCode()
  expect(aa).toBeFalsy()
  await signOut()

  // with unverified phoneNumber
  await signIn({ user: Users.Member })
  const aaa = await sendPhoneNumberVerificationCode()
  expect(aaa).toBeTruthy()
  const verificationCode = (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).phoneNumberVerificationCode
  const bbb = await verifyPhoneNumber({ verificationCode: 'WRONG' })
  expect(bbb).toBeFalsy()
  expect(
    (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified
  ).toBeFalsy()
  const ccc = await verifyPhoneNumber({ verificationCode })
  expect(ccc).toBeTruthy()
  expect(
    (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified
  ).toBeTruthy()
  await signOut()
})

test('setup Time-based-one-time-password authentication (TOTP)', async () => {
  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['TOTP']
    },
    simulate2FAAuth: true
  })
  const a = await initTOTPSharedSecret()
  expect(a.secret).toBeFalsy()
  await signOut()

  await signIn({ user: Users.Member })
  const b = await initTOTPSharedSecret()
  expect(b.secret).toBeTruthy()
  const c = await validateTOTPSharedSecret({ totp: 'WRONG' })
  expect(c).toBeFalsy()
  expect(
    (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified
  ).toBeFalsy()

  const otp = OTP({ secret: b.secret })
  const totp = otp.totp()
  const d = await validateTOTPSharedSecret({ totp })
  expect(d).toBeTruthy()
  expect(
    (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified
  ).toBeTruthy()
  await signOut()
})

test('enable 2 factor authentication', async () => {
  let apolloFetch = global.instance.createApolloFetch()
  await signIn({
    apolloFetch,
    user: {
      ...Users.Member,
      phoneNumber: null
    }
  })
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })).toBeFalsy()
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })).toBeFalsy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })).toBeFalsy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })).toBeFalsy()
  await signOut({ apolloFetch })

  apolloFetch = global.instance.createApolloFetch()
  await signIn({ user: Users.TwoFactorMember })
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })).toBeTruthy()
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })).toBeTruthy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })).toBeTruthy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })).toBeTruthy()
  await signOut({ apolloFetch })

  apolloFetch = global.instance.createApolloFetch()
  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS', 'TOTP']
    },
    simulate2FAAuth: true
  })
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })).toBeFalsy()
  expect(await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })).toBeTruthy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })).toBeFalsy()
  expect(await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })).toBeTruthy()
  await signOut({ apolloFetch })
})

test('update email', async () => {
  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS']
    },
    simulate2FAAuth: true
  })
  const a = await updateEmail({ email: 'gessler@altdorf.ch' })
  expect(a.email).toBeFalsy()
  await signOut()

  await signIn({ user: Users.Member })
  const b = await updateEmail({ email: 'gessler@altdorf.ch' })
  expect(b.email).toBeTruthy()
  await signOut()
})

test.skip('update phone number', async () => {
  expect(true).toBeTruthy()
})

test('authorize a session via 2fa: email, sms', async () => {
  const { payload: emailToken, email } = await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS']
    },
    simulate2FAAuth: true
  })

  const { session: { id: sessionId } } = await unauthorizedSession({
    user: Users.TwoFactorMember,
    type: 'EMAIL_TOKEN',
    payload: emailToken
  })

  const tokens = await pgDatabase().public
    .tokens.find({ sessionId, type: 'EMAIL_TOKEN' })
  expect(tokens.length).toBe(1)

  await startChallenge({ sessionId, type: 'SMS' })

  const { payload: smsCode } = await pgDatabase().public
    .tokens.findOne({ sessionId, type: 'SMS' })

  const { data: fail } = await authorizeSession({
    email,
    tokens: [
      { type: 'SMS', payload: smsCode }
    ]
  })
  expect(fail).toBeFalsy()

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'SMS', payload: smsCode }
    ]
  })
  expect(data.authorizeSession).toBeTruthy()

  await signOut()
})

test('authorize a session 2fa (multiple challenges): email, sms', async () => {
  const { payload: emailToken, email } = await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS']
    },
    simulate2FAAuth: true
  })

  const { session: { id: sessionId } } = await unauthorizedSession({
    user: Users.TwoFactorMember,
    type: 'EMAIL_TOKEN',
    payload: emailToken
  })

  const tokens = await pgDatabase().public
    .tokens.find({ sessionId, type: 'EMAIL_TOKEN' })
  expect(tokens.length).toBe(1)

  await startChallenge({ sessionId, type: 'SMS' })
  await startChallenge({ sessionId, type: 'SMS' })
  await startChallenge({ sessionId, type: 'SMS' })

  const smsTokens = await pgDatabase().public
    .tokens.find(
      { sessionId, type: 'SMS' },
      { orderBy: { createdAt: 'desc' } }
    )

  const { payload: smsCode } = smsTokens.shift()

  // console.log(smsCode)

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'SMS', payload: smsCode }
    ]
  })
  expect(data.authorizeSession).toBeTruthy()

  const expiredTokens = await pgDatabase().public
    .tokens.find({ email, 'expiresAt <': new Date().toISOString() })
  expect(expiredTokens.length).toBe(4)

  await signOut()
})

test('authorize a session via 2fa: email, totp', async () => {
  const { payload: emailToken, email } = await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['TOTP']
    },
    simulate2FAAuth: true
  })

  const { session: { id: sessionId } } = await unauthorizedSession({
    user: Users.TwoFactorMember,
    type: 'EMAIL_TOKEN',
    payload: emailToken
  })

  const tokens = await pgDatabase().public
    .tokens.find({ sessionId, type: 'EMAIL_TOKEN' })
  expect(tokens.length).toBe(1)

  await startChallenge({ sessionId, type: 'TOTP' })

  const totpToken = await pgDatabase().public
    .tokens.find({ sessionId, type: 'TOTP' })
  expect(totpToken.length).toBe(1)

  const secret = Users.TwoFactorMember.TOTPChallengeSecret
  const totpCode = OTP({ secret }).totp()
  expect(totpCode).toBeTruthy()

  const { data: fail } = await authorizeSession({
    email,
    tokens: [
      { type: 'TOTP', payload: totpCode }
    ]
  })
  expect(fail).toBeFalsy()

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'TOTP', payload: totpCode }
    ]
  })
  expect(data.authorizeSession).toBeTruthy()

  const { data: gone } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'TOTP', payload: totpCode }
    ]
  })
  expect(gone).toBeFalsy()

  await signOut()
})

test('authorize older sign in attempt', async () => {
  // 1st signIn attempt
  const { payload, email } = await signIn({
    user: { ...Users.Member },
    skipAuthorization: true
  })

  // Other signIn attempts
  await signIn({
    user: { ...Users.Member },
    skipAuthorization: true
  })
  await signIn({
    user: { ...Users.Member },
    skipAuthorization: true
  })

  const { data } = await authorizeSession({
    email,
    tokens: [{ type: 'EMAIL_TOKEN', payload }]
  })
  expect(data.authorizeSession).toBeTruthy()

  const expiredTokens = await pgDatabase().public
    .tokens.find({ email, 'expiresAt <': new Date().toISOString() })
  expect(expiredTokens.length).toBe(3)

  const { data: gone } = await authorizeSession({
    email,
    tokens: [{ type: 'EMAIL_TOKEN', payload }]
  })
  expect(gone).toBeFalsy()

  await signOut()
})

describe('addUserToRole', () => {
  const ADD_USER_TO_ROLE = `
    mutation addUserToRole($userId: ID!, $role: String!) {
      user: addUserToRole(userId: $userId, role: $role) {
        id
        roles
      }
    }
  `

  const addUserToRole = ({ userId, role }) => {
    return global.instance.apolloFetch({
      query: ADD_USER_TO_ROLE,
      variables: {
        userId, role
      }
    })
  }

  test('Users.Admin adds role to Users.Supporter', async () => {
    await pgDatabase().public.users.insert(Users.Supporter)
    await signIn({ user: Users.Admin })

    const result = await addUserToRole({
      userId: Users.Supporter.id,
      role: 'editor'
    })
    const user = await pgDatabase().public.users.findOne({ id: Users.Supporter.id })
    expect(user.roles).toEqual(['supporter', 'editor'])
    expect(result.data.user.roles).toEqual(['supporter', 'editor'])

    await signOut()
  })

  test('Users.Supporter adds role to Users.Member', async () => {
    await pgDatabase().public.users.insert(Users.Member)
    await signIn({ user: Users.Supporter })

    const result = await addUserToRole({
      userId: Users.Member.id,
      role: 'editor'
    })
    const user = await pgDatabase().public.users.findOne({ id: Users.Member.id })
    expect(user.roles).toEqual(['member'])
    expect(result.errors).toBeTruthy()

    await signOut()
  })
})

describe('removeUserFromRole', () => {
  const REMOVE_USER_FROM_ROLE = `
    mutation removeUserFromRole($userId: ID!, $role: String!) {
      user: removeUserFromRole(userId: $userId, role: $role) {
        id
        roles
      }
    }
  `

  const removeUserFromRole = ({ userId, role }) => {
    return global.instance.apolloFetch({
      query: REMOVE_USER_FROM_ROLE,
      variables: {
        userId, role
      }
    })
  }

  test('Users.Admin removes role from Users.Supporter', async () => {
    await pgDatabase().public.users.insert(Users.Supporter)
    await signIn({ user: Users.Admin })

    const result = await removeUserFromRole({
      userId: Users.Supporter.id,
      role: 'supporter'
    })
    const user = await pgDatabase().public.users.findOne({ id: Users.Supporter.id })
    expect(user.roles).toEqual([])
    expect(result.data.user.roles).toEqual([])

    await signOut()
  })

  test('removeUserFromRole: Users.Supporter removes role from Users.Member', async () => {
    await pgDatabase().public.users.insert(Users.Member)
    await signIn({ user: Users.Supporter })

    const result = await removeUserFromRole({
      userId: Users.Member.id,
      role: 'member'
    })
    const user = await pgDatabase().public.users.findOne({ id: Users.Member.id })
    expect(user.roles).toEqual(['member'])
    expect(result.errors).toBeTruthy()

    await signOut()
  })
})
