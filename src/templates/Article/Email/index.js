import React from 'react'
import {
  matchParagraph,
  matchType,
  matchZone,
  matchImage,
  matchHeading
} from 'mdast-react-render/lib/utils'

const inlineRules = [
  {
    matchMdast: matchParagraph,
    component: ({ children }) => <p>{children}</p>
  },
  {
    matchMdast: matchHeading(1),
    component: ({ children }) => <h1>{children}</h1>
  },
  {
    matchMdast: matchHeading(2),
    component: ({ children }) => <h2>{children}</h2>
  },
  {
    matchMdast: matchHeading(3),
    component: ({ children }) => <h3>{children}</h3>
  },
  {
    matchMdast: matchHeading(4),
    component: ({ children }) => <h4>{children}</h4>
  },
  {
    matchMdast: matchHeading(5),
    component: ({ children }) => <h5>{children}</h5>
  },
  {
    matchMdast: matchHeading(6),
    component: ({ children }) => <h6>{children}</h6>
  },
  {
    matchMdast: matchType('link'),
    component: ({ children }) => children
  },
  {
    matchMdast: matchZone('TITLE'),
    component: ({ children }) => <div>{children}</div>
  },
  {
    matchMdast: matchZone('CENTER'),
    component: ({ children }) => (
      <div
        style={{
          margin: '0 auto'
        }}
      >
        {children}
      </div>
    )
  },
  {
    matchMdast: matchZone('NOTE'),
    component: ({ children }) => (
      <div style={{ margin: '1rem' }}>{children}</div>
    )
  },
  {
    matchMdast: matchType('strong'),
    component: ({ children }) => <b>{children}</b>
  }
]

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => <div>{children}</div>,
      rules: [
        ...inlineRules,
        {
          matchMdast: matchZone('FIGURE'),
          component: ({ children }) => (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {children}
            </div>
          ),
          rules: [
            ...inlineRules,
            {
              matchMdast: matchImage,
              component: props => <pre>{JSON.stringify(props, null, 2)}</pre>
            }
          ]
        }
      ]
    }
  ]
}

export default schema
