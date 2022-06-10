const UUT = require('./mdastToSlate/mdastToSlatetree')

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
    name: 'link definition',
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
    name: 'linkReference compatibility',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Der Mensch ',
            },
            {
              type: 'linkReference',
              identifier: 'single',
              label: 'singular',
              referenceType: 'shortcut',
              children: [
                {
                  type: 'text',
                  value: 'singular',
                },
              ],
            },
            {
              type: 'text',
              value: ', Die Menschen ',
            },
            {
              type: 'linkReference',
              identifier: 'plural',
              label: 'plural',
              referenceType: 'shortcut',
              children: [
                {
                  type: 'text',
                  value: 'plural',
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
            text: 'Der Mensch ',
          },
          {
            text: '[singular]',
          },
          {
            text: ', Die Menschen ',
          },
          {
            text: '[plural]',
          },
        ],
        type: 'paragraph',
      },
    ],
  },
  {
    name: 'html compatibility',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Dies ist eigentlich kein ',
            },
            {
              type: 'html',
              value: '<html>',
            },
            {
              type: 'text',
              value: ' Element :thinking:',
            },
          ],
        },
      ],
    },
    slatetree: [
      {
        children: [
          {
            text: 'Dies ist eigentlich kein ',
          },
          {
            text: '<html>',
          },
          {
            text: ' Element :thinking:',
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
    name: 'sub and sup',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '2H',
            },
            {
              type: 'sub',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'text',
              value: '+O',
            },
            {
              type: 'sub',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'text',
              value: '→2H',
            },
            {
              type: 'sub',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'text',
              value: 'O',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '32m',
            },
            {
              type: 'sup',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'text',
              value: '+8m',
            },
            {
              type: 'sup',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'text',
              value: '=40m',
            },
            {
              type: 'sup',
              children: [
                {
                  type: 'text',
                  value: '2',
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
  },
  {
    name: 'headline',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Headline 1',
            },
          ],
        },
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: 'Headline 2',
            },
          ],
        },
        {
          type: 'heading',
          depth: 3,
          children: [
            {
              type: 'text',
              value: 'Headline 3',
            },
          ],
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            {
              type: 'text',
              value: 'Headline 4',
            },
          ],
        },
        {
          type: 'heading',
          depth: 5,
          children: [
            {
              type: 'text',
              value: 'Headline 5',
            },
          ],
        },
        {
          type: 'heading',
          depth: 6,
          children: [
            {
              type: 'text',
              value: 'Headline 6',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'lists',
    mdast: {
      type: 'root',
      children: [
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
                      value: 'Item 1',
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
                      value: 'Item 2',
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
                      value: 'Item 3',
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
                      value: 'Item 1',
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
                      value: 'Item 2',
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
                      value: 'Item 3',
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
  },
  {
    name: 'break',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'We should',
            },
            {
              type: 'break',
            },
            {
              type: 'text',
              value: 'break up',
            },
          ],
        },
      ],
    },
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
  },
  {
    name: 'code',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Some',
            },
            {
              type: 'break',
            },
            {
              type: 'inlineCode',
              value: 'Inline code',
            },
            {
              type: 'break',
            },
            {
              type: 'text',
              value: 'Followed by:',
            },
          ],
        },
        {
          type: 'code',
          lang: null,
          meta: null,
          value: 'Code block',
        },
      ],
    },
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
  },
  {
    name: 'Complex example 1',
    mdast: {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Text',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Lorem ipsum ',
            },
            {
              type: 'link',
              title: null,
              url: 'https://www.loremipsum.de/',
              children: [
                {
                  type: 'text',
                  value: 'dolor',
                },
              ],
            },
            {
              type: 'text',
              value:
                ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Ordered list',
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
                      value: 'Item 1',
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
                      value: 'Item 2',
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
                      value: 'Item 3',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Unordered list',
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
                      value: 'Item 1',
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
                      value: 'Item 2',
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
                      value: 'Item 3',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Marks',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: 'Bold',
                },
              ],
            },
            {
              type: 'text',
              value: ' ',
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
            {
              type: 'text',
              value: ' ',
            },
            {
              type: 'delete',
              children: [
                {
                  type: 'text',
                  value: 'Strikethrough',
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Blockquote',
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
                  value: 'Quote mit einem Paragraph',
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
                  value: 'Quote mit vier Paragraphen',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'Text 1',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'Text 2',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'Text 3',
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
]

describe('mdastToSlatetree', () => {
  cases.forEach(({ name, mdast, slatetree }) => {
    test(`transform ${name}`, () => {
      expect(UUT(mdast)).toEqual(slatetree)
    })
  })
})
