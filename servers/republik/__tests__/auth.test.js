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
   Users } = require('./auth.js')

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

test('get unauthorized session data via email token', async (t2) => {
  await prepare()
  t2.test('as Unverified User', async (t) => {
    const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
    const a = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload })
    t.notOk(a.session, 'wrong e-mail address is used in combination with correct token')
    const b = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload: payload + '01' })
    t.notOk(b.session, 'correct e-mail address is used in combination with wrong token')
    const c = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
    t.ok(c.session, 'e-mail and token are correct')
    t.equal(c.enabledSecondFactors.length, 0, 'unverified users are always on 1fa')
    await signOut()
    t.end()
  })
  t2.test('as TwoFactor User', async (t) => {
    const { payload } = await signIn({
      user: {
        ...Users.TwoFactorMember,
        enabledSecondFactors: ['SMS', 'TOTP']
      },
      skipAuthorization: true
    })
    const a = await unauthorizedSession({ user: Users.Member, type: 'EMAIL_TOKEN', payload })
    t.notOk(a.session, 'wrong e-mail address is used in combination with correct token')
    const b = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload: payload + '01' })
    t.notOk(b.session, 'correct e-mail address is used in combination with wrong token')
    const c = await unauthorizedSession({ user: Users.TwoFactorMember, type: 'EMAIL_TOKEN', payload })
    t.ok(c.session, 'e-mail and token are correct')
    t.equal(c.enabledSecondFactors.length, 2, 'should return SMS + TOTP')
    await signOut()
    t.end()
  })
  t2.end()
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

test('verify phoneNumber', async (t2) => {
  await prepare()

  t2.test('without phoneNumber', async (t) => {
    await signIn({
      user: {
        ...Users.Member,
        phoneNumber: null
      }
    })
    const a = await sendPhoneNumberVerificationCode()
    t.notOk(a, 'we cannot send an sms if phone number incorrect format or not set')
    await signOut()
    t.end()
  })

  t2.test('with SMS 2FA enabled', async (t) => {
    await signIn({
      user: {
        ...Users.TwoFactorMember,
        enabledSecondFactors: ['SMS']
      },
      simulate2FAAuth: true
    })
    const a = await sendPhoneNumberVerificationCode()
    t.notOk(a, 'we cannot send an sms if 2fa is enabled for SMS token type')
    await signOut()
    t.end()
  })

  t2.test('with unverified phoneNumber', async (t) => {
    await signIn({ user: Users.Member })
    const a = await sendPhoneNumberVerificationCode()
    t.ok(a, 'sms with verification code has been reported as successfully sent')
    const verificationCode = (await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).phoneNumberVerificationCode
    const b = await verifyPhoneNumber({ verificationCode: 'WRONG' })
    t.notOk(b, 'phoneNumber reported as un-verified')
    t.notOk((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified, 'unverified')
    const c = await verifyPhoneNumber({ verificationCode })
    t.ok(c, 'phoneNumber reported as verified')
    t.ok((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isPhoneNumberVerified, 'verified')
    await signOut()
    t.end()
  })

  t2.end()
})

test.only('setup Time-based-one-time-password authentication (TOTP)', async (t2) => {
  await prepare()

  t2.test('with TOTP 2FA enabled', async (t) => {
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
    t.end()
  })

  t2.test('with unverified phoneNumber', async (t) => {
    await signIn({ user: Users.Member })
    const a = await initTOTPSharedSecret()
    t.ok(a.secret, 'totp secret received')
    const b = await validateTOTPSharedSecret({ totp: 'WRONG' })
    t.notOk(b, 'TOTP shared secret reported as unverified')
    t.notOk((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified, 'is unverified')

    const otp = OTP({ secret: a.secret })
    const totp = otp.totp()
    const c = await validateTOTPSharedSecret({ totp })
    t.ok(c, 'TOTP shared secret reported as verified')
    t.ok((await pgDatabase().public.users.findOne({ 'id': Users.Member.id })).isTOTPChallengeSecretVerified, 'is verified')
    await signOut()
    t.end()
  })

  t2.end()
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
  t.ok(true)
  // for SMS
  // for TOTP
  // x when ready and when not
  t.end()
})

test('update email', async (t) => {
  t.ok(true)
  // not allowed when 2fa
  t.end()
})

test('update phone number', async (t) => {
  t.ok(true)
  // not allowed when 2fa enabled for SMS
  t.end()
})
