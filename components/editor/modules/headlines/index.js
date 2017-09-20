import React from 'react'
import { css } from 'glamor'
import { Placeholder } from 'slate'
import MarkdownSerializer from '../../../../lib/serializer'

import { matchBlock } from '../../utils'
import {
  MediumHeadlineButton,
  SmallHeadlineButton
} from './ui'

import {
  TITLE,
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './constants'

export const styles = {
  title: {
    position: 'relative',
    fontSize: 36,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    lineHeight: '1.2em',
    margin: '0 0 0.2em'
  }
}

export const title = {
  match: matchBlock(TITLE),
  matchMdast: (node) => node.type === 'heading' && node.depth === 1,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: TITLE,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'heading',
    depth: 1,
    children: visitChildren(object)
  }),
  render: ({ children, ...props }) =>
    <h1 {...css(styles.title)}>
      <Placeholder
        state={props.state}
        node={props.node}
        firstOnly={false}>
        Titel
      </Placeholder>
      { children }
    </h1>
}

export const titleSerializer = new MarkdownSerializer({
  rules: [
    title
  ]
})

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
  render: ({ children }) => <h2>{ children }</h2>
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
  render: ({ children }) => <h3>{ children }</h3>
}

export const serializer = new MarkdownSerializer({
  rules: [
    title,
    mediumHeadline,
    smallHeadline
  ]
})

export {
  TITLE,
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
          title,
          mediumHeadline,
          smallHeadline
        ]
      }
    }
  ]
}
