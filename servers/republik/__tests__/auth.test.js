const test = require('tape-async')
const OTP = require('otp')
const { connectIfNeeded, pgDatabase } = require('./helpers.js')
const { signIn,
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

const prepare = async () => {
  await connectIfNeeded()
  await pgDatabase().public.users.truncate({ cascade: true })
}

test('sign in', async (t) => {
  await prepare()
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true })
  t.ok(result && result.userId, 'reportedly started sign in request as unverified user')
  t.equal(result.signInResult.data.signIn.tokenType, 'EMAIL_TOKEN', 'EMAIL_TOKEN is the default tokenType')
  const tokens = await pgDatabase().public.tokens.find({ 'expiresAt >': new Date(), 'email': Users.Unverified.email })
  const sessions = await pgDatabase().public.sessions.find({'sess @>': { 'email': Users.Unverified.email }})
  t.equal(tokens.length, 1, 'created a new token for mail')
  t.equal(sessions.length, 1, 'created new session')
  await signOut()
  t.end()
})

test('sign out', async (t) => {
  await prepare()
  await signIn({ user: Users.Unverified, skipAuthorization: true })
  const result = await signOut({ skipTruncation: true })
  t.ok(result, 'sign out reportedly successful')
  const tokens = await pgDatabase().public.tokens.find({ sessionId: null, email: Users.Unverified.email })
  const sessions = await pgDatabase().public.sessions.find()
  t.equal(tokens.length, 1, 'sessionId mapping of token removed')
  t.equal(sessions.length, 0, 'sessions cleared')
  t.end()
})

test('get unauthorized session data via email token', async (t) => {
  await prepare()

  // as Unverified User
  const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const a = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload })
  t.notOk(a.session, 'wrong e-mail address is used in combination with correct token')
  const b = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload: payload + '01' })
  t.notOk(b.session, 'correct e-mail address is used in combination with wrong token')
  const c = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
  t.ok(c.session, 'e-mail and token are correct')
  t.equal(c.enabledSecondFactors.length, 0, 'unverified users are always on 1fa')
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
  t.notOk(aa.session, 'wrong e-mail address is used in combination with correct token')
  const bb = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload2f + '01' })
  t.notOk(bb.session, 'correct e-mail address is used in combination with wrong token')
  const cc = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload2f })
  t.ok(cc.session, 'e-mail and token are correct')
  t.equal(cc.enabledSecondFactors.length, 2, 'should return SMS + TOTP')
  await signOut()

  t.end()
})

test('deny a session', async (t) => {
  await prepare()
  const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const a = await denySession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
  t.ok(a, 'session has been reportedly denied')
  const tokens = await pgDatabase().public.tokens.find({'expiresAt >': new Date()})
  const sessions = await pgDatabase().public.sessions.find({'sess @>': { 'expire >': new Date() }})
  t.equal(tokens.length, 0, 'all tokens expired')
  t.equal(sessions.length, 0, 'all sessions expired')
  t.end()
})

test('sign in with tokenType APP without devices', async (t) => {
  await prepare()
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true, tokenType: 'APP' })
  t.notOk(result.signInResult.data, 'no data from signIn')
  console.log(result.signInResult.errors)
  t.ok(result.signInResult.errors, 'error thrown tokenType not available')
  t.end()
})

