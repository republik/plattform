const UUT = require('./slate/findLinkHref')

const cases = [
  /*
  {
    name: ''
    slatetree: []
    urls: []
  },
  */
  {
    name: 'find valid href values',
    slatetree: [
      {
        children: [
          {
            text: 'https://domtain.tld/0',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'https://domain.tld/1',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/1',
          },
          {
            text: '',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'Link',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/2',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'Not a link',
              },
            ],
            type: 'link',
            href: 'foobar://something/but/a/link',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    urls: ['https://domain.tld/1', 'https://domain.tld/2'],
  },
  {
    name: 'no links in tree',
    slatetree: [
      {
        children: [
          {
            text: 'Nothing linked.',
          },
        ],
        type: 'paragraph',
      },
    ],
    urls: [],
  },
]

describe('slate/findLinkHref', () => {
  cases.forEach(({ name, slatetree, urls }) => {
    test(name, () =>
      UUT(slatetree).then((result) => {
        expect(result).toEqual(urls)
      }),
    )
  })
})
