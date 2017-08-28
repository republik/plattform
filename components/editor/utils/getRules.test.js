import test from 'tape'
import getRules, {getSerializationRules} from './getRules'

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

test('utils.getSerializationRules', assert => {
  assert.plan(2)
  assert.deepEqual(getSerializationRules([
    {
      schema: {
        rules: [
          'A'
        ]
      }
    }
  ]), [], 'skip rules without mdast helpers')

  assert.deepEqual(getSerializationRules([
    {
      schema: {
        rules: [
          'A',
          {fromMdast: true},
          {toMdast: true}
        ]
      }
    }
  ]), [{fromMdast: true}, {toMdast: true}], 'only rules with mdast helpers')
})