test('sign in with tokenType APP', async (t) => {
  await prepare()
  // sign in device
  const resultDevice = await signIn({ user: Users.Unverified, skipAuthorization: false, tokenType: 'EMAIL_TOKEN' })
  t.ok(resultDevice && resultDevice.userId, 'started signIn request')
  const meDevice = await meQuery()
  t.ok(meDevice && meDevice.data && meDevice.data.me, 'me query on device')
  t.equals(meDevice.data.me.id, Users.Unverified.id, 'me query on device returned current user')

  let sessions = await pgDatabase().public.sessions.find({'sess @>': { 'email': Users.Unverified.email }})
  t.equal(sessions.length, 1, 'created new session')
  await pgDatabase().public.devices.insert({
    userId: Users.Unverified.id,
    sessionId: sessions[0].id,
    token: 'testtoken',
    information: { os: 'ios', test: true }
  })

  const meDevice2 = await meQuery()
  t.ok(meDevice2 && meDevice2.data && meDevice2.data.me, 'me query on device with device added')
  t.ok(meDevice2.data.me.sessions.find(s => s.isCurrent && s.device), 'current session has device')

  // in separate session
  const resultBrowser = await signIn({ user: Users.Unverified, skipAuthorization: true, tokenType: 'APP', newCookieStore: true, skipTruncate: true })
  t.ok(resultBrowser.signInResult.data && resultBrowser.signInResult.data.signIn.phrase, 'signIn with APP initiated')
  t.notOk(resultBrowser.signInResult.errors, 'no errors thrown')

  sessions = await pgDatabase().public.sessions.find({'sess @>': { 'email': Users.Unverified.email }})
  t.equal(sessions.length, 2, 'two sessions present')

  const tokens = await pgDatabase().public.tokens.find({ email: Users.Unverified.email, type: 'APP' }, { limit: 1 })
  const { payload } = tokens.shift() || {}
  t.ok(payload, 'APP token is present')

  // authorize APP token in non authorized session must fail
  const resultBrowserAuthorize = await authorizeSession({
    email: Users.Unverified.email,
    tokens: [{ type: 'APP', payload }],
    apolloFetch: resultBrowser.apolloFetch
  })
  t.ok(resultBrowserAuthorize && resultBrowserAuthorize.errors, 'authorize APP token in unauthorized session fails')
  t.notOk(resultBrowserAuthorize.data, 'authorize APP token in unauthorized session fails')

  // back in device's session
  const resultDeviceAuthorize = await authorizeSession({
    email: Users.Unverified.email,
    tokens: [{ type: 'APP', payload }]
  })
  t.ok(resultDeviceAuthorize && resultDeviceAuthorize.data, 'authorize on device successfull')
  t.notOk(resultDeviceAuthorize.errors, 'authorize on device no errors')

  const meBrowser = await meQuery({apolloFetch: resultBrowser.apolloFetch})
  t.ok(meBrowser && meBrowser.data && meBrowser.data.me, 'me query in browser')
  t.equals(meBrowser.data.me.id, Users.Unverified.id, 'me query in browser returned current user')
  t.equals(meBrowser.data.me.sessions.length, 2, 'me has two sessions')

  t.end()
})

test('sign in with tokenType APP default tokenType', async (t) => {
  await prepare()
  // sign in device
  const resultDevice = await signIn({ user: Users.Unverified, skipAuthorization: false, tokenType: 'EMAIL_TOKEN' })
  t.ok(resultDevice && resultDevice.userId, 'started signIn request')
  const meDevice = await meQuery()
  t.ok(meDevice && meDevice.data && meDevice.data.me, 'me query on device')
  t.equals(meDevice.data.me.id, Users.Unverified.id, 'me query on device returned current user')

  let sessions = await pgDatabase().public.sessions.find({'sess @>': { 'email': Users.Unverified.email }})
  t.equal(sessions.length, 1, 'created new session')
  await pgDatabase().public.devices.insert({
    userId: Users.Unverified.id,
    sessionId: sessions[0].id,
    token: 'testtoken',
    information: { os: 'ios', test: true }
  })

  const meDevice2 = await meQuery()
  t.ok(meDevice2 && meDevice2.data && meDevice2.data.me, 'me query on device with device added')
  t.ok(meDevice2.data.me.sessions.find(s => s.isCurrent && s.device), 'current session has device')

  // in separate session
  const resultSession1 = await signIn({ user: Users.Unverified, skipAuthorization: true, newCookieStore: true, skipTruncate: true })
  t.ok(resultSession1.signInResult.data && resultSession1.signInResult.data.signIn.phrase, 'signIn initiated')
  t.notOk(resultSession1.signInResult.errors, 'no errors thrown')
  t.equals(resultSession1.signInResult.data.signIn.tokenType, 'APP', 'APP is the default tokenType without settings')

  // change default tokenType
  const resultPreferredFirstFactor = await preferredFirstFactor({tokenType: 'EMAIL_TOKEN', apolloFetch: resultDevice.apolloFetch})
  t.ok(resultPreferredFirstFactor && resultPreferredFirstFactor.data, 'changed preferredFirstFactor')
  t.notOk(resultPreferredFirstFactor.errors, 'change preferredFirstFactor no errors')
  t.equals(resultPreferredFirstFactor.data.preferredFirstFactor.preferredFirstFactor, 'EMAIL_TOKEN', 'change preferredFirstFactor reported EMAIL_TOKEN')

  // in separate session
  const resultSession2 = await signIn({ user: Users.Unverified, skipAuthorization: true, newCookieStore: true, skipTruncate: true })
  t.ok(resultSession2.signInResult.data && resultSession2.signInResult.data.signIn.phrase, 'signIn initiated')
  t.notOk(resultSession2.signInResult.errors, 'no errors thrown')
  t.equals(resultSession2.signInResult.data.signIn.tokenType, 'EMAIL_TOKEN', 'EMAIL_TOKEN is the default tokenType')

  t.end()
})

