import { match, matchDocument } from './'

describe('match util test-suite', () => {
  it('utils.match', () => {
    // returns true if both kind and type of the passed object match the premise
    expect(match('foo')('bar')({ kind: 'foo', type: 'bar' })).toBeTruthy()

    // returns false if kind doesn't match the premise
    expect(match('foo')('bar')({ kind: 'bar', type: 'bar' })).toBeFalsy()

    // returns false if type doesn't match the premise
    expect(match('foo')('bar')({ kind: 'foo', type: 'foo' })).toBeFalsy()
  })

  it('utils.matchDocument', () => {
    // returns true if kind is `document
    expect(matchDocument({ kind: 'document' })).toBeTruthy()

    // returns false if kind is not `document
    expect(matchDocument({ kind: 'foo' })).toBeFalsy()
  })
})
