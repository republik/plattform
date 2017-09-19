import React from 'react'
import { css } from 'glamor'

import { matchBlock } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'
import { getSerializationRules } from '../../utils/getRules'
import addValidation from '../../utils/serializationValidation'

import paragraph, { PARAGRAPH } from '../paragraph'
import headlines from '../headlines'
import figure from '../figure'
import blockquote from '../blockquote'

const PADDING = 20
const containerStyle = css({
  margin: '0 auto',
  padding: PADDING,
  paddingTop: PADDING / 2,
  maxWidth: 640,
  '@media (min-width: 600px)': {
    paddingTop: PADDING
  }
})

const Center = ({children}) => (
  <div {...containerStyle}>
    {children}
    <div style={{clear: 'both'}} />
  </div>
)

export const TYPE = 'CENTER'

const childSerializer = new MarkdownSerializer({
  rules: getSerializationRules([
    ...paragraph.plugins,
    ...figure.plugins,
    ...headlines.plugins,
    ...blockquote.plugins
  ])
})

const center = {
  match: matchBlock(TYPE),
  matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: TYPE,
    nodes: childSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren, context) => ({
    type: 'zone',
    identifier: TYPE,
    children: childSerializer.toMdast(object.nodes, context)
  }),
  render: ({ children, ...props }) =>
    <Center>
      {children}
    </Center>
}

export const serializer = new MarkdownSerializer({
  rules: [
    center
  ]
})

addValidation(center, serializer, 'center')

export default {
  plugins: [
    {
      schema: {
        rules: [
          {
            match: matchBlock(TYPE),
            validate: node => {
              const notBlocks = node.nodes.filter(n => n.kind !== 'block')

              return notBlocks.size
                ? notBlocks
                : null
            },
            normalize: (transform, object, notBlocks) => {
              notBlocks.forEach((child) => {
                transform.wrapBlockByKey(child.key, PARAGRAPH)
              })

              return transform
            }
          },
          center
        ]
      }
    }
  ]
}
