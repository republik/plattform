const UUT = require('./slate/collapseLinkText')

const cases = [
  /*
  {
    name: ''
    slatetree: []
    options?: { prefix: 35, postfix: 10, char: '…' }
    expected: []
  },
  */
  {
    name: 'collapse link text',
    slatetree: [
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'https://domain.tld/do/collapse/this/link/because/its/just/too/long.acc',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/do/collapse/this/link/because/its/just/too/long.acc',
          },
          {
            text: '',
          },
        ],
        type: 'paragraph',
      },
    ],
    expected: [
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'https://domain.tld/do/collapse/this…o/long.acc',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/do/collapse/this/link/because/its/just/too/long.acc',
          },
          {
            text: '',
          },
        ],
        type: 'paragraph',
      },
    ],
  },
  {
    name: 'do not collapse non-URL link text w/ different href',
    slatetree: [
      {
        children: [
          {
            text: 'Please see ',
          },
          {
            children: [
              {
                text: 'here',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/do/not/collapse/because/link/is/hidden.asc',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    expected: [
      {
        children: [
          {
            text: 'Please see ',
          },
          {
            children: [
              {
                text: 'here',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/do/not/collapse/because/link/is/hidden.asc',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
  },
  {
    name: 'do not collapse text only in form of a link',
    slatetree: [
      {
        children: [
          {
            text: 'https://domain.tld/do/not/collapse/this/one/because/its/not/a/link.mp3',
          },
        ],
        type: 'paragraph',
      },
    ],
    expected: [
      {
        children: [
          {
            text: 'https://domain.tld/do/not/collapse/this/one/because/its/not/a/link.mp3',
          },
        ],
        type: 'paragraph',
      },
    ],
  },
  {
    name: 'collapse some link text (complex example)',
    slatetree: [
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'https://domain.tld/this/is/an/immensly/long/link/that/requires/collapsing/please.pdf',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/this/is/an/immensly/long/link/that/requires/collapsing/please.pdf',
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
                text: 'https://domain.tld/no/collapsing/needed',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/no/collapsing/needed',
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
                text: 'Link not to collapse',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/this/is/an/other/immensly/long/but/hidden/link/that/requires/no/collapsing.pdf',
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
                text: 'Another link not to collapse',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/no/collapsing/needed',
          },
          {
            text: '',
          },
        ],
        type: 'paragraph',
      },
    ],
    expected: [
      {
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'https://domain.tld/this/is/an/immen…please.pdf',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/this/is/an/immensly/long/link/that/requires/collapsing/please.pdf',
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
                text: 'https://domain.tld/no/collapsing/needed',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/no/collapsing/needed',
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
                text: 'Link not to collapse',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/this/is/an/other/immensly/long/but/hidden/link/that/requires/no/collapsing.pdf',
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
                text: 'Another link not to collapse',
              },
            ],
            type: 'link',
            href: 'https://domain.tld/no/collapsing/needed',
          },
          {
            text: '',
          },
        ],
        type: 'paragraph',
      },
    ],
  },
]

describe('slate/collapseLinkText', () => {
  cases.forEach(({ name, slatetree, options, expected }) => {
    test(name, () =>
      UUT({ children: slatetree }, options).then(() => {
        expect(slatetree).toEqual(expected)
      }),
    )
  })
})
