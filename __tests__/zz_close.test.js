const test = require('tape-async')
const { disconnect } = require('./helpers.js')
const {
  FORCE_TEST_END
} = process.env

test('close', t => {
  if (FORCE_TEST_END) {
    disconnect()
  }
  t.end()
})
