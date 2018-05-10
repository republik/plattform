const test = require('tape-async')
const { connectIfNeeded, pgDatabase } = require('./helpers.js')
const { signIn,
   signOut,
   unauthorizedSession,
   denySession,
   Users } = require('./auth.js')

const prepare = async (options) => {
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

test.only('setup SMS based authentication', async (t) => {
  // sendPhoneNumberVerification
  // validatePhoneNumber...

  // not allowed when 2fa activated for SMS

  t.end()
})

test('setup Time-based-one-time-password authentication (TOTP)', async (t) => {
  t.ok(true)

  // initTOTP...
  // validateSharedSecret...

  // not allowed when 2fa activated for TOTP

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
