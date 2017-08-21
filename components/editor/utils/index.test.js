import test from 'tape'
import { match, matchDocument, pluginFromRules } from './'

test('utils.match', assert => {
  assert.plan(3)

  assert.equal(
    match('foo')('bar')({ kind: 'foo', type: 'bar' }),
    true,
    'returns true if both kind and type of the passed object match the premise'
  )

  assert.equal(
    match('foo')('bar')({ kind: 'bar', type: 'bar' }),
    false,
    'returns false if kind doesn\'t match the premise'
  )

  assert.equal(
    match('foo')('bar')({ kind: 'foo', type: 'foo' }),
    false,
    'returns false if type doesn\'t match the premise'
  )
})

test('utils.matchDocument', assert => {
  assert.plan(2)

  assert.equal(
    matchDocument({ kind: 'document' }),
    true,
    'returns true if kind is `document`'
  )

  assert.equal(
    matchDocument({ kind: 'foo' }),
    false,
    'returns false if kind is not `document`'
  )
})

test('utils.pluginFromRules', assert => {
  assert.plan(1)

  assert.deepEqual(
    pluginFromRules(['a', 'b', 'c']),
    {
      schema: {
        rules: ['a', 'b', 'c']
      }
    },
    'returns a slate-compatibe schema structure with all arguments as rules'
  )
})
