const test = require('tape-async')
const { connectIfNeeded } = require('./helpers.js')
const { signIn, signOut, Users } = require('./auth.js')

const prepare = async (options) => {
  await connectIfNeeded()
}

test.only('start sign in request', async (t) => {
  await prepare()
  await signOut()
  const result = await signIn({ user: Users.Unverified, skipAuthorization: true })
  console.log(result)
  t.ok(true)
  t.end()
})

test('sign out', async (t) => {
  t.ok(true)
  t.end()
})

test('get session data via email token', async (t) => {
  t.ok(true)
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
