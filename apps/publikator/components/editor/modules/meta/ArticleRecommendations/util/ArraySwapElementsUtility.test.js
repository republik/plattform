import { swapArrayElements } from './ArraySwapElementsUtility'

describe('ArticleRecommendations ArrayItemSwap utility', () => {
  function runTestData(testData) {
    testData.forEach(({ input, expected }) => {
      expect(swapArrayElements(...input)).toEqual(expected)
    })
  }

  it('should swap array elements', () => {
    const testData = [
      {
        input: [[1, 2, 3], 0, 1],
        expected: [2, 1, 3],
      },
      {
        input: [[1, 2, 3, 4, 5], 1, 3],
        expected: [1, 4, 3, 2, 5],
      },
      {
        input: [[1, 2, 3], 0, 2],
        expected: [3, 2, 1],
      },
    ]

    runTestData(testData)
  })

  it('should not swap array elements given invalid index', () => {
    const testData = [
      {
        input: [[1, 2, 3], -1, 1],
        expected: [1, 2, 3],
      },
      {
        input: [[1, 2, 3], 1, -1],
        expected: [1, 2, 3],
      },
    ]

    runTestData(testData)
  })
})
