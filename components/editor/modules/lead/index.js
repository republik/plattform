import React from 'react'
import { css } from 'glamor'
import { LeadButton } from './ui'
import Placeholder from '../../Placeholder'
import { matchBlock } from '../../utils'
import { LEAD } from './constants'
import { mq } from '../../styles'

export const styles = {
  lead: {
    fontWeight: 'bold',
    margin: 0,
    position: 'relative',
    ':before': {
      display: 'inline',
      content: '«'
    },
    ':after': {
      display: 'inline',
      content: '»'
    },
    [mq.medium]: {
      color: '#ccc'
    }
  }
}

export const lead = {
  match: matchBlock(LEAD),
  matchMdast: (node) => node.type === 'blockquote',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: LEAD,
    nodes: visitChildren(node.children[0])
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'blockquote',
    children: [
      {
        type: 'paragraph',
        children: visitChildren(object)
      }
    ]
  }),
  render: ({ children, ...props }) =>
    <p {...css(styles.lead)}>
      <Placeholder
        {...props}
      >
        {'Hier könnte ihr Lead stehen.'}
      </Placeholder>
      {children}
    </p>
}

export {
  LEAD,
  LeadButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          lead
        ]
      }
    }
  ]
}
