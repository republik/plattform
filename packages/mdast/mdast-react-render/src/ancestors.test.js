import test from 'tape'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { renderMdast } from './'
import { matchType, matchZone, matchParagraph } from './utils'

Enzyme.configure({ adapter: new Adapter() })

const mdast = {
  type: 'root',
  data: {
    linkColor: 'LightCoral'
  },
  children: [
    {
      type: 'zone',
      identifier: 'teaser',
      data: {
        linkColor: 'Indigo'
      },
      children: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            value: 'Hello'
          }, {
            type: 'link',
            children: [{
              type: 'text',
              value: 'World'
            }]
          }]
        }
      ]
    },
    {
      type: 'paragraph',
      children: [{
        type: 'text',
        value: 'Hello'
      }, {
        type: 'link',
        children: [{
          type: 'text',
          value: 'World'
        }]
      }]
    }
  ]
}

test('extract props from ancestors', assert => {
  const A = ({ children, linkColor }) =>
    <a style={{color: linkColor }}>{children}</a>
  const P = ({ children }) => <p>{children}</p>
  const linkProps = (node, index, parent, {ancestors}) => ({
    linkColor: (
      ancestors.find(matchZone('teaser')) ||
      ancestors.find(matchType('root'))
    ).data.linkColor
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
                    props: (node, index, parent, {ancestors}) => {
                      assert.ok(matchParagraph(ancestors[0]))
                      assert.ok(matchZone('teaser')(ancestors[1]))
                      assert.ok(matchType('root')(ancestors[2]))
                      return linkProps(node, index, parent, {ancestors})
                    },
                    component: A
                  }
                ]
              }
            ]
          },
          {
            matchMdast: matchParagraph,
            component: P,
            rules: [
              {
                matchMdast: matchType('link'),
                props: (node, index, parent, {ancestors}) => {
                  assert.ok(matchParagraph(ancestors[0]))
                  assert.ok(matchType('root')(ancestors[1]))
                  return linkProps(node, index, parent, {ancestors})
                },
                component: A
              }
            ]
          }
        ]
      }
    ]
  }

  assert.doesNotThrow(() => {
    let wrapper = shallow(
      renderMdast(mdast, schema, {MissingNode: false})
    )

    const links = wrapper.find(A)
    assert.equal(
      links.at(0).prop('linkColor'),
      'Indigo'
    )
    assert.equal(
      links.at(1).prop('linkColor'),
      'LightCoral'
    )
  })

  assert.end()
})
