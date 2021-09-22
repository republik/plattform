const UUT = require('./mdastCollapseLink')

const node = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Kurzer Link: ',
        },
        {
          type: 'link',
          title: null,
          url: 'https://www.ise.fraunhofer.de',
          children: [
            {
              type: 'text',
              value: 'https://www.ise.fraunhofer.de',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Langer Link: ',
        },
        {
          type: 'link',
          title: null,
          url: 'https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/Stromerzeugung_2017_e.pdf',
          children: [
            {
              type: 'text',
              value:
                'https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/Stromerzeugung_2017_e.pdf',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'link',
          title: null,
          url: 'https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/Stromerzeugung_2017_e.pdf',
          children: [
            {
              type: 'text',
              value: 'Beschrifteter Link',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Textpassage',
        },
      ],
    },
  ],
}

describe('mdastCollapseLink', () => {
  test('collapse link nodes', () => {
    const result = UUT(node)
    expect(result).toMatchSnapshot()
  })

  test('collapse link nodes w/ options', () => {
    const result = UUT(node, {
      prefixLength: 10,
      postfixLength: 5,
      collapseChar: '–',
    })
    expect(result).toMatchSnapshot()
  })
})
