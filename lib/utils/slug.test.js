import test from 'tape'
import slug from './slug'

test('lib.utils.slug', assert => {
  assert.equal(slug('John Doe'), 'john-doe', 'lower case and no spaces')
  assert.equal(slug('   John Doe   '), 'john-doe', 'trim')
  assert.equal(slug('John   Doe'), 'john-doe', 'double space')
  assert.equal(slug('@~John,.?-+=|/Doe!'), 'john-doe', 'invalid chars')
  assert.equal(slug('äüöß'), 'aeueoess', 'umlaut german')
  assert.equal(slug('âàçéêèëîïôùû'), 'aaceeeeiiouu', 'umlaut french')
  assert.end()
})
