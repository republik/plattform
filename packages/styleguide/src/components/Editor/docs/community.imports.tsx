import { CustomDescendant } from '../custom-types'

export const tree1: CustomDescendant[] = [
  {
    type: 'headline',
    children: [
      {
        text: 'La vie de château',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'inlineCode',
        children: [{ text: 'Once upon' }],
      },
      {
        text: ' a time, in a ',
      },
      {
        text: 'small',
        sup: true,
      },
      {
        text: ' castle, lived a ',
      },
      {
        text: 'bold',
        bold: true,
        italic: true,
        strikethrough: true,
      },
      {
        text: ' lady. She was responsible for:',
      },
    ],
  },
  {
    type: 'ol',
    children: [
      {
        type: 'listItem',
        children: [
          {
            text: 'the stables',
          },
        ],
      },
      {
        type: 'listItem',
        children: [
          {
            text: 'the dragons',
          },
        ],
      },
      {
        type: 'listItem',
        children: [
          {
            text: 'the chicken',
          },
        ],
      },
    ],
    ordered: true,
  },
  {
    type: 'blockQuote',
    children: [
      {
        type: 'blockQuoteText',
        children: [
          {
            text: 'Basically lots of',
          },
        ],
      },
      {
        type: 'blockQuoteText',
        children: [
          {
            text: 'shit',
          },
        ],
      },
      {
        type: 'figureCaption',
        children: [
          {
            text: 'As the peasants say ',
          },
          {
            type: 'figureByline',
            children: [
              {
                text: '(True that.)',
              },
            ],
          },
          {
            text: '',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Read ',
      },
      {
        type: 'link',
        children: [
          {
            text: 'her story',
          },
        ],
        href: 'https://devcenter.heroku.com/articles/git',
      },
      {
        text: ' here.',
      },
    ],
  },
  {
    type: 'blockCode',
    children: [
      {
        text: 'The story machine says goodbye.',
      },
    ],
  },
]
