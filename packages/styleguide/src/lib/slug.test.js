import { slug } from './slug'

describe('lib.utils.slug - test suite', function () {
  test('lower case and no spaces', function () {
    expect(slug('John Doe')).toEqual('john-doe')
  })
  test('trim', function () {
    expect(slug('   John Doe   ')).toEqual('john-doe')
  })

  test('double space', function () {
    expect(slug('John   Doe')).toEqual('john-doe')
  })

  test('invalid chars', function () {
    expect(slug('@~John,.?-+=|/Doe!')).toEqual('john-doe')
  })

  test('umlaut german', function () {
    expect(slug('äüöß')).toEqual('aeueoess')
  })

  test('umlaut french', function () {
    expect(slug('âàçéêèëîïôùû')).toEqual('aaceeeeiiouu')
  })

  test('soft hyphen', function () {
    expect(slug('um\u00adwelt\u00adschmerz')).toEqual('umweltschmerz')
  })
})
