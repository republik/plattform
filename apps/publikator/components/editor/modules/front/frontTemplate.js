export const getFrontTemplate = ({ schema }) => ({
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'TEASER',
      data: {
        teaserType: 'frontImage',
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              title: null,
              url: '/static/desert.jpg',
              alt: 'desert',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'The sand is near aka Teaser 3',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'An article by ',
            },
            {
              type: 'link',
              title: null,
              url: '',
              children: [
                {
                  type: 'text',
                  value: 'Christof Moser',
                },
              ],
            },
            {
              type: 'text',
              value: ', 31 December 2017',
            },
          ],
        },
      ],
    },
    {
      type: 'zone',
      identifier: 'TEASER',
      data: {
        teaserType: 'frontImage',
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              title: null,
              url: '/static/desert.jpg',
              alt: 'desert',
            },
          ],
        },
        {
          type: 'heading',
          depth: 6,
          children: [
            {
              type: 'text',
              value: 'Teaser 1',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'The sand is near',
            },
          ],
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            {
              type: 'text',
              value:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'An article by ',
            },
            {
              type: 'link',
              title: null,
              url: '',
              children: [
                {
                  type: 'text',
                  value: 'Christof Moser',
                },
              ],
            },
            {
              type: 'text',
              value: ', 31 December 2017',
            },
          ],
        },
      ],
    },
    {
      type: 'zone',
      identifier: 'TEASER',
      data: {
        teaserType: 'frontImage',
      },
      children: [
        {
          type: 'heading',
          depth: 6,
          children: [
            {
              type: 'text',
              value: 'Teaser 2',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'The sand is near',
            },
          ],
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            {
              type: 'text',
              value:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'An article by ',
            },
            {
              type: 'link',
              title: null,
              url: '',
              children: [
                {
                  type: 'text',
                  value: 'Christof Moser',
                },
              ],
            },
            {
              type: 'text',
              value: ', 31 December 2017',
            },
          ],
        },
      ],
    },
    {
      type: 'zone',
      identifier: 'TEASER',
      data: {
        teaserType: 'frontImage',
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              title: null,
              url: '/static/desert.jpg',
              alt: 'desert',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'The sand is near aka Teaser 3',
            },
          ],
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            {
              type: 'text',
              value:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'An article by ',
            },
            {
              type: 'link',
              title: null,
              url: '',
              children: [
                {
                  type: 'text',
                  value: 'Christof Moser',
                },
              ],
            },
            {
              type: 'text',
              value: ', 31 December 2017',
            },
          ],
        },
      ],
    },
  ],
  meta: {
    template: schema,
  },
})
