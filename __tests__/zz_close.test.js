const test = require('tape-async')
const { disconnect, throwOnOpenTransaction } = require('./helpers.js')
const {
  FORCE_TEST_END
} = process.env

test('close', async t => {
  t.ok(await throwOnOpenTransaction(), 'there should be no open transactions left over')
  if (FORCE_TEST_END) {
    disconnect()
  }
  t.end()
})
