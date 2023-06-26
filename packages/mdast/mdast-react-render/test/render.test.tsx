import { renderMdast } from '../src'
import { matchType, matchHeading, matchParagraph } from '../src/utils'

const mdast = {
  type: 'root',
  children: [
    {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: 'The Titel',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '«A good lead.»',
        },
      ],
    },
  ],
}

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => <div>{children}</div>,
      rules: [
        {
          matchMdast: matchHeading(1),
          component: ({ children }) => <h1>{children}</h1>,
        },
        {
          matchMdast: matchParagraph,
          component: ({ children }) => <p>{children}</p>,
        },
      ],
    },
  ],
}

describe('Render Mdast', () => {
  test('doesnt fail', () => {
    expect(() => {
      renderMdast(mdast, schema, { MissingNode: false })
    }).not.toThrow()
  })
})
