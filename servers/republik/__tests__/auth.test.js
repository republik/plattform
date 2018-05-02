const test = require('tape-async')
const { connectIfNeeded } = require('./helpers.js')
const { signIn, signOut, unauthorizedSession, Users } = require('./auth.js')

const prepare = async (options) => {
  await connectIfNeeded()
}

test('sign in', async (t) => {
  await prepare()
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true })
  t.ok(result && result.userId, 'started sign in request as unverified user')
  t.end()
})

test('sign out', async (t) => {
  await prepare()
  await signIn({ user: Users.Unverified, skipAuthorization: true })
  const result = await signOut()
  t.ok(result, 'sign out successful')
  t.end()
})

test.only('get session data via email token', async (t) => {
  await prepare()
  const { payload } = await signIn({ user: Users.Unverified, skipAuthorization: true })
  const result = await unauthorizedSession({ user: Users.Unverified, type: 'EMAIL_TOKEN', payload })
  t.ok(result.session)
  t.equal(result.enabledSecondFactors.length, 0)
  t.end()
})

test('deny a session', async (t) => {
  t.ok(true)
  // via email token -> success
  // via email + sms -> success
  // via email + totp -> success
  // via sms + totp -> fail
  t.end()
})

test('setup SMS based authentication', async (t) => {
  t.ok(true)

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
