import { creditsToString } from './CreditLineUtility'

describe('ArticleRecommendations credits utility', () => {
  it('should combine credits mdast object to a single string', () => {
    const testData = [
      {
        input: [
          {
            type: 'text',
            value: 'Von ',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Ada Lovelace',
              },
            ],
            type: 'link',
            title: null,
            url: '',
          },
          {
            type: 'text',
            value: ' (Text) und Alain Turing (Bilder), 09.06.2021',
          },
        ],
        expected:
          'Von Ada Lovelace (Text) und Alain Turing (Bilder), 09.06.2021',
      },
      {
        input: [
          {
            type: 'text',
            value: 'Von ',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Darth Vader',
              },
            ],
            type: 'link',
          },
          {
            type: 'text',
            value: ', ',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Rick Astley',
              },
            ],
            type: 'link',
          },
          {
            type: 'text',
            value: ' (Text) und Superwoman (Bilder), 01.04.2022',
          },
        ],
        expected:
          'Von Darth Vader, Rick Astley (Text) und Superwoman (Bilder), 01.04.2022',
      },
    ]

    testData.forEach(({ input, expected }) => {
      expect(creditsToString(input)).toBe(expected)
    })
  })

  it('should return null if no credits are given', () => {
    expect(creditsToString(null)).toBeNull()
  })
})
