const test = require('tape-async')
const { disconnect } = require('./helpers.js')

test('close', t => {
  t.end()
  disconnect()
})
