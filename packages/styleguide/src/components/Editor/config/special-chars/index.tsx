import { CharConfig } from '../../custom-types'

export const config: CharConfig[] = [
  {
    type: 'quotes',
    insert: '«»',
    buttonStyle: {
      marginRight: 13,
    },
  },
  {
    type: 'nestedQuotes',
    insert: '‹›',
    buttonStyle: {
      marginRight: 10,
    },
  },
  {
    type: 'endash',
    insert: '\u2013',
    buttonStyle: {
      marginRight: 13,
    },
  },
  {
    type: 'nbsp',
    isInvisible: true,
    insert: '\u00a0',
    render: '\u2423', // open box: ␣
    renderStyle: {
      marginRight: '-0.25em',
    },
    buttonStyle: {
      marginRight: 7,
    },
  },
  {
    type: 'shy',
    isInvisible: true,
    insert: '\u00ad',
    render: '\u2027', // hyphenation point: ‧
    buttonStyle: {
      marginRight: 13,
    },
  },
]
