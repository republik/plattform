const UUT = require('./slate/toString')

const cases = [
  /*
  {
    name: ''
    slatetree: []
    glue?: ' '
    string: ''
  },
  */
  {
    name: 'some phrases',
    slatetree: [
      {
        children: [
          {
            text: 'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
          },
        ],
        type: 'paragraph',
      },
    ],
    string:
      'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
  },
  {
    name: 'some paragraphs',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
          },
        ],
        type: 'paragraph',
      },
    ],
    string:
      'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque. Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
  },
  {
    name: 'some paragraphs using newline as glue',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
          },
        ],
        type: 'paragraph',
      },
    ],
    glue: '\n',
    string:
      'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.\nUt pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
  },
  {
    name: 'some paragraphs using empty string as glue',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
          },
        ],
        type: 'paragraph',
      },
    ],
    glue: '',
    string:
      'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
  },
  {
    name: 'inline emphasis',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse ',
          },
          {
            text: 'facere minima incidunt accusantium rem',
            italic: true,
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'Qui esse facere minima incidunt accusantium rem.',
  },
  {
    name: 'inline bold',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse ',
          },
          {
            text: 'facere minima incidunt accusantium rem',
            bold: true,
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'Qui esse facere minima incidunt accusantium rem.',
  },
  {
    name: 'sub and sup',
    slatetree: [
      {
        children: [
          {
            text: '2H',
          },
          {
            text: '2',
            sub: true,
          },
          {
            text: '+O',
          },
          {
            text: '2',
            sub: true,
          },
          {
            text: '→2H',
          },
          {
            text: '2',
            sub: true,
          },
          {
            text: 'O',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: '32m',
          },
          {
            text: '2',
            sup: true,
          },
          {
            text: '+8m',
          },
          {
            text: '2',
            sup: true,
          },
          {
            text: '=40m',
          },
          {
            text: '2',
            sup: true,
          },
        ],
        type: 'paragraph',
      },
    ],
    string: '2H2+O2→2H2O 32m2+8m2=40m2',
  },
  {
    name: 'inline link',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse ',
          },
          {
            children: [
              {
                text: 'facere minima incidunt accusantium rem',
              },
            ],
            type: 'link',
            href: 'https://www.republik.ch',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'Qui esse facere minima incidunt accusantium rem.',
  },
  {
    name: 'bold link',
    slatetree: [
      {
        children: [
          {
            text: 'Qui esse ',
            bold: true,
          },
          {
            children: [
              {
                text: 'facere minima incidunt accusantium rem',
                bold: true,
              },
            ],
            type: 'link',
            href: 'https://www.republik.ch',
          },
          {
            text: '.',
            bold: true,
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'Qui esse facere minima incidunt accusantium rem.',
  },
  {
    name: 'strikethrough',
    slatetree: [
      {
        children: [
          {
            text: 'Some Text with ',
          },
          {
            text: 'strikethrough',
            strikethrough: true,
          },
          {
            text: ' as well as ',
          },
          {
            text: 'strikethrough ',
            strikethrough: true,
          },
          {
            children: [
              {
                strikethrough: true,
                text: 'containing',
              },
            ],
            type: 'link',
            href: 'https://republik.ch',
          },
          {
            strikethrough: true,
            text: ' a link',
          },
        ],
        type: 'paragraph',
      },
    ],
    string:
      'Some Text with strikethrough as well as strikethrough containing a link',
  },
  {
    name: 'link definition',
    slatetree: [
      {
        children: [
          {
            text: 'Das hier ist ein ',
          },
          {
            children: [
              {
                text: 'Link',
              },
            ],
            type: 'link',
            href: 'https://www.republik.ch',
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'Das hier ist ein Link',
  },
  {
    name: 'blockquote',
    slatetree: [
      {
        children: [
          {
            children: [
              {
                text: 'Blockquote',
              },
            ],
            type: 'blockQuoteText',
          },
        ],
        type: 'blockQuote',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Paragraph 1',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Paragraph 2',
              },
            ],
            type: 'blockQuoteText',
          },
        ],
        type: 'blockQuote',
      },
    ],
    string: 'Blockquote Paragraph 1 Paragraph 2',
  },
  {
    name: 'nested blockquote compability',
    slatetree: [
      {
        children: [
          {
            children: [
              {
                text: 'Blockquote Level 1',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Blockquote Level 2',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Blockquote Level 3',
              },
            ],
            type: 'blockQuoteText',
          },
        ],
        type: 'blockQuote',
      },
    ],
    string: 'Blockquote Level 1 Blockquote Level 2 Blockquote Level 3',
  },
  {
    name: 'headline',
    slatetree: [
      {
        children: [
          {
            text: 'Headline 1',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Headline 2',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Headline 3',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Headline 4',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Headline 5',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Headline 6',
          },
        ],
        type: 'headline',
      },
    ],
    string: 'Headline 1 Headline 2 Headline 3 Headline 4 Headline 5 Headline 6',
  },
  {
    name: 'lists',
    slatetree: [
      {
        children: [
          {
            children: [
              {
                text: 'Item 1',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 2',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 3',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'ul',
        ordered: false,
      },
      {
        children: [
          {
            children: [
              {
                text: 'Item 1',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 2',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 3',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'ol',
        ordered: true,
      },
    ],
    string: 'Item 1 Item 2 Item 3 Item 1 Item 2 Item 3',
  },
  {
    name: 'break',
    slatetree: [
      {
        children: [
          {
            text: 'We should',
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
            text: 'break up',
          },
        ],
        type: 'paragraph',
      },
    ],
    string: 'We should break up',
  },
  {
    name: 'code',
    slatetree: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Some',
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
            type: 'inlineCode',
            value: 'Inline code',
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
            text: 'Followed by:',
          },
        ],
      },
      {
        type: 'blockCode',
        value: 'Code block',
      },
    ],
    string: 'Some Inline code Followed by: Code block',
  },
  {
    name: 'complex example 1',
    slatetree: [
      {
        children: [
          {
            text: 'Text',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Lorem ipsum ',
          },
          {
            children: [
              {
                text: 'dolor',
              },
            ],
            type: 'link',
            href: 'https://www.loremipsum.de/',
          },
          {
            text: ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Ordered list',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Item 1',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 2',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 3',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'ol',
        ordered: true,
      },
      {
        children: [
          {
            text: 'Unordered list',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Item 1',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 2',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Item 3',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'ul',
        ordered: false,
      },
      {
        children: [
          {
            text: 'Marks',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Bold',
            bold: true,
          },
          {
            text: ' ',
          },
          {
            text: 'Italic',
            italic: true,
          },
          {
            text: ' ',
          },
          {
            text: 'Strikethrough',
            strikethrough: true,
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Blockquote',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Quote mit einem Paragraph',
              },
            ],
            type: 'blockQuoteText',
          },
        ],
        type: 'blockQuote',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Quote mit vier Paragraphen',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Text 1',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Text 2',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Text 3',
              },
            ],
            type: 'blockQuoteText',
          },
        ],
        type: 'blockQuote',
      },
    ],
    string:
      'Text Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Ordered list Item 1 Item 2 Item 3 Unordered list Item 1 Item 2 Item 3 Marks Bold Italic Strikethrough Blockquote Quote mit einem Paragraph Quote mit vier Paragraphen Text 1 Text 2 Text 3',
  },
]

describe('slate/toString', () => {
  cases.forEach(({ name, slatetree, glue, string }) => {
    test(`transform ${name}`, () => {
      expect(UUT({ children: slatetree }, glue)).toEqual(string)
    })
  })
})
