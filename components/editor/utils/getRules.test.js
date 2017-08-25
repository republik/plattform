import test from 'tape'
import getRules from './getRules'

test('utils.getRules', assert => {
  assert.plan(1)
  assert.deepEqual(getRules([
    {
      schema: {
        rules: [
          'A'
        ]
      }
    },
    {},
    {
      schema: {
        rules: [
          'B'
        ]
      }
    }
  ]), ['A', 'B'], 'extract rules from multiple plugins and skip plugins without schema or rules')
})
