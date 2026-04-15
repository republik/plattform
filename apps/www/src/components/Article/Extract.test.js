import { parseSliceRanges } from './Extract'

describe('components/Article/Extract.js', () => {
  it('parseSliceRanges.index', () => {
    expect(parseSliceRanges('0')).toStrictEqual([[0, 1]])
    expect(parseSliceRanges('0:0')).toStrictEqual([
      [0, 1],
      [0, 1],
    ])
  })

  it('parseSliceRanges.range', () => {
    expect(parseSliceRanges('0...2')).toStrictEqual([[0, 2]])
    expect(parseSliceRanges('0...2:0...3')).toStrictEqual([
      [0, 2],
      [0, 3],
    ])
    expect(parseSliceRanges('...2:...3')).toStrictEqual([
      [0, 2],
      [0, 3],
    ])
    expect(parseSliceRanges('0:2...')).toStrictEqual([
      [0, 1],
      [2, undefined],
    ])
  })
})
