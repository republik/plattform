require('@orbiting/backend-modules-env').config()
const test = require('tape-async')
const TwilioInterface = require('./TwilioInterface')

test('test twilio', async (t) => {
  console.log(TwilioInterface)
  try {
    t.fail()
  } catch (e) {
    t.ok(true)
  }
  t.end()
})
