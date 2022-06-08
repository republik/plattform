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
            text: 'Qui esse facere minima incidunt accusantium rem. Nostrum laboriosam qui dolore velit est adipisci. Labore soluta aut ut. Nobis alias et omnis et repellat natus atque.',
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
]

describe('mdastToSlatetree', () => {
  cases.forEach(({ name, mdast, slatetree }) => {
    test(`transform ${name}`, () => {
      expect(UUT(mdast)).toEqual(slatetree)
    })
  })
})
