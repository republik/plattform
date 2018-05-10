const test = require('tape-async')
const OTP = require('otp')
const { connectIfNeeded, pgDatabase } = require('./helpers.js')
const { signIn,
   signOut,
   unauthorizedSession,
   denySession,
   sendPhoneNumberVerificationCode,
   verifyPhoneNumber,
   initTOTPSharedSecret,
   validateTOTPSharedSecret,
   updateTwoFactorAuthentication,
   updateEmail,
   Users
 } = require('./auth.js')

const prepare = async () => {
  await connectIfNeeded()
}

test('sign in', async (t) => {
  await prepare()
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true })
  t.ok(result && result.userId, 'reportedly started sign in request as unverified user')
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
  const { payload2 } = await signIn({
    user: {
      ...Users.TwoFactorMember,
      enabledSecondFactors: ['SMS', 'TOTP']
    },
    skipAuthorization: true
  })
  const aa = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload })
  t.notOk(aa.session, 'wrong e-mail address is used in combination with correct token')
  const bb = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload2 + '01' })
  t.notOk(bb.session, 'correct e-mail address is used in combination with wrong token')
  const cc = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload })
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

test('authorize a session', async (t) => {
  t.ok(true)
  // via email token -> success
  // via email + sms -> success
  // via email + totp -> success
  // via sms + totp -> fail

  // test('start TOTP challenge', async (t) => {
  //   t.ok(true)
  //   t.end()
  // })
  //
  // test('start SMS challenge', async (t) => {
  //   t.ok(true)
  //   t.end()
  // })
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
