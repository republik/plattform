const UUT = require('./slate/visit')

const cases = [
  /*
  {
    name: ''
    slatetree: []
    predicate: async ()
    visitor: async ()
    expected: []
  },
  */
  {
    name: 'alter nodes w/ text',
    slatetree: [
      {
        children: [
          {
            text: 'A first paragraph.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'A second paragraph.',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'break',
          },
          {
            text: 'A second phrase in second paragraph.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'A third paragraph.',
          },
        ],
        type: 'paragraph',
      },
    ],
    predicate: (child) => !!child.text,
    visitor: (child) => {
      child.__visited = true
    },
    expected: [
      {
        children: [{ __visited: true, text: 'A first paragraph.' }],
        type: 'paragraph',
      },
      {
        children: [
          { __visited: true, text: 'A second paragraph.' },
          { children: [{ text: '' }], type: 'break' },
          { __visited: true, text: 'A second phrase in second paragraph.' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ __visited: true, text: 'A third paragraph.' }],
        type: 'paragraph',
      },
    ],
  },
]

describe('slate/visit', () => {
  cases.forEach(({ name, slatetree, predicate, visitor, expected }) => {
    test(name, () =>
      UUT({ children: slatetree }, predicate, visitor).then(() => {
        expect(slatetree).toEqual(expected)
      }),
    )
  })
})
