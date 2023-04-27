import test from 'tape'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { renderMdast } from './'
import { matchType, matchHeading, matchParagraph } from './utils'

Enzyme.configure({ adapter: new Adapter() })

const mdast = {
  'type': 'root',
  'children': [
    {
      'type': 'heading',
      'depth': 1,
      'children': [{
        'type': 'text',
        'value': 'The Titel'
      }]
    },
    {
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': '«A good lead.»'
      }]
    }
  ]
}

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

test('render', assert => {
  assert.doesNotThrow(() => {
    shallow(
      renderMdast(mdast, schema, {MissingNode: false})
    )
  })

  assert.end()
})
