import React from 'react'
import { css } from 'glamor'
import MarkdownSerializer from '../../../../lib/serializer'

import { matchBlock } from '../../utils'
import {
  MediumHeadlineButton,
  SmallHeadlineButton
} from './ui'

import {
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './constants'

export const styles = {
  h1: {
    position: 'relative',
    fontSize: 36
  },
  base: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    lineHeight: '1.2em',
    margin: '0 0 0.2em'
  },
  h2: {
    fontSize: 28
  },
  h3: {
    fontSize: 18
  }
}

export const mediumHeadline = {
  match: matchBlock(MEDIUM_HEADLINE),
  matchMdast: (node) => node.type === 'heading' && node.depth === 2,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: MEDIUM_HEADLINE,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'heading',
    depth: 2,
    children: visitChildren(object)
  }),
  render: ({ children, attributes }) => <h2 {...css(styles.base)} {...css(styles.h2)} {...attributes}>{ children }</h2>
}

export const smallHeadline = {
  match: matchBlock(SMALL_HEADLINE),
  matchMdast: (node) => node.type === 'heading' && node.depth === 3,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: SMALL_HEADLINE,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'heading',
    depth: 3,
    children: visitChildren(object)
  }),
  render: ({ children, attributes }) => <h3 {...css(styles.base)} {...css(styles.h3)} {...attributes}>{ children }</h3>
}

export const serializer = new MarkdownSerializer({
  rules: [
    mediumHeadline,
    smallHeadline
  ]
})

export {
  MEDIUM_HEADLINE,
  MediumHeadlineButton,
  SMALL_HEADLINE,
  SmallHeadlineButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          mediumHeadline,
          smallHeadline
        ]
      }
    }
  ]
}
