const UUT = require('./mdastToSlatetree')

const cases = [
  /* 
  {
    name: '',
    mdast: {},
    slatetree: {},
  },
  */
  {
    name: 'some phrases',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'some paragraphs',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'Ut pariatur et autem atque aut. Sunt et dignissimos fugiat itaque consectetur et rerum. Alias maxime voluptas harum iure repellat et nesciunt. Mollitia et optio quis.',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'inline emphasis',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Qui esse ',
            },
            {
              type: 'emphasis',
              children: [
                {
                  type: 'text',
                  value: 'facere minima incidunt accusantium rem',
                },
              ],
            },
            {
              type: 'text',
              value: '.',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'inline bold',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Qui esse ',
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: 'facere minima incidunt accusantium rem',
                },
              ],
            },
            {
              type: 'text',
              value: '.',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'inline link',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Qui esse ',
            },
            {
              type: 'link',
              title: null,
              url: 'https://www.republik.ch',
              children: [
                {
                  type: 'text',
                  value: 'facere minima incidunt accusantium rem',
                },
              ],
            },
            {
              type: 'text',
              value: '.',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'reference link',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Das hier ist ein ',
            },
            {
              type: 'link',
              title: null,
              url: '123',
              children: [
                {
                  type: 'text',
                  value: 'Link',
                },
              ],
            },
          ],
        },
        {
          type: 'definition',
          identifier: '123',
          label: '123',
          title: null,
          url: 'https://www.republik.ch',
        },
      ],
    },
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
  },
  {
    name: 'blockquote',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Blockquote',
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Paragraph 1',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'Paragraph 2',
                },
              ],
            },
          ],
        },
      ],
    },
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
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'figureByline',
              },
              {
                text: '',
              },
            ],
            type: 'figureCaption',
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
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'figureByline',
              },
              {
                text: '',
              },
            ],
            type: 'figureCaption',
          },
        ],
        type: 'blockQuote',
      },
    ],
  },
  {
    name: 'complex comment 1',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Das hier ist ein ',
            },
            {
              type: 'link',
              title: null,
              url: '123',
              children: [
                {
                  type: 'text',
                  value: 'Link',
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
              value: 'Zitat mit ',
            },
            {
              type: 'delete',
              children: [
                {
                  type: 'text',
                  value: 'Italic',
                },
              ],
            },
          ],
        },
        {
          type: 'definition',
          identifier: '123',
          label: '123',
          title: null,
          url: 'https://www.republik.ch',
        },
        {
          type: 'thematicBreak',
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Das hier ist ein Zitat',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'Das ist die zweite Zeile des Zitats',
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Zitat mit ',
                },
                {
                  type: 'delete',
                  children: [
                    {
                      type: 'text',
                      value: 'Italic',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Hallo',
                },
              ],
            },
            {
              type: 'blockquote',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Hallo 2',
                    },
                  ],
                },
                {
                  type: 'blockquote',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          value: 'Hallo 3',
                        },
                      ],
                    },
                  ],
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
              value: 'Das ist ein ',
            },
            {
              type: 'inlineCode',
              value: 'foobar',
            },
            {
              type: 'text',
              value: '.',
            },
          ],
        },
        {
          type: 'code',
          lang: null,
          meta: null,
          value: 'Codeblock',
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Das ist ein Titel',
            },
          ],
        },
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: 'Subheadline',
            },
          ],
        },
        {
          type: 'heading',
          depth: 3,
          children: [
            {
              type: 'text',
              value: 'H3',
            },
          ],
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            {
              type: 'text',
              value: 'H4',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Titel mit ',
            },
            {
              type: 'emphasis',
              children: [
                {
                  type: 'text',
                  value: 'Italic',
                },
              ],
            },
          ],
        },
        {
          type: 'list',
          ordered: false,
          start: null,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Das hier ist eine Liste',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Der zweite Eintrag in der Liste',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Noch ein Listeneintrag',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'list',
          ordered: true,
          start: 1,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Space, …',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: '… the final frontier …',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'These are the voyages',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'of the starship',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              spread: false,
              checked: null,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Enterprise.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
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
      {
        children: [
          {
            text: 'Zitat mit ',
          },
          {
            text: 'Italic',
            strikethrough: true,
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Das hier ist ein Zitat',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Das ist die zweite Zeile des Zitats',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'figureByline',
              },
              {
                text: '',
              },
            ],
            type: 'figureCaption',
          },
        ],
        type: 'blockQuote',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Hallo 1',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Hallo 2',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: 'Hallo 3',
              },
            ],
            type: 'blockQuoteText',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'figureByline',
              },
              {
                text: '',
              },
            ],
            type: 'figureCaption',
          },
        ],
        type: 'blockQuote',
      },
      {
        children: [
          {
            text: 'Das ist ein `foobar`',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: '```Codeblock```',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Das ist ein Titel',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Subheadline',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'H3',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'H4',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            text: 'Titel mit Italic',
          },
        ],
        type: 'headline',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Das hier ist eine Liste',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Der zweite Eintrag in der Liste',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Noch ein Listeneintrag',
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
                text: 'Space, …',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: '… the final frontier …',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'These are the voyages',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'of the starship',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                text: 'Enterprise.',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'ol',
        ordered: true,
      },
    ],
  },
]

describe('mdastToSlatetree', () => {
  cases.forEach(({ name, mdast, slatetree }) => {
    test(`transform ${name}`, () => {
      expect(UUT(mdast)).toEqual(slatetree)
    })
  })
})