test('verify phoneNumber', async (t) => {
  await prepare()

  // without phoneNumber
  await signIn({
    user: {
      ...Users.Member,
      phoneNumber: null
    }
  })
  const a = await sendPhoneNumberVerificationCode()
  t.notOk(a, 'we cannot send an sms if phone number incorrect format or not set')
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
  t.notOk(aa, 'we cannot send an sms if 2fa is enabled for SMS token type')
  await signOut()

  // with unverified phoneNumber
  await signIn({ user: Users.Member })
  const aaa = await sendPhoneNumberVerificationCode()
  t.ok(aaa, 'sms with verification code has been reported as successfully sent')
  const verificationCode = (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).phoneNumberVerificationCode
  const bbb = await verifyPhoneNumber({ verificationCode: 'WRONG' })
  t.notOk(bbb, 'phoneNumber reported as un-verified')
  t.notOk((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified, 'unverified')
  const ccc = await verifyPhoneNumber({ verificationCode })
  t.ok(ccc, 'phoneNumber reported as verified')
  t.ok((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified, 'verified')
  await signOut()

  t.end()
})

test('setup Time-based-one-time-password authentication (TOTP)', async (t) => {
  await prepare()

  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['TOTP']
    },
    simulate2FAAuth: true
  })
  const a = await initTOTPSharedSecret()
  t.notOk(a.secret, 'we cannot init TOTP if 2fa is enabled for TOTP token type')
  await signOut()

  await signIn({ user: Users.Member })
  const b = await initTOTPSharedSecret()
  t.ok(b.secret, 'totp secret received')
  const c = await validateTOTPSharedSecret({ totp: 'WRONG' })
  t.notOk(c, 'TOTP shared secret reported as unverified')
  t.notOk((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified, 'is unverified')

  const otp = OTP({ secret: b.secret })
  const totp = otp.totp()
  const d = await validateTOTPSharedSecret({ totp })
  t.ok(d, 'TOTP shared secret reported as verified')
  t.ok((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified, 'is verified')
  await signOut()
  t.end()
})

test('enable 2 factor authentication', async (t) => {
  await prepare()
  await signIn({
    user: {
      ...Users.Member,
      phoneNumber: null
    }
  })
  t.notOk((await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })), 'enable sms should fail')
  t.notOk((await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })), 'disable sms should fail')
  t.notOk((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })), 'enable totp should fail')
  t.notOk((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })), 'disable totp should fail')
  await signOut()

  await signIn({ user: Users.TwoFactorMember })
  t.ok((await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })), 'enable SMS')
  t.ok((await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })), 'disable SMS again')
  t.ok((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })), 'enable TOTP')
  t.ok((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })), 'disable TOTP again')
  await signOut()

  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS', 'TOTP']
    },
    simulate2FAAuth: true
  })
  t.notOk((await updateTwoFactorAuthentication({ type: 'SMS', enabled: true })), 'enable SMS should fail')
  t.ok((await updateTwoFactorAuthentication({ type: 'SMS', enabled: false })), 'disable SMS')
  t.notOk((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: true })), 'enable TOTP should fail')
  t.ok((await updateTwoFactorAuthentication({ type: 'TOTP', enabled: false })), 'disable TOTP')

  await signOut()
  t.end()
})

test('update email', async (t) => {
  await prepare()

  await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS']
    },
    simulate2FAAuth: true
  })
  const a = await updateEmail({ email: 'gessler@altdorf.ch' })
  t.notOk(a.email, 'not allowed while 2fa is active')
  await signOut()

  await signIn({ user: Users.Member })
  const b = await updateEmail({ email: 'gessler@altdorf.ch' })
  t.ok(b.email, 'allowed when 2fa not active')
  await signOut()

  t.end()
})

