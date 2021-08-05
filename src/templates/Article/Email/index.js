import React from 'react'
import {
  matchHeading,
  matchParagraph,
  matchType
} from 'mdast-react-render/lib/utils'

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => <div>{children}</div>,
      rules: [
        {
          matchMdast: matchHeading(1),
          component: ({ children }) => <h1>{children}</h1>
        },
        {
          matchMdast: matchParagraph,
          component: ({ children }) => <p>{children}</p>
        }
      ]
    }
  ]
}

export default schema
