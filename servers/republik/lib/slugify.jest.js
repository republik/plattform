const UUT = require('./slugify')

describe('slugify()', () => {
  test('"pä" results in "pae"', () => {
    expect(UUT('pä')).toEqual('pae')
  })

  test('"würde" results in "wuerde"', () => {
    expect(UUT('würde')).toEqual('wuerde')
  })

  test('"Möbel" results in "moebel"', () => {
    expect(UUT('Möbel')).toEqual('moebel')
  })

  test('"passé" results in "passé"', () => {
    expect(UUT('passé')).toEqual('passe')
  })

  test('"Der Bär ißt Honigblüten" results in "passé"', () => {
    expect(UUT('Der Bär ißt Honigblüten'))
      .toEqual('der-baer-isst-honigblueten')
  })

  test('trims trailing whitespace', () => {
    expect(UUT(' string')).toEqual('string')
    expect(UUT('string ')).toEqual('string')
    expect(UUT(' string ')).toEqual('string')
    expect(UUT(' string 2ndstring ')).toEqual('string-2ndstring')
  })

  test('replaces special characters', () => {
    expect(UUT('https://foobar.tld/xyz?param=value'))
      .toEqual('https:foobar.tldxyzparamvalue')
    expect(UUT('#slug'))
      .toEqual('slug')
  })

  test('empty string returns empty string', () => {
    expect(UUT('')).toEqual('')
  })

  test('faulty argument throws TypeError', () => {
    expect(() => UUT()).toThrowError(TypeError)
    expect(() => UUT({})).toThrowError(TypeError)
    expect(() => UUT([])).toThrowError(TypeError)
    expect(() => UUT(() => {})).toThrowError(TypeError)
  })
})
