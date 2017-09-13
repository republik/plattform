import React from 'react'
import { css } from 'glamor'

import { matchBlock } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'
import { getSerializationRules } from '../../utils/getRules'

import paragraph from '../paragraph'
import headlines from '../headlines'
import image from '../image'

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
  </div>
)

export const TYPE = 'CENTER'

const center = {
  match: matchBlock(TYPE),
  matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: TYPE,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'zone',
    identifier: TYPE,
    children: visitChildren(object)
  }),
  render: ({ children, ...props }) =>
    <Center>
      {children}
    </Center>
}

export const serializer = new MarkdownSerializer({
  rules: getSerializationRules([
    ...paragraph.plugins,
    ...image.plugins,
    ...headlines.plugins
  ]).concat(center)
})

export default {
  plugins: [
    {
      schema: {
        rules: [
          center
        ]
      }
    }
  ]
}
