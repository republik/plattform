import test from 'tape'

test('Foo = bar', assert => {
  assert.plan(1)

  const Foo = true
  const bar = true

  assert.equal(Foo, bar)
})