test('update phone number', async (t) => {
  await prepare()
  // TODO: Test updateMe
  t.ok(true)
  t.end()
})

test('authorize a session via 2fa: email, sms', async (t) => {
  await prepare()

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
  t.equal(tokens.length, 1, 'an email token found')

  await startChallenge({ sessionId, type: 'SMS' })

  const { payload: smsCode } = await pgDatabase().public
    .tokens.findOne({ sessionId, type: 'SMS' })

  const { data: fail } = await authorizeSession({
    email,
    tokens: [
      { type: 'SMS', payload: smsCode }
    ]
  })
  t.notOk(fail, 'requires 2 tokens to authorize')

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'SMS', payload: smsCode }
    ]
  })
  t.ok(data.authorizeSession, 'authorize session returns true')

  await signOut()

  t.end()
})

test('authorize a session 2fa (multiple challenges): email, sms', async (t) => {
  await prepare()

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
  t.equal(tokens.length, 1, 'an email token found')

  await startChallenge({ sessionId, type: 'SMS' })
  await startChallenge({ sessionId, type: 'SMS' })
  await startChallenge({ sessionId, type: 'SMS' })

  const smsTokens = await pgDatabase().public
    .tokens.find(
      { sessionId, type: 'SMS' },
      { orderBy: { createdAt: 'desc' } }
    )

  const { payload: smsCode } = smsTokens.shift()

  console.log(smsCode)

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'SMS', payload: smsCode }
    ]
  })
  t.ok(data.authorizeSession, 'authorize session returns true')

  const expiredTokens = await pgDatabase().public
    .tokens.find({ email, 'expiresAt <': new Date().toISOString() })
  t.equal(expiredTokens.length, 4, '4 expired tokens found')

  await signOut()

  t.end()
})

test('authorize a session via 2fa: email, totp', async (t) => {
  await prepare()

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
  t.equal(tokens.length, 1, 'an email token found')

  await startChallenge({ sessionId, type: 'TOTP' })

  const totpToken = await pgDatabase().public
    .tokens.find({ sessionId, type: 'TOTP' })
  t.equal(totpToken.length, 1, 'a totp token found')

  const secret = Users.TwoFactorMember.TOTPChallengeSecret
  const totpCode = OTP({ secret }).totp()
  t.ok(totpCode, 'totp pin generated')

  const { data: fail } = await authorizeSession({
    email,
    tokens: [
      { type: 'TOTP', payload: totpCode }
    ]
  })
  t.notOk(fail, 'requires 2 tokens to authorize')

  const { data } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'TOTP', payload: totpCode }
    ]
  })
  t.ok(data.authorizeSession, 'authorize session returns true')

  const { data: gone } = await authorizeSession({
    email,
    tokens: [
      { type: 'EMAIL_TOKEN', payload: emailToken },
      { type: 'TOTP', payload: totpCode }
    ]
  })
  t.notOk(gone, 'can not authorize twice')

  await signOut()

  t.end()
})

test('authorize older sign in attempt', async (t) => {
  await prepare()

  // 1st signIn attempt
  const { payload, email } = await signIn({
    user: { ...Users.Member },
    skipAuthorization: true
  })

  // Other signIn attempts
  await signIn({
    user: { ...Users.Member },
    skipTruncate: true,
    skipAuthorization: true
  })
  await signIn({
    user: { ...Users.Member },
    skipTruncate: true,
    skipAuthorization: true
  })

  const { data } = await authorizeSession({
    email,
    tokens: [{ type: 'EMAIL_TOKEN', payload }]
  })
  t.ok(data.authorizeSession, 'sign in attempt successful')

  const expiredTokens = await pgDatabase().public
    .tokens.find({ email, 'expiresAt <': new Date().toISOString() })
  t.equal(expiredTokens.length, 3, '3 expired tokens found')

  const { data: gone } = await authorizeSession({
    email,
    tokens: [{ type: 'EMAIL_TOKEN', payload }]
  })
  t.notOk(gone, 'can not authorize twice')

  await signOut()

  t.end()
})
