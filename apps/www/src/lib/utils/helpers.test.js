import { getElementFromSeed } from './helpers'

describe('/lib/utils/helpers.js', () => {
  it('helpers.getElementFromSeed', () => {
    expect(
      getElementFromSeed(['el-0', 'el-1', 'el-2', 'el-3', 'el-4'], 0.2),
    ).toBe('el-1')
    expect(
      getElementFromSeed(['el-0', 'el-1', 'el-2', 'el-3', 'el-4'], 0.6),
    ).toBe('el-3')
    expect(getElementFromSeed(['el-0'], 0.6)).toBe('el-0')
    expect(getElementFromSeed(['el-0'], 0)).toBe('el-0')
    expect(getElementFromSeed(['el-0'], 0.999)).toBe('el-0')

    // 'seed is expected to be 0 to 1, excluding 1'
    expect(getElementFromSeed(['el-0'], 1)).toBeUndefined()
  })
})
