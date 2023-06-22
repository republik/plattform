import { render } from '@testing-library/react'

import { renderMdast } from '../src'
import { matchType, matchZone, matchParagraph } from '../src/utils'

const mdast = {
  type: 'root',
  data: {
    linkColor: 'LightCoral',
  },
  children: [
    {
      type: 'zone',
      identifier: 'teaser',
      data: {
        linkColor: 'Indigo',
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Hello',
            },
            {
              type: 'link',
              children: [
                {
                  type: 'text',
                  value: 'World',
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
          value: 'Hello',
        },
        {
          type: 'link',
          children: [
            {
              type: 'text',
              value: 'World',
            },
          ],
        },
      ],
    },
  ],
}

describe('Ancestors Awareness', () => {
  test('extract props from ancestors', () => {
    const A = ({ children, linkColor }) => (
      <a href='https://www.test.com' style={{ color: linkColor }}>
        {children}
      </a>
    )
    const P = ({ children }) => <p>{children}</p>
    const linkProps = (node, index, parent, { ancestors }) => ({
      linkColor: (
        ancestors.find(matchZone('teaser')) || ancestors.find(matchType('root'))
      ).data.linkColor,
    })

    const schema = {
      rules: [
        {
          matchMdast: matchType('root'),
          component: ({ children }) => <div>{children}</div>,
          rules: [
            {
              matchMdast: matchZone('teaser'),
              component: ({ children }) => <div>{children}</div>,
              rules: [
                {
                  matchMdast: matchParagraph,
                  component: P,
                  rules: [
                    {
                      matchMdast: matchType('link'),
                      props: (node, index, parent, { ancestors }) => {
                        expect(matchParagraph(ancestors[0])).toBe(true)
                        expect(matchZone('teaser')(ancestors[1])).toBe(true)
                        expect(matchType('root')(ancestors[2])).toBe(true)
                        return linkProps(node, index, parent, { ancestors })
                      },
                      component: A,
                    },
                  ],
                },
              ],
            },
            {
              matchMdast: matchParagraph,
              component: P,
              rules: [
                {
                  matchMdast: matchType('link'),
                  props: (node, index, parent, { ancestors }) => {
                    expect(matchParagraph(ancestors[0])).toBe(true)
                    expect(matchType('root')(ancestors[1])).toBe(true)
                    return linkProps(node, index, parent, { ancestors })
                  },
                  component: A,
                },
              ],
            },
          ],
        },
      ],
    }

    expect(() => {
      const rendered = render(
        renderMdast(mdast, schema, { MissingNode: false }),
      )
      const links = rendered.getAllByRole('link')
      expect(links[0].style.color).toEqual('Indigo')
      expect(links[1].style.color).toEqual('LightCoral')
    }).not.toThrow()
  })
})
