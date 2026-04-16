import compareVersion from './CompareVersion'

describe('CompareVersion test-suite', () => {
  it('should return 0 if versions are equal', () => {
    const testData = [
      ['0.0.1', '0.0.1'],
      ['0.1.0', '0.1.0'],
      ['0.1.1', '0.1.1'],
      ['1.0.0', '1.0.0'],
      ['1.0.1', '1.0.1'],
      ['1.1.0', '1.1.0'],
      ['1.1.1', '1.1.1'],
      ['4.3.2', '4.3.2'],
    ]

    testData.forEach((versions) => {
      const result = compareVersion(versions[0], versions[1])
      expect(result).toBe(0)
    })
  })

  it('should return -1 if version1 is less than version2', () => {
    const testData = [
      ['0.0.0', '0.0.1'],
      ['0.0.1', '0.1.0'],
      ['0.1.0', '0.1.1'],
      ['1.0.0', '1.0.1'],
      ['1.0.1', '1.1.0'],
      ['1.1.0', '1.1.1'],
      ['4.3.1', '4.3.2'],
    ]

    testData.forEach((versions) => {
      const result = compareVersion(versions[0], versions[1])
      expect(result).toBeLessThan(0)
    })
  })

  it('should return 1 if version1 is greater than version2', () => {
    const testData = [
      ['0.0.1', '0.0.0'],
      ['0.1.0', '0.0.1'],
      ['0.1.1', '0.1.0'],
      ['1.0.1', '1.0.0'],
      ['1.1.0', '1.0.1'],
      ['1.1.1', '1.1.0'],
      ['4.3.2', '4.3.1'],
    ]

    testData.forEach((versions) => {
      const result = compareVersion(versions[0], versions[1])
      expect(result).toBeGreaterThan(0)
    })
  })

  it('should throw error if invalid versions are provided', () => {
    const testData = [
      '0.0.0.0',
      '-1.0.0',
      '1.0.0-',
      '0.a.b',
      '-1.-1.-1',
      'hallo',
    ]

    testData.forEach((version) => {
      expect(() => compareVersion(version, version)).toThrowError(
        `Invalid version: ${version}`,
      )
    })
  })
})
